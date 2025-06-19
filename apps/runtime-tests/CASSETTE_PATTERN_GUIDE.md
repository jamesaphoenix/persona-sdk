# 📼 The Cassette Pattern: Complete Guide

## What Are Cassettes?

Cassettes are a testing pattern borrowed from VCR (Video Cassette Recorder) - they **record** HTTP requests/responses once, then **replay** them in future test runs. Think of it like recording a TV show on VHS and watching it later.

## Why Use Cassettes?

### 1. **Cost Savings** 💰
```javascript
// First run: Makes real API call ($0.002)
const persona = await PersonaBuilder.fromPrompt("Create a gamer persona");

// All future runs: Uses recorded response ($0.00)
const persona = await PersonaBuilder.fromPrompt("Create a gamer persona");
```

### 2. **Speed** 🚀
- Real OpenAI call: 2-5 seconds
- Cassette replay: 1-5 milliseconds

### 3. **Deterministic Testing** 🎯
- Same input = Same output every time
- No flaky tests due to API variations
- Predictable CI/CD runs

### 4. **Offline Development** 🌐
- Work without internet
- Test without API keys
- Develop on planes!

## How Cassettes Work

### Recording Mode
```javascript
// CASSETTE_MODE=record

// 1. Intercept the request
Request: POST https://api.openai.com/v1/chat/completions
Body: { prompt: "Create a gamer persona" }

// 2. Make real API call
// 3. Save request + response to cassette file
cassettes/
  └── create-gamer-persona-a7f3b2.json
      {
        "request": { url, method, body },
        "response": { status, headers, data },
        "timestamp": "2024-01-15T10:30:00Z"
      }
```

### Replay Mode
```javascript
// CASSETTE_MODE=replay (default)

// 1. Intercept the request
// 2. Hash request to find matching cassette
// 3. Return recorded response instantly
// 4. No real API call made!
```

## Implementation Example

### Basic Cassette Manager
```javascript
class CassetteManager {
  constructor(cassetteDir = './cassettes') {
    this.cassetteDir = cassetteDir;
    this.mode = process.env.CASSETTE_MODE || 'replay';
  }

  async intercept(requestConfig) {
    const cassetteId = this.generateId(requestConfig);
    const cassettePath = `${this.cassetteDir}/${cassetteId}.json`;

    if (this.mode === 'replay') {
      // Try to load existing cassette
      if (fs.existsSync(cassettePath)) {
        const cassette = JSON.parse(fs.readFileSync(cassettePath));
        return cassette.response;
      }
      throw new Error(`No cassette found for ${cassetteId}`);
    }

    // Recording mode - make real request
    const response = await makeRealApiCall(requestConfig);
    
    // Save cassette
    const cassette = {
      request: requestConfig,
      response: response,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(cassettePath, JSON.stringify(cassette, null, 2));
    
    return response;
  }

  generateId(config) {
    // Create unique ID from request details
    const content = `${config.method}-${config.url}-${JSON.stringify(config.body)}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }
}
```

## Advanced Features

### 1. **Function Diff Tracking**
```javascript
// Track function signatures
const functionSignatures = {
  "PersonaBuilder.fromPrompt": {
    hash: "a7f3b2c9",
    params: ["prompt", "options"],
    lastModified: "2024-01-15"
  }
};

// If signature changes, invalidate cassettes
if (currentHash !== savedHash) {
  console.log("Function changed! Regenerating cassettes...");
  deleteCassettesForFunction("PersonaBuilder.fromPrompt");
}
```

### 2. **Selective Recording**
```javascript
// Only record specific functions
const recordingRules = {
  "PersonaBuilder.fromPrompt": true,
  "PersonaBuilder.generateMultiple": true,
  "PersonaBuilder.create": false  // Don't record, not expensive
};
```

### 3. **Cassette Expiration**
```javascript
// Auto-expire old cassettes
const cassette = loadCassette(id);
const age = Date.now() - new Date(cassette.timestamp);
const MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

if (age > MAX_AGE) {
  console.log("Cassette expired, re-recording...");
  return record(request);
}
```

## Best Practices

### 1. **Cassette Naming**
```javascript
// Good: Descriptive and unique
"gamer-persona-age25-location-ny-8a7f3b.json"

// Bad: Too generic
"test1.json"
```

### 2. **Sensitive Data**
```javascript
// Sanitize before saving
cassette.request.headers['Authorization'] = 'Bearer [REDACTED]';
cassette.response.data.apiKey = '[REDACTED]';
```

### 3. **Version Control**
```yaml
# .gitignore
cassettes/*.json       # Option 1: Ignore all
cassettes/*-local.json # Option 2: Ignore local only

# Commit shared cassettes for team consistency
```

### 4. **Cassette Organization**
```
cassettes/
├── ai-features/
│   ├── from-prompt/
│   └── generate-multiple/
├── distributions/
└── correlations/
```

## Testing Workflow

### Initial Setup
```bash
# 1. Set API key
export OPENAI_API_KEY=sk-...

# 2. Record cassettes
npm run test:record

# 3. Cassettes created!
✓ Created 47 cassettes in 2.3 minutes
```

### Daily Development
```bash
# Just run tests - uses cassettes
npm test

# Super fast!
✓ 47 tests passed in 0.8 seconds
```

### Function Changes
```bash
# Detect changes
> Function PersonaBuilder.fromPrompt has changed
> Deleting 5 related cassettes...
> Re-running affected tests in record mode...
✓ Updated cassettes generated
```

## Common Patterns

### 1. **Request Matching**
```javascript
// Flexible matching
function matchRequest(recorded, current) {
  return recorded.url === current.url &&
         recorded.method === current.method &&
         deepEqual(recorded.body.messages, current.body.messages);
  // Ignore timestamps, request IDs, etc.
}
```

### 2. **Fallback Strategies**
```javascript
async function withCassette(fn, config) {
  try {
    return await cassetteManager.intercept(config);
  } catch (e) {
    if (process.env.ALLOW_FALLBACK) {
      console.warn("No cassette found, making real request");
      return await fn();
    }
    throw e;
  }
}
```

### 3. **Parallel Recording**
```javascript
// Record multiple cassettes efficiently
const tasks = [
  { prompt: "gamer persona" },
  { prompt: "developer persona" },
  { prompt: "artist persona" }
];

await Promise.all(
  tasks.map(task => recordCassette(task))
);
```

## Troubleshooting

### "No cassette found"
```bash
# Solution 1: Record the cassette
CASSETTE_MODE=record npm test -- --grep "specific test"

# Solution 2: Check cassette naming
ls cassettes/ | grep "your-test"
```

### "Cassette mismatch"
```javascript
// Debug request differences
console.log("Expected:", cassette.request);
console.log("Actual:", currentRequest);
```

### Performance Tips
```javascript
// 1. Batch similar requests
const personas = await PersonaBuilder.generateMultiple(prompts);

// 2. Use cassette pools
const cassettePool = new CassettePool({ maxSize: 1000 });

// 3. Compress large cassettes
const compressed = zlib.gzipSync(JSON.stringify(cassette));
```

## Summary

Cassettes give you:
- ✅ Fast tests (milliseconds vs seconds)
- ✅ Free tests (no API costs after recording)
- ✅ Reliable tests (same results every time)
- ✅ Offline development
- ✅ Team consistency (share cassettes)

The pattern is simple:
1. **Record once** when you have API access
2. **Replay forever** in tests
3. **Re-record** only when functions change

This is the way to test expensive API integrations! 📼✨