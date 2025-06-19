# Persona SDK Development Guidelines

## Project Overview

This is a TypeScript SDK for generating personas from statistical distributions. The SDK provides:
- Persona generation using various statistical distributions
- PersonaGroup management for handling collections of personas
- Tool use integration for intelligent distribution selection
- Clean, modular API following TanStack-style patterns

## Development Principles

### Code Style
- Use TypeScript with strict type checking
- Write comprehensive JSDoc comments for all public APIs
- Follow functional programming patterns where appropriate
- Keep the API minimal and intuitive
- One export per file

### Testing Strategy
- Use TDD approach with Vitest
- NEVER use Jest - Vitest ALL THE WAY
- NEVER disable tests - always fix the underlying issue instead of disabling tests
- NEVER disable TypeScript type-checking - always fix the actual type errors
- This is a production-grade project - maintain strict quality standards
- Write tests first, then implementation
- Focus on behavior testing
- Test edge cases and error states
- Aim for high coverage

### Architecture
- Keep personas in memory (no persistence)
- Use clean interfaces and types
- Modular design with clear separation of concerns
- Support for multiple AI providers (OpenAI, LangChain)

## Package Structure

```
packages/persona-sdk/
├── src/
│   ├── index.ts           # Main exports
│   ├── persona.ts         # Persona class
│   ├── persona-group.ts   # PersonaGroup class
│   ├── distributions/     # Statistical distributions
│   ├── tools/            # Tool use utilities
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── tests/
│   ├── persona.test.ts
│   ├── persona-group.test.ts
│   └── distributions/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Key Features to Implement

1. **Persona Class**
   - Generate from distributions
   - Support for various attributes
   - Clean builder pattern

2. **PersonaGroup Class**
   - Add/remove personas
   - Generate structured output
   - Distribution-based operations

3. **Distribution Support**
   - Normal, Uniform, Exponential, etc.
   - Custom distribution interface
   - Statistical utilities

4. **Tool Use Integration**
   - AI-powered distribution selection
   - Structured output generation
   - OpenAI function calling

## Development Commands

- `pnpm dev` - Start development
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm build` - Build the package
- `pnpm type-check` - Check TypeScript types
- `pnpm runtime:test` - Run runtime tests with cassettes
- `pnpm runtime:test:record` - Record new cassettes
- `pnpm web:test` - Run web app tests

## CI/CD Best Practices

### Monitoring GitHub Actions

When pushing changes, always monitor the CI/CD pipeline:

1. **Push changes**: `git push`
2. **Wait briefly**: `sleep 10`
3. **Check runs**: `gh run list --limit 3 --repo jamesaphoenix/persona-sdk`
4. **Monitor status**: `gh run view <run-id> --repo jamesaphoenix/persona-sdk`
5. **Check failures**: `gh run view <run-id> --log-failed --repo jamesaphoenix/persona-sdk`

Example workflow:
```bash
# After pushing
sleep 10 && gh run list --limit 3 --repo jamesaphoenix/persona-sdk

# Wait for tests to complete (usually 2-3 minutes)
sleep 120 && gh run view <run-id> --repo jamesaphoenix/persona-sdk

# If failures, check logs
gh run view <run-id> --log-failed --repo jamesaphoenix/persona-sdk | head -50
```

Always ensure all tests pass on all platforms (Ubuntu, macOS, Windows) before considering a task complete.

### Monitoring Vercel Deployments

When working on documentation changes, monitor Vercel deployments:

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Link to project**: `vercel link` (if not already linked)
3. **Monitor deployments**: 
   ```bash
   # List recent deployments
   vercel ls --limit 5
   
   # Check deployment status
   vercel inspect <deployment-url>
   
   # Poll for deployment completion
   while vercel ls --limit 1 | grep -q "Building"; do
     echo "Deployment in progress..."
     sleep 10
   done
   echo "Deployment complete!"
   ```
4. **Verify changes**: Always check the live site after deployment

## Documentation Best Practices

### Writing Style
- **Never put two paragraphs in a row** - This makes docs insanely readable and consumable
- Use code examples liberally
- Break up content with headers, lists, and code blocks
- Keep explanations concise and actionable
- Follow the Zod documentation style - highly scannable with short sections

