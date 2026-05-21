# Ceramic AI SDK

[Ceramic AI](https://ceramic.ai) search tool integration with [Vercel AI SDK](https://sdk.vercel.ai).

## Installation

```bash
npm install @ceramicai/sdk ai @ai-sdk/openai
```

## Setup

Get your free API key at [platform.ceramic.ai/keys](https://platform.ceramic.ai/keys) and export it:

```
export CERAMIC_API_KEY=your_api_key
```

Also export any additional API keys you need, e.g., OpenAI:

```
export OPENAI_API_KEY=your_api_key
```

## Example usage

```typescript
import { generateText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { webSearch } from '@ceramicai/sdk';

const { text } = await generateText({
  model: openai('gpt-5.5'),
  tools: {
    webSearch: webSearch(),
  },
  stopWhen: stepCountIs(5),
  prompt: 'What are the latest developments in AI?',
});

console.log(text);
```

Save the file as `example.ts`. In the same directory, create a `package.json` with:

```json
{ "type": "module" }
```

Then run:

```bash
npx tsx example.ts
```

## Configuration

```typescript
webSearch({
  apiKey: 'your_api_key',       // defaults to process.env.CERAMIC_API_KEY
  maxDescriptionLength: 3000,   // 1000–8000, defaults to 3000
})
```

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | `process.env.CERAMIC_API_KEY` | Your Ceramic API key |
| `maxDescriptionLength` | `number` | `3000` | Max characters per result description (1000–8000) |

## Result shape

Each search call returns:

```typescript
{
  requestId: string;
  results: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  totalResults: number;
  executionTime: number; // seconds
}
```

## Resources

- [API Reference](https://docs.ceramic.ai/api-reference/search)
- [Search best practices](https://docs.ceramic.ai/api/search/best-practices)
- [Get an API key](https://platform.ceramic.ai/keys)