/**
 * Integration tests between API and SDK
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PersonaBuilder, PersonaGroup, NormalDistribution, UniformDistribution } from '../../src/index.js';
import { PostgresAdapter } from '../../src/adapters/postgres/adapter.js';
import { createServer } from '../../src/api/server.js';
import { PersonaApiClient } from '../../src/api/client.js';
import type { FastifyInstance } from 'fastify';
import type { DatabaseClient, QueryResult } from '../../src/adapters/postgres/adapter.js';

// In-memory database mock
class InMemoryDatabaseClient implements DatabaseClient {
  private data = {
    personas: new Map<string, any>(),
    groups: new Map<string, any>(),
    memberships: new Map<string, any>(),
  };
  private idCounter = 1;

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    const sql = text.toLowerCase();

    // INSERT personas
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
      this.data.personas.set(id, persona);
      return { rows: [persona] as any, rowCount: 1 };
    }

    // SELECT personas by ID
    if (sql.includes('select * from personas where id')) {
      const persona = this.data.personas.get(values![0]);
      return { rows: persona ? [persona] : [], rowCount: persona ? 1 : 0 } as any;
    }

    // UPDATE personas
    if (sql.includes('update personas')) {
      const id = values![values!.length - 1];
      const persona = this.data.personas.get(id);
      if (persona) {
        // Parse SET clause to update fields
        if (sql.includes('name =')) persona.name = values![0];
        if (sql.includes('age =')) persona.age = values![sql.includes('name =') ? 1 : 0];
        persona.updated_at = new Date();
        return { rows: [persona] as any, rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // DELETE personas
    if (sql.includes('delete from personas')) {
      const deleted = this.data.personas.delete(values![0]);
      return { rows: [], rowCount: deleted ? 1 : 0 };
    }

    // COUNT personas
    if (sql.includes('count(*)') && sql.includes('personas')) {
      return { rows: [{ count: String(this.data.personas.size) }] as any, rowCount: 1 };
    }

    // SELECT personas with pagination
    if (sql.includes('select * from personas') && sql.includes('limit')) {
      const allPersonas = Array.from(this.data.personas.values());
      const limit = values![values!.length - 2] || 20;
      const offset = values![values!.length - 1] || 0;
      const personas = allPersonas
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(offset, offset + limit);
      return { rows: personas as any, rowCount: personas.length };
    }

    // INSERT groups
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
      this.data.groups.set(id, group);
      return { rows: [group] as any, rowCount: 1 };
    }

    // SELECT groups by ID
    if (sql.includes('select * from persona_groups where id')) {
      const group = this.data.groups.get(values![0]);
      return { rows: group ? [group] : [], rowCount: group ? 1 : 0 } as any;
    }

    // INSERT memberships
    if (sql.includes('insert into persona_group_members')) {
      const membershipId = `12345678-1234-1234-1234-${String(this.idCounter++).padStart(12, '0')}`;
      this.data.memberships.set(membershipId, {
        persona_id: values![0],
        group_id: values![1],
      });
      return { rows: [], rowCount: 1 };
    }

    // Stats query
    if (sql.includes('total_personas')) {
      return {
        rows: [{
          total_personas: String(this.data.personas.size),
          total_groups: String(this.data.groups.size),
          avg_group_size: '0',
        }] as any,
        rowCount: 1,
      };
    }

    // Default empty result
    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    return callback(this);
  }

  // Test helper to clear data
  clear() {
    this.data.personas.clear();
    this.data.groups.clear();
    this.data.memberships.clear();
  }
}

describe('API and SDK Integration', () => {
  let server: FastifyInstance;
  let client: PersonaApiClient;
  let dbClient: InMemoryDatabaseClient;
  const baseUrl = 'http://localhost:3001';

  beforeAll(async () => {
    // Create in-memory database
    dbClient = new InMemoryDatabaseClient();

    // Start server
    server = await createServer({
      databaseClient: dbClient,
      port: 3001,
      host: 'localhost',
      cors: true,
      swagger: false,
      logger: false,
    });

    await server.listen({ port: 3001, host: 'localhost' });

    // Create API client
    client = new PersonaApiClient({ baseUrl });
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    dbClient.clear();
  });

  describe('SDK to API Integration', () => {
    it('should create personas via SDK and retrieve via API', async () => {
      // Create persona using SDK
      const persona = PersonaBuilder.create()
        .withName('Alice Johnson')
        .withAge(28)
        .withOccupation('Software Engineer')
        .withSex('female')
        .build();

      // Save via API
      const created = await client.createPersona({
        name: persona.name,
        age: persona.age,
        occupation: persona.occupation,
        sex: persona.sex,
        attributes: persona.attributes,
      });

      expect(created.name).toBe('Alice Johnson');
      expect(created.age).toBe(28);

      // Retrieve via API
      const retrieved = await client.getPersona(created.id);
      expect(retrieved.name).toBe('Alice Johnson');
    });

    it('should handle PersonaGroup operations', async () => {
      // Create group via API
      const group = await client.createGroup({
        name: 'Tech Workers',
        description: 'Software engineers and developers',
      });

      expect(group.name).toBe('Tech Workers');

      // Create personas
      const personas = await client.bulkCreatePersonas({
        personas: [
          { name: 'Developer 1', occupation: 'Frontend Developer' },
          { name: 'Developer 2', occupation: 'Backend Developer' },
          { name: 'Developer 3', occupation: 'DevOps Engineer' },
        ],
        groupId: group.id,
      });

      expect(personas).toHaveLength(3);
    });

    it('should generate personas from distributions', async () => {
      // Use SDK to create distribution-based personas
      const group = new PersonaGroup('Statistical Group');
      const ageDistribution = new NormalDistribution(32, 5);
      const experienceDistribution = new UniformDistribution(1, 10);

      // Generate test data
      const testPersonas = Array.from({ length: 10 }, (_, i) => ({
        name: `Person ${i}`,
        age: Math.round(ageDistribution.sample()),
        attributes: {
          yearsExperience: Math.round(experienceDistribution.sample()),
        },
      }));

      // Create via API
      const created = await client.bulkCreatePersonas({
        personas: testPersonas,
      });

      expect(created).toHaveLength(10);
      
      // Verify distribution properties
      const ages = created.map(p => p.age!);
      const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
      expect(avgAge).toBeGreaterThan(25);
      expect(avgAge).toBeLessThan(40);
    });

    it('should handle pagination', async () => {
      // Create many personas
      const personas = Array.from({ length: 50 }, (_, i) => ({
        name: `Person ${i}`,
        age: 20 + i,
      }));

      await client.bulkCreatePersonas({ personas });

      // Query with pagination
      const page1 = await client.queryPersonas({ limit: 20, offset: 0 });
      expect(page1.data).toHaveLength(20);
      expect(page1.total).toBe(50);
      expect(page1.hasMore).toBe(true);

      const page2 = await client.queryPersonas({ limit: 20, offset: 20 });
      expect(page2.data).toHaveLength(20);
      expect(page2.hasMore).toBe(true);

      const page3 = await client.queryPersonas({ limit: 20, offset: 40 });
      expect(page3.data).toHaveLength(10);
      expect(page3.hasMore).toBe(false);
    });

    it('should handle complex queries', async () => {
      // Create diverse personas
      await client.bulkCreatePersonas({
        personas: [
          { name: 'Alice', age: 25, occupation: 'Engineer' },
          { name: 'Bob', age: 35, occupation: 'Designer' },
          { name: 'Charlie', age: 45, occupation: 'Manager' },
          { name: 'Diana', age: 30, occupation: 'Engineer' },
          { name: 'Eve', age: 28, occupation: 'Engineer' },
        ],
      });

      // Query by occupation
      const engineers = await client.queryPersonas({
        occupation: 'Engineer',
      });

      expect(engineers.data).toHaveLength(3);
      expect(engineers.data.every(p => p.occupation === 'Engineer')).toBe(true);

      // Query by age range
      const youngAdults = await client.queryPersonas({
        age: { min: 25, max: 30 },
      });

      expect(youngAdults.data).toHaveLength(3);
      expect(youngAdults.data.every(p => p.age! >= 25 && p.age! <= 30)).toBe(true);
    });

    it('should get statistics', async () => {
      // Create test data
      await client.createGroup({ name: 'Group 1' });
      await client.createGroup({ name: 'Group 2' });
      
      await client.bulkCreatePersonas({
        personas: [
          { name: 'Person 1' },
          { name: 'Person 2' },
          { name: 'Person 3' },
        ],
      });

      const stats = await client.getStats();
      
      expect(stats.totalPersonas).toBe(3);
      expect(stats.totalGroups).toBe(2);
    });

    it('should handle errors gracefully', async () => {
      // Try to get non-existent persona
      await expect(client.getPersona('non-existent-id')).rejects.toThrow();

      // Try to update non-existent persona
      await expect(
        client.updatePersona('non-existent-id', { name: 'New Name' })
      ).rejects.toThrow();

      // Try to delete non-existent persona
      await expect(client.deletePersona('non-existent-id')).rejects.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent persona creation', async () => {
      const promises = Array.from({ length: 20 }, (_, i) =>
        client.createPersona({ name: `Concurrent ${i}` })
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(20);
      expect(new Set(results.map(r => r.id)).size).toBe(20); // All unique IDs
    });

    it('should handle mixed concurrent operations', async () => {
      // Create initial data
      const group = await client.createGroup({ name: 'Concurrent Group' });
      const persona = await client.createPersona({ name: 'Initial Person' });

      // Perform mixed operations concurrently
      const operations = [
        client.createPersona({ name: 'New Person 1' }),
        client.createPersona({ name: 'New Person 2' }),
        client.updatePersona(persona.id, { age: 30 }),
        client.getPersona(persona.id),
        client.queryPersonas({ limit: 10 }),
        client.getStats(),
      ];

      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(6);
      expect(results[0]).toHaveProperty('name', 'New Person 1');
      expect(results[1]).toHaveProperty('name', 'New Person 2');
    });
  });
});