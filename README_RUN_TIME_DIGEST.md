# Runtime Testing: Why It Matters

## The Gap Between Theory and Reality

Unit tests verify that individual components work in isolation. But software doesn't run in isolation—it runs in the real world, where functions call other functions, types get compiled differently, and users do unexpected things. Runtime testing bridges this gap.

## What Runtime Testing Catches That Unit Tests Miss

### 1. API Contract Mismatches

**The Problem**: Your unit test mocks a function expecting it to be called one way, but the actual implementation works differently.

**Real Example from Persona SDK**:
```javascript
// Unit test assumed this would work:
const personas = group.getAll();  // ❌ Method doesn't exist

// Runtime test discovered the actual API:
const personas = group.personas;  // ✅ It's a getter, not a method
```

**Why It Happened**: The test was written based on assumptions about the API, not the actual implementation.

### 2. Type Compilation Differences

**The Problem**: TypeScript types look correct in your IDE, but the compiled JavaScript behaves differently.

**Real Example**:
```javascript
// TypeScript source shows a method:
class Persona {
  clone(newName?: string): Persona { ... }
}

// But test expected different signature:
const clone = persona.clone('New Name');  // Runtime revealed parameter wasn't supported initially
```

**Why It Matters**: TypeScript's type system is erased at runtime. What compiles doesn't always run as expected.

### 3. Edge Cases in Real Usage

**The Problem**: Unit tests often test the "happy path" with clean, predictable data.

**Real Example**:
```javascript
// Unit test used nice numbers:
new UniformDistribution(0, 100);  // ✅ Works fine

// Runtime test tried edge case:
new UniformDistribution(42, 42);  // ❌ Rejected! Min must be less than max

// Had to fix to support single-point distributions
```

**Impact**: Real users will inevitably hit these edge cases.

### 4. Integration Between Components

**The Problem**: Components that work perfectly in isolation fail when used together.

**Real Example**:
```javascript
// Each worked fine alone:
const dist = new NormalDistribution(30, 5);     // ✅
const persona = new Persona('Test', {...});     // ✅

// But together:
const persona = Persona.fromDistributions('Test', {
  age: dist,  // ❌ Runtime error: age was sometimes negative!
});
```

**The Fix**: Added validation to ensure sampled values were valid for the context.

### 5. Hidden Dependencies and Side Effects

**The Problem**: Functions might depend on global state, environment variables, or have unexpected side effects.

**Real Example**:
```javascript
// Unit test mocked the API call:
vi.mock('openai', () => ({ /* mock */ }));

// Runtime test with cassettes revealed:
PersonaBuilder.fromPrompt('...') 
// Actually needed: API key validation, response parsing, error handling
// Response format had ```json``` wrappers that needed stripping
```

## The Runtime Testing Success Story

In the Persona SDK, runtime testing revealed critical issues:

1. **Initial State**: 40.7% of functions worked correctly
2. **After Fixing API Mismatches**: 63% success rate
3. **After Adding Missing Methods**: 88.9% success rate  
4. **After Edge Case Handling**: 96.3% success rate
5. **After Validation Fixes**: 100% success rate

Each improvement came from bugs that **unit tests completely missed**.

## Why Runtime Testing Is Essential

### 1. Tests the Actual Compiled Code
- Unit tests run on source code with mocks
- Runtime tests run on the actual distributed package
- Catches build and compilation issues

### 2. Validates Real-World Usage Patterns
```javascript
// Unit test:
expect(persona.age).toBe(30);  // Simple assertion

// Runtime test:
const group = new PersonaGroup();
for (let i = 0; i < 1000; i++) {
  group.add(Persona.fromDistributions(...));
}
const stats = group.getStatistics('age');  // Tests real usage flow
```

### 3. Discovers Documentation Gaps
If the runtime test fails because an API doesn't exist as documented, you've found a documentation bug before your users do.

### 4. Performance and Resource Testing
```javascript
// Runtime test can measure:
const start = Date.now();
const personas = PersonaGroup.generateFromDistributions(10000, {...});
const duration = Date.now() - start;
// Is this fast enough? Does it leak memory?
```

### 5. Cross-Platform Compatibility
Runtime tests can run on different Node versions, operating systems, and JavaScript engines (like Bun), catching platform-specific issues.

## The Cost of Not Having Runtime Tests

Without runtime testing, these bugs reach production:

1. **Users report**: "The example in your docs doesn't work"
2. **Support tickets**: "I'm getting undefined when I call persona.age"
3. **GitHub issues**: "Type definitions don't match runtime behavior"
4. **Lost trust**: Users switch to alternatives that "just work"

## Runtime Testing Best Practices

### 1. Test Every Public API
```javascript
// Systematically test all methods
for (const [className, methods] of allPublicAPIs) {
  testEachMethod(className, methods);
}
```

### 2. Use Realistic Data
Don't just test with "Test User" and age 30. Test with:
- Extreme values (age: 1, age: 150)
- Empty strings
- Special characters
- Large datasets

### 3. Test Function Composition
```javascript
// Don't just test A and B separately
// Test A→B→C flows that users will actually do
const persona = PersonaBuilder.create()
  .withAge(new NormalDistribution(30, 5))
  .withAttribute('score', new UniformDistribution(0, 100))
  .buildWithCorrelations({...});
```

### 4. Make Tests Fast with Cassettes
Record expensive operations once, replay forever:
```javascript
// First run: costs money, takes time
const result = await AI.generate();  // Records to cassette

// All future runs: free and instant
const result = await AI.generate();  // Reads from cassette
```

