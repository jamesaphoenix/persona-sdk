# @open-person/persona-sdk Summary

## Overview

A TypeScript SDK for generating personas from statistical distributions with AI-powered insights. Clean, modular, and type-safe.

## Key Features

### 1. Persona Creation with Required Fields
Every persona must have:
- `name`: string
- `age`: number (validated with Zod)
- `occupation`: string 
- `sex`: 'male' | 'female' | 'other'

Plus any custom attributes you need.

### 2. Statistical Distributions
- **NormalDistribution**: For bell-curve data (age, income)
- **UniformDistribution**: For evenly distributed values
- **ExponentialDistribution**: For time/decay patterns
- **BetaDistribution**: For probabilities (0-1 scale)
- **CategoricalDistribution**: For discrete choices

### 3. Builder Pattern
```typescript
const persona = PersonaBuilder.create()
  .withName('Alice')
  .withAge(new NormalDistribution(30, 5))
  .withOccupation('Engineer')
  .withSex('female')
  .withAttribute('salary', 95000)
  .build();
```

### 4. PersonaGroup Management
- Add/remove personas
- Filter and search
- Generate from distributions
- Calculate statistics

### 5. AI-Powered Features (LangChain)
- **Structured Output Generation**: Use Zod schemas with LangChain's `withStructuredOutput`
- **Distribution Selection**: AI recommends appropriate distributions
- **Market Segmentation**: Automatic persona grouping

## Architecture

```
packages/persona-sdk/
├── src/
│   ├── persona.ts           # Core Persona class with generics
│   ├── persona-builder.ts   # Fluent builder API
│   ├── persona-group.ts     # Group management
│   ├── distributions/       # Statistical distributions
│   ├── tools/              # AI-powered tools
│   └── types/              # TypeScript types + Zod schemas
└── tests/                  # Vitest tests
```

## Quick Example

```typescript
import { PersonaGroup, NormalDistribution } from '@open-person/persona-sdk';

// Create a group and generate personas
// Note: You can mix distributions (vary per persona) with literal values (same for all)
const customers = new PersonaGroup('Customers');
customers.generateFromDistributions(100, {
  age: new NormalDistribution(35, 10),      // Distribution: varies per persona
  occupation: 'Customer',                   // Literal: same for all personas
  sex: new CategoricalDistribution([        // Distribution: varies per persona
    { value: 'male', probability: 0.5 },
    { value: 'female', probability: 0.5 }
  ]),
  spendingScore: new UniformDistribution(0, 100), // Distribution: varies
  membershipTier: 'Gold',                   // Literal: same for all
  region: 'North America'                   // Literal: same for all
});

// Get insights with AI
const insights = await customers.generateStructuredOutput(
  z.object({
    segments: z.array(z.object({
      name: z.string(),
      size: z.number()
    }))
  }),
  'Identify customer segments'
);
```

## Dependencies
- `zod`: Schema validation and type inference
- `langchain` + `@langchain/openai`: AI features
- `random-js`: Reliable random number generation
- `simple-statistics`: Statistical calculations

## For Your Presentation

1. **Clean API**: Minimal surface area, intuitive methods
2. **Type Safety**: Full TypeScript with Zod validation
3. **Extensible**: Easy to add new distributions or attributes
4. **AI-Ready**: Built-in LangChain integration
5. **Memory-Only**: No persistence complexity
6. **TDD**: Test-driven development approach