import { Agent } from '@mastra/core/agent';

const sectionWriter = new Agent({
    id: "sectionWriter",
    name: "Section Writer",
    instructions: `
  You are a literary analysis assistant.
  Write a structured section for a book report.
  Use clear paragraphs when necessary.
  Keep it analytical rather than summary-heavy. You don't need to repeat the author or the name of the book unless necessary
  Do not include the name of the section in at the start of the section
  `,
  model: 'openai/gpt-4o-mini',
});

export {sectionWriter}