### 5. Track Coverage
Know what percentage of your public API is tested:
```
Coverage Report:
- Persona: 100% (16/16 methods tested)
- PersonaGroup: 100% (12/12 methods tested)
- Distributions: 100% (20/20 methods tested)
Overall: 100% coverage of testable functions
```

## Runtime Testing in React Applications

Traditional React component tests often miss real-world issues. Here's how to implement runtime testing for React:

### 1. Component Integration Testing

**Traditional Test** (what most people do):
```javascript
// Isolated component test with mocks
test('PersonaCard renders', () => {
  const mockPersona = { id: '1', name: 'Test', age: 30 };
  render(<PersonaCard persona={mockPersona} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

**Runtime Test** (what actually catches bugs):
```javascript
// Test the full component lifecycle with real data flow
test('PersonaCard full integration', async () => {
  // Use real SDK to generate data
  const persona = PersonaBuilder.create()
    .withName('Test User')
    .withAge(new NormalDistribution(30, 5))
    .build();
  
  // Render in realistic context
  const { container } = render(
    <PersonaProvider>
      <PersonaCard persona={persona} />
    </PersonaProvider>
  );
  
  // Test real interactions
  await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
  
  // Verify side effects actually happen
  await waitFor(() => {
    expect(window.localStorage.getItem('lastEditedPersona')).toBe(persona.id);
  });
  
  // Check performance
  const renderTime = performance.measure('persona-card-render');
  expect(renderTime.duration).toBeLessThan(100); // ms
});
```

### 2. React Hook Runtime Testing

**The Problem**: Hooks can have complex state interactions that only appear during real usage.

```javascript
// Runtime test for custom hooks
describe('usePersonaGroup runtime tests', () => {
  it('handles rapid updates without memory leaks', async () => {
    const { result } = renderHook(() => usePersonaGroup('test-group'));
    
    // Simulate real usage patterns
    for (let i = 0; i < 100; i++) {
      act(() => {
        result.current.addPersona(generateTestPersona());
      });
    }
    
    // Check for memory leaks
    const memoryBefore = performance.memory.usedJSHeapSize;
    
    // Trigger cleanup
    act(() => {
      result.current.clearGroup();
    });
    
    // Force garbage collection (if available)
    if (global.gc) global.gc();
    
    const memoryAfter = performance.memory.usedJSHeapSize;
    expect(memoryAfter).toBeLessThan(memoryBefore * 1.1); // Max 10% growth
  });
  
  it('maintains consistency during concurrent updates', async () => {
    const { result } = renderHook(() => usePersonaGroup('test-group'));
    
    // Simulate concurrent updates (common in real apps)
    await Promise.all([
      act(async () => result.current.addPersona(generateTestPersona())),
      act(async () => result.current.removePersona('some-id')),
      act(async () => result.current.updateFilters({ age: '>30' }))
    ]);
    
    // State should still be consistent
    expect(result.current.personas.length).toBe(result.current.count);
    expect(result.current.error).toBeNull();
  });
});
```

### 3. React Error Boundary Testing

```javascript
// Runtime test for error boundaries
test('PersonaApp handles SDK errors gracefully', async () => {
  // Mock SDK to throw realistic errors
  const originalFromPrompt = PersonaBuilder.fromPrompt;
  PersonaBuilder.fromPrompt = async () => {
    throw new Error('Rate limit exceeded');
  };
  
  render(
    <ErrorBoundary>
      <PersonaApp />
    </ErrorBoundary>
  );
  
  // Trigger error condition
  await userEvent.click(screen.getByText('Generate with AI'));
  
  // Should show user-friendly error, not crash
  await waitFor(() => {
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.getByText(/Try again/)).toBeInTheDocument();
  });
  
  // Should recover when user retries
  PersonaBuilder.fromPrompt = originalFromPrompt;
  await userEvent.click(screen.getByText('Try again'));
  
  await waitFor(() => {
    expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
  });
});
```

### 4. React Performance Runtime Testing

```javascript
// Test real render performance
test('PersonaGrid handles large datasets efficiently', async () => {
  const personas = Array.from({ length: 1000 }, (_, i) => 
    PersonaBuilder.create()
      .withName(`User ${i}`)
      .withAge(20 + (i % 60))
      .build()
  );
  
  const startTime = performance.now();
  
  const { container } = render(
    <PersonaGrid personas={personas} />
  );
  
  const initialRenderTime = performance.now() - startTime;
  expect(initialRenderTime).toBeLessThan(500); // Initial render < 500ms
  
  // Test scroll performance
  const scrollContainer = container.querySelector('.persona-grid');
  
  const scrollStartTime = performance.now();
  fireEvent.scroll(scrollContainer, { target: { scrollTop: 5000 } });
  const scrollTime = performance.now() - scrollStartTime;
  
  expect(scrollTime).toBeLessThan(16); // Single frame (60fps)
});
```

## Runtime Testing for API Contracts

API contract testing ensures your frontend and backend stay in sync. Here's how to implement it effectively:

### 1. Contract Recording

**Step 1**: Record actual API responses during development
```javascript
class APIContractRecorder {
  constructor() {
    this.contracts = new Map();
  }
  
