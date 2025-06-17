# @jamesaphoenix/persona-sdk

A TypeScript SDK for generating personas from statistical distributions with AI-powered insights.

## Features

- 🎲 **Statistical Distributions**: Generate personas using Normal, Uniform, Exponential, Beta, and Categorical distributions
- 👥 **PersonaGroup Management**: Organize and analyze collections of personas
- 🤖 **AI-Powered Tools**: Automatic distribution selection and structured output generation using OpenAI
- 📊 **Statistical Analysis**: Built-in statistics for persona attributes
- 🔧 **Clean API**: Simple, modular, and type-safe interface
- 🌱 **Reproducible**: Seedable random generation for consistent results

## Installation

```bash
npm install @jamesaphoenix/persona-sdk
# or
pnpm add @jamesaphoenix/persona-sdk
# or
yarn add @jamesaphoenix/persona-sdk
```

## Quick Start

```typescript
import { 
  Persona, 
  PersonaGroup, 
  NormalDistribution, 
  UniformDistribution,
  CategoricalDistribution 
} from '@jamesaphoenix/persona-sdk';

// Create a single persona
const john = new Persona('John Doe', {
  age: 35,
  occupation: 'Software Engineer',
  sex: 'male',
  income: 75000,
  interests: ['technology', 'fitness']
});

// Generate personas from distributions
// Note: You can mix distributions with literal values for flexibility
const distributions = {
  age: new NormalDistribution(35, 10),
  occupation: new CategoricalDistribution([
    { value: 'Engineer', probability: 0.4 },
    { value: 'Designer', probability: 0.3 },
    { value: 'Manager', probability: 0.3 }
  ]),
  sex: new CategoricalDistribution([
    { value: 'male', probability: 0.45 },
    { value: 'female', probability: 0.45 },
    { value: 'other', probability: 0.1 }
  ]),
  income: new NormalDistribution(60000, 20000),
  satisfaction: new UniformDistribution(1, 10),
  category: new CategoricalDistribution([
    { value: 'premium', probability: 0.2 },
    { value: 'standard', probability: 0.5 },
    { value: 'basic', probability: 0.3 }
  ])
};

const generatedPersona = Persona.fromDistributions('Alice Smith', distributions);

// Create and manage persona groups
const group = new PersonaGroup('Target Audience');
group.generateFromDistributions(100, distributions);

// Get statistics
const ageStats = group.getStatistics('age');
console.log(`Average age: ${ageStats.mean}`);
```

## Distributions

### Normal Distribution
Best for naturally occurring attributes with central tendency.

```typescript
const ageDistribution = new NormalDistribution(
  35,    // mean (μ)
  10     // standard deviation (σ)
);
```

### Uniform Distribution
For evenly distributed attributes.

```typescript
const scoreDistribution = new UniformDistribution(
  0,     // min
  100    // max
);
```

### Exponential Distribution
For time-based or decay attributes.

```typescript
const waitTimeDistribution = new ExponentialDistribution(
  0.5    // rate (λ)
);
```

### Beta Distribution
For probabilities or percentages.

```typescript
const successRateDistribution = new BetaDistribution(
  2,     // alpha (α)
  5      // beta (β)
);
```

### Categorical Distribution
For discrete choices.

```typescript
const occupationDistribution = new CategoricalDistribution([
  { value: 'engineer', probability: 0.3 },
  { value: 'designer', probability: 0.2 },
  { value: 'manager', probability: 0.25 },
  { value: 'analyst', probability: 0.25 }
]);
```

## Correlated Personas

Generate personas with realistic relationships between attributes:

```typescript
import { PersonaGroup, NormalDistribution, CommonCorrelations } from '@jamesaphoenix/persona-sdk';

// Create a group with correlated attributes
const group = new PersonaGroup('Realistic Population');

group.generateWithCorrelations(100, {
  attributes: {
    age: new NormalDistribution(35, 10),
    yearsExperience: new NormalDistribution(10, 5),
    income: new NormalDistribution(75000, 25000),
    height: new NormalDistribution(170, 10),  // cm
    weight: new NormalDistribution(70, 15),   // kg
    occupation: 'Professional',              // Literal value
    sex: 'other'                            // Literal value
  },
  correlations: [
    // Define correlations between numeric attributes
    { attribute1: 'age', attribute2: 'income', correlation: 0.6 },
    { attribute1: 'age', attribute2: 'yearsExperience', correlation: 0.8 },
    { attribute1: 'height', attribute2: 'weight', correlation: 0.7 }
  ],
  conditionals: [
    // Experience can't exceed working years
    {
      attribute: 'yearsExperience',
      dependsOn: 'age',
      transform: CommonCorrelations.ageExperience
    },
    // Income increases with age
    {
      attribute: 'income',
      dependsOn: 'age',
      transform: CommonCorrelations.ageIncome
    }
  ]
});

// Built-in correlation functions:
// - CommonCorrelations.ageIncome: Income increases with age until retirement
// - CommonCorrelations.ageExperience: Experience bounded by working years
// - CommonCorrelations.heightWeight: BMI-based weight correlation
// - CommonCorrelations.educationIncome: Higher education → higher income
// - CommonCorrelations.urbanRuralIncome: Urban areas have higher incomes
```

## AI-Powered Features

### 🧠 Intelligent Persona Generation (NEW!)

Generate personas with ANY traits while ensuring they're completely realistic:

