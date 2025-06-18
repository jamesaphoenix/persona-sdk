/**
 * Stress tests for PostgreSQL adapter
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgresAdapter } from '../../../src/adapters/postgres/adapter.js';
import type { DatabaseClient, QueryResult } from '../../../src/adapters/postgres/adapter.js';
import type { PersonaRecord, PersonaGroupRecord } from '../../../src/adapters/postgres/types.js';

// Enhanced mock database with realistic constraints
class StressMockDatabaseClient implements DatabaseClient {
  private data = {
    personas: new Map<string, PersonaRecord>(),
    groups: new Map<string, PersonaGroupRecord>(),
    memberships: new Map<string, { persona_id: string; group_id: string; joined_at: Date }>(),
  };
  private queryCount = 0;
  private transactionCount = 0;
  private errorRate = 0; // Percentage of queries that should fail

  setErrorRate(rate: number) {
    this.errorRate = rate;
  }

  getStats() {
    return {
      queryCount: this.queryCount,
      transactionCount: this.transactionCount,
      personaCount: this.data.personas.size,
      groupCount: this.data.groups.size,
      membershipCount: this.data.memberships.size,
    };
  }

  private shouldFail(): boolean {
    return Math.random() * 100 < this.errorRate;
  }

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    this.queryCount++;

    // Simulate random failures
    if (this.shouldFail()) {
      throw new Error('Database connection error');
    }

    // Simulate query latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

    const sql = text.toLowerCase();

    // Enhanced persona creation with validation
    if (sql.includes('insert into personas')) {
      if (!values![0]) {
        throw new Error('NOT NULL constraint violation: name');
      }

      const id = `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const persona: PersonaRecord = {
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

      // Validate age constraint
      if (persona.age !== null && persona.age !== undefined) {
        if (persona.age < 0 || persona.age > 150) {
          throw new Error('CHECK constraint violation: age must be between 0 and 150');
        }
      }

      this.data.personas.set(id, persona);
      return { rows: [persona] as any, rowCount: 1 };
    }

    // Complex query handling
    if (sql.includes('select * from personas') && !sql.includes('where id')) {
      const allPersonas = Array.from(this.data.personas.values());
      let filtered = allPersonas;

      // Apply WHERE conditions
      if (sql.includes('where')) {
        const whereMatch = sql.match(/where\s+(.+?)(?:order|limit|$)/);
        if (whereMatch) {
          const conditions = whereMatch[1];
          
          if (conditions.includes('name ilike')) {
            const namePattern = values![0].replace(/%/g, '');
            filtered = filtered.filter(p => 
              p.name.toLowerCase().includes(namePattern.toLowerCase())
            );
          }

          if (conditions.includes('age >=') && conditions.includes('age <=')) {
            const minAge = values![conditions.includes('name') ? 1 : 0];
            const maxAge = values![conditions.includes('name') ? 2 : 1];
            filtered = filtered.filter(p => 
              p.age !== null && p.age >= minAge && p.age <= maxAge
            );
          }

          if (conditions.includes('attributes @>')) {
            const attributeIndex = values!.findIndex(v => typeof v === 'object' && !Array.isArray(v));
            if (attributeIndex !== -1) {
              const requiredAttrs = values![attributeIndex];
              filtered = filtered.filter(p => {
                for (const [key, value] of Object.entries(requiredAttrs)) {
                  if (p.attributes[key] !== value) return false;
                }
                return true;
              });
            }
          }
        }
      }

      // Apply ORDER BY
      if (sql.includes('order by')) {
        const orderMatch = sql.match(/order by\s+(\w+)\s*(asc|desc)?/);
        if (orderMatch) {
          const field = orderMatch[1];
          const direction = orderMatch[2] || 'asc';
          filtered.sort((a, b) => {
            const aVal = a[field as keyof PersonaRecord];
            const bVal = b[field as keyof PersonaRecord];
            const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            return direction === 'desc' ? -cmp : cmp;
          });
        }
      }

      // Apply LIMIT and OFFSET
      if (sql.includes('limit')) {
        const limit = values![values!.length - 2];
        const offset = values![values!.length - 1];
        filtered = filtered.slice(offset, offset + limit);
      }

      return { rows: filtered as any, rowCount: filtered.length };
    }

    // Count queries
    if (sql.includes('count(*)')) {
      if (sql.includes('personas')) {
        return { rows: [{ count: String(this.data.personas.size) }] as any, rowCount: 1 };
      }
      if (sql.includes('persona_groups')) {
        return { rows: [{ count: String(this.data.groups.size) }] as any, rowCount: 1 };
      }
    }

    // Group operations
    if (sql.includes('insert into persona_groups')) {
      const id = `g_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const group: PersonaGroupRecord = {
        id,
        name: values![0],
        description: values![1],
        metadata: values![2] || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.groups.set(id, group);
      return { rows: [group] as any, rowCount: 1 };
    }

    // Membership operations
    if (sql.includes('insert into persona_group_members')) {
      // Check for existing membership
      for (const membership of this.data.memberships.values()) {
        if (membership.persona_id === values![0] && membership.group_id === values![1]) {
          // ON CONFLICT DO NOTHING
          return { rows: [], rowCount: 0 };
        }
      }

      const membershipId = `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.data.memberships.set(membershipId, {
        persona_id: values![0],
        group_id: values![1],
        joined_at: new Date(),
      });
      return { rows: [], rowCount: 1 };
    }

    // Group members query
    if (sql.includes('join persona_group_members')) {
      const groupId = values![0];
      const members: PersonaRecord[] = [];
      
      for (const membership of this.data.memberships.values()) {
        if (membership.group_id === groupId) {
          const persona = this.data.personas.get(membership.persona_id);
          if (persona) members.push(persona);
        }
      }

      return { rows: members as any, rowCount: members.length };
    }

    // Default empty result
    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    this.transactionCount++;
    
    // Create a snapshot of current data
    const snapshot = {
      personas: new Map(this.data.personas),
      groups: new Map(this.data.groups),
      memberships: new Map(this.data.memberships),
    };

    try {
      const result = await callback(this);
      return result;
    } catch (error) {
      // Rollback on error
      this.data = snapshot;
      throw error;
    }
  }

  clear() {
    this.data.personas.clear();
    this.data.groups.clear();
    this.data.memberships.clear();
    this.queryCount = 0;
    this.transactionCount = 0;
  }
}

describe('PostgreSQL Adapter - Stress Tests', () => {
  let adapter: PostgresAdapter;
  let mockClient: StressMockDatabaseClient;

  beforeAll(() => {
    mockClient = new StressMockDatabaseClient();
    adapter = new PostgresAdapter(mockClient);
  });

  afterAll(() => {
    mockClient.clear();
  });

  describe('High Volume Operations', () => {
    it('should handle creating 1000 personas efficiently', async () => {
      const startTime = Date.now();
      const personas: any[] = [];

      for (let i = 0; i < 1000; i++) {
        const persona = await adapter.createPersona({
          name: `Stress Test Person ${i}`,
          age: Math.floor(Math.random() * 50) + 20,
          occupation: ['Engineer', 'Designer', 'Manager', 'Analyst'][i % 4],
          attributes: {
            testRun: 'stress-test',
            index: i,
            random: Math.random(),
          },
        });
        personas.push(persona);
      }

      const duration = Date.now() - startTime;
      console.log(`Created 1000 personas in ${duration}ms (${duration / 1000}ms per persona)`);

      expect(personas).toHaveLength(1000);
      expect(duration).toBeLessThan(10000); // Should complete in under 10 seconds

      const stats = mockClient.getStats();
      expect(stats.personaCount).toBe(1000);
    });

    it('should handle bulk creation of 5000 personas', async () => {
      mockClient.clear();
      
      const startTime = Date.now();
      const batchSize = 100;
      const totalPersonas = 5000;

      for (let batch = 0; batch < totalPersonas / batchSize; batch++) {
        const personas = Array.from({ length: batchSize }, (_, i) => ({
          name: `Bulk Person ${batch * batchSize + i}`,
          age: 20 + (i % 50),
          occupation: ['Dev', 'QA', 'PM', 'Designer'][i % 4],
          attributes: {
            batch,
            index: i,
            timestamp: Date.now(),
          },
        }));

        await adapter.bulkCreatePersonas({ personas });
      }

      const duration = Date.now() - startTime;
      console.log(`Bulk created 5000 personas in ${duration}ms`);

      expect(mockClient.getStats().personaCount).toBe(5000);
      expect(duration).toBeLessThan(30000); // Should complete in under 30 seconds
    });

    it('should efficiently query large datasets with complex filters', async () => {
      // Ensure we have data
      if (mockClient.getStats().personaCount < 1000) {
        await adapter.bulkCreatePersonas({
          personas: Array.from({ length: 1000 }, (_, i) => ({
            name: `Query Test ${i}`,
            age: 20 + (i % 60),
            occupation: ['Engineer', 'Designer', 'Manager', 'Analyst'][i % 4],
            attributes: {
              department: ['IT', 'HR', 'Sales', 'Marketing'][i % 4],
              level: Math.floor(i / 250) + 1,
            },
          })),
        });
      }

      const startTime = Date.now();

      // Complex query 1: Age range + occupation
      const engineers = await adapter.queryPersonas({
        age: { min: 25, max: 35 },
        occupation: 'Engineer',
        limit: 50,
      });

      // Complex query 2: Attribute filtering
      const seniorIT = await adapter.queryPersonas({
        attributes: { department: 'IT', level: 4 },
        limit: 20,
      });

      // Complex query 3: Name search with pagination
      const namedPersonas = await adapter.queryPersonas({
        name: 'Query Test 1',
        limit: 10,
        offset: 0,
      });

      const duration = Date.now() - startTime;
      console.log(`Executed 3 complex queries in ${duration}ms`);

      expect(engineers.data.length).toBeGreaterThan(0);
      expect(engineers.data.every(p => p.occupation === 'Engineer')).toBe(true);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle 100 concurrent persona creations', async () => {
      mockClient.clear();

      const concurrentOps = 100;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentOps }, (_, i) =>
        adapter.createPersona({
          name: `Concurrent Person ${i}`,
          age: 25 + (i % 40),
          attributes: { concurrent: true, index: i },
        })
      );

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      console.log(`Completed ${concurrentOps} concurrent creations in ${duration}ms`);

      expect(results).toHaveLength(concurrentOps);
      expect(new Set(results.map(r => r.id)).size).toBe(concurrentOps); // All unique IDs
      expect(mockClient.getStats().personaCount).toBe(concurrentOps);
    });

    it('should handle mixed concurrent read/write operations', async () => {
      // Seed with initial data
      const initialPersonas = await adapter.bulkCreatePersonas({
        personas: Array.from({ length: 50 }, (_, i) => ({
          name: `Initial Person ${i}`,
          age: 30,
        })),
      });

      const group = await adapter.createPersonaGroup({
        name: 'Concurrent Test Group',
      });

      const operations = [
        // Writes
        ...Array.from({ length: 20 }, (_, i) =>
          adapter.createPersona({ name: `New Person ${i}` })
        ),
        // Reads
        ...Array.from({ length: 20 }, () =>
          adapter.queryPersonas({ limit: 10 })
        ),
        // Updates
        ...initialPersonas.slice(0, 10).map(p =>
          adapter.updatePersona(p.id, { age: 31 })
        ),
        // Group operations
        ...initialPersonas.slice(0, 10).map(p =>
          adapter.addPersonaToGroup(p.id, group.id)
        ),
      ];

      const startTime = Date.now();
      const results = await Promise.allSettled(operations);
      const duration = Date.now() - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`Mixed operations: ${successful} successful, ${failed} failed in ${duration}ms`);

      expect(successful).toBeGreaterThan(50); // Most should succeed
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Error Recovery', () => {
    it('should handle intermittent database failures gracefully', async () => {
      mockClient.clear();
      mockClient.setErrorRate(10); // 10% failure rate

      const attempts = 100;
      let successes = 0;
      let failures = 0;

      for (let i = 0; i < attempts; i++) {
        try {
          await adapter.createPersona({
            name: `Error Test ${i}`,
            age: 30,
          });
          successes++;
        } catch (error) {
          failures++;
        }
      }

      console.log(`With 10% error rate: ${successes} successes, ${failures} failures`);

      expect(successes).toBeGreaterThan(80); // Should succeed most of the time
      expect(failures).toBeGreaterThan(5); // Should have some failures
      expect(successes + failures).toBe(attempts);

      mockClient.setErrorRate(0); // Reset error rate
    });

    it('should maintain data consistency during transaction failures', async () => {
      mockClient.clear();

      const initialCount = mockClient.getStats().personaCount;

      try {
        await adapter.bulkCreatePersonas({
          personas: [
            { name: 'Transaction Test 1' },
            { name: '' }, // This should fail
            { name: 'Transaction Test 3' },
          ],
        });
      } catch (error) {
        // Expected to fail
      }

      // Transaction should have rolled back
      expect(mockClient.getStats().personaCount).toBe(initialCount);
    });
  });

  describe('Memory Efficiency', () => {
    it('should handle large result sets without excessive memory usage', async () => {
      // Create a large dataset
      await adapter.bulkCreatePersonas({
        personas: Array.from({ length: 10000 }, (_, i) => ({
          name: `Memory Test ${i}`,
          age: 20 + (i % 60),
          attributes: {
            data: 'x'.repeat(100), // 100 chars of data per persona
            index: i,
          },
        })),
      });

      const memBefore = process.memoryUsage().heapUsed;

      // Query in batches
      const batchSize = 100;
      const batches = 10;
      
      for (let i = 0; i < batches; i++) {
        const result = await adapter.queryPersonas({
          limit: batchSize,
          offset: i * batchSize,
        });
        
        expect(result.data).toHaveLength(batchSize);
        
        // Process and discard to simulate real usage
        result.data.forEach(p => {
          // Simulate processing
          const processed = JSON.stringify(p);
        });
      }

      const memAfter = process.memoryUsage().heapUsed;
      const memUsed = (memAfter - memBefore) / 1024 / 1024; // MB

      console.log(`Memory used for processing 1000 personas: ${memUsed.toFixed(2)}MB`);
      expect(memUsed).toBeLessThan(50); // Should use less than 50MB
    });
  });

  describe('Edge Cases', () => {
    it('should handle personas with maximum field lengths', async () => {
      const longName = 'A'.repeat(255); // Max VARCHAR length
      const largeAttributes = {
        description: 'x'.repeat(10000),
        tags: Array.from({ length: 100 }, (_, i) => `tag${i}`),
        nested: {
          level1: {
            level2: {
              level3: {
                data: 'deeply nested data',
              },
            },
          },
        },
      };

      const persona = await adapter.createPersona({
        name: longName,
        age: 150, // Max age
        attributes: largeAttributes,
      });

      expect(persona.name).toBe(longName);
      expect(persona.age).toBe(150);
      expect(persona.attributes).toEqual(largeAttributes);
    });

    it('should handle special characters in all fields', async () => {
      const specialChars = `Test "quotes" 'apostrophes' \\ backslash / slash
        新 中文 العربية emoji 😀 tabs\ttabs newlines\nnewlines`;

      const persona = await adapter.createPersona({
        name: specialChars,
        occupation: specialChars,
        attributes: {
          special: specialChars,
          unicode: '🎭🎨🎪🎯',
        },
      });

      expect(persona.name).toBe(specialChars);
      expect(persona.attributes.special).toBe(specialChars);
    });

    it('should handle null and undefined values correctly', async () => {
      const persona = await adapter.createPersona({
        name: 'Null Test',
        age: null as any,
        occupation: undefined,
        sex: null as any,
        attributes: {
          nullValue: null,
          undefinedValue: undefined,
        },
      });

      expect(persona.name).toBe('Null Test');
      expect(persona.age).toBeNull();
      expect(persona.occupation).toBeNull();
      expect(persona.sex).toBeNull();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance targets for common operations', async () => {
      const benchmarks = {
        singleCreate: { target: 10, actual: 0 },
        bulkCreate100: { target: 100, actual: 0 },
        simpleQuery: { target: 20, actual: 0 },
        complexQuery: { target: 50, actual: 0 },
        update: { target: 10, actual: 0 },
        delete: { target: 10, actual: 0 },
      };

      // Single create
      let start = Date.now();
      await adapter.createPersona({ name: 'Benchmark Test' });
      benchmarks.singleCreate.actual = Date.now() - start;

      // Bulk create
      start = Date.now();
      await adapter.bulkCreatePersonas({
        personas: Array.from({ length: 100 }, (_, i) => ({
          name: `Bulk Benchmark ${i}`,
        })),
      });
      benchmarks.bulkCreate100.actual = Date.now() - start;

      // Simple query
      start = Date.now();
      await adapter.queryPersonas({ limit: 20 });
      benchmarks.simpleQuery.actual = Date.now() - start;

      // Complex query
      start = Date.now();
      await adapter.queryPersonas({
        name: 'Benchmark',
        age: { min: 20, max: 40 },
        limit: 50,
        orderBy: 'created_at',
        orderDirection: 'desc',
      });
      benchmarks.complexQuery.actual = Date.now() - start;

      // Update
      const personaToUpdate = await adapter.createPersona({ name: 'Update Test' });
      start = Date.now();
      await adapter.updatePersona(personaToUpdate.id, { age: 35 });
      benchmarks.update.actual = Date.now() - start;

      // Delete
      start = Date.now();
      await adapter.deletePersona(personaToUpdate.id);
      benchmarks.delete.actual = Date.now() - start;

      console.log('Performance Benchmarks:');
      Object.entries(benchmarks).forEach(([op, { target, actual }]) => {
        const status = actual <= target ? '✅' : '❌';
        console.log(`  ${op}: ${actual}ms (target: ${target}ms) ${status}`);
        expect(actual).toBeLessThan(target * 2); // Allow 2x target for CI environments
      });
    });
  });
});