  async recordContract(endpoint, method, payload) {
    const response = await fetch(endpoint, {
      method,
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const contract = {
      request: {
        endpoint,
        method,
        payload,
        headers: Object.fromEntries(response.headers)
      },
      response: {
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: await response.json(),
        timestamp: new Date().toISOString()
      }
    };
    
    this.contracts.set(`${method} ${endpoint}`, contract);
    return contract;
  }
  
  saveContracts() {
    fs.writeFileSync(
      'api-contracts.json', 
      JSON.stringify(Array.from(this.contracts.entries()), null, 2)
    );
  }
}
```

### 2. Contract Validation

**Step 2**: Validate contracts during tests
```javascript
class APIContractValidator {
  constructor(contractsPath) {
    this.contracts = new Map(JSON.parse(
      fs.readFileSync(contractsPath, 'utf-8')
    ));
  }
  
  validateResponse(endpoint, method, actualResponse) {
    const contract = this.contracts.get(`${method} ${endpoint}`);
    if (!contract) {
      throw new Error(`No contract found for ${method} ${endpoint}`);
    }
    
    // Validate structure
    const errors = [];
    
    // Check status code
    if (actualResponse.status !== contract.response.status) {
      errors.push(
        `Status mismatch: expected ${contract.response.status}, got ${actualResponse.status}`
      );
    }
    
    // Check response shape
    const contractKeys = Object.keys(contract.response.body);
    const actualKeys = Object.keys(actualResponse.body);
    
    const missingKeys = contractKeys.filter(k => !actualKeys.includes(k));
    const extraKeys = actualKeys.filter(k => !contractKeys.includes(k));
    
    if (missingKeys.length > 0) {
      errors.push(`Missing keys: ${missingKeys.join(', ')}`);
    }
    
    if (extraKeys.length > 0) {
      errors.push(`Unexpected keys: ${extraKeys.join(', ')}`);
    }
    
    // Check types
    for (const key of contractKeys) {
      const contractType = typeof contract.response.body[key];
      const actualType = typeof actualResponse.body[key];
      
      if (contractType !== actualType) {
        errors.push(
          `Type mismatch for "${key}": expected ${contractType}, got ${actualType}`
        );
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Contract validation failed:\n${errors.join('\n')}`);
    }
  }
}
```

### 3. Runtime Contract Testing

```javascript
describe('API Contract Runtime Tests', () => {
  const validator = new APIContractValidator('./api-contracts.json');
  
  it('POST /api/personas matches contract', async () => {
    const payload = {
      name: 'Test User',
      age: 30,
      occupation: 'Developer'
    };
    
    const response = await fetch('/api/personas', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseData = {
      status: response.status,
      body: await response.json()
    };
    
    // This will throw if contract is violated
    validator.validateResponse('/api/personas', 'POST', responseData);
  });
  
  it('handles paginated responses correctly', async () => {
    // Test actual pagination behavior
    const page1 = await fetch('/api/personas?page=1&limit=10');
    const page2 = await fetch('/api/personas?page=2&limit=10');
    
    const data1 = await page1.json();
    const data2 = await page2.json();
    
    // Ensure no duplicate IDs across pages
    const ids1 = new Set(data1.items.map(p => p.id));
    const ids2 = new Set(data2.items.map(p => p.id));
    
    expect(ids1.intersection(ids2).size).toBe(0);
    
    // Ensure consistent total count
    expect(data1.total).toBe(data2.total);
  });
});
```

### 4. GraphQL Contract Testing

```javascript
class GraphQLContractTester {
  async testQuery(query, variables, expectedShape) {
    const response = await graphqlClient.request(query, variables);
    
    // Deep shape validation
    function validateShape(actual, expected, path = '') {
      for (const [key, expectedValue] of Object.entries(expected)) {
        const actualValue = actual[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        if (actualValue === undefined) {
          throw new Error(`Missing field: ${currentPath}`);
        }
        
        if (expectedValue === '?') continue; // Optional field
        
        if (typeof expectedValue === 'string') {
          // Type check
          const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;
          if (actualType !== expectedValue) {
            throw new Error(
              `Type mismatch at ${currentPath}: expected ${expectedValue}, got ${actualType}`
            );
          }
        } else if (typeof expectedValue === 'object') {
          // Nested shape
          if (Array.isArray(expectedValue)) {
            if (!Array.isArray(actualValue)) {
              throw new Error(`Expected array at ${currentPath}`);
            }
            if (actualValue.length > 0) {
              validateShape(actualValue[0], expectedValue[0], `${currentPath}[0]`);
            }
          } else {
            validateShape(actualValue, expectedValue, currentPath);
          }
        }
      }
    }
    
    validateShape(response, expectedShape);
    return response;
  }
}

// Usage
const tester = new GraphQLContractTester();

test('persona query returns expected shape', async () => {
  const query = `
    query GetPersona($id: ID!) {
      persona(id: $id) {
        id
        name
        age
        attributes
        group {
          id
          name
        }
      }
    }
  `;
  
  await tester.testQuery(query, { id: 'test-123' }, {
    persona: {
      id: 'string',
      name: 'string',
      age: 'number',
      attributes: 'object',
      group: {
        id: 'string',
        name: 'string'
      }
    }
  });
});
```

### 5. API Evolution Testing

```javascript
// Track API changes over time
class APIEvolutionTracker {
  async checkBackwardCompatibility(endpoint) {
    const currentVersion = await fetch(`${endpoint}?version=current`);
    const previousVersion = await fetch(`${endpoint}?version=v1`);
    
    const current = await currentVersion.json();
    const previous = await previousVersion.json();
    
    // Ensure all previous fields still exist
    const removedFields = Object.keys(previous).filter(
      key => !(key in current)
    );
    
    if (removedFields.length > 0) {
      throw new Error(
        `Breaking change: removed fields: ${removedFields.join(', ')}`
      );
    }
    
    // Warn about deprecated fields
    const deprecatedFields = Object.keys(current).filter(
      key => current[key]?._deprecated === true
    );
    
    if (deprecatedFields.length > 0) {
      console.warn(
        `Deprecated fields detected: ${deprecatedFields.join(', ')}`
      );
    }
  }
}
```

## Advanced Runtime Testing Techniques

### 1. Chaos Engineering for Frontend

Runtime testing can simulate real-world failures:

```javascript
class ChaosRuntime {
  constructor() {
    this.chaosLevel = 0.1; // 10% chance of chaos
  }
  
  // Randomly slow down API calls
  async chaosifyFetch(url, options) {
    if (Math.random() < this.chaosLevel) {
      const delay = Math.random() * 5000; // Up to 5 second delay
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Randomly fail requests
    if (Math.random() < this.chaosLevel) {
      throw new Error('Network request failed');
    }
    
    return fetch(url, options);
  }
  
  // Randomly throttle CPU
  throttleCPU() {
    if (Math.random() < this.chaosLevel) {
      const start = Date.now();
      while (Date.now() - start < 100) {
        // Block for 100ms
      }
    }
  }
}

// Runtime test with chaos
test('app remains responsive under adverse conditions', async () => {
  const chaos = new ChaosRuntime();
  window.fetch = chaos.chaosifyFetch.bind(chaos);
  
  render(<App />);
  
  // Should still load within reasonable time
  await waitFor(() => {
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  }, { timeout: 10000 });
  
  // UI should remain interactive
  const button = screen.getByRole('button');
  await userEvent.click(button);
  
  // Should show loading states
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### 2. Mutation Testing for Runtime

Ensure your runtime tests actually catch bugs:

```javascript
class RuntimeMutationTester {
  async mutateAndTest(originalFunction, tests) {
    const mutations = [
      // Off-by-one errors
      code => code.replace(/(\w+)\s*<\s*(\w+)/g, '$1 <= $2'),
      code => code.replace(/(\w+)\s*>\s*(\w+)/g, '$1 >= $2'),
      
      // Boundary conditions
      code => code.replace(/\b0\b/g, '1'),
      code => code.replace(/\b1\b/g, '0'),
      
      // Null checks
      code => code.replace(/!= null/g, '== null'),
      code => code.replace(/!== null/g, '=== null'),
      
      // Array operations
      code => code.replace(/\.push\(/g, '.pop('),
      code => code.replace(/\.shift\(/g, '.unshift('),
    ];
    
    const originalCode = originalFunction.toString();
    let caughtMutations = 0;
    
    for (const mutation of mutations) {
      const mutatedCode = mutation(originalCode);
      if (mutatedCode === originalCode) continue;
      
      try {
        // Create mutated function
        const mutatedFunction = eval(`(${mutatedCode})`);
        
        // Run tests against mutated version
        let testsFailed = false;
        for (const test of tests) {
          try {
            await test(mutatedFunction);
          } catch (e) {
            testsFailed = true;
            caughtMutations++;
            break;
          }
        }
        
        if (!testsFailed) {
          console.warn('Mutation survived:', mutatedCode);
        }
      } catch (e) {
        // Syntax error in mutation, skip
      }
    }
    
    const mutationScore = caughtMutations / mutations.length;
    return { score: mutationScore, caught: caughtMutations, total: mutations.length };
  }
}
```

### 3. Property-Based Runtime Testing

Test with generated inputs to find edge cases:

```javascript
import fc from 'fast-check';

describe('Property-based runtime tests', () => {
  it('PersonaGroup maintains invariants', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            age: fc.integer({ min: 0, max: 150 }),
            occupation: fc.string({ minLength: 1 }),
            sex: fc.constantFrom('male', 'female', 'other')
          })
        ),
        (personaData) => {
          // Create group with random data
          const group = new PersonaGroup('Test');
          
          personaData.forEach(data => {
            group.add(new Persona(data.name, data));
          });
          
          // Invariants that must always hold
          expect(group.size).toBe(personaData.length);
          expect(group.personas.length).toBe(group.size);
          
          // Statistics should be valid
          if (group.size > 0) {
            const stats = group.getStatistics('age');
            expect(stats.mean).toBeGreaterThanOrEqual(stats.min);
            expect(stats.mean).toBeLessThanOrEqual(stats.max);
            expect(stats.count).toBe(group.size);
          }
          
          // Filtering should maintain consistency
          const filtered = group.filter(p => p.age > 30);
          expect(filtered.every(p => p.age > 30)).toBe(true);
          expect(filtered.length).toBeLessThanOrEqual(group.size);
        }
      )
    );
  });
});
```

### 4. Snapshot Testing with Runtime Validation

```javascript
class RuntimeSnapshotValidator {
  constructor() {
    this.snapshots = new Map();
  }
  
  async validateRuntimeBehavior(component, scenarios) {
    for (const scenario of scenarios) {
      const { name, setup, actions, expectations } = scenario;
      
      // Setup scenario
      if (setup) await setup();
      
      // Capture initial state
      const { container } = render(component);
      const initialSnapshot = container.innerHTML;
      
      // Perform actions
      for (const action of actions) {
        await action();
      }
      
      // Capture final state
      const finalSnapshot = container.innerHTML;
      
      // Store snapshots
      this.snapshots.set(`${name}-initial`, initialSnapshot);
      this.snapshots.set(`${name}-final`, finalSnapshot);
      
      // Validate expectations
      for (const expectation of expectations) {
        await expectation();
      }
      
      // Check for memory leaks
      const observers = (window as any).__observerCount || 0;
      expect(observers).toBe(0); // All observers should be cleaned up
      
      cleanup();
    }
  }
  
  compareSnapshots(name1, name2) {
    const snap1 = this.snapshots.get(name1);
    const snap2 = this.snapshots.get(name2);
    
    if (!snap1 || !snap2) {
      throw new Error('Snapshot not found');
    }
    
    // Smart diff that ignores irrelevant changes
    const diff = this.smartDiff(snap1, snap2);
    return diff;
  }
  
  smartDiff(html1, html2) {
    // Remove dynamic attributes
    const normalize = (html) => html
      .replace(/data-testid="[^"]*"/g, '')
      .replace(/id="[^"]*"/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return normalize(html1) === normalize(html2) ? null : {
      before: normalize(html1),
      after: normalize(html2)
    };
  }
}
```

### 5. Runtime Regression Testing

```javascript
class RuntimeRegressionTester {
  constructor() {
    this.baselineMetrics = new Map();
  }
  
