# effective-agents-mastra

Reference implementation of agentic design patterns using [Mastra](https://mastra.ai/) (TypeScript AI framework). Heavly inspired by the [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) blog by @Anthropic

| Workflow | Pattern | Description |
|---|---|---|
| `prompt-chaining` | Sequential LLM calls | Topic → description → X thread |
| `parallelization` | Concurrent LLM calls | Fan out tasks simultaneously |
| `routing` | LLM classification + branching | Routes to customer-support or general-question handler |
| `orchestrator-workers` | Plan → parallel execute → merge | Generates book report sections concurrently |
| `evaluator-optimizer` | Generate-then-evaluate loop | Refines recipe until infant-safe |
| `weather-workflow` | Tool use + scorers | Starter/reference with evals and observability |

## Setup

```shell
cp .env.example .env
# add your OPENAI_API_KEY to .env

npm install
```

## Running / Testing

```shell
npm run dev
```

Open [http://localhost:4111](http://localhost:4111), go to the **Workflows** tab, pick a workflow, and run it with sample input.

> Requires a valid OpenAI API key — all workflows use `gpt-4o-mini`.

## Learn more

- [Mastra docs](https://mastra.ai/docs/)
- [Mastra Studio](https://mastra.ai/docs/getting-started/studio)
- [Mastra Cloud deployment](https://mastra.ai/docs/deployment/overview)
