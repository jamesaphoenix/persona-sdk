# Quick Start Guide

## Installation

```bash
npm install @jamesaphoenix/persona-sdk
```

## 1. Basic Persona Creation

```typescript
import { Persona, PersonaBuilder } from '@jamesaphoenix/persona-sdk';

// Create a persona with required fields
const user = new Persona('John Doe', {
  age: 35,
  occupation: 'Software Engineer',
  sex: 'male',
  // Custom fields
  location: 'New York',
  interests: ['technology', 'music']
});

// Or use the builder pattern
const jane = PersonaBuilder.create()
  .withName('Jane Smith')
  .withAge(28)
  .withOccupation('Product Designer')
  .withSex('female')
  .withAttribute('salary', 95000)
  .withAttribute('skills', ['UI/UX', 'Figma', 'React'])
  .build();
```

## 2. Generate from Distributions

```typescript
import { 
  Persona,
  PersonaBuilder,
  NormalDistribution, 
  CategoricalDistribution,
  ExponentialDistribution 
} from '@jamesaphoenix/persona-sdk';

// Define distributions for all required fields
// You can mix distributions with literal values - useful when some attributes should be constant
const distributions = {
  age: new NormalDistribution(30, 5), // mean=30, stdDev=5
  occupation: new CategoricalDistribution([
    { value: 'Software Engineer', probability: 0.4 },
    { value: 'Product Manager', probability: 0.3 },
    { value: 'Data Scientist', probability: 0.3 }
  ]),
  sex: new CategoricalDistribution([
    { value: 'male', probability: 0.5 },
    { value: 'female', probability: 0.48 },
    { value: 'other', probability: 0.02 }
  ]),
  // Custom fields
  yearsExperience: new ExponentialDistribution(0.2),
  company: 'Tech Corp',  // Literal value - same for all generated personas
  isActive: true         // Literal value - same for all generated personas
};

// Generate one persona
const employee = Persona.fromDistributions('Employee 1', distributions);

// Generate many
const team = Persona.generateMany('Employee', 10, distributions);

// Or use builder with distributions
const randomPerson = PersonaBuilder.create()
  .withName('Random Person')
  .withAge(new NormalDistribution(35, 10))
  .withOccupation(new CategoricalDistribution([
    { value: 'Doctor', probability: 0.3 },
    { value: 'Teacher', probability: 0.7 }
  ]))
  .withSex('female')
  .build();
```

## 3. PersonaGroup Management

```typescript
import { PersonaGroup } from '@jamesaphoenix/persona-sdk';

// Create a group
const customerBase = new PersonaGroup('Customers');

// Add personas
// Note: Required fields (age, occupation, sex) must be provided
// You can use distributions or literal values for any field
customerBase.generateFromDistributions(100, {
  age: new NormalDistribution(35, 10),     // Distribution: varies per persona
  occupation: 'Customer',                   // Literal: same for all
  sex: new CategoricalDistribution([        // Distribution: varies per persona
    { value: 'male', probability: 0.5 },
    { value: 'female', probability: 0.5 }
  ]),
  spendingScore: new UniformDistribution(0, 100), // Distribution: varies
  region: 'North America',                  // Literal: same for all
  accountType: 'Premium'                    // Literal: same for all
});

// Get statistics
const stats = customerBase.getStatistics('age');
console.log(`Average age: ${stats.mean}`);

// Filter personas
const highSpenders = customerBase.filter(
  p => p.attributes.spendingScore > 80
);
```

## 4. AI-Powered Insights (requires OpenAI API key)

```typescript
import { StructuredOutputGenerator } from '@jamesaphoenix/persona-sdk';
import { z } from 'zod';

// Set OPENAI_API_KEY in environment or pass directly
const generator = new StructuredOutputGenerator();

// Define what insights you want
const InsightsSchema = z.object({
  segments: z.array(z.object({
    name: z.string(),
    description: z.string(),
    size: z.number()
  })),
  recommendations: z.array(z.string())
});

// Generate insights
const insights = await generator.generate(
  customerBase,
  InsightsSchema,
  'Identify customer segments and marketing strategies'
);

console.log(insights.data.segments);
console.log(insights.data.recommendations);
```

## 5. Complete Example

```typescript
import { 
  PersonaGroup,
  NormalDistribution,
  BetaDistribution,
  StructuredOutputGenerator
} from '@jamesaphoenix/persona-sdk';
import { z } from 'zod';

async function analyzeUserBase() {
  // Create user group with distributions
  const users = new PersonaGroup('App Users');
  
  users.generateFromDistributions(200, {
    age: new NormalDistribution(28, 8),
    engagementScore: new BetaDistribution(3, 2), // 0-1, skewed high
    monthlyUsageHours: new ExponentialDistribution(0.05)
  });

  // Get basic stats
  console.log('User base size:', users.size);
  console.log('Avg engagement:', users.getStatistics('engagementScore').mean);

  // Generate AI insights
  const generator = new StructuredOutputGenerator();
  const segments = await generator.generateSegments(users, 3);
  
  segments.data.segments.forEach(segment => {
    console.log(`\n${segment.name}: ${segment.description}`);
    console.log('Size:', segment.size);
    console.log('Key traits:', segment.keyCharacteristics);
  });
}

analyzeUserBase();
```

## Environment Setup

Create a `.env` file:

```
OPENAI_API_KEY=your-api-key-here
```

## Next Steps

- Explore more [distributions](./README.md#distributions)
- Learn about [structured outputs](./README.md#structured-output-generation-langchain)
- See [full examples](./examples/basic-usage.ts)