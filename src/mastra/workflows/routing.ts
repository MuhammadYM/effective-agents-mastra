import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';

const llmCallRouter = createStep({
    id: 'llm-call-router',
    inputSchema: z.object({
        query: z.string().describe('The users query '),
    }),
    outputSchema:z.object({
        query: z.string().describe('The users query '),
        routingCategory: z.enum(['customer-support', 'general-question']).describe('The routing category for the query'),
    }), 
    execute: async ({inputData}) => {
        const {query} = inputData

        const { output } = await generateText({
            model: openai('gpt-4o-mini'),
            output: Output.object({
                schema: z.object({
                    routingCategory: z.enum(['customer-support', 'general-question']),
                }),
            }),
            prompt: `Classify the following user query into one of these categories: "customer-support" (complaints, orders, billing, account issues) or "general-question" (general knowledge, how-to, information requests).\n\nQuery: ${query}`,
        });

        return { query, routingCategory: output.routingCategory }
    }
})

const CustomerSupport = createStep({
    id: 'customer-support',
    inputSchema: z.object({
        query: z.string().describe('The users query '),
        routingCategory: z.enum(['customer-support', 'general-question']).describe('The routing category for the query'),
    }),
    outputSchema: z.object({
        answer: z.string().describe('The answer to the users query '),
    }),
    execute: async ({inputData}) => {
        const {query} = inputData

        //make necessary llm calls for generating the answer

        return {answer: "null"}
    }
})

const GeneralQuestion = createStep({
    id: 'general-question',
    inputSchema: z.object({
        query: z.string().describe('The users query '),
        routingCategory: z.enum(['customer-support', 'general-question']).describe('The routing category for the query'),
    }),
    outputSchema: z.object({
        answer: z.string().describe('The answer to the users query '),
    }),
    execute: async ({inputData}) => {
        const {query} = inputData

        //make necessary llm calls for generating the answer

        return {answer: "null"}
    }
})


const routingWorkflow = createWorkflow({
    id: 'routing-workflow',
    inputSchema: z.object({
        query: z.string().describe('The users query '),
    }),
    outputSchema: z.object({
        query: z.string().describe('The users query '),
        routingCategory: z.enum(['customer-support', 'general-question']).describe('The routing category for the query'),
    }),
}).then(llmCallRouter)
.branch([
    [async ({ inputData: {  query, routingCategory } }) =>  routingCategory == "general-question", GeneralQuestion],
    [async ({ inputData: {  query, routingCategory } }) =>  routingCategory == "customer-support", CustomerSupport]
])
.commit()

export {routingWorkflow}