import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';


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

    const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: `Write a professional LinkedIn post about the following topic: ${topic}`,
    });

    return { linkedInPost: text }
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

        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: `Write a concise and engaging Twitter post (max 280 characters) about the following topic: ${topic}`,
        });

        return { twitterPost: text }
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