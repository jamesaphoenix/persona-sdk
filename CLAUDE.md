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