  async captureBaseline(testName, testFn) {
    const metrics = {
      startTime: performance.now(),
      startMemory: performance.memory?.usedJSHeapSize,
      renderCount: 0
    };
    
    // Monkey patch React to count renders
    const originalCreateElement = React.createElement;
    React.createElement = (...args) => {
      metrics.renderCount++;
      return originalCreateElement.apply(React, args);
    };
    
    // Run test
    await testFn();
    
    // Restore React
    React.createElement = originalCreateElement;
    
    metrics.endTime = performance.now();
    metrics.endMemory = performance.memory?.usedJSHeapSize;
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.memoryDelta = metrics.endMemory - metrics.startMemory;
    
    this.baselineMetrics.set(testName, metrics);
    return metrics;
  }
  
  async compareWithBaseline(testName, testFn, thresholds = {}) {
    const current = await this.captureBaseline(`${testName}-current`, testFn);
    const baseline = this.baselineMetrics.get(testName);
    
    if (!baseline) {
      throw new Error(`No baseline found for ${testName}`);
    }
    
    const regressions = [];
    
    // Check duration regression
    const durationIncrease = (current.duration - baseline.duration) / baseline.duration;
    if (durationIncrease > (thresholds.duration || 0.1)) { // 10% threshold
      regressions.push(`Duration increased by ${(durationIncrease * 100).toFixed(1)}%`);
    }
    
    // Check memory regression
    const memoryIncrease = (current.memoryDelta - baseline.memoryDelta) / baseline.memoryDelta;
    if (memoryIncrease > (thresholds.memory || 0.2)) { // 20% threshold
      regressions.push(`Memory usage increased by ${(memoryIncrease * 100).toFixed(1)}%`);
    }
    
    // Check render count regression
    const renderIncrease = (current.renderCount - baseline.renderCount) / baseline.renderCount;
    if (renderIncrease > (thresholds.renders || 0.05)) { // 5% threshold
      regressions.push(`Render count increased by ${(renderIncrease * 100).toFixed(1)}%`);
    }
    
    return {
      passed: regressions.length === 0,
      regressions,
      baseline,
      current
    };
  }
}
```

### 6. Runtime Contract Generation

Automatically generate contracts from runtime behavior:

```javascript
class RuntimeContractGenerator {
  constructor() {
    this.observations = new Map();
  }
  
