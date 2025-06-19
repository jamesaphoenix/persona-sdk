/**
 * Edge case tests for PostgreSQL adapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresAdapter } from '../../../src/adapters/postgres/adapter.js';
import type { DatabaseClient, QueryResult } from '../../../src/adapters/postgres/adapter.js';
import type { PersonaRecord } from '../../../src/adapters/postgres/types.js';

// Edge case focused mock database
class EdgeCaseMockDatabaseClient implements DatabaseClient {
  private data = {
    personas: new Map<string, PersonaRecord>(),
    groups: new Map<string, any>(),
    memberships: new Map<string, any>(),
  };
  private idCounter = 1;
  private queryBehavior: 'normal' | 'slow' | 'intermittent' = 'normal';
  private slowQueryDelay = 100;
  private failureRate = 0;

  setQueryBehavior(behavior: 'normal' | 'slow' | 'intermittent') {
    this.queryBehavior = behavior;
  }

  setSlowQueryDelay(ms: number) {
    this.slowQueryDelay = ms;
  }

  setFailureRate(rate: number) {
    this.failureRate = rate;
  }

  private async simulateNetworkConditions() {
    if (this.queryBehavior === 'slow') {
      await new Promise(resolve => setTimeout(resolve, this.slowQueryDelay));
    }
    
    if (this.queryBehavior === 'intermittent' && Math.random() < this.failureRate) {
      throw new Error('Database connection timeout');
    }
  }

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    await this.simulateNetworkConditions();

    const sql = text.toLowerCase();

    // Handle edge cases in persona creation
    if (sql.includes('insert into personas')) {
      // Edge case: empty string name
      if (values![0] === '') {
        throw new Error('Name cannot be empty');
      }

      // Edge case: negative age
      if (values![1] !== null && values![1] < 0) {
        throw new Error('Age cannot be negative');
      }

      // Edge case: age over 150
      if (values![1] !== null && values![1] > 150) {
        throw new Error('Age cannot exceed 150');
      }

      const id = `edge_${this.idCounter++}`;
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

      this.data.personas.set(id, persona);
      return { rows: [persona] as any, rowCount: 1 };
    }

    // Handle various SELECT patterns
    if (sql.includes('select * from personas')) {
      if (sql.includes('where id')) {
        const persona = this.data.personas.get(values![0]);
        return { rows: persona ? [persona] : [], rowCount: persona ? 1 : 0 } as any;
      }

      let personas = Array.from(this.data.personas.values());

      // Handle WHERE conditions
      if (sql.includes('where')) {
        // Empty result edge case
        if (sql.includes('name ilike') && values![0] === '%%') {
          // Match all
          personas = personas;
        } else if (sql.includes('name ilike') && values![0] === '%') {
          // Match none
          personas = [];
        } else if (sql.includes('name ilike')) {
          const pattern = values![0].replace(/%/g, '');
          personas = personas.filter(p => 
            p.name.toLowerCase().includes(pattern.toLowerCase())
          );
        }

        // Age range with same min and max
        if (sql.includes('age >=') && sql.includes('age <=')) {
          const minIndex = sql.includes('name ilike') ? 1 : 0;
          const maxIndex = minIndex + 1;
          const min = values![minIndex];
          const max = values![maxIndex];
          
          personas = personas.filter(p => 
            p.age !== null && p.age >= min && p.age <= max
          );
        }
      }

      // Handle ORDER BY edge cases
      if (sql.includes('order by')) {
        if (sql.includes('order by age')) {
          // Sort with nulls
          personas.sort((a, b) => {
            if (a.age === null && b.age === null) return 0;
            if (a.age === null) return sql.includes('desc') ? -1 : 1;
            if (b.age === null) return sql.includes('desc') ? 1 : -1;
            return sql.includes('desc') ? b.age - a.age : a.age - b.age;
          });
        } else if (sql.includes('order by name')) {
          // Sort by name
          personas.sort((a, b) => {
            const result = a.name.localeCompare(b.name);
            return sql.includes('desc') ? -result : result;
          });
        }
      }

      // Handle LIMIT/OFFSET edge cases
      if (sql.includes('limit')) {
        const limit = values![values!.length - 2];
        const offset = values![values!.length - 1];
        
        // Edge case: offset beyond data
        if (offset >= personas.length) {
          personas = [];
        } else {
          personas = personas.slice(offset, offset + limit);
        }
      }

      return { rows: personas as any, rowCount: personas.length };
    }

    // Handle COUNT with edge cases
    if (sql.includes('count(*)')) {
      if (sql.includes('personas')) {
        // Return string "0" for empty, as Postgres does
        const count = this.data.personas.size;
        return { rows: [{ count: String(count) }] as any, rowCount: 1 };
      }
    }

    // UPDATE edge cases
    if (sql.includes('update personas')) {
      const id = values![values!.length - 1];
      const persona = this.data.personas.get(id);
      
      if (!persona) {
        return { rows: [], rowCount: 0 };
      }

      // Edge case: updating to same values
      const original = { ...persona };
      let valueIndex = 0;
      
      if (sql.includes('name =')) {
        persona.name = values![valueIndex++];
      }
      if (sql.includes('age =')) {
        persona.age = values![valueIndex++];
      }
      
      // Check if anything actually changed
      const changed = JSON.stringify(original) !== JSON.stringify(persona);
      if (changed) {
        persona.updated_at = new Date();
      }

      return { rows: [persona] as any, rowCount: 1 };
    }

    // DELETE edge cases
    if (sql.includes('delete from personas')) {
      // Edge case: deleting non-existent
      const id = values![0];
      const existed = this.data.personas.has(id);
      
      if (existed) {
        this.data.personas.delete(id);
        // Also clean up any memberships
        for (const [memId, membership] of this.data.memberships.entries()) {
          if (membership.persona_id === id) {
            this.data.memberships.delete(memId);
          }
        }
      }
      
      return { rows: [], rowCount: existed ? 1 : 0 };
    }

    // Handle group operations
    if (sql.includes('insert into persona_groups')) {
      // Edge case: duplicate group name (would violate unique constraint)
      const existingGroup = Array.from(this.data.groups.values())
        .find(g => g.name === values![0]);
      
      if (existingGroup) {
        throw new Error('Group name already exists');
      }

      const id = `grp_${this.idCounter++}`;
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

    // Membership edge cases
    if (sql.includes('insert into persona_group_members')) {
      const personaId = values![0];
      const groupId = values![1];

      // Edge case: persona doesn't exist
      if (!this.data.personas.has(personaId)) {
        throw new Error('Foreign key violation: persona not found');
      }

      // Edge case: group doesn't exist
      if (!this.data.groups.has(groupId)) {
        throw new Error('Foreign key violation: group not found');
      }

      // Check for duplicate membership
      for (const membership of this.data.memberships.values()) {
        if (membership.persona_id === personaId && membership.group_id === groupId) {
          // ON CONFLICT DO NOTHING
          return { rows: [], rowCount: 0 };
        }
      }

      const id = `mem_${this.idCounter++}`;
      this.data.memberships.set(id, {
        id,
        persona_id: personaId,
        group_id: groupId,
        joined_at: new Date(),
      });
      return { rows: [], rowCount: 1 };
    }

    // Get group members
    if (sql.includes('select p.* from personas p') && sql.includes('join persona_group_members')) {
      const groupId = values![0];
      const members = [];
      
      for (const membership of this.data.memberships.values()) {
        if (membership.group_id === groupId) {
          const persona = this.data.personas.get(membership.persona_id);
          if (persona) {
            members.push(persona);
          }
        }
      }
      
      return { rows: members as any, rowCount: members.length };
    }
    
    // Default
    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    // Edge case: nested transactions
    const savepoint = `sp_${Date.now()}`;
    const snapshot = {
      personas: new Map(this.data.personas),
      groups: new Map(this.data.groups),
      memberships: new Map(this.data.memberships),
    };

    try {
      const result = await callback(this);
      return result;
    } catch (error) {
      // Rollback
      this.data = snapshot;
      throw error;
    }
  }

  clear() {
    this.data.personas.clear();
    this.data.groups.clear();
    this.data.memberships.clear();
  }

  // Helper to check internal state
  getInternalState() {
    return {
      personas: this.data.personas.size,
      groups: this.data.groups.size,
      memberships: this.data.memberships.size,
    };
  }
}

describe('PostgreSQL Adapter - Edge Cases', () => {
  let adapter: PostgresAdapter;
  let mockClient: EdgeCaseMockDatabaseClient;

  beforeEach(() => {
    mockClient = new EdgeCaseMockDatabaseClient();
    adapter = new PostgresAdapter(mockClient);
  });

  describe('Empty and Null Handling', () => {
    it('should handle empty string values', async () => {
      // Empty name should fail
      await expect(adapter.createPersona({ name: '' }))
        .rejects.toThrow('Name cannot be empty');

      // Empty occupation is OK
      const persona = await adapter.createPersona({
        name: 'Test',
        occupation: '',
      });
      expect(persona.occupation).toBe('');
    });

    it('should handle all null optional fields', async () => {
      const persona = await adapter.createPersona({
        name: 'Null Test',
        age: null as any,
        occupation: null as any,
        sex: null as any,
        attributes: null as any,
        metadata: null as any,
      });

      expect(persona.name).toBe('Null Test');
      expect(persona.age).toBeNull();
      expect(persona.occupation).toBeNull();
      expect(persona.sex).toBeNull();
      expect(persona.attributes).toEqual({});
      expect(persona.metadata).toEqual({});
    });

    it('should handle empty query results', async () => {
      const result = await adapter.queryPersonas({ name: 'NonExistent' });
      
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should handle empty bulk operations', async () => {
      const result = await adapter.bulkCreatePersonas({ personas: [] });
      expect(result).toHaveLength(0);
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle age boundary values', async () => {
      // Minimum age (0)
      const baby = await adapter.createPersona({ name: 'Baby', age: 0 });
      expect(baby.age).toBe(0);

      // Maximum age (150)
      const ancient = await adapter.createPersona({ name: 'Ancient', age: 150 });
      expect(ancient.age).toBe(150);

      // Over maximum
      await expect(adapter.createPersona({ name: 'TooOld', age: 151 }))
        .rejects.toThrow('Age cannot exceed 150');

      // Negative age
      await expect(adapter.createPersona({ name: 'Negative', age: -1 }))
        .rejects.toThrow('Age cannot be negative');
    });

    it('should handle string length boundaries', async () => {
      // Maximum VARCHAR(255) length
      const maxName = 'A'.repeat(255);
      const persona = await adapter.createPersona({ name: maxName });
      expect(persona.name).toHaveLength(255);

      // Very short name
      const shortPersona = await adapter.createPersona({ name: 'A' });
      expect(shortPersona.name).toBe('A');
    });

    it('should handle pagination boundaries', async () => {
      // Create exactly 20 personas (default page size)
      await adapter.bulkCreatePersonas({
        personas: Array.from({ length: 20 }, (_, i) => ({ name: `Person ${i}` })),
      });

      // First page
      const page1 = await adapter.queryPersonas({ limit: 20, offset: 0 });
      expect(page1.data).toHaveLength(20);
      expect(page1.hasMore).toBe(false);

      // Beyond last page
      const beyondLast = await adapter.queryPersonas({ limit: 20, offset: 20 });
      expect(beyondLast.data).toHaveLength(0);
      expect(beyondLast.hasMore).toBe(false);

      // Offset at boundary
      const boundary = await adapter.queryPersonas({ limit: 10, offset: 19 });
      expect(boundary.data).toHaveLength(1);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent creates with same data', async () => {
      const promises = Array.from({ length: 10 }, () =>
        adapter.createPersona({ name: 'Concurrent Person', age: 30 })
      );

      const results = await Promise.all(promises);
      
      // All should succeed with unique IDs
      const ids = results.map(r => r.id);
      expect(new Set(ids).size).toBe(10);
      
      // All should have the same name
      expect(results.every(r => r.name === 'Concurrent Person')).toBe(true);
    });

    it('should handle concurrent updates to same persona', async () => {
      const persona = await adapter.createPersona({ name: 'Update Target', age: 30 });

      // Concurrent updates with different values
      const updates = Array.from({ length: 5 }, (_, i) =>
        adapter.updatePersona(persona.id, { age: 31 + i })
      );

      const results = await Promise.all(updates);
      
      // All updates should succeed
      expect(results.every(r => r !== null)).toBe(true);
      
      // Final state should be one of the update values
      const final = await adapter.getPersona(persona.id);
      expect(final?.age).toBeGreaterThanOrEqual(31);
      expect(final?.age).toBeLessThanOrEqual(35);
    });

    it('should handle concurrent deletes', async () => {
      const persona = await adapter.createPersona({ name: 'Delete Target' });

      // Try to delete the same persona multiple times
      const deletes = Array.from({ length: 3 }, () =>
        adapter.deletePersona(persona.id)
      );

      const results = await Promise.all(deletes);
      
      // Only one should succeed
      const successCount = results.filter(r => r === true).length;
      expect(successCount).toBe(1);
    });
  });

  describe('Transaction Edge Cases', () => {
    it('should handle empty transactions', async () => {
      const stateBefore = mockClient.getInternalState();
      
      await adapter.bulkCreatePersonas({ personas: [] });
      
      const stateAfter = mockClient.getInternalState();
      expect(stateAfter).toEqual(stateBefore);
    });

    it('should rollback on partial failure', async () => {
      const stateBefore = mockClient.getInternalState();

      try {
        await adapter.bulkCreatePersonas({
          personas: [
            { name: 'Valid 1' },
            { name: 'Valid 2' },
            { name: '' }, // This will fail
            { name: 'Valid 3' },
          ],
        });
      } catch (error) {
        // Expected to fail
      }

      const stateAfter = mockClient.getInternalState();
      expect(stateAfter).toEqual(stateBefore);
    });

    it('should handle nested transaction scenarios', async () => {
      // Create initial state
      const group = await adapter.createPersonaGroup({ name: 'Transaction Test' });
      
      try {
        await adapter.bulkCreatePersonas({
          personas: [
            { name: 'Person 1' },
            { name: 'Person 2' },
          ],
          groupId: group.id,
        });

        // Nested operation that fails
        await adapter.bulkCreatePersonas({
          personas: [{ name: '' }], // Fails
          groupId: group.id,
        });
      } catch (error) {
        // Expected
      }

      // First bulk should have succeeded
      const members = await adapter.getGroupMembers(group.id);
      expect(members).toHaveLength(2);
    });
  });

  describe('Query Edge Cases', () => {
    it('should handle queries with all filters', async () => {
      // Create diverse test data
      await adapter.bulkCreatePersonas({
        personas: [
          { name: 'Alice Anderson', age: 25, occupation: 'Engineer', sex: 'female' },
          { name: 'Bob Brown', age: 30, occupation: 'Designer', sex: 'male' },
          { name: 'Alice Cooper', age: 35, occupation: 'Engineer', sex: 'other' },
        ],
      });

      // Query with all possible filters
      const result = await adapter.queryPersonas({
        name: 'Alice',
        age: { min: 20, max: 30 },
        occupation: 'Engineer',
        sex: 'female',
        limit: 10,
        offset: 0,
        orderBy: 'age',
        orderDirection: 'asc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Alice Anderson');
    });

    it('should handle same min and max age', async () => {
      await adapter.createPersona({ name: 'Age 30', age: 30 });
      await adapter.createPersona({ name: 'Age 31', age: 31 });

      const result = await adapter.queryPersonas({
        age: { min: 30, max: 30 },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Age 30');
    });

    it('should handle wildcard-only queries', async () => {
      await adapter.bulkCreatePersonas({
        personas: [
          { name: 'Test 1' },
          { name: 'Test 2' },
          { name: 'Test 3' },
        ],
      });

      // Query with just %
      const allResults = await adapter.queryPersonas({ name: '' });
      expect(allResults.data).toHaveLength(3);
    });
  });

  describe('Network and Timing Issues', () => {
    it.skip('should handle slow queries', async () => {
      mockClient.setQueryBehavior('slow');
      mockClient.setSlowQueryDelay(50);

      const start = Date.now();
      const persona = await adapter.createPersona({ name: 'Slow Create' });
      const duration = Date.now() - start;

      expect(persona.name).toBe('Slow Create');
      expect(duration).toBeGreaterThanOrEqual(50);
    });

    it.skip('should handle intermittent failures', async () => {
      mockClient.setQueryBehavior('intermittent');
      mockClient.setFailureRate(0.5); // 50% failure rate

      let successes = 0;
      let failures = 0;

      for (let i = 0; i < 10; i++) {
        try {
          await adapter.createPersona({ name: `Intermittent ${i}` });
          successes++;
        } catch (error) {
          failures++;
        }
      }

      // Should have some of each
      expect(successes).toBeGreaterThan(0);
      expect(failures).toBeGreaterThan(0);
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should return false when persona does not exist when adding to group', async () => {
      const group = await adapter.createPersonaGroup({ name: 'FK Test' });

      // Try to add non-existent persona
      const result = await adapter.addPersonaToGroup('non-existent-persona', group.id);
      expect(result).toBe(false);
    });

    it('should return false when group does not exist when adding persona', async () => {
      const persona = await adapter.createPersona({ name: 'FK Test' });

      // Try to add to non-existent group  
      const result = await adapter.addPersonaToGroup(persona.id, 'non-existent-group');
      expect(result).toBe(false);
    });

    it('should handle duplicate group names', async () => {
      await adapter.createPersonaGroup({ name: 'Unique Name' });
      
      await expect(adapter.createPersonaGroup({ name: 'Unique Name' }))
        .rejects.toThrow('Group name already exists');
    });
  });

  describe('Data Type Edge Cases', () => {
    it('should handle various number formats in attributes', async () => {
      const persona = await adapter.createPersona({
        name: 'Number Test',
        attributes: {
          integer: 42,
          float: 3.14159,
          negative: -100,
          zero: 0,
          scientific: 1.23e-10,
          infinity: Infinity,
          negInfinity: -Infinity,
          notANumber: NaN,
        },
      });

      expect(persona.attributes.integer).toBe(42);
      expect(persona.attributes.float).toBe(3.14159);
      expect(persona.attributes.negative).toBe(-100);
      expect(persona.attributes.zero).toBe(0);
      expect(persona.attributes.scientific).toBe(1.23e-10);
      expect(persona.attributes.infinity).toBe(Infinity);
      expect(persona.attributes.negInfinity).toBe(-Infinity);
      expect(persona.attributes.notANumber).toBeNaN();
    });

    it('should handle boolean values in attributes', async () => {
      const persona = await adapter.createPersona({
        name: 'Boolean Test',
        attributes: {
          isActive: true,
          isDeleted: false,
          truthyNumber: 1,
          falsyNumber: 0,
          truthyString: 'yes',
          falsyString: '',
        },
      });

      expect(persona.attributes.isActive).toBe(true);
      expect(persona.attributes.isDeleted).toBe(false);
    });

    it('should handle date values in attributes', async () => {
      const now = new Date();
      const past = new Date('2000-01-01');
      const future = new Date('2100-12-31');

      const persona = await adapter.createPersona({
        name: 'Date Test',
        attributes: {
          currentDate: now,
          pastDate: past,
          futureDate: future,
          isoString: now.toISOString(),
          timestamp: now.getTime(),
        },
      });

      expect(persona.attributes.currentDate).toEqual(now);
      expect(persona.attributes.pastDate).toEqual(past);
      expect(persona.attributes.futureDate).toEqual(future);
    });
  });

  describe('Sorting and Ordering Edge Cases', () => {
    it('should handle sorting with null values', async () => {
      await adapter.bulkCreatePersonas({
        personas: [
          { name: 'Has Age 50', age: 50 },
          { name: 'No Age', age: null as any },
          { name: 'Has Age 30', age: 30 },
          { name: 'Also No Age', age: null as any },
          { name: 'Has Age 40', age: 40 },
        ],
      });

      // Sort ascending - nulls should be last
      const asc = await adapter.queryPersonas({
        orderBy: 'age',
        orderDirection: 'asc',
      });

      expect(asc.data[0].age).toBe(30);
      expect(asc.data[1].age).toBe(40);
      expect(asc.data[2].age).toBe(50);
      expect(asc.data[3].age).toBeNull();
      expect(asc.data[4].age).toBeNull();

      // Sort descending - nulls should be first
      const desc = await adapter.queryPersonas({
        orderBy: 'age',
        orderDirection: 'desc',
      });

      expect(desc.data[0].age).toBeNull();
      expect(desc.data[1].age).toBeNull();
      expect(desc.data[2].age).toBe(50);
    });

    it('should handle sorting by different field types', async () => {
      const baseDate = new Date();
      await adapter.bulkCreatePersonas({
        personas: [
          { name: 'Charlie' },
          { name: 'Alice' },
          { name: 'Bob' },
        ],
      });

      // Sort by name
      const byName = await adapter.queryPersonas({
        orderBy: 'name',
        orderDirection: 'asc',
      });

      expect(byName.data[0].name).toBe('Alice');
      expect(byName.data[1].name).toBe('Bob');
      expect(byName.data[2].name).toBe('Charlie');
    });
  });
});