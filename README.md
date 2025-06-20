# Persona SDK

A lightweight TypeScript SDK for generating personas with AI-powered features and statistical distributions.

## Features

- **Persona Creation**: Build realistic personas with customizable attributes
- **AI-Powered Generation**: Create personas from natural language prompts
- **Structured Output**: Generate structured data with Zod schema validation
- **Statistical Distributions**: Use various distributions for realistic data
- **Runtime Testing**: Comprehensive test system with VCR-style cassettes

## Installation

```bash
npm install @jamesaphoenix/persona-sdk
```

## Quick Start

```typescript
import { PersonaBuilder, PersonaAI, StructuredOutputGenerator } from '@jamesaphoenix/persona-sdk';

// Create a persona manually
const persona = PersonaBuilder.create()
  .setName('Alice Johnson')
  .setAge(28)
  .setOccupation('Software Engineer')
  .setSex('female')
  .build();

// Generate from AI prompt
const aiPersona = await PersonaBuilder.fromPrompt(
  'Create a 35-year-old data scientist in Austin',
  { apiKey: process.env.OPENAI_API_KEY }
);

// Generate structured insights
const insights = await StructuredOutputGenerator.generate({
  prompt: 'Analyze user personas for product-market fit',
  schema: MarketInsightSchema,
  apiKey: process.env.OPENAI_API_KEY
});
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