  observe(functionName, inputs, output) {
    if (!this.observations.has(functionName)) {
      this.observations.set(functionName, []);
    }
    
    this.observations.get(functionName).push({
      inputs,
      output,
      timestamp: Date.now()
    });
  }
  
  generateContract(functionName, options = {}) {
    const observations = this.observations.get(functionName);
    if (!observations || observations.length === 0) {
      throw new Error(`No observations for ${functionName}`);
    }
    
    // Infer input schema
    const inputSchema = this.inferSchema(
      observations.map(o => o.inputs),
      options.strict
    );
    
    // Infer output schema
    const outputSchema = this.inferSchema(
      observations.map(o => o.output),
      options.strict
    );
    
    // Generate contract
    const contract = {
      functionName,
      observations: observations.length,
      inputSchema,
      outputSchema,
      examples: observations.slice(0, 3), // Include first 3 examples
      generated: new Date().toISOString()
    };
    
    return contract;
  }
  
  inferSchema(values, strict = false) {
    if (values.length === 0) return { type: 'undefined' };
    
    const types = new Set(values.map(v => this.getType(v)));
    
    if (types.size === 1) {
      const type = Array.from(types)[0];
      
      if (type === 'object') {
        // Infer object shape
        const shape = {};
        const allKeys = new Set();
        
        values.forEach(obj => {
          Object.keys(obj).forEach(key => allKeys.add(key));
        });
        
        allKeys.forEach(key => {
          const keyValues = values
            .filter(obj => key in obj)
            .map(obj => obj[key]);
          
          shape[key] = {
            required: keyValues.length === values.length,
            schema: this.inferSchema(keyValues, strict)
          };
        });
        
        return { type: 'object', shape };
      }
      
      if (type === 'array') {
        const allItems = values.flat();
        return {
          type: 'array',
          items: this.inferSchema(allItems, strict)
        };
      }
      
      return { type };
    }
    
    // Multiple types
    if (strict) {
      return { type: 'union', types: Array.from(types) };
    }
    
    return { type: 'any' };
  }
  
  getType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }
}
```

## When Normal Tests Aren't Enough

You're right that normal tests often miss critical issues. Here's when you need runtime testing:

### 1. **State Management Complexity**
When your app has complex state interactions (Redux, MobX, Zustand), runtime tests catch race conditions and state inconsistencies.

### 2. **Third-Party Integrations**
When integrating with external services, runtime tests with recorded responses ensure your integration stays working.

### 3. **Performance Requirements**
When you have specific performance SLAs, runtime tests measure actual performance, not theoretical Big-O notation.

### 4. **User Flow Testing**
When testing complete user journeys, runtime tests validate the entire flow works, not just individual pieces.

### 5. **Cross-Browser/Platform Behavior**
When your app must work across different environments, runtime tests catch platform-specific issues.

## Docker-Based Runtime Testing

### Why Docker for Runtime Testing?

Docker provides consistent, reproducible runtime environments that catch issues your local machine might miss:

1. **Environment Parity**: Test in the same environment as production
2. **Dependency Isolation**: Catch missing or conflicting dependencies
3. **Resource Constraints**: Test with realistic memory/CPU limits
4. **Network Conditions**: Simulate real network latency and failures
5. **Multi-Service Testing**: Test microservices together

### Basic Docker Runtime Test Setup

```dockerfile
# runtime-test.dockerfile
FROM node:20-alpine AS base

