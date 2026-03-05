import { createStep, createWorkflow } from "@mastra/core/workflows";
import z from "zod";
import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";

const feedbackSchema = z.object({
    suitable: z.boolean(),
    reason: z.string().describe('reason why the recipe is not suitable for infants'),
});

// Sets up initial state with null feedback before the loop starts
const initRecipe = createStep({
    id: "init-recipe",
    inputSchema: z.object({
        dish: z.string().describe('The dish we would like to make'),
    }),
    outputSchema: z.object({
        dish: z.string(),
        recipe: z.string(),
        feedback: feedbackSchema.nullable(),
    }),
    execute: async ({ inputData }) => ({
        dish: inputData.dish,
        recipe: '',
        feedback: null,
    }),
});

// Generates a recipe then immediately evaluates it — both run in one loop iteration
const generateAndEvaluate = createStep({
    id: "generate-and-evaluate",
    inputSchema: z.object({
        dish: z.string(),
        recipe: z.string(),
        feedback: feedbackSchema.nullable(),
    }),
    outputSchema: z.object({
        dish: z.string(),
        recipe: z.string(),
        feedback: feedbackSchema,
    }),
    execute: async ({ inputData }) => {
        const { dish, feedback } = inputData;
        const feedbackContext = feedback ? `Previous feedback: ${feedback.reason}` : '';

        const { output: genOutput } = await generateText({
            model: openai("gpt-4o-mini"),
            output: Output.object({
                schema: z.object({
                    recipe: z.string().describe('The recipe for that dish'),
                }),
            }),
            prompt: `Create a simple recipe for "${dish}". ${feedbackContext}`,
        });

        const { output: evalOutput } = await generateText({
            model: openai("gpt-4o-mini"),
            output: Output.object({
                schema: z.object({ feedback: feedbackSchema }),
            }),
            prompt: `Evaluate the following recipe to see if its contents are suitable for infants. Keep the reason simple and straightforward.\n\nRecipe: ${genOutput.recipe}`,
        });

        return {
            dish,
            recipe: genOutput.recipe,
            feedback: evalOutput.feedback,
        };
    },
});

const recipeGeneratorWorkflow = createWorkflow({
    id: 'recipe-generator-workflow',
    inputSchema: z.object({
        dish: z.string().describe('The dish we would like to make'),
    }),
    outputSchema: z.object({
        dish: z.string(),
        recipe: z.string(),
        feedback: feedbackSchema,
    }),
})
    .then(initRecipe)
    .dountil(
        generateAndEvaluate,
        async ({ inputData }) => inputData.feedback?.suitable === true,
    )
    .commit();

export { recipeGeneratorWorkflow };