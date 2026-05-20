import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Ceramic from 'ceramic-ai';
import { ceramicSearch, webSearch } from './index.js';

vi.mock('ceramic-ai', () => ({ default: vi.fn() }));

const MockCeramic = vi.mocked(Ceramic as any);

const MOCK_RESPONSE = {
  requestId: 'req-abc',
  result: {
    results: [
      { title: 'Result 1', url: 'https://example.com/1', description: 'Desc 1' },
      { title: 'Result 2', url: 'https://example.com/2', description: 'Desc 2' },
    ],
    totalResults: 2,
    searchMetadata: { executionTime: 123 },
  },
};

describe('ceramicSearch', () => {
  let mockSearch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSearch = vi.fn().mockResolvedValue(MOCK_RESPONSE);
    MockCeramic.mockImplementation(() => ({ search: mockSearch }));
    delete process.env.CERAMIC_API_KEY;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throws when no API key is configured', () => {
    expect(() => ceramicSearch()).toThrow('Ceramic API key required');
  });

  it('reads API key from CERAMIC_API_KEY env var', () => {
    process.env.CERAMIC_API_KEY = 'env-key';
    expect(() => ceramicSearch()).not.toThrow();
    expect(MockCeramic).toHaveBeenCalledWith({ apiKey: 'env-key' });
  });

  it('uses apiKey from config over env var', () => {
    process.env.CERAMIC_API_KEY = 'env-key';
    ceramicSearch({ apiKey: 'config-key' });
    expect(MockCeramic).toHaveBeenCalledWith({ apiKey: 'config-key' });
  });

  describe('execute', () => {
    it('calls search with the query', async () => {
      const t = ceramicSearch({ apiKey: 'test-key' });
      await t.execute({ query: 'latest AI news' }, {} as any);
      expect(mockSearch).toHaveBeenCalledWith({ query: 'latest AI news' });
    });

    it('omits maxDescriptionLength when not specified', async () => {
      const t = ceramicSearch({ apiKey: 'test-key' });
      await t.execute({ query: 'test' }, {} as any);
      expect(mockSearch).toHaveBeenCalledWith({ query: 'test' });
    });

    it('passes config maxDescriptionLength to search', async () => {
      const t = ceramicSearch({ apiKey: 'test-key', maxDescriptionLength: 4000 });
      await t.execute({ query: 'test' }, {} as any);
      expect(mockSearch).toHaveBeenCalledWith({ query: 'test', maxDescriptionLength: 4000 });
    });

    it('maps response to CeramicSearchResponse shape', async () => {
      const t = ceramicSearch({ apiKey: 'test-key' });
      const result = await t.execute({ query: 'test' }, {} as any);
      expect(result).toEqual({
        requestId: 'req-abc',
        results: [
          { title: 'Result 1', url: 'https://example.com/1', description: 'Desc 1' },
          { title: 'Result 2', url: 'https://example.com/2', description: 'Desc 2' },
        ],
        totalResults: 2,
        executionTime: 123,
      });
    });
  });

  it('webSearch is an alias for ceramicSearch', () => {
    expect(webSearch).toBe(ceramicSearch);
  });
});
