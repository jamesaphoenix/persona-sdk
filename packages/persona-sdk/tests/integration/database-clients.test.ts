/**
 * Tests for different database client implementations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresAdapter } from '../../src/adapters/postgres/adapter.js';
import { SupabaseDatabaseClient } from '../../src/adapters/postgres/clients/supabase.js';
import { PrismaDatabaseClient } from '../../src/adapters/postgres/clients/prisma.js';
import type { DatabaseClient, QueryResult } from '../../src/adapters/postgres/adapter.js';

// Mock Supabase client
class MockSupabaseClient {
  private data = new Map<string, any>();
  private idCounter = 1;

  from(table: string) {
    return new MockSupabaseQuery(table, this.data, this.idCounter++);
  }

  async rpc(functionName: string, params?: any) {
    if (functionName === 'execute_sql') {
      // Handle raw SQL execution
      const { query, params: values } = params;
      const sql = query.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Mock SQL execution
      if (sql.includes('insert into personas')) {
        const id = `sb_${this.idCounter++}`;
        const persona = {
          id,
          name: values[0],
          age: values[1],
          occupation: values[2],
          sex: values[3],
          attributes: values[4] || {},
          metadata: values[5] || {},
          created_at: new Date(),
          updated_at: new Date(),
        };
        this.data.set(id, persona);
        return { data: [persona], error: null, count: 1 };
      }
      
      if (sql.includes('select * from personas where id')) {
        const persona = this.data.get(values[0]);
        return { data: persona ? [persona] : [], error: null, count: persona ? 1 : 0 };
      }

      if (sql.includes('update personas') && sql.includes('where id')) {
        const id = values[values.length - 1]; // ID is usually last parameter
        const persona = this.data.get(id);
        if (persona) {
          // Update fields based on the query
          if (sql.includes('name =')) persona.name = values[0];
          if (sql.includes('age =')) {
            const ageIndex = sql.includes('name =') ? 1 : 0;
            persona.age = values[ageIndex];
          }
          if (sql.includes('occupation =')) {
            let occIndex = 0;
            if (sql.includes('name =')) occIndex++;
            if (sql.includes('age =')) occIndex++;
            persona.occupation = values[occIndex];
          }
          persona.updated_at = new Date();
          return { data: [persona], error: null, count: 1 };
        }
        return { data: [], error: null, count: 0 };
      }

      if (sql.includes('delete from personas where id')) {
        const id = values[0];
        const deleted = this.data.delete(id);
        return { data: [], error: null, count: deleted ? 1 : 0 };
      }

      if (sql.includes('select * from personas')) {
        let personas = Array.from(this.data.values());
        let paramIndex = 0;

        // Apply WHERE clause filters
        if (sql.includes('where') && values && values.length > 0) {
          // Handle age range filters
          if (sql.includes('age >=')) {
            const minAge = values[paramIndex++];
            personas = personas.filter(p => p.age >= minAge);
          }
          if (sql.includes('age <=')) {
            const maxAge = values[paramIndex++];
            personas = personas.filter(p => p.age <= maxAge);
          }
          
          // Handle occupation filter
          if (sql.includes('occupation ilike')) {
            const occupationPattern = values[paramIndex++] as string;
            const searchOccupation = occupationPattern.replace(/^%|%$/g, '');
            personas = personas.filter(p => 
              p.occupation && p.occupation.toLowerCase().includes(searchOccupation.toLowerCase())
            );
          }
        }

        // Apply pagination
        if (sql.includes('limit') && values && values.length >= 2) {
          const limit = values[values.length - 2] || 20;
          const offset = values[values.length - 1] || 0;
          personas = personas.slice(offset, offset + limit);
        }

        return { data: personas, error: null, count: personas.length };
      }

      if (sql.includes('count(*)') && sql.includes('personas')) {
        return { data: [{ count: String(this.data.size) }], error: null, count: 1 };
      }

      // Handle stats query
      if ((sql.includes('as total_personas') && sql.includes('as total_groups') && sql.includes('as avg_group_size')) ||
          (sql.includes('count(*)') && sql.includes('personas') && sql.includes('persona_groups') && sql.includes('persona_group_stats'))) {
        return {
          data: [{
            total_personas: String(this.data.size),
            total_groups: '0',
            avg_group_size: '0.00',
          }],
          error: null,
          count: 1
        };
      }

      // Handle generate_distribution_personas RPC call
      if (sql.includes('generate_distribution_personas')) {
        const count = values[0] || 10;
        const personas = Array.from({ length: count }, (_, i) => ({
          id: `sp_${this.idCounter++}`,
          name: `Generated ${i}`,
          age: Math.floor(Math.random() * 50) + 20,
        }));
        return { data: personas, error: null, count: personas.length };
      }
      
      return { data: [], error: null, count: 0 };
    }
    
    if (functionName === 'generate_distribution_personas') {
      // Simulate stored procedure
      const count = params.count || 10;
      const personas = Array.from({ length: count }, (_, i) => ({
        id: `sp_${this.idCounter++}`,
        name: `Generated ${i}`,
        age: Math.floor(Math.random() * 50) + 20,
      }));
      return { data: personas, error: null };
    }
    
    return { data: null, error: { message: 'Unknown function' } };
  }
}

class MockSupabaseQuery {
  constructor(
    private table: string,
    private data: Map<string, any>,
    private id: number
  ) {}

  select(columns?: string) {
    return this;
  }

  insert(values: any | any[]) {
    const insertData = Array.isArray(values) ? values : [values];
    const results = insertData.map(v => {
      const id = `sb_${this.id++}`;
      const record = { ...v, id, created_at: new Date(), updated_at: new Date() };
      this.data.set(id, record);
      return record;
    });
    return {
      data: results,
      error: null,
    };
  }

  update(values: any) {
    return {
      eq: (column: string, value: any) => {
        let updated = null;
        for (const [id, record] of this.data.entries()) {
          if (record[column] === value) {
            Object.assign(record, values, { updated_at: new Date() });
            updated = record;
            break;
          }
        }
        return { data: updated ? [updated] : [], error: null };
      },
    };
  }

  delete() {
    return {
      eq: (column: string, value: any) => {
        let deleted = false;
        for (const [id, record] of this.data.entries()) {
          if (record[column] === value || (column === 'id' && id === value)) {
            this.data.delete(id);
            deleted = true;
            break;
          }
        }
        return { data: null, error: null, count: deleted ? 1 : 0 };
      },
    };
  }

  eq(column: string, value: any) {
    const results = [];
    for (const record of this.data.values()) {
      if (record[column] === value) {
        results.push(record);
      }
    }
    return { data: results, error: null };
  }

  gte(column: string, value: any) {
    return this;
  }

  lte(column: string, value: any) {
    const results = [];
    for (const record of this.data.values()) {
      // Simple range filter
      if (record[column] >= value) {
        results.push(record);
      }
    }
    return { data: results, error: null };
  }

  ilike(column: string, pattern: string) {
    const searchTerm = pattern.replace(/%/g, '').toLowerCase();
    const results = [];
    for (const record of this.data.values()) {
      if (record[column]?.toLowerCase().includes(searchTerm)) {
        results.push(record);
      }
    }
    return { data: results, error: null };
  }

  order(column: string, options?: { ascending?: boolean }) {
    return this;
  }

  range(from: number, to: number) {
    const allData = Array.from(this.data.values());
    return { data: allData.slice(from, to + 1), error: null };
  }
}

// Mock Prisma client
class MockPrismaClient {
  private data = {
    personas: new Map<string, any>(),
    personaGroups: new Map<string, any>(),
    personaGroupMembers: new Map<string, any>(),
  };
  private idCounter = 1;

  persona = {
    create: async ({ data }: any) => {
      const id = `pr_${this.idCounter++}`;
      const record = {
        id,
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.personas.set(id, record);
      return record;
    },

    createMany: async ({ data }: any) => {
      const records = data.map((d: any) => {
        const id = `pr_${this.idCounter++}`;
        const record = {
          id,
          ...d,
          created_at: new Date(),
          updated_at: new Date(),
        };
        this.data.personas.set(id, record);
        return record;
      });
      return { count: records.length };
    },

    findUnique: async ({ where }: any) => {
      return this.data.personas.get(where.id) || null;
    },

    findMany: async ({ where, take, skip, orderBy }: any = {}) => {
      let results = Array.from(this.data.personas.values());
      
      // Apply filters
      if (where) {
        if (where.age?.gte !== undefined && where.age?.lte !== undefined) {
          results = results.filter(p => p.age >= where.age.gte && p.age <= where.age.lte);
        }
        if (where.name?.contains) {
          results = results.filter(p => 
            p.name.toLowerCase().includes(where.name.contains.toLowerCase())
          );
        }
        if (where.occupation) {
          results = results.filter(p => p.occupation === where.occupation);
        }
      }

      // Apply ordering
      if (orderBy) {
        const [field, direction] = Object.entries(orderBy)[0];
        results.sort((a, b) => {
          if (direction === 'desc') {
            return b[field] > a[field] ? 1 : -1;
          }
          return a[field] > b[field] ? 1 : -1;
        });
      }

      // Apply pagination
      if (skip !== undefined) {
        results = results.slice(skip);
      }
      if (take !== undefined) {
        results = results.slice(0, take);
      }

      return results;
    },

    update: async ({ where, data }: any) => {
      const record = this.data.personas.get(where.id);
      if (!record) return null;
      
      Object.assign(record, data, { updated_at: new Date() });
      return record;
    },

    delete: async ({ where }: any) => {
      const record = this.data.personas.get(where.id);
      if (!record) return null;
      
      this.data.personas.delete(where.id);
      return record;
    },

    count: async ({ where }: any = {}) => {
      if (!where) return this.data.personas.size;
      
      let count = 0;
      for (const record of this.data.personas.values()) {
        // Simple filter matching
        let matches = true;
        if (where.age?.gte !== undefined && record.age < where.age.gte) matches = false;
        if (where.age?.lte !== undefined && record.age > where.age.lte) matches = false;
        if (where.occupation && record.occupation !== where.occupation) matches = false;
        
        if (matches) count++;
      }
      return count;
    },
  };

  personaGroup = {
    create: async ({ data }: any) => {
      const id = `grp_${this.idCounter++}`;
      const record = {
        id,
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.personaGroups.set(id, record);
      return record;
    },

    findUnique: async ({ where, include }: any) => {
      const group = this.data.personaGroups.get(where.id);
      if (!group) return null;

      if (include?.members) {
        const members = [];
        for (const membership of this.data.personaGroupMembers.values()) {
          if (membership.group_id === where.id) {
            const persona = this.data.personas.get(membership.persona_id);
            if (persona) {
              members.push({ persona });
            }
          }
        }
        return { ...group, members };
      }

      return group;
    },
  };

  personaGroupMember = {
    create: async ({ data }: any) => {
      const id = `mem_${this.idCounter++}`;
      const record = {
        id,
        ...data,
        joined_at: new Date(),
      };
      this.data.personaGroupMembers.set(id, record);
      return record;
    },

    deleteMany: async ({ where }: any) => {
      let count = 0;
      for (const [id, record] of this.data.personaGroupMembers.entries()) {
        if (record.persona_id === where.persona_id && record.group_id === where.group_id) {
          this.data.personaGroupMembers.delete(id);
          count++;
        }
      }
      return { count };
    },
  };

  $transaction = async (fn: any) => {
    // Simple transaction simulation
    if (typeof fn === 'function') {
      // Function-based transaction (Prisma style)
      return fn(this);
    } else if (Array.isArray(fn)) {
      // Array-based transaction (for compatibility)
      const results = [];
      for (const op of fn) {
        try {
          const result = await op;
          results.push(result);
        } catch (error) {
          // Rollback would happen here in real implementation
          throw error;
        }
      }
      return results;
    }
    throw new Error('Invalid transaction argument');
  };

  $queryRawUnsafe = async (query: any, ...values: any[]) => {
    const sql = query.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Handle INSERT queries
    if (sql.includes('insert into personas')) {
      const id = `pr_${this.idCounter++}`;
      const persona = {
        id,
        name: values[0],
        age: values[1],
        occupation: values[2],
        sex: values[3],
        attributes: values[4] || {},
        metadata: values[5] || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.personas.set(id, persona);
      return [persona];
    }

    if (sql.includes('insert into persona_groups')) {
      const id = `prg_${this.idCounter++}`;
      const group = {
        id,
        name: values[0],
        description: values[1],
        metadata: values[2] || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.personaGroups.set(id, group);
      return [group];
    }

    if (sql.includes('insert into persona_group_members')) {
      const id = `mem_${this.idCounter++}`;
      const membership = {
        id,
        persona_id: values[0],
        group_id: values[1],
        joined_at: new Date(),
      };
      this.data.personaGroupMembers.set(id, membership);
      return [];
    }

    // Handle SELECT queries
    if (sql.includes('select * from personas where id')) {
      const persona = this.data.personas.get(values[0]);
      return persona ? [persona] : [];
    }

    if (sql.includes('select * from persona_groups where id')) {
      const group = this.data.personaGroups.get(values[0]);
      return group ? [group] : [];
    }

    if (sql.includes('get_persona_group_with_members')) {
      const groupId = values[0];
      const group = this.data.personaGroups.get(groupId);
      if (!group) return [];
      
      const personas = [];
      for (const membership of this.data.personaGroupMembers.values()) {
        if (membership.group_id === groupId) {
          const persona = this.data.personas.get(membership.persona_id);
          if (persona) {
            personas.push(persona);
          }
        }
      }
      
      return [{
        ...group,
        personas: personas,
      }];
    }

    if (sql.includes('update personas') && sql.includes('where id')) {
      const id = values[values.length - 1];
      const persona = this.data.personas.get(id);
      if (persona) {
        // Update fields based on the query
        if (sql.includes('name =')) persona.name = values[0];
        if (sql.includes('age =')) {
          const ageIndex = sql.includes('name =') ? 1 : 0;
          persona.age = values[ageIndex];
        }
        if (sql.includes('occupation =')) {
          let occIndex = 0;
          if (sql.includes('name =')) occIndex++;
          if (sql.includes('age =')) occIndex++;
          persona.occupation = values[occIndex];
        }
        persona.updated_at = new Date();
        return [persona];
      }
      return [];
    }

    if (sql.includes('delete from personas where id')) {
      const id = values[0];
      const deleted = this.data.personas.delete(id);
      return deleted ? [{ rowCount: 1 }] : [{ rowCount: 0 }];
    }

    if (sql.includes('select * from personas')) {
      let personas = Array.from(this.data.personas.values());
      let paramIndex = 0;

      // Apply WHERE clause filters
      if (sql.includes('where') && values && values.length > 0) {
        // Handle age range filters
        if (sql.includes('age >=')) {
          const minAge = values[paramIndex++];
          personas = personas.filter(p => p.age >= minAge);
        }
        if (sql.includes('age <=')) {
          const maxAge = values[paramIndex++];
          personas = personas.filter(p => p.age <= maxAge);
        }
        
        // Handle occupation filter
        if (sql.includes('occupation ilike')) {
          const occupationPattern = values[paramIndex++] as string;
          const searchOccupation = occupationPattern.replace(/^%|%$/g, '');
          personas = personas.filter(p => 
            p.occupation && p.occupation.toLowerCase().includes(searchOccupation.toLowerCase())
          );
        }
      }

      // Apply pagination
      if (sql.includes('limit') && values && values.length >= 2) {
        const limit = values[values.length - 2] || 20;
        const offset = values[values.length - 1] || 0;
        personas = personas.slice(offset, offset + limit);
      }

      return personas;
    }

    // Handle stats query - check before simple count query
    if ((sql.includes('as total_personas') && sql.includes('as total_groups') && sql.includes('as avg_group_size')) ||
        (sql.includes('count(*)') && sql.includes('personas') && sql.includes('persona_groups') && sql.includes('persona_group_stats'))) {
      return [{
        total_personas: String(this.data.personas.size),
        total_groups: String(this.data.personaGroups.size),
        avg_group_size: '0.00',
      }];
    }

    if (sql.includes('count(*)') && sql.includes('personas')) {
      return [{ count: String(this.data.personas.size) }];
    }
    
    // Simulate analytics queries
    if (query.includes('AVG(age)')) {
      const personas = Array.from(this.data.personas.values());
      const ages = personas.filter(p => p.age).map(p => p.age);
      const avg = ages.reduce((a, b) => a + b, 0) / ages.length;
      return [{ avg_age: avg, total_count: personas.length }];
    }
    
    return [];
  };
  
  $queryRaw = this.$queryRawUnsafe;
}

describe('Database Client Integration Tests', () => {
  describe('Supabase Client', () => {
    let supabaseClient: SupabaseDatabaseClient;
    let adapter: PostgresAdapter;

    beforeEach(() => {
      const mockSupabase = new MockSupabaseClient() as any;
      supabaseClient = new SupabaseDatabaseClient(mockSupabase);
      adapter = new PostgresAdapter(supabaseClient);
    });

    it('should create personas through Supabase', async () => {
      const persona = await adapter.createPersona({
        name: 'Supabase Test',
        age: 30,
        occupation: 'Developer',
      });

      expect(persona.id).toMatch(/^sb_/);
      expect(persona.name).toBe('Supabase Test');
    });

    it('should query personas with filters', async () => {
      // Create test data
      await adapter.bulkCreatePersonas({
        personas: [
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 30 },
          { name: 'Charlie', age: 35 },
        ],
      });

      const result = await adapter.queryPersonas({
        age: { min: 28, max: 35 },
      });

      expect(result.data).toHaveLength(2);
      expect(result.data.every(p => p.age >= 28 && p.age <= 35)).toBe(true);
    });

    it('should update personas', async () => {
      const persona = await adapter.createPersona({ name: 'Update Test' });
      
      const updated = await adapter.updatePersona(persona.id, {
        age: 40,
        occupation: 'Senior Developer',
      });

      expect(updated?.age).toBe(40);
      expect(updated?.occupation).toBe('Senior Developer');
    });

    it('should delete personas', async () => {
      const persona = await adapter.createPersona({ name: 'Delete Test' });
      
      const deleted = await adapter.deletePersona(persona.id);
      expect(deleted).toBe(true);

      const found = await adapter.getPersona(persona.id);
      expect(found).toBeNull();
    });

    it('should handle bulk operations', async () => {
      const personas = Array.from({ length: 50 }, (_, i) => ({
        name: `Bulk Person ${i}`,
        age: 20 + (i % 30),
      }));

      const created = await adapter.bulkCreatePersonas({ personas });
      expect(created).toHaveLength(50);
    });

    it('should use Supabase RPC functions', async () => {
      const mockSupabase = new MockSupabaseClient() as any;
      const client = new SupabaseDatabaseClient(mockSupabase);
      
      // Test RPC call through raw query
      const result = await client.query(
        "SELECT * FROM generate_distribution_personas($1, $2)",
        [10, { mean: 30, stdDev: 5 }]
      );

      // In real implementation, this would call the RPC
      expect(result.rowCount).toBeGreaterThan(0);
    });
  });

  describe('Prisma Client', () => {
    let prismaClient: PrismaDatabaseClient;
    let adapter: PostgresAdapter;

    beforeEach(() => {
      const mockPrisma = new MockPrismaClient() as any;
      prismaClient = new PrismaDatabaseClient(mockPrisma);
      adapter = new PostgresAdapter(prismaClient);
    });

    it('should create personas through Prisma', async () => {
      const persona = await adapter.createPersona({
        name: 'Prisma Test',
        age: 28,
        occupation: 'Engineer',
        attributes: {
          level: 'Senior',
          skills: ['TypeScript', 'Node.js'],
        },
      });

      expect(persona.id).toMatch(/^pr_/);
      expect(persona.name).toBe('Prisma Test');
      expect(persona.attributes.level).toBe('Senior');
    });

    it('should query with Prisma-style filters', async () => {
      // Create test data
      await adapter.bulkCreatePersonas({
        personas: [
          { name: 'Developer One', age: 25, occupation: 'Developer' },
          { name: 'Developer Two', age: 30, occupation: 'Developer' },
          { name: 'Designer One', age: 27, occupation: 'Designer' },
        ],
      });

      // Query with filters
      const developers = await adapter.queryPersonas({
        occupation: 'Developer',
        age: { min: 25, max: 30 },
      });

      expect(developers.data).toHaveLength(2);
      expect(developers.data.every(p => p.occupation === 'Developer')).toBe(true);
    });

    it('should handle transactions', async () => {
      const mockPrisma = new MockPrismaClient() as any;
      const client = new PrismaDatabaseClient(mockPrisma);
      
      // Test transaction
      await client.transaction(async (tx) => {
        // Create multiple personas in transaction
        const adapter = new PostgresAdapter(tx);
        
        const p1 = await adapter.createPersona({ name: 'Transaction 1' });
        const p2 = await adapter.createPersona({ name: 'Transaction 2' });
        
        expect(p1.id).toBeDefined();
        expect(p2.id).toBeDefined();
        
        return [p1, p2];
      });
    });

    it('should handle Prisma relations', async () => {
      // Create group and personas
      const group = await adapter.createPersonaGroup({
        name: 'Prisma Relations Test',
        description: 'Testing relations',
      });

      const personas = await adapter.bulkCreatePersonas({
        personas: [
          { name: 'Member 1' },
          { name: 'Member 2' },
        ],
        groupId: group.id,
      });

      // Query group with members (would use include in real Prisma)
      const groupWithMembers = await adapter.getPersonaGroupWithMembers(group.id);
      
      expect(groupWithMembers?.personas).toHaveLength(2);
    });

    it('should use Prisma aggregations', async () => {
      // Create test data
      await adapter.bulkCreatePersonas({
        personas: Array.from({ length: 20 }, (_, i) => ({
          name: `Stats Person ${i}`,
          age: 20 + (i % 40),
        })),
      });

      // Get count
      const stats = await adapter.getStats();
      expect(stats.totalPersonas).toBeGreaterThanOrEqual(20);
    });

    it('should handle Prisma-specific query features', async () => {
      const mockPrisma = new MockPrismaClient() as any;
      const client = new PrismaDatabaseClient(mockPrisma);
      
      // Test raw query
      const result = await client.query(
        "SELECT AVG(age) as avg_age, COUNT(*) as total_count FROM personas",
        []
      );

      expect(result.rows).toBeDefined();
    });
  });

  describe('Client Compatibility', () => {
    it('should maintain consistent behavior across clients', async () => {
      const mockSupabase = new MockSupabaseClient() as any;
      const mockPrisma = new MockPrismaClient() as any;
      
      const supabaseAdapter = new PostgresAdapter(new SupabaseDatabaseClient(mockSupabase));
      const prismaAdapter = new PostgresAdapter(new PrismaDatabaseClient(mockPrisma));

      // Test same operations on both
      const testPersona = {
        name: 'Compatibility Test',
        age: 30,
        occupation: 'Engineer',
        attributes: { test: true },
      };

      const supabaseResult = await supabaseAdapter.createPersona(testPersona);
      const prismaResult = await prismaAdapter.createPersona(testPersona);

      // Should have same shape (except IDs)
      expect(supabaseResult.name).toBe(prismaResult.name);
      expect(supabaseResult.age).toBe(prismaResult.age);
      expect(supabaseResult.occupation).toBe(prismaResult.occupation);
      expect(supabaseResult.attributes).toEqual(prismaResult.attributes);
    });

    it('should handle errors consistently', async () => {
      const mockSupabase = new MockSupabaseClient() as any;
      const mockPrisma = new MockPrismaClient() as any;
      
      const supabaseAdapter = new PostgresAdapter(new SupabaseDatabaseClient(mockSupabase));
      const prismaAdapter = new PostgresAdapter(new PrismaDatabaseClient(mockPrisma));

      // Test non-existent persona
      const supabaseNotFound = await supabaseAdapter.getPersona('non-existent');
      const prismaNotFound = await prismaAdapter.getPersona('non-existent');

      expect(supabaseNotFound).toBeNull();
      expect(prismaNotFound).toBeNull();
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle batch operations efficiently', async () => {
      const clients = [
        { name: 'Supabase', client: new SupabaseDatabaseClient(new MockSupabaseClient() as any) },
        { name: 'Prisma', client: new PrismaDatabaseClient(new MockPrismaClient() as any) },
      ];

      for (const { name, client } of clients) {
        const adapter = new PostgresAdapter(client);
        
        const start = performance.now();
        
        // Create 100 personas
        await adapter.bulkCreatePersonas({
          personas: Array.from({ length: 100 }, (_, i) => ({
            name: `Perf Test ${i}`,
            age: 25,
          })),
        });

        const duration = performance.now() - start;
        
        // Should complete reasonably fast (mock is instant, but principle applies)
        expect(duration).toBeLessThan(1000);
        
        // Verify all created
        const all = await adapter.queryPersonas({ limit: 200 });
        expect(all.data.length).toBeGreaterThanOrEqual(100);
      }
    });
  });
});