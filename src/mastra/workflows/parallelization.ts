import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';


const step1 = createStep({
   id: 'create linkedIn post',
   inputSchema: z.object({
    topic: z.string().describe('The topic to create a linkedIn post for'),
   }),
   outputSchema: z.object({
    linkedInPost: z.string().describe('A linkedIn post about the topic'),
   }),
   execute: async ({inputData}) => {
    const {topic} = inputData

    //make necessary llm calls for generating the linkedIn post

    return {linkedInPost: "null"}
   }
})

const step2 = createStep({
    id: 'create twitter post',
    inputSchema: z.object({
        topic: z.string().describe('The topic to create a twitter post for'),
    }),
    outputSchema: z.object({
        twitterPost: z.string().describe('A twitter post about the topic'),
    }),
    execute: async ({inputData}) => {
        const {topic} = inputData

        //make necessary llm calls for generating the twitter post

        return {twitterPost: "null"}
    }
})


const parallelizationWorkflow = createWorkflow({
    id: 'parallelization-workflow',
    inputSchema: z.object({
        topic: z.string().describe('The topic to create a linkedIn post and twitter post for'),
    }),
    outputSchema: z.object({
        linkedInPost: z.string().describe('A linkedIn post about the topic'),
        twitterPost: z.string().describe('A twitter post about the topic'),
    }),
})
    .parallel([step1, step2])
    .commit();

export {parallelizationWorkflow};