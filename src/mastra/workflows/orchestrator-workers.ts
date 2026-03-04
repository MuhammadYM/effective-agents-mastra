import { createStep, createWorkflow  } from "@mastra/core/workflows";
import { workers } from "node:cluster";
import { z } from "zod";


const orchestrator = createStep({
    id: 'orchestrator',
    inputSchema: z.object({
        book: z.string().describe('the name of a book')
    }),
    outputSchema: z.object({
        book: z.string(),
        reportSections: z.array(z.string())
    }),
    execute: async ({inputData}) =>{

        const {book} = inputData

        // necessary calls to break the book down into sections


        return {book: book, sections: reportSections}
    }
})

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
    execute: async ({input, mastra}) =>{
        const {book, reportSections} = input

        const sectionAnalyses = await Promise.all(
            reportSections.map(async (section) => {
                const agent = mastra?.getAgent('sectionWriter');
                const result = await agent?.generate(
                    `Write the ${section} section about the book called ${book}`
                );

                return {
                    section,
                    content: result?.output ?? '',
                };
            }),
        );
        

        return {sectionAnalyses}
    }
})

const synthesizer = createStep({
    id: 'synthesizer',
    inputSchema: z.object({
        analysis: z.array(z.object()).describe('analysis of the book broken down by sections')
    }), 
    outputSchema: z.object({
        report: z.string().describe('book report created by putting all analysis sections together')
    }),
    execute: async ({inputData})=>{
        const {analysis} = inputData
        let report = ''
        //flatten and concatenate the analysis

        return {report: report}

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