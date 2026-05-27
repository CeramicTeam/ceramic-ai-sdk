import { tool } from 'ai';
import Ceramic from 'ceramic-ai';
import { z } from 'zod';

export interface CeramicSearchConfig {
  /** Ceramic API key. Defaults to process.env.CERAMIC_API_KEY. Get one at https://platform.ceramic.ai/keys */
  apiKey?: string;
  /** Max characters per result description. Range: 1000–8000. Default: 3000. */
  maxDescriptionLength?: number;
}

export interface CeramicSearchResult {
  title: string;
  url: string;
  description: string;
}

export interface CeramicSearchResponse {
  requestId: string;
  results: CeramicSearchResult[];
  totalResults: number;
  executionTime: number;
}

export function ceramicSearch(config: CeramicSearchConfig = {}) {
  const apiKey = config.apiKey ?? process.env.CERAMIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Ceramic API key required. Set the CERAMIC_API_KEY environment variable or pass apiKey in config. ' +
        'Get yours at https://platform.ceramic.ai/keys',
    );
  }

  const client = new Ceramic({ apiKey });

  return tool({
    description:
      'Search the web using Ceramic. ' +
      'Use for accurate current information — news, prices, recent events, documentation, general fact checking. ' +
      'Returns up to 10 ranked results with titles, URLs, and descriptions. ' +
      'Ceramic matches exact keywords — it does not interpret natural language or synonyms automatically. Call Ceramic search with a keyword query version of the user\'s question. ' +
      'Keyword query conversion rules: \n' +
      '- Queries must be 2-8 words\n' +
      '- Extract specific entities, topics, locations, and dates\n' +
      '- Replace conversational phrasing with concrete keywords\n' +
      '- Do not include uninformative words such as articles (the, a, an). Avoid prepositions (on, about, in, for, of, at, by, with) unless they are within established phrases or names (United States of America, Into the Wild).\n' +
      '- Include relevant synonyms explicitly when terminology is ambiguous\n' +
      '- Keep word order meaningful (`house cat` and `cat house` return different results)\n' +
      '- Good keyword query examples: \n' +
      '    - "2026 Super Bowl halftime performer" \n' +
      '    - "climate change effects global warming impact" \n' +
      '    - "beginner investing strategies stocks bonds basics" \n' +
      'If the search returns no useful results, retry with a more specific keyword query. ',
    inputSchema: z.object({
      query: z.string().describe('Keyword-based search query (2–8 words)'),
    }),
    execute: async ({ query }: { query: string }): Promise<CeramicSearchResponse> => {
      const res = await client.search({
        query,
        ...(config.maxDescriptionLength !== undefined && {
          maxDescriptionLength: config.maxDescriptionLength,
        }),
      });

      return {
        requestId: res.requestId,
        results: res.result.results.map(
          (r: { title: string; url: string; description: string }) => ({
            title: r.title,
            url: r.url,
            description: r.description,
          }),
        ),
        totalResults: res.result.totalResults,
        executionTime: res.result.searchMetadata.executionTime,
      };
    },
  });
}
