# Persona SDK Minimal

A minimal TypeScript SDK for generating personas with AI-powered features. Perfect for internal use and rapid prototyping.

## Features

- **Persona Creation**: Build realistic personas with customizable attributes
- **AI-Powered Generation**: Create personas from natural language prompts
- **Structured Output**: Generate insights and analysis using LangChain
- **Prompt Optimization**: Enhance prompts for better persona generation
- **Statistical Distributions**: Use various distributions for realistic data
- **100% Test Coverage**: Comprehensive runtime tests with cassette recording

## Installation

```bash
pnpm install
pnpm build
```

## Quick Start

```typescript
import { PersonaBuilder, PersonaAI, StructuredOutputGenerator } from '@internal/persona-sdk-minimal';

// Create a persona manually
const persona = PersonaBuilder.create()
  .withName('Alice Johnson')
  .withAge(28)
  .withOccupation('Software Engineer')
  .withSex('female')
  .build();

// Generate from AI prompt
const aiPersona = await PersonaAI.fromPrompt(
  'Create a 35-year-old data scientist in Austin',
  { apiKey: process.env.OPENAI_API_KEY }
);

// Generate structured insights
const generator = new StructuredOutputGenerator(apiKey);
const insights = await generator.generate(
  personaGroup,
  MarketInsightSchema,
  'Analyze for product-market fit'
);
```

## Core Components

### Persona & PersonaBuilder
- Create personas with required and custom attributes
- Fluent builder API for easy construction
- Built-in validation

### PersonaAI
- `fromPrompt()`: Generate single persona from text
- `generateMultiple()`: Create diverse persona groups
- `optimizePrompt()`: Enhance prompts automatically
- `suggestAttributes()`: Get AI-powered attribute recommendations

### StructuredOutputGenerator
- Generate type-safe outputs using Zod schemas
- Analyze persona groups for insights
- Create market segments and recommendations

### Distributions
- Normal, Uniform, Exponential, Beta, Categorical
- Use for realistic attribute generation

## Testing

```bash
# Run unit tests
pnpm test

# Run runtime tests with cassettes
pnpm runtime:test

# Record new cassettes (requires API key)
pnpm runtime:test:record
```

## Environment Variables

```env
OPENAI_API_KEY=your-api-key-here
```

## License

Private - Internal Use Only