# Install tools for runtime testing
RUN apk add --no-cache \
    chromium \
    firefox-esr \
    curl \
    jq \
    netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the application
RUN pnpm build

# Runtime test stage
FROM base AS runtime-test

# Install runtime test dependencies
RUN pnpm add -D \
    puppeteer \
    playwright \
    @testcontainers/testcontainers

# Set up Chrome for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy runtime tests
COPY runtime-tests ./runtime-tests

# Run runtime tests
CMD ["pnpm", "runtime:test"]
```

### Docker Compose for Multi-Service Testing

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  # Main application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://test:test@postgres:5432/testdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - test-network

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
      - POSTGRES_DB=testdb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - test-network

  # Cache
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - test-network

  # Runtime test runner
  test-runner:
    build:
      context: .
      dockerfile: runtime-test.dockerfile
      target: runtime-test
    environment:
      - APP_URL=http://app:3000
      - DATABASE_URL=postgresql://test:test@postgres:5432/testdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - app
      - postgres
      - redis
    volumes:
      - ./runtime-tests:/app/runtime-tests
      - ./test-results:/app/test-results
    networks:
      - test-network
    command: |
      sh -c "
        echo 'Waiting for app to be ready...'
        while ! nc -z app 3000; do sleep 1; done
        echo 'Running runtime tests...'
        pnpm runtime:test
      "

networks:
  test-network:
    driver: bridge
```

### Testcontainers for Dynamic Docker Testing

