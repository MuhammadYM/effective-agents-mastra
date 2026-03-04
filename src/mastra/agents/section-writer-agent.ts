import { Agent } from '@mastra/core/agent';

const sectionWriter = new Agent({
    id: "sectionWriter",
    name: "Section Writer",
    instructions: `
  You are a literary analysis assistant.
  Write a structured section for a book report.
  Use clear paragraphs when necessary.
  Keep it analytical rather than summary-heavy.
  `,
  model: 'openai/gpt-4o-mini',
});

export {sectionWriter}