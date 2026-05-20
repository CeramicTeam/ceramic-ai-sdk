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
      'Search the web using Ceramic AI. Ceramic uses lexical (keyword) matching — NOT semantic search. ' +
      'Rewrite the natural language query as 2–8 specific keywords before calling the search: ' +
      'extract specific entities, topics, locations, and dates; ' +
      'replace conversational phrasing with concrete keywords; ' +
      'include relevant synonyms explicitly when terminology is ambiguous; ' +
      'keep word order meaningful (house cat and cat house return different results). ' +
      'Examples of good keyword queries: 2026 Super Bowl halftime performer, California tenant security deposit return law, Serena Williams Grand Slam titles.\n ' + 
      'Call Ceramic search with the rewritten keyword query. ' + 
      'The tool returns up to 10 results ranked by relevance, each with title, URL, and description.',
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
