import { createStep, createWorkflow  } from "@mastra/core/workflows";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";



const orchestrator = createStep({
    id: 'orchestrator',
    inputSchema: z.object({
        book: z.string().describe('the name of a book')
    }),
    outputSchema: z.object({
        book: z.string(),
        reportSections: z.array(z.string())
    }),
    execute: async ({ inputData }) => {
        const { book } = inputData;

        const { output: object } = await generateText({
            model: openai("gpt-4o-mini"),
            output: Output.object({
                schema: z.object({
                    book: z.string(),
                    reportSections: z.array(z.string()),
                }),
            }),
            prompt: `Create simple and minimal sections for a report about the book "${book}".`,
        });

        return object;
      },
});

const fanOut = createStep({
    id:'fan-out',
    inputSchema: z.object({
        book: z.string(),
        reportSections: z.array(z.string()).describe('An array consisting of different sections for the book')
    }),
    outputSchema:  z.object({
        sectionAnalyses: z.array(
            z.object({
              section: z.string(),
              content: z.string()
            })
          )
    }).describe('analysis of the book in each sections'),
    execute: async ({inputData, mastra}) =>{
        const {book, reportSections} = inputData

        const sectionAnalyses = await Promise.all(
            reportSections.map(async (section) => {
                const agent = mastra?.getAgent('sectionWriter');
                const result = await agent?.generate(
                    `Write the content for the ${section} section about the book called ${book}`,
                    // to show that these run concurrent
                    {
                        runId: `fan-out-${section.toLowerCase().replace(/\s+/g, '-')}`,
                        tracingOptions: {
                            metadata: { section, book },
                            tags: ['fan-out'],
                        },
                    }
                );

                return {
                    section,
                    content: result?.text ?? '',
                };
            }),
        );
        

        return {sectionAnalyses}
    }
})

const synthesizer = createStep({
    id: 'synthesizer',
    inputSchema: z.object({
        sectionAnalyses: z.array(
            z.object({
              section: z.string(),
              content: z.string()
            })
          )
    }), 
    outputSchema: z.object({
        report: z.string().describe('book report created by putting all analysis sections together')
    }),
    execute: async ({inputData, mastra})=>{
        const {sectionAnalyses} = inputData

        const report = sectionAnalyses
            .map(({ section, content }) => `# ${section}\n\n${content}`)
            .join('\n\n---\n\n')
        
            console.log(report)

        return {report}

    }
})

const orchestratorWorkers = createWorkflow({
    id: 'orchestrator-workers',
    inputSchema: z.object({
        book: z.string().describe('The book we want a report for')
    }),
    outputSchema: z.object({
        report: z.string().describe('The report of the book')
    })
}).then(orchestrator)
.then(fanOut)
.then(synthesizer)
.commit()

export { orchestratorWorkers}