### Fumadocs MDX Rules
- **NEVER add H1 headings (`# Title`) in MDX content** - Fumadocs automatically renders the frontmatter `title` as H1
- Only use H2 (`##`) and below in MDX content to avoid duplicate headings
- Example:
  ```mdx
  ---
  title: My Page Title  # This becomes the H1
  ---
  
  Content starts here, no `# My Page Title` needed.
  
  ## First Section  # This is correct
  ```

## Testing Patterns

### VCR Cassette Pattern

We use the VCR cassette pattern for testing expensive API calls. This pattern:
- **Records** API responses once (costs money)
- **Replays** them forever (free and fast)
- **Detects** when functions change and need re-recording

#### How Cassettes Work

```javascript
// First run (CASSETTE_MODE=record)
const persona = await PersonaBuilder.fromPrompt("Create gamer");
// → Makes real API call, saves to cassettes/fromPrompt-8a7f3b.json

// All future runs (CASSETTE_MODE=replay)
const persona = await PersonaBuilder.fromPrompt("Create gamer");
// → Loads from cassette, no API call!
```

#### Cassette Manager Implementation

The cassette manager intercepts function calls:

```javascript
async intercept(functionName, args, executor) {
  const cassettePath = this.getCassettePath(functionName, args);
  
  if (this.mode === 'replay') {
    const cassette = await this.loadCassette(cassettePath);
    if (cassette) return cassette.response; // No API call!
    throw new Error("No cassette found");
  }
  
  // Record mode: make real call and save
  const response = await executor(...args);
  await this.saveCassette(cassettePath, { request: args, response });
  return response;
}
```

#### Function Diff Tracking

Automatically detects when functions change:

```javascript
// Tracks function signatures
const hash = md5(functionImplementation.toString());
if (hash !== savedHash) {
  console.log("Function changed! Re-record cassettes");
}
```

### Runtime Testing

We have comprehensive runtime tests that:
- Test every SDK function in Node.js
- Use cassettes for expensive operations
- Track test coverage and performance
- Support both regular Node.js and Bun runtime

#### Test Structure

```
apps/runtime-tests/
├── cassettes/         # Recorded API responses
├── signatures/        # Function signatures for diff tracking
├── src/
│   ├── cassette-manager.js
│   ├── function-tracker.js
│   └── test-runner.js
└── tests/
    ├── persona-builder.test.js
    ├── persona-group.test.js
    └── distributions.test.js
```

#### Running Tests

```bash
# First time - record cassettes
CASSETTE_MODE=record pnpm runtime:test

# Subsequent runs - use cassettes
pnpm runtime:test

# With Bun (faster)
bun test
```

### Web App Testing

We also have a comprehensive web app for testing:
- Vitest for unit and integration tests
- Component testing with React Testing Library
- E2E tests with mocked API responses
- No expensive operations in tests

#### Test Types

1. **Unit Tests** - Fast, isolated component tests
2. **Integration Tests** - Component interaction tests
3. **E2E Tests** - Full flow tests with mocked APIs

#### Mocking Strategy

All expensive operations are mocked:

```javascript
vi.mock('@jamesaphoenix/persona-sdk', async () => {
  const actual = await vi.importActual('@jamesaphoenix/persona-sdk');
  return {
    ...actual,
    PersonaBuilder: {
      ...actual.PersonaBuilder,
      fromPrompt: vi.fn().mockResolvedValue({
        name: 'Mocked Persona',
        age: 25
      })
    }
  };
});
```

### Bun Runtime Testing

For maximum performance, we support Bun:

```typescript
// Uses Bun's native file APIs
const file = Bun.file(cassettePath);
const cassette = await file.json();

// Bun's built-in test runner
import { test, expect } from 'bun:test';

