import {createStep, createWorkflow} from '@mastra/core/workflows';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';


// Step 1: generate short description of the topic
const step1 = createStep({
    id: 'create short description',
    inputSchema:z.object({
        topic: z.string().describe('The topic to generate a short description for'),
    }),
    outputSchema:z.object({
        description: z.string().describe('A short description of the topic'),
    }),
    execute: async ({inputData}) => {
        const {topic} = inputData

        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: `Write a short, clear description of the following topic: ${topic}`,
        });

        return { description: text }
    }
})

const step2 = createStep({
    id: 'update description',
    inputSchema: z.object({
        description: z.string().describe('A short description of the topic'),
    }),
    outputSchema: z.object({
        updatedDescription:z.string().describe('An updated description of the topic'),
    }),
    execute: async ({inputData}) => {
        const {description} = inputData

        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: `Improve and expand the following description to make it more engaging and informative:\n\n${description}`,
        });

        return { updatedDescription: text }
    }
})

const step3 = createStep({
    id: 'generate X thread from description',
    inputSchema:z.object({
        updatedDescription:z.string().describe('An updated description of the topic'),
    }),
    outputSchema: z.object({
        xThread:z.string().describe('A simplified version of the description for X'),
    }),
    execute: async ({inputData}) => {
        const {updatedDescription} = inputData

        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: `Convert the following description into an engaging X (Twitter) thread. Format each tweet numbered (1/, 2/, etc.):\n\n${updatedDescription}`,
        });

        return { xThread: text }
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

export {promptChainingWorkflow};