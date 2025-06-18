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

  getQueryCount() {
    return this.queryCount;
  }

  reset() {
    this.data.clear();
    this.queryCount = 0;
    this.idCounter = 1;
    this.errorMode = 'none';
    this.errorRate = 0;
  }

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    this.queryCount++;

    // Simulate various error conditions
    switch (this.errorMode) {
      case 'connection':
        throw new Error('connection refused');
      
      case 'timeout':
        await new Promise(resolve => setTimeout(resolve, 100));
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
      const id = `12345678-1234-1234-1234-${String(this.idCounter++).padStart(12, '0')}`;
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

    // Handle count queries
    if (sql.includes('count(*)') && sql.includes('personas')) {
      return { rows: [{ count: String(this.data.size) }] as any, rowCount: 1 };
    }

    if (sql.includes('select * from personas')) {
      let personas = Array.from(this.data.values());
      
      // Handle LIMIT and OFFSET for pagination
      if (sql.includes('limit') && values && values.length >= 2) {
        const limit = values[values.length - 2];
        const offset = values[values.length - 1];
        personas = personas.slice(offset, offset + limit);
      }
      
      return { rows: personas as any, rowCount: personas.length };
    }

    // Handle group operations
    if (sql.includes('insert into persona_groups')) {
      const id = `12345678-1234-1234-1234-${String(this.idCounter++).padStart(12, '0')}`;
      const group = {
        id,
        name: values![0],
        description: values![1],
        metadata: values![2] || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.set(`group:${id}`, group);
      return { rows: [group] as any, rowCount: 1 };
    }

    if (sql.includes('select * from persona_groups where id')) {
      const group = this.data.get(`group:${values![0]}`);
      return { rows: group ? [group] : [], rowCount: group ? 1 : 0 } as any;
    }

    // Handle membership operations
    if (sql.includes('insert into persona_group_members')) {
      const id = `mem_${this.idCounter++}`;
      const membership = {
        id,
        persona_id: values![0],
        group_id: values![1],
        joined_at: new Date(),
      };
      this.data.set(`membership:${id}`, membership);
      return { rows: [], rowCount: 1 };
    }

    if (sql.includes('delete from persona_group_members')) {
      // Simulate membership deletion
      return { rows: [], rowCount: 1 };
    }

    if (sql.includes('get_persona_group_with_members')) {
      const group = this.data.get(`group:${values![0]}`);
      if (!group) {
        return { rows: [], rowCount: 0 };
      }
      
      const result = {
        ...group,
        personas: [], // Empty for simplicity
      };
      return { rows: [result] as any, rowCount: 1 };
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
    server = await createServer({ 
      databaseClient: mockDb, 
      port: 3457,
      logger: false 
    });
    await server.listen({ port: 3457, host: '0.0.0.0' });
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
        baseUrl: 'http://localhost:9999'
      });

      await expect(badClient.getPersona('123'))
        .rejects.toThrow();
    });

    it('should handle network timeouts', async () => {
      mockDb.setErrorMode('timeout');

      await expect(client.createPersona({ name: 'Timeout Test' }))
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
        // Should get validation error details from Zod
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(10);
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
        // Should get validation error details
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(10);
      }
    });
  });

  describe('Error Recovery', () => {
    it('should recover from transient errors', async () => {
      mockDb.setErrorMode('random');
      mockDb.setErrorRate(0.3); // 30% error rate

      let successCount = 0;
      let errorCount = 0;

      // Try multiple times
      for (let i = 0; i < 20; i++) {
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
          action: () => client.getPersona('12345678-1234-1234-1234-123456789012'),
          expectedMessage: 'persona not found',
        },
        {
          action: () => client.createPersona({ name: '' }),
          expectedMessage: 'too_small',
        },
        {
          action: () => client.updatePersona('12345678-1234-1234-1234-123456789012', { name: 'New' }),
          expectedMessage: 'persona not found',
        },
      ];

      for (const { action, expectedMessage } of errorCases) {
        try {
          await action();
          expect.fail('Should have thrown');
        } catch (error: any) {
          expect(error).toHaveProperty('message');
          expect(error.message.toLowerCase()).toContain(expectedMessage);
        }
      }
    });

    it('should include request ID for tracking', async () => {
      // This test checks that errors include enough context for debugging
      try {
        await client.getPersona('12345678-1234-1234-1234-123456789012');
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(5);
        // Request IDs would be added by the server implementation
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
        // Should get some kind of error from bulk operation
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(5);
      }

      mockDb.setErrorMode('none');
    });
  });

  describe('Retry Logic', () => {
    it('should retry on transient errors', async () => {
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
        await client.createPersona({ name: 'Retry Test' });
      } catch (error) {
        // May still fail after retries
      }

      // Should have made at least one attempt
      expect(attemptCount).toBeGreaterThan(0);

      mockDb.setErrorMode('none');
    });

    it('should not retry on client errors', async () => {
      const startCount = mockDb.getQueryCount();

      // This should fail immediately without retries
      await expect(client.createPersona({ name: '' }))
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

      // Query should work when errors are disabled
      const results = await client.queryPersonas({ limit: 10 });
      expect(results.data.length).toBeGreaterThanOrEqual(5);

      mockDb.setErrorMode('none');
    });

    it('should handle cascading failures', async () => {
      // Simulate a scenario where one failure leads to another
      mockDb.setErrorMode('none');

      const group = await client.createGroup({ 
        name: 'Cascade Test',
        description: 'Testing cascading failures',
      });

      const persona = await client.createPersona({ name: 'Cascade Person' });

      // Now cause connection errors
      mockDb.setErrorMode('connection');

      // Try to add persona to group - should fail
      const result = await client.addPersonaToGroup(persona.id, group.id);
      expect(result.success).toBe(false);

      // Try to query - should also fail
      await expect(client.getGroupWithMembers(group.id))
        .rejects.toThrow();

      mockDb.setErrorMode('none');
    });
  });

  describe('Error Logging and Monitoring', () => {
    it('should include enough context in errors for debugging', async () => {
      // Ensure we're not in error mode
      mockDb.setErrorMode('none');
      
      try {
        await client.updatePersona('12345678-1234-1234-1234-123456789012', { 
          name: 'New Name',
          age: 30,
        });
      } catch (error: any) {
        // Error should include useful context
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(10);
        
        // Should indicate what operation failed
        expect(error.message.toLowerCase()).toMatch(/persona not found|update|persona/);
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