```typescript
import { createRealisticPersonas, IntelligentPersonaFactory } from '@jamesaphoenix/persona-sdk';

// Just list any traits - AI handles all correlations!
const personas = await createRealisticPersonas(
  [
    'age', 'income', 'fitnessLevel', 'screenTimeHours',
    'favoriteFood', 'sleepQuality', 'hasKids', 'commuteTime',
    'musicTaste', 'workFromHome', 'stressLevel'
  ],
  'Urban millennials',
  100  // Generate 100 personas
);

// AI automatically ensures:
// - Parents have less sleep quality
// - Fitness level inversely correlates with screen time  
// - Income affects food preferences
// - Age influences music taste
// - Work from home affects commute time (obviously!)
// - ALL traits interact realistically
```

#### Advanced: Custom Trait Definitions

```typescript
const factory = new IntelligentPersonaFactory();

const gamingCommunity = await factory.generatePersonas({
  traits: [
    { name: 'age', dataType: 'numeric' },
    { name: 'hoursPlayedPerWeek', dataType: 'numeric' },
    { name: 'favoriteGenre', dataType: 'categorical' },
    { name: 'toxicityScore', dataType: 'numeric', constraints: { min: 0, max: 10 } },
    { name: 'teamPlayer', dataType: 'boolean' },
    { name: 'spentOnGames', dataType: 'numeric' },
    { name: 'streamViewers', dataType: 'numeric' },
    { name: 'energyDrinkBrand', dataType: 'categorical' }
  ],
  context: 'Online gaming community members',
  count: 500,
  customRules: [
    'Toxicity decreases with age',
    'Team players have lower toxicity',
    'Streaming correlates with hours played',
    'Energy drink consumption correlates with hours played'
  ]
});

// Result: 500 realistic gamers with proper correlations
```

### Automatic Distribution Selection

```typescript
import { DistributionSelector } from '@jamesaphoenix/persona-sdk';

const selector = new DistributionSelector(); // Uses OPENAI_API_KEY env var

// Get AI recommendation for a single attribute
const distribution = await selector.selectDistribution({
  attribute: 'annual_income',
  context: 'Software engineers in Silicon Valley',
  constraints: { min: 50000, max: 300000 }
});

// Get recommendations for multiple attributes
const recommendations = await selector.recommendDistributions(
  ['age', 'experience_years', 'job_satisfaction'],
  'Tech industry professionals'
);
```

### Correlation-Aware Distribution Selection

Generate complete persona configurations with realistic correlations:

```typescript
import { CorrelationAwareSelector } from '@jamesaphoenix/persona-sdk';

const selector = new CorrelationAwareSelector();

// AI generates distributions AND correlations
const config = await selector.selectCorrelatedDistributions({
  attributes: ['age', 'income', 'experience', 'satisfaction'],
  context: 'Remote software developers',
  existingAttributes: { location: 'Global', workStyle: 'Remote' }
});

// Use the configuration
const group = new PersonaGroup('Remote Team');
group.generateWithCorrelations(50, config);

// Result includes:
// - Appropriate distributions for each attribute
// - Correlations (e.g., age-income: 0.6)
// - Conditionals (e.g., experience limited by age)
```

### Structured Output Generation (LangChain)

The SDK uses LangChain's `withStructuredOutput` method for reliable structured output generation:

```typescript
import { StructuredOutputGenerator } from '@jamesaphoenix/persona-sdk';
import { z } from 'zod';

const generator = new StructuredOutputGenerator();

// Define output schema with Zod
const MarketingInsightsSchema = z.object({
  segments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    characteristics: z.array(z.string())
  })),
  recommendations: z.array(z.string()),
  keyInsight: z.string()
});

// Generate insights from persona group
const insights = await generator.generate(
  group,
  MarketingInsightsSchema,
  'Identify key market segments and provide marketing recommendations'
);

console.log(insights.data);
```

You can also use the built-in methods:

```typescript
// Generate distribution insights
const distInsights = await generator.generateDistributionInsights(
  group, 
  ['age', 'income', 'satisfaction']
);

// Generate market segments
const segments = await generator.generateSegments(group, 4); // 4 segments

// Or use directly from PersonaGroup
const output = await group.generateStructuredOutput(
  YourSchema,
  'Your analysis prompt'
);
```

## Advanced Usage

### Reproducible Generation

```typescript
// Use seeds for reproducible results
const seededDist = new NormalDistribution(100, 15, 12345);
const value1 = seededDist.sample(); // Always generates the same sequence
const value2 = seededDist.sample();
```

### Filtering and Analysis

```typescript
// Filter personas
const millennials = group.filter(p => {
  const age = p.attributes.age as number;
  return age >= 25 && age <= 40;
});

// Get group summary
const summary = group.getSummary();
console.log(`Common attributes: ${JSON.stringify(summary.commonAttributes)}`);
```

### Batch Generation

```typescript
// Generate multiple personas at once
const personas = Persona.generateMany(
  'Customer',      // base name
  1000,           // count
  distributions   // distribution map
);
```

## Configuration

Set your OpenAI API key for AI features:

```bash
export OPENAI_API_KEY=your-api-key-here
```

Or pass it directly:

```typescript
const selector = new DistributionSelector('your-api-key');
```

The SDK uses `gpt-4.1-mini` as the default model for all AI features, but you can customize it:

```typescript
// For structured output generation
const insights = await group.generateStructuredOutput(
  YourSchema,
  'Your analysis prompt',
  { modelName: 'gpt-4-turbo-preview' } // Optional: use a different model
);
```



## TypeScript Support

This SDK is written in TypeScript and provides full type definitions:

```typescript
import type { 
  PersonaAttributes,
  Distribution,
  DistributionMap,
  StructuredOutput 
} from '@open-persona/persona-sdk';
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT