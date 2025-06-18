/**
 * Tests for PostgreSQL Adapter
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PostgresAdapter } from '../../../src/adapters/postgres/adapter.js';
import type { DatabaseClient, QueryResult } from '../../../src/adapters/postgres/adapter.js';
import type {
  PersonaRecord,
  PersonaGroupRecord,
  CreatePersonaInput,
  UpdatePersonaInput,
  CreatePersonaGroupInput,
  UpdatePersonaGroupInput,
} from '../../../src/adapters/postgres/types.js';

// Mock database client
class MockDatabaseClient implements DatabaseClient {
  private data = {
    personas: new Map<string, PersonaRecord>(),
    groups: new Map<string, PersonaGroupRecord>(),
    memberships: new Map<string, { persona_id: string; group_id: string }>(),
  };

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    // Parse SQL and execute mock operations
    const lowerText = text.toLowerCase();

    // INSERT INTO personas
    if (lowerText.includes('insert into personas')) {
      const persona: PersonaRecord = {
        id: this.generateId(),
        name: values![0],
        age: values![1],
        occupation: values![2],
        sex: values![3],
        attributes: values![4],
        metadata: values![5],
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.personas.set(persona.id, persona);
      return { rows: [persona] as any, rowCount: 1 };
    }

    // SELECT FROM personas WHERE id
    if (lowerText.includes('select * from personas where id')) {
      const persona = this.data.personas.get(values![0]);
      return { rows: persona ? [persona] : [], rowCount: persona ? 1 : 0 } as any;
    }

    // UPDATE personas
    if (lowerText.includes('update personas')) {
      const id = values![values!.length - 1];
      const persona = this.data.personas.get(id);
      if (persona) {
        // Update fields based on SET clause and values
        const updated = { ...persona, updated_at: new Date() };
        let valueIndex = 0;
        if (lowerText.includes('name =')) {
          updated.name = values![valueIndex++];
        }
        if (lowerText.includes('age =')) {
          updated.age = values![valueIndex++];
        }
        if (lowerText.includes('occupation =')) {
          updated.occupation = values![valueIndex++];
        }
        if (lowerText.includes('sex =')) {
          updated.sex = values![valueIndex++];
        }
        if (lowerText.includes('attributes =')) {
          updated.attributes = values![valueIndex++];
        }
        if (lowerText.includes('metadata =')) {
          updated.metadata = values![valueIndex++];
        }
        this.data.personas.set(id, updated);
        return { rows: [updated] as any, rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // DELETE FROM personas
    if (lowerText.includes('delete from personas')) {
      const deleted = this.data.personas.delete(values![0]);
      return { rows: [], rowCount: deleted ? 1 : 0 };
    }

    // COUNT personas
    if (lowerText.includes('select count(*) from personas')) {
      const count = this.data.personas.size;
      return { rows: [{ count: count.toString() }] as any, rowCount: 1 };
    }

    // SELECT personas with pagination
    if (lowerText.includes('select * from personas') && lowerText.includes('limit')) {
      const limit = values![values!.length - 2];
      const offset = values![values!.length - 1];
      const personas = Array.from(this.data.personas.values())
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(offset, offset + limit);
      return { rows: personas as any, rowCount: personas.length };
    }

    // Group operations
    if (lowerText.includes('insert into persona_groups')) {
      const group: PersonaGroupRecord = {
        id: this.generateId(),
        name: values![0],
        description: values![1],
        metadata: values![2],
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.groups.set(group.id, group);
      return { rows: [group] as any, rowCount: 1 };
    }

    // Group membership
    if (lowerText.includes('insert into persona_group_members')) {
      const membershipId = this.generateId();
      this.data.memberships.set(membershipId, {
        persona_id: values![0],
        group_id: values![1],
      });
      return { rows: [], rowCount: 1 };
    }

    // Delete membership
    if (lowerText.includes('delete from persona_group_members')) {
      let deleted = false;
      for (const [id, membership] of this.data.memberships.entries()) {
        if (membership.persona_id === values![0] && membership.group_id === values![1]) {
          this.data.memberships.delete(id);
          deleted = true;
          break;
        }
      }
      return { rows: [], rowCount: deleted ? 1 : 0 };
    }

    // Stats query
    if (lowerText.includes('total_personas')) {
      return {
        rows: [{
          total_personas: this.data.personas.size.toString(),
          total_groups: this.data.groups.size.toString(),
          avg_group_size: '0',
        }] as any,
        rowCount: 1,
      };
    }

    // Default
    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    // Simple transaction mock - just execute the callback
    return callback(this);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Test helpers
  clear() {
    this.data.personas.clear();
    this.data.groups.clear();
    this.data.memberships.clear();
  }
}

describe('PostgresAdapter', () => {
  let adapter: PostgresAdapter;
  let mockClient: MockDatabaseClient;

  beforeEach(() => {
    mockClient = new MockDatabaseClient();
    adapter = new PostgresAdapter(mockClient);
  });

  afterEach(() => {
    mockClient.clear();
  });

  describe('Persona CRUD', () => {
    it('should create a persona', async () => {
      const input: CreatePersonaInput = {
        name: 'John Doe',
        age: 30,
        occupation: 'Engineer',
        sex: 'male',
        attributes: { interests: ['coding', 'music'] },
        metadata: { source: 'test' },
      };

      const persona = await adapter.createPersona(input);

      expect(persona).toBeDefined();
      expect(persona.name).toBe('John Doe');
      expect(persona.age).toBe(30);
      expect(persona.occupation).toBe('Engineer');
      expect(persona.attributes).toEqual({ interests: ['coding', 'music'] });
    });

    it('should get a persona by id', async () => {
      const created = await adapter.createPersona({ name: 'Jane Doe' });
      const retrieved = await adapter.getPersona(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Jane Doe');
    });

    it('should return null for non-existent persona', async () => {
      const persona = await adapter.getPersona('non-existent-id');
      expect(persona).toBeNull();
    });

    it('should update a persona', async () => {
      const created = await adapter.createPersona({ name: 'Original Name' });
      
      const updated = await adapter.updatePersona(created.id, {
        name: 'Updated Name',
        age: 35,
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.age).toBe(35);
    });

    it('should delete a persona', async () => {
      const created = await adapter.createPersona({ name: 'To Delete' });
      
      const deleted = await adapter.deletePersona(created.id);
      expect(deleted).toBe(true);

      const retrieved = await adapter.getPersona(created.id);
      expect(retrieved).toBeNull();
    });

    it('should return false when deleting non-existent persona', async () => {
      const deleted = await adapter.deletePersona('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should query personas with pagination', async () => {
      // Create test personas
      for (let i = 0; i < 25; i++) {
        await adapter.createPersona({ name: `Person ${i}` });
      }

      const result = await adapter.queryPersonas({
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.hasMore).toBe(true);
    });

    it('should bulk create personas', async () => {
      const personas = await adapter.bulkCreatePersonas({
        personas: [
          { name: 'Person 1' },
          { name: 'Person 2' },
          { name: 'Person 3' },
        ],
      });

      expect(personas).toHaveLength(3);
      expect(personas[0].name).toBe('Person 1');
      expect(personas[1].name).toBe('Person 2');
      expect(personas[2].name).toBe('Person 3');
    });
  });

  describe('PersonaGroup CRUD', () => {
    it('should create a persona group', async () => {
      const input: CreatePersonaGroupInput = {
        name: 'Engineers',
        description: 'Software engineers group',
        metadata: { department: 'IT' },
      };

      const group = await adapter.createPersonaGroup(input);

      expect(group).toBeDefined();
      expect(group.name).toBe('Engineers');
      expect(group.description).toBe('Software engineers group');
      expect(group.metadata).toEqual({ department: 'IT' });
    });

    it('should manage group memberships', async () => {
      const persona = await adapter.createPersona({ name: 'John' });
      const group = await adapter.createPersonaGroup({ name: 'Team A' });

      // Add to group
      const added = await adapter.addPersonaToGroup(persona.id, group.id);
      expect(added).toBe(true);

      // Remove from group
      const removed = await adapter.removePersonaFromGroup(persona.id, group.id);
      expect(removed).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should get database statistics', async () => {
      // Create test data
      await adapter.createPersona({ name: 'Person 1' });
      await adapter.createPersona({ name: 'Person 2' });
      await adapter.createPersonaGroup({ name: 'Group 1' });

      const stats = await adapter.getStats();

      expect(stats.totalPersonas).toBe(2);
      expect(stats.totalGroups).toBe(1);
      expect(stats.avgGroupSize).toBe(0); // No members added
    });
  });

  describe('Transactions', () => {
    it('should handle transactions for bulk operations', async () => {
      const personas = await adapter.bulkCreatePersonas({
        personas: [
          { name: 'TX Person 1' },
          { name: 'TX Person 2' },
        ],
      });

      expect(personas).toHaveLength(2);
      expect(personas.every(p => p.name.startsWith('TX Person'))).toBe(true);
    });
  });
});