test('persona creation', () => {
  const persona = PersonaBuilder.create().build();
  expect(persona.id).toBeDefined();
});
```

### Best Practices

1. **Always use cassettes** for expensive API calls
2. **Mock in unit tests** to keep them fast
3. **Record cassettes sparingly** - only when needed
4. **Commit cassettes** to version control
5. **Monitor function changes** with diff tracking
6. **Use Bun for speed** when available

## Runtime Testing System

### Overview

The runtime testing system (`apps/runtime-tests`) is a custom test harness that validates the SDK's actual runtime behavior. Unlike unit tests which test isolated components, runtime tests execute real SDK functions to catch:

- API mismatches between tests and implementation
- Edge cases in real usage
- Integration issues between components
- Performance characteristics
- Memory leaks and resource management

### Architecture

```
apps/runtime-tests/
├── src/
│   ├── cassette-manager.js      # Records/replays API calls
│   ├── test-runner.js           # Executes tests with timing & reporting
│   ├── coverage-analyzer.js     # Discovers & tracks function coverage
│   ├── sequential-tester.js    # Runs all SDK functions sequentially
│   ├── full-coverage-test.js   # Combines coverage + testing
│   └── loader.js               # ESM loader for .js extension resolution
├── tests/
│   ├── persona-builder.test.js
│   ├── persona-group.test.js
│   └── distributions.test.js
├── cassettes/                   # Recorded API responses
└── coverage-report.html        # Visual coverage report
```

### Key Components

#### 1. Test Runner
Executes tests with proper error handling, timing, and parallel execution:

```javascript
async runTests(tests) {
  const results = await pLimit(5)(
    tests.map(test => () => this.runTest(test))
  );
  
  return {
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    duration: totalDuration,
    results
  };
}
```

#### 2. Coverage Analyzer
Discovers all SDK functions and categorizes them:

```javascript
// Discovers functions via reflection
const classes = [
  { name: 'Persona', class: PersonaSDK.Persona },
  { name: 'PersonaGroup', class: PersonaSDK.PersonaGroup },
  // ... etc
];

// Categorizes as testable vs external dependencies
this.externalDependencies = new Set([
  'PostgresAdapter',      // Needs database
  'PersonaApiClient',     // Needs server
  'DistributionSelector', // Needs API key
  // ... etc
]);
```

#### 3. Sequential Tester
Tests each SDK function systematically:

```javascript
// Tests are organized by component
async testPersona() {
  const tests = [];
  
  // Test constructor
  tests.push(this.createSafeTest('Persona.constructor', async () => {
    const persona = new PersonaSDK.Persona('Test', {
      age: 30,
      occupation: 'Developer',
      sex: 'other'
    });
    
    if (!persona.id) throw new Error('Should have ID');
    return persona;
  }));
  
  // Test methods, getters, edge cases...
  return this.testRunner.runTests(tests);
}
```

#### 4. ESM Loader
Handles missing .js extensions in TypeScript compiled output:

```javascript
export async function resolve(specifier, context, nextResolve) {
  // Add .js extension if missing
  if (!specifier.endsWith('.js') && specifier.startsWith('.')) {
    return nextResolve(specifier + '.js', context);
  }
  return nextResolve(specifier, context);
}
```

### Runtime Bug Discovery Process

1. **Initial Runtime Tests** revealed API mismatches:
   - `persona.age` was undefined (missing getters)
   - `group.getAll()` didn't exist (was `group.personas`)
   - `group.size()` wasn't a function (was a getter)

2. **Edge Case Testing** found validation issues:
   - UniformDistribution rejected min == max
   - Negative ages weren't properly validated
   - Clone method didn't accept new name parameter

3. **Iterative Fixes** improved success rate:
   - 40.7% → 63% → 88.9% → 96.3% → 98.6% → 100%

### Running Runtime Tests

```bash
# Run all runtime tests
cd apps/runtime-tests
node --loader ./loader.js src/sequential-tester.js

# Run with coverage analysis
node --loader ./loader.js src/full-coverage-test.js

# Run specific test file
node --loader ./loader.js tests/persona-builder.test.js
```

### Benefits

1. **Catches Real Bugs**: Found issues unit tests missed
2. **Fast Feedback**: Tests run in milliseconds
3. **No External Dependencies**: Uses cassettes for API calls
4. **Comprehensive Coverage**: Tests all public APIs
5. **Easy Debugging**: Clear error messages with stack traces

### Writing Runtime Tests

```javascript
export const personaBuilderTests = [
  {
    name: 'PersonaBuilder.fromPrompt with cassette',
    category: 'AI Features',
    cassette: true,  // Enable cassette recording
    fn: async () => {
      const persona = await PersonaBuilder.fromPrompt(
        'Create a 25-year-old software developer',
        { apiKey: process.env.OPENAI_API_KEY }
      );
      
      if (!persona.age || persona.age < 20 || persona.age > 30) {
        throw new Error('Age should be around 25');
      }
      
      return { success: true, persona };
    }
  }
];
```

### Integration with CI/CD

Runtime tests are part of the CI pipeline:

```yaml
- name: Run Runtime Tests
  run: |
    cd apps/runtime-tests
    pnpm install
    pnpm test
```

This ensures all changes maintain 100% runtime test success before merging.