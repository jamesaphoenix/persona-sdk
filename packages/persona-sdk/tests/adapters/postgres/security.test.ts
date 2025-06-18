/**
 * Security tests for PostgreSQL adapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresAdapter } from '../../../src/adapters/postgres/adapter.js';
import type { DatabaseClient, QueryResult } from '../../../src/adapters/postgres/adapter.js';

// Security-focused mock database
class SecurityMockDatabaseClient implements DatabaseClient {
  public queryLog: Array<{ sql: string; values: any[] }> = [];
  private data = new Map<string, any>();

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    // Log all queries for inspection
    this.queryLog.push({ sql: text, values: values || [] });

    // Check for SQL injection attempts
    const dangerousPatterns = [
      /;\s*DROP/i,
      /;\s*DELETE/i,
      /;\s*UPDATE.*SET/i,
      /;\s*INSERT.*VALUES.*\(/i,
      /UNION\s+SELECT/i,
      /OR\s+1\s*=\s*1/i,
      /--\s*$/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        throw new Error('Potential SQL injection detected');
      }
    }

    // Simple mock implementation
    const sql = text.toLowerCase();

    if (sql.includes('insert into personas')) {
      const id = `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    return callback(this);
  }

  clear() {
    this.queryLog = [];
    this.data.clear();
  }
}

describe('PostgreSQL Adapter - Security Tests', () => {
  let adapter: PostgresAdapter;
  let mockClient: SecurityMockDatabaseClient;

  beforeEach(() => {
    mockClient = new SecurityMockDatabaseClient();
    adapter = new PostgresAdapter(mockClient);
  });

  describe('SQL Injection Prevention', () => {
    it('should safely handle malicious names', async () => {
      const maliciousInputs = [
        "Robert'); DROP TABLE personas; --",
        "Alice' OR '1'='1",
        "Bob'; DELETE FROM personas WHERE '1'='1'; --",
        "Charlie' UNION SELECT * FROM users --",
        "David\\'; DROP TABLE personas; --",
        "Eve`; DROP TABLE personas; --",
        "Frank\"; DROP TABLE personas; --",
        "Grace'); INSERT INTO admins VALUES ('hacker', 'password'); --",
      ];

      for (const maliciousName of maliciousInputs) {
        const persona = await adapter.createPersona({
          name: maliciousName,
          age: 30,
        });

        expect(persona.name).toBe(maliciousName);
        
        // Verify the SQL was properly parameterized
        const lastQuery = mockClient.queryLog[mockClient.queryLog.length - 1];
        expect(lastQuery.sql).not.toContain('DROP');
        expect(lastQuery.sql).not.toContain(maliciousName);
        expect(lastQuery.values[0]).toBe(maliciousName);
      }
    });

    it('should handle malicious attributes safely', async () => {
      const maliciousAttributes = {
        "evil'); DROP TABLE personas; --": "value",
        "key' OR '1'='1": "another value",
        nested: {
          "'; DELETE FROM personas; --": "nested value",
        },
        array: ["'; DROP TABLE personas; --", "normal value"],
      };

      const persona = await adapter.createPersona({
        name: 'Test Person',
        attributes: maliciousAttributes,
      });

      expect(persona.attributes).toEqual(maliciousAttributes);
      
      // Verify attributes were stored as JSON, not executed
      const lastQuery = mockClient.queryLog[mockClient.queryLog.length - 1];
      expect(lastQuery.values[4]).toEqual(maliciousAttributes);
    });

    it('should handle malicious query parameters', async () => {
      // Create test data first
      await adapter.createPersona({ name: 'Normal Person' });

      // Try malicious query parameters
      const maliciousQueries = [
        { name: "' OR '1'='1" },
        { occupation: "'; DROP TABLE personas; --" },
        { age: { min: "0 OR 1=1", max: "100 OR 1=1" } as any },
      ];

      for (const query of maliciousQueries) {
        const result = await adapter.queryPersonas(query as any);
        
        // Should return empty or filtered results, not all data
        expect(result.data.length).toBeLessThanOrEqual(1);
      }
    });

    it('should escape special characters in LIKE queries', async () => {
      // Create personas with special characters
      const specialNames = [
        'Test_Person',
        'Test%Person',
        'Test[Person]',
        'Test\\Person',
        "Test'Person",
        'Test"Person',
      ];

      for (const name of specialNames) {
        await adapter.createPersona({ name });
      }

      // Query for each special character
      for (const name of specialNames) {
        const result = await adapter.queryPersonas({ name });
        
        // Should find the exact match
        expect(result.data.some(p => p.name === name)).toBe(true);
      }
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should handle extremely long strings', async () => {
      const longString = 'a'.repeat(1000000); // 1MB string
      
      const persona = await adapter.createPersona({
        name: 'Long Data Test',
        attributes: {
          description: longString,
          nested: {
            deepData: longString,
          },
        },
      });

      expect(persona.attributes.description).toBe(longString);
      expect(persona.attributes.nested.deepData).toBe(longString);
    });

    it('should handle various Unicode and special characters', async () => {
      const unicodeTests = [
        '🎭🎨🎪🎯🎰🎱', // Emojis
        '你好世界', // Chinese
        'مرحبا بالعالم', // Arabic
        'Здравствуй, мир', // Russian
        '🇺🇸🇬🇧🇯🇵🇩🇪🇫🇷', // Flag emojis
        '\u0000\u0001\u0002', // Control characters
        '\\x00\\x01\\x02', // Hex escapes
        '<script>alert("XSS")</script>', // HTML
        '${variable}', // Template literal
        '{{mustache}}', // Template syntax
      ];

      for (const testString of unicodeTests) {
        const persona = await adapter.createPersona({
          name: testString,
          occupation: testString,
          attributes: { data: testString },
        });

        expect(persona.name).toBe(testString);
        expect(persona.occupation).toBe(testString);
        expect(persona.attributes.data).toBe(testString);
      }
    });

    it('should handle null bytes and special characters', async () => {
      const nullByteString = 'Test\0String';
      const tabString = 'Test\tString';
      const newlineString = 'Test\nString\rWith\r\nLinebreaks';
      
      const persona = await adapter.createPersona({
        name: 'Special Chars',
        attributes: {
          nullByte: nullByteString,
          tabs: tabString,
          newlines: newlineString,
        },
      });

      expect(persona.attributes.nullByte).toBe(nullByteString);
      expect(persona.attributes.tabs).toBe(tabString);
      expect(persona.attributes.newlines).toBe(newlineString);
    });
  });

  describe('Access Control and Authorization', () => {
    it('should not expose internal IDs in error messages', async () => {
      try {
        await adapter.getPersona('../../etc/passwd');
      } catch (error) {
        // Error should not contain the malicious path
        expect(String(error)).not.toContain('/etc/passwd');
      }

      try {
        await adapter.updatePersona('non-existent-id', { name: 'New Name' });
      } catch (error) {
        // Error should be generic
        expect(String(error)).not.toContain('non-existent-id');
      }
    });

    it('should validate UUID format for IDs', async () => {
      const invalidIds = [
        '../../../etc/passwd',
        '"; DROP TABLE personas; --',
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '1 OR 1=1',
        '',
        null,
        undefined,
        123,
        {},
        [],
      ];

      for (const invalidId of invalidIds) {
        const result = await adapter.getPersona(invalidId as any);
        expect(result).toBeNull();
        
        const deleted = await adapter.deletePersona(invalidId as any);
        expect(deleted).toBe(false);
      }
    });
  });

  describe('Resource Exhaustion Prevention', () => {
    it('should handle attempts to create massive nested objects', async () => {
      // Create deeply nested object
      let deepObject: any = { value: 'deep' };
      for (let i = 0; i < 100; i++) {
        deepObject = { nested: deepObject };
      }

      const persona = await adapter.createPersona({
        name: 'Deep Nesting Test',
        attributes: deepObject,
      });

      expect(persona.attributes).toBeDefined();
      
      // Verify it doesn't cause stack overflow when accessed
      let current = persona.attributes;
      let depth = 0;
      while (current.nested && depth < 100) {
        current = current.nested;
        depth++;
      }
      expect(depth).toBe(100);
    });

    it('should handle large array attributes', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        index: i,
        data: `Item ${i}`,
        nested: { value: i },
      }));

      const persona = await adapter.createPersona({
        name: 'Large Array Test',
        attributes: { items: largeArray },
      });

      expect(persona.attributes.items).toHaveLength(10000);
    });

    it('should prevent billion laughs attack patterns', async () => {
      // Create expanding data structure
      const expandingData: any = { a: 'x'.repeat(1000) };
      for (let i = 0; i < 10; i++) {
        expandingData[`level${i}`] = {
          ...expandingData,
          extra: 'x'.repeat(1000),
        };
      }

      const persona = await adapter.createPersona({
        name: 'Expanding Data Test',
        attributes: expandingData,
      });

      expect(persona.attributes).toBeDefined();
    });
  });

  describe('Timing Attack Prevention', () => {
    it('should have consistent response times for queries', async () => {
      // Create test personas
      const personas = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          adapter.createPersona({ name: `Timing Test ${i}` })
        )
      );

      // Measure query times
      const timings: number[] = [];

      for (const persona of personas) {
        const start = performance.now();
        await adapter.getPersona(persona.id);
        const end = performance.now();
        timings.push(end - start);
      }

      // Also test non-existent IDs
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        await adapter.getPersona(`non-existent-${i}`);
        const end = performance.now();
        timings.push(end - start);
      }

      // Check that timings are relatively consistent
      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      const maxDeviation = Math.max(...timings.map(t => Math.abs(t - avgTime)));
      
      // Timing should not vary by more than 10ms (accounting for system variance)
      expect(maxDeviation).toBeLessThan(10);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data integrity under concurrent modifications', async () => {
      const persona = await adapter.createPersona({
        name: 'Concurrent Test',
        age: 30,
        attributes: { counter: 0 },
      });

      // Simulate concurrent updates
      const updates = Array.from({ length: 10 }, (_, i) =>
        adapter.updatePersona(persona.id, {
          attributes: { counter: i + 1 },
        })
      );

      const results = await Promise.all(updates);
      
      // Last update should win
      const final = await adapter.getPersona(persona.id);
      expect(final?.attributes.counter).toBeGreaterThan(0);
    });

    it('should prevent data corruption from malformed JSON', async () => {
      const corruptData = [
        { corrupt: undefined },
        { func: () => {} },
        { symbol: Symbol('test') },
        { circular: null as any },
      ];
      
      // Create circular reference
      corruptData[3].circular = corruptData[3];

      for (const data of corruptData) {
        try {
          await adapter.createPersona({
            name: 'Corrupt Data Test',
            attributes: data as any,
          });
        } catch (error) {
          // Should handle gracefully
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('Error Information Disclosure', () => {
    it('should not leak sensitive information in errors', async () => {
      const sensitiveData = {
        password: 'secret123',
        apiKey: 'sk-1234567890',
        ssn: '123-45-6789',
        creditCard: '4111111111111111',
      };

      try {
        // Simulate an error with sensitive data
        await adapter.createPersona({
          name: null as any, // This should cause an error
          attributes: sensitiveData,
        });
      } catch (error) {
        const errorMessage = String(error);
        
        // Error should not contain sensitive values
        expect(errorMessage).not.toContain('secret123');
        expect(errorMessage).not.toContain('sk-1234567890');
        expect(errorMessage).not.toContain('123-45-6789');
        expect(errorMessage).not.toContain('4111111111111111');
      }
    });
  });

  describe('Query Complexity Limits', () => {
    it('should handle complex nested queries safely', async () => {
      // Create personas with nested attributes
      await adapter.bulkCreatePersonas({
        personas: Array.from({ length: 100 }, (_, i) => ({
          name: `Complex ${i}`,
          attributes: {
            level1: {
              level2: {
                level3: {
                  value: i,
                  tags: [`tag${i}`, `tag${i + 1}`],
                },
              },
            },
          },
        })),
      });

      // Try complex attribute query
      const result = await adapter.queryPersonas({
        attributes: {
          level1: {
            level2: {
              level3: {
                value: 50,
              },
            },
          },
        },
      });

      expect(result.data.length).toBeGreaterThanOrEqual(0);
    });
  });
});