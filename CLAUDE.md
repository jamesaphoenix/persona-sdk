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