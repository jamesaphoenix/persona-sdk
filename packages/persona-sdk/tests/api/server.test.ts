/**
 * Comprehensive tests for Fastify API server
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createServer } from '../../src/api/server.js';
import type { FastifyInstance } from 'fastify';
import type { DatabaseClient, QueryResult } from '../../src/adapters/postgres/adapter.js';

// Mock database for testing
class MockApiDatabaseClient implements DatabaseClient {
  private data = {
    personas: new Map<string, any>(),
    groups: new Map<string, any>(),
    memberships: new Map<string, any>(),
  };
  private idCounter = 1;

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    const sql = text.toLowerCase();
    
    
    // Stats query (complex with subqueries) - check early to avoid conflicts
    if (sql.includes('total_personas') && sql.includes('total_groups') && sql.includes('avg_group_size')) {
      return {
        rows: [{
          total_personas: String(this.data.personas.size),
          total_groups: String(this.data.groups.size),
          avg_group_size: '0',
        }] as any,
        rowCount: 1,
      };
    }

    // Personas operations
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

    if (sql.includes('select * from personas where id')) {
      const persona = this.data.personas.get(values![0]);
      return { rows: persona ? [persona] : [], rowCount: persona ? 1 : 0 } as any;
    }

    if (sql.includes('update personas')) {
      const id = values![values!.length - 1];
      const persona = this.data.personas.get(id);
      if (persona) {
        let valueIndex = 0;
        if (sql.includes('name =')) persona.name = values![valueIndex++];
        if (sql.includes('age =')) persona.age = values![valueIndex++];
        if (sql.includes('occupation =')) persona.occupation = values![valueIndex++];
        if (sql.includes('sex =')) persona.sex = values![valueIndex++];
        if (sql.includes('attributes =')) persona.attributes = values![valueIndex++];
        if (sql.includes('metadata =')) persona.metadata = values![valueIndex++];
        persona.updated_at = new Date();
        return { rows: [persona] as any, rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (sql.includes('delete from personas')) {
      const deleted = this.data.personas.delete(values![0]);
      return { rows: [], rowCount: deleted ? 1 : 0 };
    }

    // Count queries
    if (sql.includes('count(*)')) {
      let count = 0;
      if (sql.includes('personas')) {
        let personas = Array.from(this.data.personas.values());
        
        // Apply same filtering logic as data queries
        if (sql.includes('where') && sql.includes('name ilike')) {
          const nameFilter = values![0];
          const cleanFilter = nameFilter.replace(/%/g, '').toLowerCase();
          personas = personas.filter(p => 
            p.name.toLowerCase().includes(cleanFilter)
          );
        }
        
        count = personas.length;
      } else if (sql.includes('persona_groups')) {
        count = this.data.groups.size;
      }
      return { rows: [{ count: String(count) }] as any, rowCount: 1 };
    }

    // Complex select queries for personas
    if (sql.includes('select * from personas')) {
      let personas = Array.from(this.data.personas.values());
      let paramIndex = 0;
      
      // Handle WHERE conditions
      if (sql.includes('where')) {
        if (sql.includes('name ilike') || sql.includes('name like')) {
          const nameFilter = values![paramIndex++];
          // Remove % wildcards and check if the name contains the filter
          const cleanFilter = nameFilter.replace(/%/g, '').toLowerCase();
          personas = personas.filter(p => 
            p.name.toLowerCase().includes(cleanFilter)
          );
        }
        
        if (sql.includes('age >=') && sql.includes('age <=')) {
          const minAge = values![paramIndex++];
          const maxAge = values![paramIndex++];
          personas = personas.filter(p => p.age >= minAge && p.age <= maxAge);
        }
        
        if (sql.includes('occupation =')) {
          const occupation = values![paramIndex++];
          personas = personas.filter(p => p.occupation === occupation);
        }
      }
      
      // Handle ORDER BY
      if (sql.includes('order by')) {
        if (sql.includes('age')) {
          personas.sort((a, b) => {
            const result = (a.age || 0) - (b.age || 0);
            return sql.includes('desc') ? -result : result;
          });
        } else if (sql.includes('name')) {
          personas.sort((a, b) => {
            const result = (a.name || '').localeCompare(b.name || '');
            return sql.includes('desc') ? -result : result;
          });
        } else if (sql.includes('created_at')) {
          personas.sort((a, b) => {
            const result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            return sql.includes('desc') ? -result : result;
          });
        }
      }
      
      // Handle LIMIT and OFFSET
      if (sql.includes('limit')) {
        const limit = values![values!.length - 2] || 20;
        const offset = values![values!.length - 1] || 0;
        personas = personas.slice(offset, offset + limit);
      }
      
      return { rows: personas as any, rowCount: personas.length };
    }

    // Groups operations
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

    if (sql.includes('select * from persona_groups where id')) {
      const group = this.data.groups.get(values![0]);
      return { rows: group ? [group] : [], rowCount: group ? 1 : 0 } as any;
    }

    // Memberships
    if (sql.includes('insert into persona_group_members')) {
      const id = `12345678-1234-1234-1234-${String(this.idCounter++).padStart(12, '0')}`;
      this.data.memberships.set(id, {
        persona_id: values![0],
        group_id: values![1],
      });
      return { rows: [], rowCount: 1 };
    }

    if (sql.includes('delete from persona_group_members')) {
      for (const [id, m] of this.data.memberships.entries()) {
        if (m.persona_id === values![0] && m.group_id === values![1]) {
          this.data.memberships.delete(id);
          return { rows: [], rowCount: 1 };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    // Group with members
    if (sql.includes('get_persona_group_with_members')) {
      const group = this.data.groups.get(values![0]);
      if (!group) return { rows: [], rowCount: 0 };

      const members: any[] = [];
      for (const m of this.data.memberships.values()) {
        if (m.group_id === values![0]) {
          const persona = this.data.personas.get(m.persona_id);
          if (persona) members.push(persona);
        }
      }

      return {
        rows: [{
          group_id: group.id,
          group_name: group.name,
          group_description: group.description,
          personas: members,
        }] as any,
        rowCount: 1,
      };
    }


    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    return callback(this);
  }

  clear() {
    this.data.personas.clear();
    this.data.groups.clear();
    this.data.memberships.clear();
    this.idCounter = 1;
  }
}

describe('API Server', () => {
  let app: FastifyInstance;
  let dbClient: MockApiDatabaseClient;

  beforeAll(async () => {
    dbClient = new MockApiDatabaseClient();
    app = await createServer({
      databaseClient: dbClient,
      logger: false,
      swagger: false,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    dbClient.clear();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });

  describe('Personas Endpoints', () => {
    describe('POST /personas', () => {
      it('should create a persona with valid data', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: {
            name: 'John Doe',
            age: 30,
            occupation: 'Engineer',
            sex: 'male',
            attributes: { skills: ['JavaScript', 'TypeScript'] },
          },
        });

        expect(response.statusCode).toBe(201);
        const persona = response.json();
        expect(persona).toMatchObject({
          name: 'John Doe',
          age: 30,
          occupation: 'Engineer',
          sex: 'male',
          attributes: { skills: ['JavaScript', 'TypeScript'] },
        });
        expect(persona.id).toBeDefined();
        expect(persona.created_at).toBeDefined();
      });

      it('should reject invalid persona data', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: {
            // Missing required name field
            age: 'not a number',
          },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toHaveProperty('error');
      });

      it('should handle edge case values', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: {
            name: 'Edge Case',
            age: 0, // Minimum age
            occupation: '', // Empty string
            sex: null,
            attributes: {
              nested: {
                deep: {
                  value: 'test',
                },
              },
              array: [1, 2, 3],
              null: null,
            },
          },
        });

        expect(response.statusCode).toBe(201);
        const persona = response.json();
        expect(persona.age).toBe(0);
        expect(persona.attributes.nested.deep.value).toBe('test');
      });
    });

    describe('GET /personas/:id', () => {
      it('should retrieve an existing persona', async () => {
        // Create a persona first
        const createResponse = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: { name: 'Test Person' },
        });
        const created = createResponse.json();

        const response = await app.inject({
          method: 'GET',
          url: `/personas/${created.id}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchObject({ name: 'Test Person' });
      });

      it('should return 404 for non-existent persona', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/personas/12345678-1234-1234-1234-123456789012',
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toEqual({ error: 'Persona not found' });
      });
    });

    describe('PATCH /personas/:id', () => {
      it('should update persona fields', async () => {
        // Create a persona
        const createResponse = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: { name: 'Original Name', age: 25 },
        });
        const created = createResponse.json();

        // Update it
        const response = await app.inject({
          method: 'PATCH',
          url: `/personas/${created.id}`,
          payload: {
            name: 'Updated Name',
            age: 26,
            occupation: 'Developer',
          },
        });

        expect(response.statusCode).toBe(200);
        const updated = response.json();
        expect(updated.name).toBe('Updated Name');
        expect(updated.age).toBe(26);
        expect(updated.occupation).toBe('Developer');
      });

      it('should handle partial updates', async () => {
        const createResponse = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: { name: 'Test', age: 30, occupation: 'Original' },
        });
        const created = createResponse.json();

        const response = await app.inject({
          method: 'PATCH',
          url: `/personas/${created.id}`,
          payload: { age: 31 }, // Only update age
        });

        expect(response.statusCode).toBe(200);
        const updated = response.json();
        expect(updated.age).toBe(31);
        expect(updated.name).toBe('Test'); // Unchanged
        expect(updated.occupation).toBe('Original'); // Unchanged
      });

      it('should handle null values in updates', async () => {
        const createResponse = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: { name: 'Test', age: 30, occupation: 'Engineer' },
        });
        const created = createResponse.json();

        const response = await app.inject({
          method: 'PATCH',
          url: `/personas/${created.id}`,
          payload: { occupation: null }, // Set to null
        });

        expect(response.statusCode).toBe(200);
        const updated = response.json();
        expect(updated.occupation).toBeNull();
      });
    });

    describe('DELETE /personas/:id', () => {
      it('should delete an existing persona', async () => {
        const createResponse = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: { name: 'To Delete' },
        });
        const created = createResponse.json();

        const response = await app.inject({
          method: 'DELETE',
          url: `/personas/${created.id}`,
        });

        expect(response.statusCode).toBe(204);
        expect(response.body).toBe('');

        // Verify it's deleted
        const getResponse = await app.inject({
          method: 'GET',
          url: `/personas/${created.id}`,
        });
        expect(getResponse.statusCode).toBe(404);
      });

      it('should return 404 when deleting non-existent persona', async () => {
        const response = await app.inject({
          method: 'DELETE',
          url: '/personas/12345678-1234-1234-1234-123456789012',
        });

        expect(response.statusCode).toBe(404);
      });
    });

    describe('GET /personas', () => {
      beforeEach(async () => {
        // Create test data
        for (let i = 0; i < 30; i++) {
          await app.inject({
            method: 'POST',
            url: '/personas',
            payload: {
              name: `Person ${i}`,
              age: 20 + (i % 40),
              occupation: ['Engineer', 'Designer', 'Manager'][i % 3],
              attributes: { index: i },
            },
          });
        }
      });

      it('should return paginated results with default parameters', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/personas',
        });

        expect(response.statusCode).toBe(200);
        const result = response.json();
        expect(result.data).toHaveLength(20); // Default limit
        expect(result.total).toBe(30);
        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(20);
        expect(result.hasMore).toBe(true);
      });

      it('should support custom pagination parameters', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/personas?limit=5&offset=10',
        });

        expect(response.statusCode).toBe(200);
        const result = response.json();
        expect(result.data).toHaveLength(5);
        expect(result.page).toBe(3); // offset 10 / limit 5 + 1
        expect(result.hasMore).toBe(true);
      });

      it('should filter by name', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/personas?name=Person 1',
        });

        expect(response.statusCode).toBe(200);
        const result = response.json();
        expect(result.data.every((p: any) => p.name.includes('Person 1'))).toBe(true);
      });

      it('should filter by age range', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/personas?age=' + encodeURIComponent(JSON.stringify({ min: 25, max: 30 })),
        });

        expect(response.statusCode).toBe(200);
        const result = response.json();
        expect(result.data.every((p: any) => p.age >= 25 && p.age <= 30)).toBe(true);
      });

      it('should sort results', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/personas?orderBy=age&orderDirection=asc&limit=5',
        });

        expect(response.statusCode).toBe(200);
        const result = response.json();
        const ages = result.data.map((p: any) => p.age);
        expect(ages).toEqual([...ages].sort((a, b) => a - b));
      });

      it('should handle empty results', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/personas?name=NonExistent',
        });

        expect(response.statusCode).toBe(200);
        const result = response.json();
        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
        expect(result.hasMore).toBe(false);
      });
    });

    describe('POST /personas/bulk', () => {
      it('should create multiple personas', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/personas/bulk',
          payload: {
            personas: [
              { name: 'Bulk 1', age: 25 },
              { name: 'Bulk 2', age: 30 },
              { name: 'Bulk 3', age: 35 },
            ],
          },
        });

        expect(response.statusCode).toBe(201);
        const personas = response.json();
        expect(personas).toHaveLength(3);
        expect(personas[0].name).toBe('Bulk 1');
        expect(personas[1].name).toBe('Bulk 2');
        expect(personas[2].name).toBe('Bulk 3');
      });

      it('should validate all personas in bulk request', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/personas/bulk',
          payload: {
            personas: [
              { name: 'Valid' },
              { age: 25 }, // Missing name
              { name: 'Also Valid' },
            ],
          },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toHaveProperty('error');
      });

      it('should handle empty bulk requests', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/personas/bulk',
          payload: { personas: [] },
        });

        expect(response.statusCode).toBe(400);
      });

      it('should enforce maximum bulk size', async () => {
        const personas = Array.from({ length: 1001 }, (_, i) => ({
          name: `Bulk ${i}`,
        }));

        const response = await app.inject({
          method: 'POST',
          url: '/personas/bulk',
          payload: { personas },
        });

        expect(response.statusCode).toBe(400);
      });
    });
  });

  describe('Groups Endpoints', () => {
    describe('POST /groups', () => {
      it('should create a group', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/groups',
          payload: {
            name: 'Test Group',
            description: 'A test group',
            metadata: { purpose: 'testing' },
          },
        });

        expect(response.statusCode).toBe(201);
        const group = response.json();
        expect(group.name).toBe('Test Group');
        expect(group.description).toBe('A test group');
        expect(group.metadata).toEqual({ purpose: 'testing' });
      });
    });

    describe('GET /groups/:id/members', () => {
      it('should return group with all members', async () => {
        // Create group
        const groupResponse = await app.inject({
          method: 'POST',
          url: '/groups',
          payload: { name: 'Member Test Group' },
        });
        const group = groupResponse.json();

        // Create personas
        const persona1Response = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: { name: 'Member 1' },
        });
        const persona1 = persona1Response.json();

        const persona2Response = await app.inject({
          method: 'POST',
          url: '/personas',
          payload: { name: 'Member 2' },
        });
        const persona2 = persona2Response.json();

        // Add to group
        await app.inject({
          method: 'POST',
          url: '/memberships',
          payload: { personaId: persona1.id, groupId: group.id },
        });

        await app.inject({
          method: 'POST',
          url: '/memberships',
          payload: { personaId: persona2.id, groupId: group.id },
        });

        // Get group with members
        const response = await app.inject({
          method: 'GET',
          url: `/groups/${group.id}/members`,
        });

        expect(response.statusCode).toBe(200);
        const result = response.json();
        expect(result.group_id).toBe(group.id);
        expect(result.group_name).toBe('Member Test Group');
        expect(result.personas).toHaveLength(2);
        expect(result.personas.map((p: any) => p.name).sort()).toEqual(['Member 1', 'Member 2']);
      });

      it('should return empty array for group with no members', async () => {
        const groupResponse = await app.inject({
          method: 'POST',
          url: '/groups',
          payload: { name: 'Empty Group' },
        });
        const group = groupResponse.json();

        const response = await app.inject({
          method: 'GET',
          url: `/groups/${group.id}/members`,
        });

        expect(response.statusCode).toBe(200);
        const result = response.json();
        expect(result.personas).toHaveLength(0);
      });
    });
  });

  describe('Membership Endpoints', () => {
    it('should add and remove persona from group', async () => {
      // Create persona and group
      const personaResponse = await app.inject({
        method: 'POST',
        url: '/personas',
        payload: { name: 'Member' },
      });
      const persona = personaResponse.json();

      const groupResponse = await app.inject({
        method: 'POST',
        url: '/groups',
        payload: { name: 'Group' },
      });
      const group = groupResponse.json();

      // Add to group
      const addResponse = await app.inject({
        method: 'POST',
        url: '/memberships',
        payload: { personaId: persona.id, groupId: group.id },
      });

      expect(addResponse.statusCode).toBe(201);
      expect(addResponse.json()).toEqual({ success: true });

      // Remove from group
      const removeResponse = await app.inject({
        method: 'DELETE',
        url: '/memberships',
        payload: { personaId: persona.id, groupId: group.id },
      });

      expect(removeResponse.statusCode).toBe(200);
      expect(removeResponse.json()).toEqual({ success: true });

      // Try to remove again (should fail)
      const removeAgainResponse = await app.inject({
        method: 'DELETE',
        url: '/memberships',
        payload: { personaId: persona.id, groupId: group.id },
      });

      expect(removeAgainResponse.statusCode).toBe(404);
    });
  });

  describe('Stats Endpoint', () => {
    it('should return database statistics', async () => {
      // Create test data
      for (let i = 0; i < 5; i++) {
        await app.inject({
          method: 'POST',
          url: '/personas',
          payload: { name: `Person ${i}` },
        });
      }

      for (let i = 0; i < 3; i++) {
        await app.inject({
          method: 'POST',
          url: '/groups',
          payload: { name: `Group ${i}` },
        });
      }

      const response = await app.inject({
        method: 'GET',
        url: '/stats',
      });

      expect(response.statusCode).toBe(200);
      const stats = response.json();
      expect(stats.totalPersonas).toBe(5);
      expect(stats.totalGroups).toBe(3);
      expect(stats.avgGroupSize).toBe(0); // No members added
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/personas',
        headers: { 'content-type': 'application/json' },
        payload: '{ invalid json',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });

    it('should handle missing content-type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/personas',
        headers: { 'content-type': 'text/plain' },
        payload: 'not json',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate UUID parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/personas/not-a-uuid',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty('error');
    });
  });

  describe('Security', () => {
    it('should sanitize user input to prevent injection', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/personas',
        payload: {
          name: "'; DROP TABLE personas; --",
          attributes: {
            script: '<script>alert("XSS")</script>',
          },
        },
      });

      expect(response.statusCode).toBe(201);
      const persona = response.json();
      expect(persona.name).toBe("'; DROP TABLE personas; --");
      expect(persona.attributes.script).toBe('<script>alert("XSS")</script>');
    });

    it('should handle extremely large payloads', async () => {
      const largeString = 'x'.repeat(1000000); // 1MB string
      const response = await app.inject({
        method: 'POST',
        url: '/personas',
        payload: {
          name: 'Large',
          attributes: { data: largeString },
        },
      });

      // Should either succeed or fail gracefully
      expect([201, 413]).toContain(response.statusCode);
    });
  });

  describe('Concurrency', () => {
    it('should handle concurrent requests correctly', async () => {
      const promises = Array.from({ length: 20 }, (_, i) =>
        app.inject({
          method: 'POST',
          url: '/personas',
          payload: { name: `Concurrent ${i}` },
        })
      );

      const responses = await Promise.all(promises);
      
      expect(responses.every(r => r.statusCode === 201)).toBe(true);
      
      const ids = responses.map(r => r.json().id);
      expect(new Set(ids).size).toBe(20); // All unique IDs
    });
  });
});