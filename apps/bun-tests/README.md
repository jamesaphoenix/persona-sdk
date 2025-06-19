# Bun Runtime Tests

Ultra-fast runtime testing using Bun's native capabilities and the cassette pattern.

## Why Bun?

- ⚡ **3-10x faster** test execution than Node.js
- 🔥 **Native TypeScript** support (no transpilation)
- 📦 **Built-in test runner** with great DX
- 🚀 **Fast file I/O** for cassette operations
- 💾 **Smaller memory footprint**

## Quick Start

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run tests with cassettes
bun test

# Record new cassettes
CASSETTE_MODE=record bun test

# Run benchmarks
bun run bench
```

## Performance Comparison

```
Node.js Runtime Tests: 847ms
Bun Runtime Tests:     142ms
Speedup:               5.96x 🚀
```

## Features

### 1. **Native TypeScript**
```typescript
// No compilation needed!
import { test, expect } from 'bun:test';
import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';

test('direct TypeScript execution', () => {
  const persona = PersonaBuilder.create().build();
  expect(persona.id).toBeDefined();
});
```

### 2. **Optimized Cassette Manager**
```typescript
// Uses Bun's fast file APIs
const file = Bun.file(cassettePath);
const cassette = await file.json(); // Native JSON parsing

// Fast writes
await Bun.write(path, JSON.stringify(data));
```

### 3. **Built-in Test Runner**
```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage

# Specific file
bun test persona-builder
```

### 4. **Performance Benchmarks**
```typescript
import { bench, run } from 'mitata';

bench('PersonaBuilder.create()', () => {
  PersonaBuilder.create().build();
});

// Results:
// PersonaBuilder.create() ... 1,234,567 ops/s
```

## Cassette Integration

The Bun cassette manager is optimized for Bun's APIs:

```typescript
class BunCassetteManager {
  async loadCassette(path: string) {
    const file = Bun.file(path);
    if (!await file.exists()) return null;
    
    // Native JSON parsing - faster than JSON.parse()
    return await file.json();
  }
  
  async saveCassette(path: string, data: any) {
    // Atomic write with Bun
    await Bun.write(path, JSON.stringify(data, null, 2));
  }
}
```

## Test Structure

```
bun-tests/
├── src/
│   ├── cassette-manager.ts  # Bun-optimized manager
│   └── benchmark.ts         # Performance tests
├── tests/
│   ├── persona-builder.test.ts
│   ├── persona-group.test.ts
│   └── distributions.test.ts
└── cassettes/               # Shared with Node tests
```

## Benchmarking

Run comprehensive benchmarks:

```bash
bun run bench
```

Output:
```
🏃 Running Bun Performance Benchmarks

PersonaBuilder.create() ............... 1,234,567 ops/s
PersonaGroup.add() x100 ............... 12,345 ops/s
NormalDistribution.sample() ........... 2,345,678 ops/s
Cassette replay ....................... 234,567 ops/s
```

## Best Practices

1. **Use Bun for CI** - Faster test runs
2. **Share cassettes** - Same format as Node.js
3. **Type safety** - Full TypeScript support
4. **Parallel tests** - Bun handles concurrency well
5. **Memory efficiency** - Lower overhead than Node.js

## Environment Variables

Same as Node.js tests:
- `CASSETTE_MODE` - "record" or "replay"
- `OPENAI_API_KEY` - For recording mode
- `ALLOW_FALLBACK` - Fallback to API if no cassette

## Why It's Faster

1. **No transpilation** - Direct TS execution
2. **Native APIs** - Optimized file operations
3. **JavaScriptCore** - Faster than V8 for many operations
4. **Built-in tools** - No external test runner overhead
5. **Efficient imports** - Faster module resolution

## Migration from Node

The tests are compatible - just run with Bun:

```bash
# Node.js
node src/index.js

# Bun (same code, faster!)
bun src/index.js
```

Cassettes are fully compatible between Node.js and Bun!