```javascript
import { GenericContainer, Network } from '@testcontainers/testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';

describe('Runtime tests with real services', () => {
  let network;
  let postgres;
  let redis;
  let app;

  beforeAll(async () => {
    // Create network
    network = await new Network().start();

    // Start PostgreSQL
    postgres = await new PostgreSqlContainer()
      .withNetwork(network)
      .withNetworkAliases('postgres')
      .start();

    // Start Redis
    redis = await new RedisContainer()
      .withNetwork(network)
      .withNetworkAliases('redis')
      .start();

    // Build and start app
    app = await new GenericContainer('.')
      .withNetwork(network)
      .withNetworkAliases('app')
      .withEnvironment({
        DATABASE_URL: `postgresql://test:test@postgres:5432/test`,
        REDIS_URL: `redis://redis:6379`,
        NODE_ENV: 'test'
      })
      .withExposedPorts(3000)
      .withWaitStrategy(Wait.forHealthCheck())
      .start();
  }, 120000); // 2 minute timeout

  afterAll(async () => {
    await app?.stop();
    await redis?.stop();
    await postgres?.stop();
    await network?.stop();
  });

  it('should handle database operations', async () => {
    const appUrl = `http://localhost:${app.getMappedPort(3000)}`;
    
    // Create persona
    const createResponse = await fetch(`${appUrl}/api/personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        age: 30,
        occupation: 'Developer'
      })
    });
    
    expect(createResponse.status).toBe(201);
    const persona = await createResponse.json();
    
    // Verify in database
    const dbUrl = postgres.getConnectionUri();
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    
    const result = await client.query(
      'SELECT * FROM personas WHERE id = $1',
      [persona.id]
    );
    
    expect(result.rows[0].name).toBe('Test User');
    await client.end();
  });

  it('should handle cache operations', async () => {
    const appUrl = `http://localhost:${app.getMappedPort(3000)}`;
    
    // First request - should hit database
    const start1 = Date.now();
    const response1 = await fetch(`${appUrl}/api/personas/stats`);
    const duration1 = Date.now() - start1;
    
    // Second request - should hit cache
    const start2 = Date.now();
    const response2 = await fetch(`${appUrl}/api/personas/stats`);
    const duration2 = Date.now() - start2;
    
    expect(duration2).toBeLessThan(duration1 / 2); // Cache should be faster
    
    // Verify in Redis
    const redisClient = createClient({
      url: redis.getConnectionUri()
    });
    await redisClient.connect();
    
    const cachedData = await redisClient.get('personas:stats');
    expect(cachedData).toBeTruthy();
    
    await redisClient.quit();
  });

  it('should handle concurrent requests', async () => {
    const appUrl = `http://localhost:${app.getMappedPort(3000)}`;
    
    // Send 100 concurrent requests
    const requests = Array.from({ length: 100 }, async (_, i) => {
      const response = await fetch(`${appUrl}/api/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `User ${i}`,
          age: 20 + (i % 50),
          occupation: 'Tester'
        })
      });
      return response.status;
    });
    
    const results = await Promise.all(requests);
    
    // All should succeed
    expect(results.every(status => status === 201)).toBe(true);
    
    // Verify count in database
    const dbUrl = postgres.getConnectionUri();
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    
    const result = await client.query('SELECT COUNT(*) FROM personas');
    expect(parseInt(result.rows[0].count)).toBe(100);
    
    await client.end();
  });
});
```

### Resource-Constrained Testing

```yaml
# docker-compose.constrained.yml
version: '3.8'

services:
  app-constrained:
    build: .
    deploy:
      resources:
        limits:
          cpus: '0.5'  # Half a CPU
          memory: 256M  # 256MB RAM
        reservations:
          cpus: '0.25'
          memory: 128M
    environment:
      - NODE_OPTIONS=--max-old-space-size=200
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  load-tester:
    image: grafana/k6
    volumes:
      - ./k6-scripts:/scripts
    command: run -u 50 -d 30s /scripts/load-test.js
    depends_on:
      app-constrained:
        condition: service_healthy
```

### Network Chaos Testing

```javascript
// network-chaos.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class NetworkChaos {
  constructor(containerName) {
    this.containerName = containerName;
  }

  async addLatency(ms) {
    await execAsync(
      `docker exec ${this.containerName} tc qdisc add dev eth0 root netem delay ${ms}ms`
    );
  }

  async addPacketLoss(percentage) {
    await execAsync(
      `docker exec ${this.containerName} tc qdisc add dev eth0 root netem loss ${percentage}%`
    );
  }

  async limitBandwidth(kbps) {
    await execAsync(
      `docker exec ${this.containerName} tc qdisc add dev eth0 root tbf rate ${kbps}kbit burst 32kbit latency 400ms`
    );
  }

  async reset() {
    await execAsync(
      `docker exec ${this.containerName} tc qdisc del dev eth0 root 2>/dev/null || true`
    );
  }
}

// Usage in tests
describe('Network resilience', () => {
  const chaos = new NetworkChaos('app-container');

  afterEach(async () => {
    await chaos.reset();
  });

  it('should handle high latency', async () => {
    await chaos.addLatency(500); // 500ms latency
    
    const response = await fetch('http://localhost:3000/api/personas', {
      timeout: 5000 // 5 second timeout
    });
    
    expect(response.status).toBe(200);
  });

  it('should handle packet loss', async () => {
    await chaos.addPacketLoss(10); // 10% packet loss
    
    let successCount = 0;
    for (let i = 0; i < 10; i++) {
      try {
        const response = await fetch('http://localhost:3000/api/personas');
        if (response.ok) successCount++;
      } catch (e) {
        // Expected some failures
      }
    }
    
    expect(successCount).toBeGreaterThan(5); // At least 50% should succeed
  });
});
```

## Full Application Runtime Testing

### End-to-End User Journey Testing

```javascript
import { chromium } from 'playwright';

describe('Complete user journey', () => {
  let browser;
  let context;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch({
      slowMo: 50, // Slow down for visibility
    });
  });

  afterAll(async () => {
    await browser?.close();
  });

  beforeEach(async () => {
    context = await browser.newContext({
      recordVideo: {
        dir: './test-videos/',
        size: { width: 1280, height: 720 }
      }
    });
    page = await context.newPage();
  });

  afterEach(async () => {
    await context?.close();
  });

  it('should complete full persona creation flow', async () => {
    // Navigate to app
    await page.goto('http://localhost:3000');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
    
    // Performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      };
    });
    
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // Under 1.5s
    
    // Create persona
    await page.click('[data-testid="create-persona-btn"]');
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="age"]', '30');
    await page.selectOption('[name="occupation"]', 'Developer');
    
    // Take screenshot before submit
    await page.screenshot({ path: './screenshots/before-submit.png' });
    
    // Submit and wait for response
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/personas') && resp.status() === 201),
      page.click('[type="submit"]')
    ]);
    
    // Verify success
    await page.waitForSelector('[data-testid="success-message"]');
    
    // Check accessibility
    const accessibilitySnapshot = await page.accessibility.snapshot();
    expect(accessibilitySnapshot.children).toBeDefined();
    
    // Check for memory leaks
    const jsHeapUsed = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Navigate away and back
    await page.goto('http://localhost:3000/about');
    await page.goBack();
    
    const jsHeapUsedAfter = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Memory shouldn't grow significantly
    expect(jsHeapUsedAfter).toBeLessThan(jsHeapUsed * 1.5);
  });

  it('should handle errors gracefully', async () => {
    // Intercept API calls to simulate errors
    await page.route('**/api/personas', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="create-persona-btn"]');
    await page.fill('[name="name"]', 'Test User');
    await page.click('[type="submit"]');
    
    // Should show error message
    await page.waitForSelector('[data-testid="error-message"]');
    const errorText = await page.textContent('[data-testid="error-message"]');
    expect(errorText).toContain('Something went wrong');
    
    // Should allow retry
    await page.waitForSelector('[data-testid="retry-button"]');
    
    // App should still be responsive
    await page.click('[data-testid="cancel-button"]');
    await page.waitForSelector('[data-testid="create-persona-btn"]');
  });
});
```

### Mobile App Runtime Testing

```javascript
import { remote } from 'webdriverio';

describe('Mobile app runtime tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await remote({
      capabilities: {
        platformName: 'iOS',
        'appium:deviceName': 'iPhone 14',
        'appium:platformVersion': '16.0',
        'appium:automationName': 'XCUITest',
        'appium:app': './build/PersonaApp.app',
      }
    });
  });

  afterAll(async () => {
    await driver?.deleteSession();
  });

  it('should handle offline mode', async () => {
    // Go offline
    await driver.setNetworkConnection(0);
    
    // Try to create persona
    const createButton = await driver.$('~create-persona');
    await createButton.click();
    
    const nameField = await driver.$('~name-input');
    await nameField.setValue('Offline User');
    
    const saveButton = await driver.$('~save-button');
    await saveButton.click();
    
    // Should show offline message
    const offlineMessage = await driver.$('~offline-message');
    const text = await offlineMessage.getText();
    expect(text).toContain('saved locally');
    
    // Go back online
    await driver.setNetworkConnection(6); // WiFi + Data
    
    // Should sync automatically
    await driver.pause(5000); // Wait for sync
    
    const syncStatus = await driver.$('~sync-status');
    const syncText = await syncStatus.getText();
    expect(syncText).toContain('Synced');
  });

  it('should handle background/foreground transitions', async () => {
    // Start a long operation
    const generateButton = await driver.$('~generate-multiple');
    await generateButton.click();
    
    // Go to background
    await driver.backgroundApp(3); // 3 seconds
    
    // Operation should continue or resume gracefully
    const statusText = await driver.$('~generation-status').getText();
    expect(statusText).toMatch(/Completed|Resumed/);
  });
});
```

### Performance Monitoring

```javascript
class RuntimePerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.thresholds = {
      ttfb: 200,        // Time to first byte
      fcp: 1500,        // First contentful paint
      lcp: 2500,        // Largest contentful paint
      fid: 100,         // First input delay
      cls: 0.1,         // Cumulative layout shift
      tti: 3500,        // Time to interactive
    };
  }

  async measurePageLoad(page) {
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let metrics = {};
        
        // Navigation timing
        const navigation = performance.getEntriesByType('navigation')[0];
        metrics.ttfb = navigation.responseStart - navigation.requestStart;
        
        // Paint timing
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime;
          }
        });
        
        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          metrics.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // TTI approximation
        setTimeout(() => {
          metrics.tti = performance.now();
          resolve(metrics);
        }, 100);
      });
    });
    
    this.metrics.push(metrics);
    return this.checkThresholds(metrics);
  }

  checkThresholds(metrics) {
    const violations = [];
    
    for (const [key, threshold] of Object.entries(this.thresholds)) {
      if (metrics[key] && metrics[key] > threshold) {
        violations.push({
          metric: key,
          value: metrics[key],
          threshold: threshold,
          excess: ((metrics[key] - threshold) / threshold * 100).toFixed(1)
        });
      }
    }
    
    return {
      passed: violations.length === 0,
      violations,
      metrics
    };
  }

  generateReport() {
    const avgMetrics = {};
    
    for (const key of Object.keys(this.thresholds)) {
      const values = this.metrics.map(m => m[key]).filter(v => v !== undefined);
      avgMetrics[key] = values.reduce((a, b) => a + b, 0) / values.length;
    }
    
    return {
      runs: this.metrics.length,
      averages: avgMetrics,
      thresholds: this.thresholds,
      recommendation: this.getRecommendation(avgMetrics)
    };
  }

  getRecommendation(avgMetrics) {
    const recommendations = [];
    
    if (avgMetrics.fcp > this.thresholds.fcp) {
      recommendations.push('Optimize initial bundle size and critical rendering path');
    }
    if (avgMetrics.lcp > this.thresholds.lcp) {
      recommendations.push('Optimize largest content element (images, fonts)');
    }
    if (avgMetrics.cls > this.thresholds.cls) {
      recommendations.push('Add size attributes to images and embeds');
    }
    
    return recommendations;
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Runtime Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # Daily

jobs:
  runtime-coverage:
    runs-on: ubuntu-latest
    continue-on-error: true # Don't fail the build
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: |
        npm install -g pnpm
        pnpm install
        
    - name: Analyze runtime coverage
      run: |
        node identify-runtime-coverage-gaps.js \
          --src packages/sdk/src \
          --tests apps/runtime-tests \
          --output markdown \
          --ci
          
    - name: Upload coverage report
      uses: actions/upload-artifact@v3
      with:
        name: runtime-coverage-report
        path: runtime-coverage-report.md
        
    - name: Comment on PR
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const report = fs.readFileSync('runtime-coverage-report.md', 'utf8');
          
          // Extract summary
          const coverageMatch = report.match(/Coverage: ([\d.]+)%/);
          const coverage = coverageMatch ? coverageMatch[1] : 'Unknown';
          
          const comment = `## Runtime Test Coverage Report
          
          **Coverage: ${coverage}%**
          
          <details>
          <summary>View detailed report</summary>
          
          ${report}
          
          </details>
          
          This is informational only and does not block merging.`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });

  docker-runtime-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and test in Docker
      run: |
        docker-compose -f docker-compose.test.yml up \
          --build \
          --abort-on-container-exit \
          --exit-code-from test-runner
          
    - name: Extract test results
      if: always()
      run: |
        docker cp $(docker-compose ps -q test-runner):/app/test-results ./test-results || true
        
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: docker-test-results
        path: test-results/

  performance-regression:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Restore performance baseline
      uses: actions/cache@v3
      with:
        path: performance-baseline.json
        key: performance-baseline-${{ github.base_ref }}
        
    - name: Run performance tests
      run: |
        docker-compose -f docker-compose.perf.yml up \
          --build \
          --abort-on-container-exit
          
    - name: Check for regressions
      run: |
        node check-performance-regression.js \
          --baseline performance-baseline.json \
          --current performance-results.json \
          --threshold 10
```

### Runtime Testing Best Practices for CI/CD

1. **Non-Blocking**: Runtime tests inform but don't block deployments
2. **Trends Over Time**: Track coverage trends, not just absolute values
3. **Selective Runs**: Run expensive tests on schedule, not every commit
4. **Parallel Execution**: Use matrix builds for different scenarios
5. **Result Visibility**: Make results easily accessible to developers

## Conclusion

Runtime testing is not a replacement for unit tests—it's a critical complement. While unit tests ensure your logic is correct, runtime tests ensure your software actually works. 

The Persona SDK's journey from 40.7% to 100% runtime test success demonstrates that even well-unit-tested code can have significant runtime issues. Every bug fixed represented a potential user frustration prevented.

**Remember**: Your users don't run your unit tests. They run your actual code. Make sure it works.

---

*"In theory, theory and practice are the same. In practice, they are not."*  
*— Yogi Berra*