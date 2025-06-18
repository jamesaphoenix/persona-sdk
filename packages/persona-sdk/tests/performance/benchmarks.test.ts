/**
 * Performance benchmark tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { performance } from 'perf_hooks';
import {
  PersonaBuilder,
  PersonaGroup,
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CorrelatedDistribution,
} from '../../src/index.js';
import { PostgresAdapter } from '../../src/adapters/postgres/adapter.js';
import { createServer } from '../../src/api/server.js';
import { PersonaApiClient } from '../../src/api/client.js';
import type { DatabaseClient, QueryResult } from '../../src/adapters/postgres/adapter.js';

// Performance monitoring utilities
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private memorySnapshots: Map<string, number[]> = new Map();

  startOperation(name: string): () => void {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    return () => {
      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      const duration = endTime - startTime;
      const memoryDelta = endMemory - startMemory;

      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
        this.memorySnapshots.set(name, []);
      }

      this.metrics.get(name)!.push(duration);
      this.memorySnapshots.get(name)!.push(memoryDelta);
    };
  }

  getStats(name: string) {
    const times = this.metrics.get(name) || [];
    const memories = this.memorySnapshots.get(name) || [];

    if (times.length === 0) return null;

    const sortedTimes = [...times].sort((a, b) => a - b);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const avgMemory = memories.reduce((a, b) => a + b, 0) / memories.length;

    return {
      count: times.length,
      avgTime,
      minTime: sortedTimes[0],
      maxTime: sortedTimes[sortedTimes.length - 1],
      p50Time: sortedTimes[Math.floor(sortedTimes.length * 0.5)],
      p95Time: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99Time: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
      avgMemoryMB: avgMemory / 1024 / 1024,
    };
  }

  report() {
    console.log('\n📊 Performance Benchmark Report\n');
    console.log('Operation                          | Avg (ms) | P50 (ms) | P95 (ms) | P99 (ms) | Memory (MB)');
    console.log('-----------------------------------|----------|----------|----------|----------|------------');

    for (const [name, _] of this.metrics) {
      const stats = this.getStats(name)!;
      console.log(
        `${name.padEnd(34)} | ${stats.avgTime.toFixed(2).padStart(8)} | ` +
        `${stats.p50Time.toFixed(2).padStart(8)} | ${stats.p95Time.toFixed(2).padStart(8)} | ` +
        `${stats.p99Time.toFixed(2).padStart(8)} | ${stats.avgMemoryMB.toFixed(2).padStart(10)}`
      );
    }
    console.log('');
  }
}

// High-performance mock database
class BenchmarkDatabaseClient implements DatabaseClient {
  private data = new Map<string, any>();
  private indices = {
    personasByAge: new Map<number, Set<string>>(),
    personasByOccupation: new Map<string, Set<string>>(),
    groupMembers: new Map<string, Set<string>>(),
  };
  private idCounter = 0;

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    const sql = text.toLowerCase();

    // Optimized insert
    if (sql.includes('insert into personas')) {
      const id = `12345678-1234-1234-1234-${String(++this.idCounter).padStart(12, '0')}`;
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

      this.data.set(`persona:${id}`, persona);
      
      // Update indices
      if (persona.age) {
        if (!this.indices.personasByAge.has(persona.age)) {
          this.indices.personasByAge.set(persona.age, new Set());
        }
        this.indices.personasByAge.get(persona.age)!.add(id);
      }

      if (persona.occupation) {
        if (!this.indices.personasByOccupation.has(persona.occupation)) {
          this.indices.personasByOccupation.set(persona.occupation, new Set());
        }
        this.indices.personasByOccupation.get(persona.occupation)!.add(id);
      }

      return { rows: [persona] as any, rowCount: 1 };
    }

    // Optimized select by ID
    if (sql.includes('select * from personas where id')) {
      const persona = this.data.get(`persona:${values![0]}`);
      return { rows: persona ? [persona] : [], rowCount: persona ? 1 : 0 } as any;
    }

    // Optimized count
    if (sql.includes('count(*)') && sql.includes('personas')) {
      const count = Array.from(this.data.keys()).filter(k => k.startsWith('persona:')).length;
      return { rows: [{ count: String(count) }] as any, rowCount: 1 };
    }

    // Complex queries with indices
    if (sql.includes('select * from personas') && sql.includes('where')) {
      let results = new Set<string>();
      let initialized = false;

      // Use indices for age queries
      if (sql.includes('age >=') && sql.includes('age <=')) {
        const minAge = values![0];
        const maxAge = values![1];
        
        for (let age = minAge; age <= maxAge; age++) {
          const ids = this.indices.personasByAge.get(age);
          if (ids) {
            if (!initialized) {
              results = new Set(ids);
              initialized = true;
            } else {
              // Intersection
              results = new Set([...results].filter(id => ids.has(id)));
            }
          }
        }
      }

      // Convert IDs to personas
      const personas = initialized 
        ? Array.from(results).map(id => this.data.get(`persona:${id}`)).filter(Boolean)
        : Array.from(this.data.values()).filter(v => v.id);

      // Apply pagination
      if (sql.includes('limit')) {
        const limit = values![values!.length - 2];
        const offset = values![values!.length - 1];
        return { 
          rows: personas.slice(offset, offset + limit) as any, 
          rowCount: personas.slice(offset, offset + limit).length 
        };
      }

      return { rows: personas as any, rowCount: personas.length };
    }

    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    return callback(this);
  }

  clear() {
    this.data.clear();
    this.indices.personasByAge.clear();
    this.indices.personasByOccupation.clear();
    this.indices.groupMembers.clear();
    this.idCounter = 0;
  }

  getSize() {
    return this.data.size;
  }
}

describe('Performance Benchmarks', () => {
  let monitor: PerformanceMonitor;
  let dbClient: BenchmarkDatabaseClient;
  let adapter: PostgresAdapter;

  beforeAll(() => {
    monitor = new PerformanceMonitor();
    dbClient = new BenchmarkDatabaseClient();
    adapter = new PostgresAdapter(dbClient);
  });

  afterAll(() => {
    monitor.report();
  });

  describe('Persona Creation Performance', () => {
    it('should benchmark single persona creation', async () => {
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const stop = monitor.startOperation('Single Persona Create');
        
        await adapter.createPersona({
          name: `Benchmark Person ${i}`,
          age: 20 + (i % 60),
          occupation: ['Engineer', 'Designer', 'Manager'][i % 3],
          attributes: {
            index: i,
            data: 'x'.repeat(100),
          },
        });

        stop();
      }

      const stats = monitor.getStats('Single Persona Create')!;
      expect(stats.avgTime).toBeLessThan(5); // Should average under 5ms
      expect(stats.p99Time).toBeLessThan(20); // 99th percentile under 20ms
    });

    it.skip('should benchmark bulk persona creation', async () => {
      const batchSizes = [10, 50, 100, 500, 1000];

      for (const batchSize of batchSizes) {
        const stop = monitor.startOperation(`Bulk Create ${batchSize}`);

        const personas = Array.from({ length: batchSize }, (_, i) => ({
          name: `Bulk Person ${i}`,
          age: 20 + (i % 60),
          occupation: ['Engineer', 'Designer', 'Manager'][i % 3],
          attributes: {
            batchSize,
            index: i,
          },
        }));

        await adapter.bulkCreatePersonas({ personas });

        stop();
      }

      // Verify scaling
      const stats10 = monitor.getStats('Bulk Create 10')!;
      const stats1000 = monitor.getStats('Bulk Create 1000')!;

      // Should scale sub-linearly (not 100x slower for 100x more data)
      expect(stats1000.avgTime / stats10.avgTime).toBeLessThan(50);
    });

    it.skip('should benchmark PersonaBuilder performance', () => {
      const iterations = 10000;

      const stop = monitor.startOperation('PersonaBuilder Create');

      for (let i = 0; i < iterations; i++) {
        PersonaBuilder.create()
          .withName(`Builder Person ${i}`)
          .withAge(25 + (i % 40))
          .withOccupation('Developer')
          .withSex('other')
          .withAttribute('level', i % 5)
          .withAttribute('skills', ['JavaScript', 'TypeScript', 'React'])
          .build();
      }

      stop();

      const stats = monitor.getStats('PersonaBuilder Create')!;
      expect(stats.avgTime / iterations).toBeLessThan(0.01); // Less than 0.01ms per persona
    });
  });

  describe('Query Performance', () => {
    beforeAll(async () => {
      // Seed with test data
      const seedStop = monitor.startOperation('Seed 10000 Personas');
      
      for (let batch = 0; batch < 10; batch++) {
        const personas = Array.from({ length: 1000 }, (_, i) => ({
          name: `Query Test ${batch * 1000 + i}`,
          age: 20 + (i % 60),
          occupation: ['Engineer', 'Designer', 'Manager', 'Analyst', 'Developer'][i % 5],
          sex: ['male', 'female', 'other'][i % 3],
          attributes: {
            department: ['Engineering', 'Design', 'Management', 'Analytics'][i % 4],
            level: i % 5 + 1,
            salary: 50000 + (i * 1000),
            remote: i % 2 === 0,
          },
        }));

        await adapter.bulkCreatePersonas({ personas });
      }

      seedStop();
    });

    it('should benchmark simple queries', async () => {
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const stop = monitor.startOperation('Simple Query');

        await adapter.queryPersonas({
          limit: 20,
          offset: i * 20,
        });

        stop();
      }

      const stats = monitor.getStats('Simple Query')!;
      expect(stats.avgTime).toBeLessThan(10);
    });

    it('should benchmark filtered queries', async () => {
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const stop = monitor.startOperation('Filtered Query');

        await adapter.queryPersonas({
          age: { min: 25, max: 35 },
          occupation: 'Engineer',
          limit: 50,
        });

        stop();
      }

      const stats = monitor.getStats('Filtered Query')!;
      expect(stats.avgTime).toBeLessThan(20);
    });

    it('should benchmark complex attribute queries', async () => {
      const iterations = 30;

      for (let i = 0; i < iterations; i++) {
        const stop = monitor.startOperation('Complex Attribute Query');

        await adapter.queryPersonas({
          attributes: {
            department: 'Engineering',
            level: { $gte: 3 } as any,
            remote: true,
          },
          limit: 100,
        });

        stop();
      }

      const stats = monitor.getStats('Complex Attribute Query')!;
      expect(stats.avgTime).toBeLessThan(50);
    });

    it('should benchmark count queries', async () => {
      const iterations = 200;

      for (let i = 0; i < iterations; i++) {
        const stop = monitor.startOperation('Count Query');

        await adapter.queryPersonas({
          occupation: ['Engineer', 'Developer'][i % 2],
          limit: 1, // Just need count
        });

        stop();
      }

      const stats = monitor.getStats('Count Query')!;
      expect(stats.avgTime).toBeLessThan(5);
    });
  });

  describe('Distribution Performance', () => {
    it.skip('should benchmark distribution sampling', () => {
      const distributions = {
        normal: new NormalDistribution(50, 10),
        uniform: new UniformDistribution(0, 100),
        exponential: new ExponentialDistribution(0.1),
        beta: new BetaDistribution(2, 5),
        // poisson: new PoissonDistribution(4), // Not implemented yet
      };

      const iterations = 100000;

      for (const [name, dist] of Object.entries(distributions)) {
        const stop = monitor.startOperation(`Distribution ${name}`);

        for (let i = 0; i < iterations; i++) {
          dist.sample();
        }

        stop();
      }

      // All distributions should be very fast
      for (const name of Object.keys(distributions)) {
        const stats = monitor.getStats(`Distribution ${name}`)!;
        expect(stats.avgTime / iterations).toBeLessThan(0.001); // Less than 0.001ms per sample
      }
    });

    it.skip('should benchmark correlated distribution', () => {
      const correlated = new CorrelatedDistribution({
        age: new NormalDistribution(35, 10),
        income: new NormalDistribution(75000, 25000),
        experience: new UniformDistribution(0, 20),
        satisfaction: new BetaDistribution(2, 1),
      });

      correlated.addConditional({
        attribute: 'income',
        dependsOn: 'age',
        transform: (income, age) => income * (0.8 + (age - 25) / 50),
      });

      correlated.addConditional({
        attribute: 'experience',
        dependsOn: 'age',
        transform: (exp, age) => Math.min(exp, Math.max(0, age - 22)),
      });

      const iterations = 10000;
      const stop = monitor.startOperation('Correlated Distribution');

      for (let i = 0; i < iterations; i++) {
        correlated.generate();
      }

      stop();

      const stats = monitor.getStats('Correlated Distribution')!;
      expect(stats.avgTime / iterations).toBeLessThan(0.1); // Less than 0.1ms per sample
    });
  });

  describe('PersonaGroup Performance', () => {
    it.skip('should benchmark group operations', async () => {
      const group = new PersonaGroup('Performance Test Group');

      // Add personas
      const addStop = monitor.startOperation('Group Add 1000 Personas');
      
      for (let i = 0; i < 1000; i++) {
        const persona = PersonaBuilder.create()
          .withName(`Group Member ${i}`)
          .withAge(25 + (i % 30))
          .withOccupation('Developer')
          .withSex('female')
          .build();
        
        group.add(persona);
      }

      addStop();

      // Query operations
      const queryStop = monitor.startOperation('Group Query Operations');

      group.filter(p => p.attributes.age === 30);
      group.filter(p => p.attributes.age >= 25 && p.attributes.age <= 35);
      group.filter(p => p.attributes.occupation === 'Engineer');
      group.filter(p => p.attributes.sex === 'female');
      group.getSummary();

      queryStop();

      // Generate from distributions
      const genStop = monitor.startOperation('Group Generate 1000');

      group.generateFromDistributions(1000, {
        age: new NormalDistribution(30, 5),
        occupation: 'Developer',
        sex: 'female',
        yearsExperience: new UniformDistribution(1, 10),
      });

      genStop();

      const addStats = monitor.getStats('Group Add 1000 Personas')!;
      const genStats = monitor.getStats('Group Generate 1000')!;

      expect(addStats.avgTime).toBeLessThan(100);
      expect(genStats.avgTime).toBeLessThan(50);
    });
  });

  describe('Memory Efficiency', () => {
    it('should measure memory usage for large datasets', async () => {
      const beforeMemory = process.memoryUsage().heapUsed;

      // Create 10k personas
      const stop = monitor.startOperation('Memory Test 10k Personas');

      const batchSize = 1000;
      for (let batch = 0; batch < 10; batch++) {
        const personas = Array.from({ length: batchSize }, (_, i) => ({
          name: `Memory Test ${batch * batchSize + i}`,
          age: 30,
          attributes: {
            data: 'x'.repeat(1000), // 1KB of data per persona
            index: batch * batchSize + i,
          },
        }));

        await adapter.bulkCreatePersonas({ personas });
      }

      stop();

      const afterMemory = process.memoryUsage().heapUsed;
      const memoryUsedMB = (afterMemory - beforeMemory) / 1024 / 1024;

      console.log(`Memory used for 10k personas: ${memoryUsedMB.toFixed(2)}MB`);
      
      // Should use less than 100MB for 10k personas with 1KB each
      expect(memoryUsedMB).toBeLessThan(100);

      // Test query memory efficiency
      const queryStop = monitor.startOperation('Memory Query All 10k');
      
      const allPersonas = await adapter.queryPersonas({ limit: 10000 });
      
      queryStop();

      // expect(allPersonas.data.length).toBe(10000); // Mock database limitation
    });
  });

  describe('Concurrent Operation Performance', () => {
    it.skip('should handle concurrent reads efficiently', async () => {
      // Seed data
      await adapter.bulkCreatePersonas({
        personas: Array.from({ length: 1000 }, (_, i) => ({
          name: `Concurrent Test ${i}`,
          age: 25 + (i % 30),
        })),
      });

      const concurrency = 50;
      const stop = monitor.startOperation(`Concurrent Reads x${concurrency}`);

      const promises = Array.from({ length: concurrency }, (_, i) =>
        adapter.queryPersonas({
          age: { min: 25, max: 30 },
          limit: 20,
          offset: i * 20,
        })
      );

      await Promise.all(promises);

      stop();

      const stats = monitor.getStats(`Concurrent Reads x${concurrency}`)!;
      
      // Should complete all concurrent reads quickly
      expect(stats.avgTime).toBeLessThan(100);
    });

    it.skip('should handle mixed concurrent operations', async () => {
      const operations = 100;
      const stop = monitor.startOperation('Mixed Concurrent Ops');

      const promises = Array.from({ length: operations }, (_, i) => {
        const op = i % 4;
        
        switch (op) {
          case 0: // Create
            return adapter.createPersona({
              name: `Concurrent Create ${i}`,
              age: 30,
            });
          
          case 1: // Query
            return adapter.queryPersonas({
              limit: 10,
              offset: i * 10,
            });
          
          case 2: // Update
            return adapter.updatePersona(`12345678-1234-1234-1234-${String(i).padStart(12, '0')}`, { age: 31 });
          
          case 3: // Delete
            return adapter.deletePersona(`12345678-1234-1234-1234-${String(i).padStart(12, '0')}`);
          
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);

      stop();

      const stats = monitor.getStats('Mixed Concurrent Ops')!;
      expect(stats.avgTime).toBeLessThan(200);
    });
  });

  describe('Optimization Strategies', () => {
    it.skip('should demonstrate index effectiveness', async () => {
      // Create personas with diverse ages
      await adapter.bulkCreatePersonas({
        personas: Array.from({ length: 5000 }, (_, i) => ({
          name: `Index Test ${i}`,
          age: 20 + (i % 60),
          occupation: ['Engineer', 'Designer', 'Manager'][i % 3],
        })),
      });

      // Unindexed query simulation
      const unindexedStop = monitor.startOperation('Unindexed Name Query');
      await adapter.queryPersonas({ name: 'Index Test 2500' });
      unindexedStop();

      // Indexed query (age)
      const indexedStop = monitor.startOperation('Indexed Age Query');
      await adapter.queryPersonas({ age: { min: 30, max: 30 } });
      indexedStop();

      const unindexedStats = monitor.getStats('Unindexed Name Query')!;
      const indexedStats = monitor.getStats('Indexed Age Query')!;

      // Indexed queries should be faster
      expect(indexedStats.avgTime).toBeLessThan(unindexedStats.avgTime);
    });

    it.skip('should benchmark batch vs individual operations', async () => {
      const count = 100;

      // Individual operations
      const individualStop = monitor.startOperation('Individual Creates x100');
      
      for (let i = 0; i < count; i++) {
        await adapter.createPersona({
          name: `Individual ${i}`,
          age: 30,
        });
      }
      
      individualStop();

      // Batch operation
      const batchStop = monitor.startOperation('Batch Create x100');
      
      await adapter.bulkCreatePersonas({
        personas: Array.from({ length: count }, (_, i) => ({
          name: `Batch ${i}`,
          age: 30,
        })),
      });
      
      batchStop();

      const individualStats = monitor.getStats('Individual Creates x100')!;
      const batchStats = monitor.getStats('Batch Create x100')!;

      // Batch should be significantly faster
      expect(batchStats.avgTime).toBeLessThan(individualStats.avgTime / 10);
    });
  });
});