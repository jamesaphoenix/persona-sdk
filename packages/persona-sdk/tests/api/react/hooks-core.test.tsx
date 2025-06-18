/**
 * Core tests for React hooks without external testing library dependencies
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  usePersona,
  usePersonas,
  useCreatePersona,
  useUpdatePersona,
  useDeletePersona,
  PersonaApiProvider,
} from '../../../src/api/react/hooks.js';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = global.fetch as any;

// Simple test harness for hooks without @testing-library/react
class HookTestHarness<T> {
  private result: T | null = null;
  private error: Error | null = null;
  private renderCount = 0;
  private updateTrigger: (() => void) | null = null;

  constructor(private hookFn: () => T) {
    this.render();
  }

  private render() {
    try {
      this.result = this.hookFn();
      this.renderCount++;
    } catch (err) {
      this.error = err as Error;
    }
  }

  get current() {
    return this.result;
  }

  get errorState() {
    return this.error;
  }

  get renders() {
    return this.renderCount;
  }

  rerender() {
    this.render();
  }

  async waitFor(predicate: () => boolean, timeout = 5000) {
    const start = Date.now();
    
    while (!predicate() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10));
      this.render();
    }

    if (!predicate()) {
      throw new Error('Timeout waiting for condition');
    }
  }
}

describe.skip('React Hooks - Core Tests', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePersona Hook', () => {
    it('should fetch persona data', async () => {
      const mockPersona = {
        id: '123',
        name: 'Test Person',
        age: 30,
        occupation: 'Engineer',
        sex: 'male',
        attributes: {},
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPersona,
      });

      const harness = new HookTestHarness(() => 
        usePersona('123', { baseUrl })
      );

      // Initial state
      expect(harness.current?.loading).toBe(true);
      expect(harness.current?.data).toBe(null);
      expect(harness.current?.error).toBe(null);

      // Wait for data
      await harness.waitFor(() => !harness.current?.loading);

      expect(harness.current?.data).toEqual(mockPersona);
      expect(harness.current?.error).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/personas/123',
        expect.any(Object)
      );
    });

    it('should handle errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const harness = new HookTestHarness(() => 
        usePersona('123', { baseUrl })
      );

      await harness.waitFor(() => !harness.current?.loading);

      expect(harness.current?.data).toBe(null);
      expect(harness.current?.error).toBeInstanceOf(Error);
      expect(harness.current?.error?.message).toBe('Network error');
    });

    it('should provide refetch function', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({ 
            id: '123', 
            name: `Person v${callCount}` 
          }),
        });
      });

      const harness = new HookTestHarness(() => 
        usePersona('123', { baseUrl })
      );

      await harness.waitFor(() => !harness.current?.loading);
      expect(harness.current?.data?.name).toBe('Person v1');

      // Trigger refetch
      await harness.current?.refetch();
      
      await harness.waitFor(() => 
        harness.current?.data?.name === 'Person v2'
      );

      expect(callCount).toBe(2);
    });
  });

  describe('usePersonas Hook with Pagination', () => {
    it('should handle paginated results', async () => {
      const page1Response = {
        data: [
          { id: '1', name: 'Person 1' },
          { id: '2', name: 'Person 2' },
        ],
        total: 5,
        page: 1,
        pageSize: 2,
        hasMore: true,
      };

      const page2Response = {
        data: [
          { id: '3', name: 'Person 3' },
          { id: '4', name: 'Person 4' },
        ],
        total: 5,
        page: 2,
        pageSize: 2,
        hasMore: true,
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page1Response,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page2Response,
        });

      const harness = new HookTestHarness(() => 
        usePersonas({ limit: 2 }, { baseUrl })
      );

      // Wait for initial load
      await harness.waitFor(() => !harness.current?.loading);

      expect(harness.current?.data?.data).toHaveLength(2);
      expect(harness.current?.hasMore).toBe(true);

      // Load more
      const loadMorePromise = harness.current?.loadMore();
      await loadMorePromise;

      // Rerender to get updated state
      harness.rerender();
      
      expect(harness.current?.data?.data).toHaveLength(4);
      expect(harness.current?.data?.data[2].name).toBe('Person 3');
    });

    it('should reset pagination', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [{ id: '1', name: 'Person 1' }],
          total: 1,
          page: 1,
          pageSize: 20,
          hasMore: false,
        }),
      });

      const harness = new HookTestHarness(() => 
        usePersonas({}, { baseUrl })
      );

      await harness.waitFor(() => !harness.current?.loading);

      // Reset
      harness.current?.reset();
      harness.rerender();

      expect(harness.current?.loading).toBe(true);
    });
  });

  describe('Mutation Hooks', () => {
    describe('useCreatePersona', () => {
      it('should create a persona', async () => {
        const newPersona = {
          id: '456',
          name: 'New Person',
          age: 25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => newPersona,
        });

        const harness = new HookTestHarness(() => 
          useCreatePersona({ baseUrl })
        );

        expect(harness.current?.loading).toBe(false);
        expect(harness.current?.data).toBe(null);

        // Perform mutation
        const resultPromise = harness.current?.mutate({ 
          name: 'New Person', 
          age: 25 
        });

        harness.rerender();
        expect(harness.current?.loading).toBe(true);

        const result = await resultPromise;
        harness.rerender();

        expect(result).toEqual(newPersona);
        expect(harness.current?.loading).toBe(false);
        expect(harness.current?.data).toEqual(newPersona);
      });

      it('should handle creation errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Creation failed'));

        const harness = new HookTestHarness(() => 
          useCreatePersona({ baseUrl })
        );

        const result = await harness.current?.mutate({ 
          name: 'Will Fail' 
        });

        harness.rerender();

        expect(result).toBe(null);
        expect(harness.current?.error?.message).toBe('Creation failed');
      });

      it('should reset mutation state', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Error'));

        const harness = new HookTestHarness(() => 
          useCreatePersona({ baseUrl })
        );

        await harness.current?.mutate({ name: 'Test' });
        harness.rerender();

        expect(harness.current?.error).toBeTruthy();

        // Reset
        harness.current?.reset();
        harness.rerender();

        expect(harness.current?.error).toBe(null);
        expect(harness.current?.data).toBe(null);
        expect(harness.current?.loading).toBe(false);
      });
    });

    describe('useUpdatePersona', () => {
      it('should update a persona', async () => {
        const updatedPersona = {
          id: '123',
          name: 'Updated Name',
          age: 31,
          updated_at: new Date().toISOString(),
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => updatedPersona,
        });

        const harness = new HookTestHarness(() => 
          useUpdatePersona({ baseUrl })
        );

        const result = await harness.current?.mutate({
          id: '123',
          data: { name: 'Updated Name', age: 31 },
        });

        expect(result).toEqual(updatedPersona);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/personas/123',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ name: 'Updated Name', age: 31 }),
          })
        );
      });
    });

    describe('useDeletePersona', () => {
      it('should delete a persona', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

        const harness = new HookTestHarness(() => 
          useDeletePersona({ baseUrl })
        );

        await harness.current?.mutate('123');
        harness.rerender();

        expect(harness.current?.error).toBe(null);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/personas/123',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });
  });

  describe('API Client Configuration', () => {
    it('should use custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123', name: 'Test' }),
      });

      const customHeaders = {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'custom-value',
      };

      const harness = new HookTestHarness(() => 
        usePersona('123', { 
          baseUrl, 
          headers: customHeaders 
        })
      );

      await harness.waitFor(() => !harness.current?.loading);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders),
        })
      );
    });

    it('should handle base URL without trailing slash', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123' }),
      });

      const harness = new HookTestHarness(() => 
        usePersona('123', { baseUrl: 'http://localhost:3000/' })
      );

      await harness.waitFor(() => !harness.current?.loading);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/personas/123',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle non-OK responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      const harness = new HookTestHarness(() => 
        usePersona('non-existent', { baseUrl })
      );

      await harness.waitFor(() => !harness.current?.loading);

      expect(harness.current?.error?.message).toBe('Not found');
    });

    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      const harness = new HookTestHarness(() => 
        usePersona('123', { baseUrl })
      );

      await harness.waitFor(() => !harness.current?.loading);

      expect(harness.current?.error?.message).toContain('HTTP 500');
    });

    it('should handle network timeouts', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        })
      );

      const harness = new HookTestHarness(() => 
        usePersona('123', { baseUrl })
      );

      await harness.waitFor(() => !harness.current?.loading);

      expect(harness.current?.error?.message).toBe('Timeout');
    });
  });

  describe('Loading States', () => {
    it('should manage loading states correctly', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(promise);

      const harness = new HookTestHarness(() => 
        usePersona('123', { baseUrl })
      );

      // Should start loading
      expect(harness.current?.loading).toBe(true);

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ id: '123', name: 'Test' }),
      });

      await harness.waitFor(() => !harness.current?.loading);

      expect(harness.current?.loading).toBe(false);
      expect(harness.current?.data).toBeTruthy();
    });

    it('should handle concurrent mutations', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ 
                id: String(callCount), 
                name: `Person ${callCount}` 
              }),
            });
          }, 50);
        });
      });

      const harness = new HookTestHarness(() => 
        useCreatePersona({ baseUrl })
      );

      // Start multiple mutations
      const promise1 = harness.current?.mutate({ name: 'First' });
      const promise2 = harness.current?.mutate({ name: 'Second' });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1?.id).toBe('1');
      expect(result2?.id).toBe('2');
      expect(callCount).toBe(2);
    });
  });
});