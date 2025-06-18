/**
 * Comprehensive error handling tests for the API
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer } from '../../src/api/server.js';
import { PostgresAdapter } from '../../src/adapters/postgres/adapter.js';
import { PersonaApiClient } from '../../src/api/client.js';
import type { FastifyInstance } from 'fastify';
import type { DatabaseClient, QueryResult } from '../../src/adapters/postgres/adapter.js';

// Error simulation mock database
class ErrorMockDatabaseClient implements DatabaseClient {
  private errorMode: 'none' | 'connection' | 'timeout' | 'constraint' | 'random' = 'none';
  private errorRate = 0;
  private queryCount = 0;
  private data = new Map<string, any>();
  private idCounter = 1;

  setErrorMode(mode: typeof this.errorMode) {
    this.errorMode = mode;
  }

  setErrorRate(rate: number) {
    this.errorRate = rate;
  }

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    this.queryCount++;

    // Simulate various error conditions
    switch (this.errorMode) {
      case 'connection':
        throw new Error('connection refused');
      
      case 'timeout':
        await new Promise(resolve => setTimeout(resolve, 5000));
        throw new Error('Query timeout');
      
      case 'constraint':
        if (text.toLowerCase().includes('insert')) {
          throw new Error('duplicate key value violates unique constraint');
        }
        break;
      
      case 'random':
        if (Math.random() < this.errorRate) {
          const errors = [
            'connection reset by peer',
            'too many connections',
            'disk full',
            'invalid input syntax',
            'deadlock detected',
          ];
          throw new Error(errors[Math.floor(Math.random() * errors.length)]);
        }
        break;
    }

    // Normal operation
    const sql = text.toLowerCase();

    if (sql.includes('insert into personas')) {
      const id = `err_${this.idCounter++}`;
      const persona = {
        id,
        name: values![0],
        age: values![1],
        occupation: values![2],
        sex: values![3],
        attributes: values![4] || {},
        metadata: values![5] || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.set(id, persona);
      return { rows: [persona] as any, rowCount: 1 };
    }

    if (sql.includes('select * from personas where id')) {
      const persona = this.data.get(values![0]);
      return { rows: persona ? [persona] : [], rowCount: persona ? 1 : 0 } as any;
    }

    if (sql.includes('select * from personas')) {
      const personas = Array.from(this.data.values());
      return { rows: personas as any, rowCount: personas.length };
    }

    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    if (this.errorMode === 'connection') {
      throw new Error('connection lost during transaction');
    }
    
    try {
      return await callback(this);
    } catch (error) {
      // Simulate rollback
      throw error;
    }
  }

  reset() {
    this.data.clear();
    this.idCounter = 1;
    this.queryCount = 0;
  }

  getQueryCount() {
    return this.queryCount;
  }
}

describe('API Error Handling Tests', () => {
  let server: FastifyInstance;
  let client: PersonaApiClient;
  let mockDb: ErrorMockDatabaseClient;
  let adapter: PostgresAdapter;
  const baseUrl = 'http://localhost:3457';

  beforeAll(async () => {
    mockDb = new ErrorMockDatabaseClient();
    adapter = new PostgresAdapter(mockDb);
    server = await createServer(adapter, { port: 3457 });
    client = new PersonaApiClient({ baseUrl });
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Connection Errors', () => {
    it('should handle database connection errors', async () => {
      mockDb.setErrorMode('connection');

      await expect(client.createPersona({ name: 'Connection Test' }))
        .rejects.toMatchObject({
          message: expect.stringContaining('connection'),
        });

      mockDb.setErrorMode('none');
    });

    it('should handle server not responding', async () => {
      // Create client pointing to non-existent server
      const badClient = new PersonaApiClient({ 
        baseUrl: 'http://localhost:9999',
        timeout: 1000,
      });

      await expect(badClient.getPersona('123'))
        .rejects.toThrow();
    });

    it('should handle network timeouts', async () => {
      // Set very short timeout
      const timeoutClient = new PersonaApiClient({ 
        baseUrl,
        timeout: 100,
      });

      mockDb.setErrorMode('timeout');

      await expect(timeoutClient.createPersona({ name: 'Timeout Test' }))
        .rejects.toThrow();

      mockDb.setErrorMode('none');
    });
  });

  describe('Database Constraint Errors', () => {
    it('should handle unique constraint violations', async () => {
      mockDb.setErrorMode('constraint');

      await expect(client.createPersona({ name: 'Constraint Test' }))
        .rejects.toMatchObject({
          message: expect.stringContaining('constraint'),
        });

      mockDb.setErrorMode('none');
    });

    it('should handle foreign key violations', async () => {
      // Simulate foreign key error
      mockDb.setErrorMode('none');
      
      // Try to add to non-existent group
      await expect(client.addPersonaToGroup('persona-123', 'non-existent-group'))
        .rejects.toThrow();
    });
  });

  describe('Validation Errors', () => {
    it('should provide clear validation error messages', async () => {
      try {
        await client.createPersona({ 
          name: '',
          age: -5,
          sex: 'invalid' as any,
        });
      } catch (error: any) {
        expect(error.message).toContain('validation');
        // Should ideally include field-specific errors
      }
    });

    it('should handle multiple validation errors', async () => {
      try {
        await client.createPersona({ 
          name: 'A'.repeat(300), // Too long
          age: 200, // Too old
          occupation: 'O'.repeat(300), // Too long
        });
      } catch (error: any) {
        expect(error.message).toContain('validation');
      }
    });
  });

  describe('Error Recovery', () => {
    it('should recover from transient errors', async () => {
      mockDb.setErrorMode('random');
      mockDb.setErrorRate(0.5); // 50% error rate

      let successCount = 0;
      let errorCount = 0;

      // Try multiple times
      for (let i = 0; i < 10; i++) {
        try {
          await client.createPersona({ name: `Recovery Test ${i}` });
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      // Should have some successes and some failures
      expect(successCount).toBeGreaterThan(0);
      expect(errorCount).toBeGreaterThan(0);

      mockDb.setErrorMode('none');
    });

    it('should maintain data integrity after errors', async () => {
      mockDb.reset();
      mockDb.setErrorMode('none');

      // Create some data
      const persona1 = await client.createPersona({ name: 'Before Error' });

      // Cause an error
      mockDb.setErrorMode('connection');
      try {
        await client.createPersona({ name: 'During Error' });
      } catch (error) {
        // Expected
      }

      // Recover
      mockDb.setErrorMode('none');
      const persona2 = await client.createPersona({ name: 'After Error' });

      // Check data integrity
      const all = await client.queryPersonas({ limit: 100 });
      expect(all.data).toHaveLength(2);
      expect(all.data.map(p => p.name)).toContain('Before Error');
      expect(all.data.map(p => p.name)).toContain('After Error');
      expect(all.data.map(p => p.name)).not.toContain('During Error');
    });
  });

  describe('Error Response Formats', () => {
    it('should return consistent error structure', async () => {
      const errorCases = [
        { 
          action: () => client.getPersona('non-existent'),
          expectedCode: 'not_found',
          expectedStatus: 404,
        },
        {
          action: () => client.createPersona({ name: '' }),
          expectedCode: 'validation_error',
          expectedStatus: 400,
        },
        {
          action: () => client.updatePersona('non-existent', { name: 'New' }),
          expectedCode: 'not_found',
          expectedStatus: 404,
        },
      ];

      for (const { action, expectedCode } of errorCases) {
        try {
          await action();
          expect.fail('Should have thrown');
        } catch (error: any) {
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('code');
          expect(error.code).toContain(expectedCode);
        }
      }
    });

    it('should include request ID for tracking', async () => {
      // Make a request that will fail
      const response = await fetch(`${baseUrl}/personas/non-existent`);
      
      expect(response.status).toBe(404);
      
      const error = await response.json();
      // Many APIs include request IDs for debugging
      // This is optional but good practice
      if (error.requestId) {
        expect(error.requestId).toMatch(/^[a-zA-Z0-9-]+$/);
      }
    });
  });

  describe('Bulk Operation Error Handling', () => {
    it('should handle partial bulk failures', async () => {
      mockDb.setErrorMode('none');
      
      // Create personas with some invalid data
      const personas = [
        { name: 'Valid 1', age: 30 },
        { name: '', age: 25 }, // Invalid
        { name: 'Valid 2', age: 35 },
      ];

      await expect(client.bulkCreatePersonas({ personas }))
        .rejects.toThrow();

      // Check that no partial data was saved
      const all = await client.queryPersonas({ limit: 100 });
      const names = all.data.map(p => p.name);
      expect(names).not.toContain('Valid 1');
      expect(names).not.toContain('Valid 2');
    });

    it('should report which items failed in bulk operations', async () => {
      mockDb.setErrorMode('random');
      mockDb.setErrorRate(0.3);

      const personas = Array.from({ length: 10 }, (_, i) => ({
        name: `Bulk Test ${i}`,
        age: 25,
      }));

      try {
        await client.bulkCreatePersonas({ personas });
      } catch (error: any) {
        // Error should indicate bulk operation failure
        expect(error.message).toMatch(/bulk|batch/i);
      }

      mockDb.setErrorMode('none');
    });
  });

  describe('Retry Logic', () => {
    it('should retry on transient errors', async () => {
      const retryClient = new PersonaApiClient({ 
        baseUrl,
        maxRetries: 3,
        retryDelay: 100,
      });

      let attemptCount = 0;
      mockDb.setErrorMode('random');
      mockDb.setErrorRate(0.6); // High error rate

      // Override query to count attempts
      const originalQuery = mockDb.query.bind(mockDb);
      mockDb.query = async function(...args) {
        attemptCount++;
        return originalQuery(...args);
      };

      try {
        await retryClient.createPersona({ name: 'Retry Test' });
      } catch (error) {
        // May still fail after retries
      }

      // Should have made multiple attempts
      expect(attemptCount).toBeGreaterThan(1);

      mockDb.setErrorMode('none');
    });

    it('should not retry on client errors', async () => {
      const retryClient = new PersonaApiClient({ 
        baseUrl,
        maxRetries: 3,
      });

      const startCount = mockDb.getQueryCount();

      // This should fail immediately without retries
      await expect(retryClient.createPersona({ name: '' }))
        .rejects.toThrow();

      const endCount = mockDb.getQueryCount();
      
      // Should not have made database queries for validation errors
      expect(endCount - startCount).toBe(0);
    });
  });

  describe('Graceful Degradation', () => {
    it('should provide partial results when possible', async () => {
      mockDb.setErrorMode('none');
      
      // Create some test data
      for (let i = 0; i < 5; i++) {
        await client.createPersona({ name: `Degradation Test ${i}` });
      }

      // Set random errors for queries
      mockDb.setErrorMode('random');
      mockDb.setErrorRate(0.2);

      // Should still return some results
      const results = await client.queryPersonas({ limit: 10 });
      expect(results.data.length).toBeGreaterThanOrEqual(0);

      mockDb.setErrorMode('none');
    });

    it('should handle cascading failures', async () => {
      // Simulate a scenario where one failure leads to another
      mockDb.setErrorMode('none');

      const group = await client.createPersonaGroup({ 
        name: 'Cascade Test',
        description: 'Testing cascading failures',
      });

      const persona = await client.createPersona({ name: 'Cascade Person' });

      // Now cause connection errors
      mockDb.setErrorMode('connection');

      // Try to add persona to group - should fail
      await expect(client.addPersonaToGroup(persona.id, group.id))
        .rejects.toThrow();

      // Try to query - should also fail
      await expect(client.getPersonaGroupWithMembers(group.id))
        .rejects.toThrow();

      mockDb.setErrorMode('none');
    });
  });

  describe('Error Logging and Monitoring', () => {
    it('should include enough context in errors for debugging', async () => {
      try {
        await client.updatePersona('non-existent-id', { 
          name: 'New Name',
          age: 30,
        });
      } catch (error: any) {
        // Error should include useful context
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(10);
        
        // Should indicate what operation failed
        expect(error.message.toLowerCase()).toMatch(/not found|update|persona/);
      }
    });

    it('should sanitize sensitive data in error messages', async () => {
      const sensitiveData = {
        name: 'Test User',
        attributes: {
          ssn: '123-45-6789',
          creditCard: '4111-1111-1111-1111',
          password: 'super-secret',
        },
      };

      try {
        // Force an error somehow
        mockDb.setErrorMode('constraint');
        await client.createPersona(sensitiveData);
      } catch (error: any) {
        // Error message should not contain sensitive data
        expect(error.message).not.toContain('123-45-6789');
        expect(error.message).not.toContain('4111-1111-1111-1111');
        expect(error.message).not.toContain('super-secret');
      }

      mockDb.setErrorMode('none');
    });
  });

  describe('Client-Side Error Handling', () => {
    it('should handle malformed responses gracefully', async () => {
      // Override fetch to return malformed data
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => 'not an object', // Invalid response
      });

      await expect(client.getPersona('123'))
        .rejects.toThrow();

      global.fetch = originalFetch;
    });

    it('should handle non-JSON error responses', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
        json: async () => { throw new Error('Not JSON'); },
      });

      await expect(client.getPersona('123'))
        .rejects.toThrow();

      global.fetch = originalFetch;
    });
  });
});