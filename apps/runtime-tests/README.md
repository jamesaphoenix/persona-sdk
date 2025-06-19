# Runtime Tests with Cassettes

Complete runtime testing suite for the Persona SDK with VCR-style cassette recording and function diff tracking.

## Features

- 🎬 **VCR Cassettes** - Record API responses once, replay forever
- 🔄 **Function Diff Tracking** - Auto-detect when functions change
- 📊 **Comprehensive Testing** - Test every SDK function at runtime
- 💰 **Cost Efficient** - Pay for API calls only once
- 🚀 **Fast Execution** - Millisecond playback vs seconds for API calls
- 📈 **Progress Tracking** - Real-time test execution monitoring

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Add your OpenAI API key to .env
# OPENAI_API_KEY=sk-...

# Record cassettes (first time only)
pnpm test:record

# Run tests with cassettes
pnpm test
```

## How It Works

### 1. Recording Mode
When you run tests in record mode, the system:
- Makes real API calls to OpenAI
- Records the responses in JSON files (cassettes)
- Tracks function signatures for change detection
- Costs money (one time only)

### 2. Replay Mode (Default)
Subsequent test runs:
- Use recorded cassettes instead of API calls
- Run in milliseconds
- Cost $0.00
- Produce identical results

### 3. Function Change Detection
The system tracks function signatures and:
- Detects when functions change
- Prompts to re-record affected cassettes
- Shows diffs of what changed
- Maintains cassette validity

## Test Coverage

### PersonaBuilder Tests
- ✅ Basic persona creation
- ✅ AI-powered persona generation (`fromPrompt`)
- ✅ Multiple persona generation
- ✅ Prompt optimization
- ✅ Attribute suggestions
- ✅ Custom attributes
- ✅ Method chaining
- ✅ Validation

### PersonaGroup Tests
- ✅ Add/remove personas
- ✅ Find by ID
- ✅ Filtering
- ✅ Statistics generation
- ✅ Clear all
- ✅ Create from array
- ✅ Map operations
- ✅ Chained operations

### Distribution Tests
- ✅ Normal distribution
- ✅ Uniform distribution
- ✅ Exponential distribution
- ✅ Binomial distribution
- ✅ Poisson distribution
- ✅ Distribution with PersonaBuilder
- ✅ Multiple distributions
- ✅ Edge cases

## Commands

```bash
# Run tests (replay mode)
npm test

# Record new cassettes
npm run test:record

# Run tests with cassettes
npm run test:replay

# Watch mode for development
npm run test:watch

# Generate function signatures
npm run generate-signatures

# Clean all cassettes (careful!)
npm run clean-cassettes
```

## Environment Variables

```bash
# Required for recording
OPENAI_API_KEY=sk-...

# Cassette mode (record/replay)
CASSETTE_MODE=replay

# Show detailed output
VERBOSE=true

# Show cassette statistics
SHOW_STATS=true

# Clean expired cassettes
CLEAN_EXPIRED=true

# Fallback to API if no cassette
ALLOW_FALLBACK=false
```

## Directory Structure

```
runtime-tests/
├── cassettes/              # Recorded API responses
│   ├── persona-builder/    # PersonaBuilder cassettes
│   ├── ai-features/        # AI feature cassettes
│   └── distributions/      # Distribution cassettes
├── signatures/             # Function signatures for diff tracking
│   ├── persona-builder.json
│   ├── persona-group.json
│   └── distributions.json
├── results/                # Test run results
│   └── test-run-*.json
└── src/
    ├── index.js            # Main test runner
    ├── cassette-manager.js # Cassette recording/replay
    ├── function-tracker.js # Function change detection
    ├── test-runner.js      # Test execution engine
    └── tests/              # Test suites
```

## Cassette Management

### Recording Best Practices
1. **Clean environment** - Ensure consistent test data
2. **Stable prompts** - Use deterministic prompts
3. **Version control** - Commit cassettes to git
4. **Team sharing** - Share cassettes with team

### When to Re-record
- Function implementation changes
- API behavior changes
- New test cases added
- Cassettes expire (30 days)

### Cassette Format
```json
{
  "request": {
    "function": "PersonaBuilder.fromPrompt",
    "args": ["Create a gamer persona"],
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "response": {
    "id": "persona-123",
    "name": "Alex Chen",
    "age": 25,
    "attributes": {
      "interests": ["gaming", "streaming"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0"
}
```

## Function Diff Tracking

The system automatically tracks function signatures:

```javascript
// Original function
async fromPrompt(prompt: string): Promise<Persona>

// Modified function
async fromPrompt(prompt: string, options?: Options): Promise<Persona>
// ↑ System detects this change and prompts for re-recording
```

### Signature Format
```json
{
  "PersonaBuilder.fromPrompt": {
    "hash": "a7f3b2c9d8e1f4g5",
    "params": ["prompt", "options"],
    "lastModified": "2024-01-15T10:30:00Z"
  }
}
```

## Cost Analysis

Without cassettes:
- 20 AI tests × 10 runs/day × $0.002 = $0.40/day
- Monthly cost: ~$12

With cassettes:
- Initial recording: ~$0.10
- Daily runs: $0.00
- Monthly cost: $0.10 (one time)

## Troubleshooting

### "No cassette found"
```bash
# Solution 1: Record the cassette
CASSETTE_MODE=record npm test

# Solution 2: Allow fallback
ALLOW_FALLBACK=true npm test
```

### "Function has changed"
```bash
# Re-record affected cassettes
CASSETTE_MODE=record npm test
```

### "API key not found"
```bash
# Add to .env file
echo "OPENAI_API_KEY=sk-..." >> .env
```

## Contributing

1. Add new tests to `src/tests/`
2. Run in record mode to create cassettes
3. Verify cassettes work in replay mode
4. Commit both tests and cassettes

## Tips

- 🎯 **Deterministic tests** - Use fixed seeds and data
- 📦 **Batch recording** - Record all cassettes at once
- 🔒 **Sanitize secrets** - Remove API keys from cassettes
- 📅 **Regular updates** - Re-record monthly for freshness
- 🤝 **Team sync** - Share cassettes via git