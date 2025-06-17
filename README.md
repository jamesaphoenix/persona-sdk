# Open Persona SDK

A TypeScript SDK for generating personas from statistical distributions with AI-powered insights.

## 📦 Package

The main package is located in `packages/persona-sdk/` and is published as `@jamesaphoenix/persona-sdk` on npm.

### Installation

```bash
npm install @jamesaphoenix/persona-sdk
# or
pnpm add @jamesaphoenix/persona-sdk
# or
yarn add @jamesaphoenix/persona-sdk
```

## 🚀 Quick Start

```typescript
import { PersonaBuilder, PersonaGroup, NormalDistribution, UniformDistribution } from '@jamesaphoenix/persona-sdk';
import { z } from 'zod';

// Create a single persona
const persona = PersonaBuilder.create()
  .withName('Alice Johnson')
  .withAge(28)
  .withOccupation('Software Engineer')
  .withSex('female')
  .build();

// Create personas with distributions
const group = new PersonaGroup('Tech Workers');
group.generateFromDistributions(100, {
  age: new NormalDistribution(32, 5),    // Age varies with normal distribution
  occupation: 'Developer',                // 'Developer' is a literal (constant)
  sex: 'other',                          // 'other' is a literal (constant)
  yearsExperience: new UniformDistribution(1, 10)  // Experience varies uniformly
});
// Note: You can mix distributions (which vary) with literals (which stay constant)

// Define schema for AI insights
const MarketingInsightSchema = z.object({
  targetSegment: z.string(),
  keyDemographics: z.object({
    averageAge: z.number(),
    primaryOccupations: z.array(z.string())
  }),
  productRecommendations: z.array(z.string()),
  marketingChannels: z.array(z.string())
});

// Generate AI insights (requires OpenAI API key)
const insights = await group.generateStructuredOutput(
  MarketingInsightSchema,
  'Analyze for product positioning'
);
```

## 🎯 Creating Realistic Personas with Correlations

Generate personas with realistic relationships between attributes:

```typescript
import { PersonaGroup, NormalDistribution, CommonCorrelations } from '@jamesaphoenix/persona-sdk';

// Create a group with correlated attributes
const realisticGroup = new PersonaGroup('Tech Professionals');

realisticGroup.generateWithCorrelations(100, {
  attributes: {
    // Define base distributions
    age: new NormalDistribution(32, 8),
    yearsExperience: new NormalDistribution(8, 4),
    income: new NormalDistribution(95000, 30000),
    height: new NormalDistribution(170, 10),  // cm
    weight: new NormalDistribution(70, 15),   // kg
    occupation: 'Software Engineer',          // Literal value
    sex: 'other',                            // Literal value
    location: 'San Francisco'                // Literal value
  },
  
  // Define correlations between numeric attributes
  correlations: [
    { attribute1: 'age', attribute2: 'income', correlation: 0.6 },
    { attribute1: 'yearsExperience', attribute2: 'income', correlation: 0.7 },
    { attribute1: 'height', attribute2: 'weight', correlation: 0.7 }
  ],
  
  // Add conditional dependencies
  conditionals: [
    {
      attribute: 'yearsExperience',
      dependsOn: 'age',
      transform: CommonCorrelations.ageExperience // Can't have 30 years experience at age 25
    },
    {
      attribute: 'income',
      dependsOn: 'location',
      transform: (income, location) => 
        location === 'San Francisco' ? income * 1.4 : income
    }
  ]
});

// Result: Personas with realistic attribute relationships
// - Older personas tend to have higher incomes
// - Experience is bounded by age
// - San Francisco workers have 40% higher salaries
// - Height and weight are correlated (realistic BMI)
```

### Built-in Correlation Functions

The SDK provides common real-world correlations:

```typescript
import { CommonCorrelations } from '@jamesaphoenix/persona-sdk';

// Age-Income: Income increases with age until retirement
CommonCorrelations.ageIncome(baseIncome, age)

// Age-Experience: Experience can't exceed working years
CommonCorrelations.ageExperience(experience, age)

// Height-Weight: BMI-based correlation
CommonCorrelations.heightWeight(baseWeight, height)

// Education-Income: More education → higher income
CommonCorrelations.educationIncome(baseIncome, educationYears)

// Urban-Rural Income: Location-based adjustments
CommonCorrelations.urbanRuralIncome(baseIncome, isUrban)
```

## 📁 Repository Structure

```
open-persona/
├── packages/
│   ├── persona-sdk/        # Main SDK package
│   └── typescript-config/  # Shared TypeScript configuration
├── .github/
│   └── workflows/         # CI/CD workflows
├── setup-github-publish.sh # Setup script for GitHub
└── publish-to-npm.sh      # Direct npm publish script
```

## 🛠️ Development

### Setup

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build packages
pnpm build
```

### Publishing

The package is automatically published to npm when:
1. A new release is created on GitHub
2. The version in `package.json` is updated and pushed to main
3. Manually triggered via GitHub Actions

To publish manually:
```bash
./publish-to-npm.sh
```

## 📄 Documentation

- [API Documentation](https://jamesaphoenix.github.io/persona-sdk/)
- [NPM Package](https://www.npmjs.com/package/@jamesaphoenix/persona-sdk)
- [Quick Start Guide](./packages/persona-sdk/QUICKSTART.md)

## 📝 License

MIT