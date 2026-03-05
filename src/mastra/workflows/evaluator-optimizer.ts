import { createStep, createWorkflow } from "@mastra/core/workflows";
import z from "zod";
import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";

const recipeGenerator = createStep({
    id: "recipe-generator",
    inputSchema:z.object({
        dish: z.string().describe('The dish we would like to make')
    }),
    outputSchema:z.object({
        recipe: z.string().describe('The recipe for that dish')
    }),
    execute: async ({inputData, mastra}) =>{
        const { dish } = inputData

        const { output: object } = await generateText({
            model: openai("gpt-4o-mini"),
            output: Output.object({
                schema: z.object({
                    recipe: z.string().describe('The recipe for that dish')
                }),
            }),
            prompt: `Create a simple recipe for the following dish "${dish}".`,
        });


        return object
    },
})


const recipeGeneratorWorkflow = createWorkflow({
    id: 'recipe-generator-workflow',
    inputSchema: z.object({
        dish: z.string().describe('The dish we would like to make')
    }),
    outputSchema:z.object({
        refinedRecipe: z.string().describe('The refined recipe for that dish')
    })
}).then(recipeGenerator).commit()

export {recipeGeneratorWorkflow}