# Persona SDK Web App

A comprehensive testing environment for the Persona SDK with Vitest, component tests, integration tests, and e2e tests with VCR cassettes.

## Features

- 🧪 **Vitest Testing Suite** - Unit, integration, and e2e tests
- 📼 **VCR Cassettes** - Record and replay OpenAI API calls
- 🎯 **Component Testing** - Test individual SDK components
- 🔄 **Integration Testing** - Test feature integration
- 🤖 **AI Feature Testing** - Test AI-powered persona generation
- 📊 **Coverage Reports** - Track test coverage

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm web:dev

# Run tests
pnpm web:test

# Run e2e tests
pnpm web:test:e2e

# Generate coverage report
pnpm web:test:coverage
```

## Testing Strategy

### Unit Tests
- Located in `tests/unit/`
- Test individual components in isolation
- Use React Testing Library

### Integration Tests
- Located in `tests/integration/`
- Test feature interactions
- Test PersonaGroup operations

### E2E Tests
- Located in `tests/e2e/`
- Test AI features with cassettes
- Record/replay OpenAI API calls

## VCR Cassettes

The app uses VCR cassettes to record and replay API calls:

1. **Recording Mode**: Set `CASSETTE_MODE=record` and provide `OPENAI_API_KEY`
2. **Replay Mode**: Default mode, uses recorded cassettes
3. **Storage**: Cassettes are stored in `cassettes/` directory

### Recording New Cassettes

```bash
# Set environment variables
export CASSETTE_MODE=record
export OPENAI_API_KEY=sk-...

# Run e2e tests to record
pnpm web:test:e2e
```

### Using Recorded Cassettes

```bash
# Just run tests (uses recorded cassettes)
pnpm web:test:e2e
```

## Project Structure

```
apps/web/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── ui/          # UI components (shadcn/ui)
│   │   └── ...          # Feature components
│   └── lib/             # Utilities and cassette manager
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── cassettes/           # Recorded API responses
└── public/              # Static assets
```

## Available Pages

- `/` - Home page with navigation
- `/builder` - Test PersonaBuilder
- `/group` - Test PersonaGroup management
- `/ai` - Test AI-powered features
- `/distributions` - Test statistical distributions

## Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run specific test file
pnpm test persona-builder.test.tsx

# Run e2e tests only
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
```

## Environment Variables

- `CASSETTE_MODE` - Set to "record" to record new cassettes
- `OPENAI_API_KEY` - Required for recording mode
- `NEXT_PUBLIC_*` - Public environment variables

## Contributing

1. Write tests first (TDD approach)
2. Test AI features with cassettes
3. Ensure all tests pass before committing
4. Keep cassettes in source control