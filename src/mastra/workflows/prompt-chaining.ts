import {createStep, createWorkflow} from '@mastra/core/workflows'; 
import { z } from 'zod';


// Step 1: generate short description of the topic
const step1 = createStep({
    id: 'step1',
    inputSchema:z.object({
        topic: z.string().describe('The topic to generate a short description for'),
    }),
    outputSchema:z.object({
        description: z.string().describe('A short description of the topic'),
    }),
    execute: async ({inputData}) => {
        const {topic} = inputData

        //make necessary llm calls for generating the description

        return {description: null}
    }
})

const step2 = createStep({
    id: 'step2',
    inputSchema: z.object({
        description: z.string().describe('A short description of the topic'),
    }),
    outputSchema: z.object({
        updatedDescriptio:z.string().describe('An updated description of the topic'),
    }),
    execute: async ({inputData}) => {
        const {description} = inputData

        //make necessary llm calls for updating the description

        return {updatedDescription: null}
    }
})

const step3 = createStep({
    id: 'step3',
    inputSchema:z.object({
        updatedDescription:z.string().describe('An updated description of the topic'),
    }),
    outputSchema: z.object({
        xThread:z.string().describe('A simplified version of the description for X'),
    }),
    execute: async ({inputData}) => {
        const {updatedDescription} = inputData

        //make necessary llm calls for generating the X thread

        return {xThread: null}
    }
})

const promptChainingWorkflow = createWorkflow({
    id: 'prompt-chaining-workflow',
    inputSchema: z.object({
        topic: z.string().describe('The topic to generate a short description for'),
    }),
    outputSchema: z.object({
        xThread:z.string().describe('A simplified version of the description for X'),
    }),
})
    .then(step1)
    .then(step2)
    .then(step3)
    .commit();

export default promptChainingWorkflow;