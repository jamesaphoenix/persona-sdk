# Persona SDK Test App

Comprehensive runtime testing application for the Persona SDK with VCR cassette recording/replay for OpenAI API calls.

## Features

- **Complete Function Coverage Testing**: Test every public method in the SDK
- **VCR Cassettes**: Record OpenAI API responses for cost-free replay
- **Test Manifest Tracking**: Track which functions have been tested
- **Real-time Coverage Stats**: See your testing progress
- **Error Tracking**: Identify and fix runtime bugs

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

3. **Run the test app**:
   ```bash
   pnpm dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3001
   ```

## How It Works

### Cassette System

The app uses MSW (Mock Service Worker) to intercept OpenAI API calls:

- **Record Mode**: Makes real API calls and saves responses to cassettes
- **Replay Mode**: Uses saved cassettes instead of making API calls

### Test Tracking

Every test run updates the test manifest with:
- Function name
- Test status (pass/fail)
- Error messages (if any)
- Execution time

### Coverage Calculation

The app automatically calculates test coverage based on:
- Total functions in each class
- Number of tested functions
- Pass/fail rates

## Testing Workflow

1. **Start in Record Mode** (first time):
   - Enter your OpenAI API key
   - Switch to "Record" mode
   - Run AI feature tests
   - Cassettes are automatically saved

2. **Continue in Replay Mode**:
   - Switch to "Replay" mode
   - Run tests without API calls
   - Fix any failing tests
   - Track your progress

3. **Export Results**:
   - Download test manifest
   - Download cassettes
   - Share with team

## Test Categories

### Core Tests
- **PersonaBuilder**: All builder methods
- **Persona**: Constructor and properties
- **PersonaGroup**: Collection management

### Distribution Tests
- **NormalDistribution**: Gaussian distribution
- **UniformDistribution**: Equal probability
- **ExponentialDistribution**: Decay patterns
- **BetaDistribution**: Probability distributions
- **CategoricalDistribution**: Discrete choices

### AI Feature Tests
- **DistributionSelectorLangChain**: AI-powered distribution selection
- **StructuredOutputGenerator**: Type-safe AI generation
- **MediaToPersonaGenerator**: Convert media to personas
- **PersonaGroup.generateStructuredOutput**: Group analysis

## Cassette Management

Cassettes are stored in `/cassettes` directory:

```json
{
  "name": "default",
  "entries": [
    {
      "url": "https://api.openai.com/v1/chat/completions",
      "method": "POST",
      "requestBody": {...},
      "responseBody": {...},
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Test Manifest

The test manifest tracks all function tests:

```json
{
  "testedFunctions": {
    "PersonaBuilder": {
      "create": { "tested": true, "lastTest": "2024-01-15T10:30:00Z" },
      "withName": { "tested": true, "lastTest": "2024-01-15T10:31:00Z" },
      "withAge": { "tested": false, "lastTest": null }
    }
  },
  "coverage": {
    "total": 50,
    "tested": 35,
    "percentage": 70.0
  }
}
```

## Debugging Failed Tests

1. Check the error message in the test result
2. Look at the console for detailed logs
3. Verify cassette recordings are complete
4. Run in record mode if cassettes are missing

## Contributing

When adding new SDK features:

1. Add corresponding test components
2. Update the test manifest structure
3. Document any new cassette requirements
4. Ensure 100% function coverage before release