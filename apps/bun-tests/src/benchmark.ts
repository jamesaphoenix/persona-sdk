import { bench, run } from 'mitata';
import { PersonaBuilder, PersonaGroup, NormalDistribution } from '@jamesaphoenix/persona-sdk';
import { BunCassetteManager } from './cassette-manager';

const cassette = new BunCassetteManager({ mode: 'replay' });

// Initialize cassettes
await cassette.init();

console.log('🏃 Running Bun Performance Benchmarks\n');

// PersonaBuilder benchmarks
bench('PersonaBuilder.create()', () => {
  PersonaBuilder.create()
    .withName('Bench User')
    .withAge(25)
    .build();
});

bench('PersonaBuilder with 10 attributes', () => {
  const builder = PersonaBuilder.create();
  for (let i = 0; i < 10; i++) {
    builder.withAttribute(`attr${i}`, `value${i}`);
  }
  builder.build();
});

// PersonaGroup benchmarks
const group = new PersonaGroup();
const testPersonas = Array.from({ length: 100 }, (_, i) => 
  PersonaBuilder.create()
    .withName(`User ${i}`)
    .withAge(20 + (i % 40))
    .build()
);

bench('PersonaGroup.add() x100', () => {
  const g = new PersonaGroup();
  testPersonas.forEach(p => g.add(p));
});

bench('PersonaGroup.filter()', () => {
  const g = PersonaGroup.fromArray(testPersonas);
  g.filter(p => p.age > 30);
});

bench('PersonaGroup.generateStatistics()', () => {
  const g = PersonaGroup.fromArray(testPersonas);
  g.generateStatistics();
});

// Distribution benchmarks
const normalDist = new NormalDistribution(100, 15);

bench('NormalDistribution.sample()', () => {
  normalDist.sample();
});

bench('NormalDistribution x1000 samples', () => {
  for (let i = 0; i < 1000; i++) {
    normalDist.sample();
  }
});

// Cassette benchmarks (if cassettes exist)
bench('Cassette replay', async () => {
  try {
    await cassette.intercept(
      'benchmark.test',
      ['test'],
      async () => ({ result: 'test' })
    );
  } catch {
    // Ignore if no cassette
  }
});

// File I/O comparison
const testData = { test: 'data', nested: { value: 123 } };

bench('Bun.write JSON', async () => {
  await Bun.write('/tmp/bench-test.json', JSON.stringify(testData));
});

bench('Bun.file.json()', async () => {
  const file = Bun.file('/tmp/bench-test.json');
  await file.json();
});

// Run benchmarks
await run({
  avg: true,
  json: false,
  colors: true,
  min_max: true,
});

// Cassette stats
console.log('\n📊 Cassette Statistics:');
const stats = await cassette.getStats();
console.log(`Total cassettes: ${stats.total}`);
console.log(`Total size: ${(stats.totalSize / 1024).toFixed(1)}KB`);
Object.entries(stats.byCategory).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});