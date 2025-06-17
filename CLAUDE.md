# Open Person SDK Development Guidelines

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