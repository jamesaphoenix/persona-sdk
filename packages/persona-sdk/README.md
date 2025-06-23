# @jamesaphoenix/persona-sdk

A TypeScript SDK for generating personas from statistical distributions with AI-powered insights.

## Features

- 🎲 **Statistical Distributions**: Generate personas using Normal, Uniform, Exponential, Beta, and Categorical distributions
- 👥 **PersonaGroup Management**: Organize and analyze collections of personas
- 🤖 **AI-Powered Tools**: Automatic distribution selection, correlation generation, and structured output generation
- 🔗 **Realistic Correlations**: Built-in correlation system ensures personas have believable attribute relationships
- 📊 **Statistical Analysis**: Built-in statistics for persona attributes
- 🔧 **Clean API**: Simple, modular, and type-safe interface
- 🌱 **Reproducible**: Seedable random generation for consistent results
- 📸 **Media-to-Persona**: Generate personas from text posts, images, and other media content
- 🔄 **LangChain Integration**: Full LangChain support for structured outputs and tool use
- 🎯 **Practical Examples**: CTR prediction, engagement analysis, voting systems, and survey simulation
- 🌱 **Deterministic Testing**: Comprehensive seeding system for reproducible tests and simulations
- 🚀 **REST API**: Full HTTP API with PostgreSQL persistence
- ⚛️ **React Hooks**: React integration with hooks for frontend applications
- 🎯 **Prompt Optimization**: Automated prompt optimization for better AI performance

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
  PersonaBuilder,
  PersonaGroup, 
  NormalDistribution, 
  UniformDistribution,
  CategoricalDistribution
} from '@jamesaphoenix/persona-sdk';

// Create a single persona
const john = PersonaBuilder.create()
  .withName('John Doe')
  .withAge(35)
  .withOccupation('Software Engineer')
  .withSex('male')
  .withAttribute('income', 75000)
  .withAttribute('interests', ['technology', 'fitness'])
  .build();

// Generate persona groups
const group = await PersonaGroup.generate({
  name: 'Target Audience',
  size: 100,
  attributes: {
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
    ])
  }
});

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

### 🧠 AI-Powered Distribution Selection

Let AI select appropriate distributions based on natural language:

```typescript
import { DistributionSelectorLangChain } from '@jamesaphoenix/persona-sdk';

const selector = new DistributionSelectorLangChain();

const result = await selector.selectDistributions({
  description: "Tech startup employees in Silicon Valley",
  requirements: [
    "Age should skew younger (25-40)",
    "Income should be high but varied by role",
    "Most should have 2-8 years experience"
  ],
  attributes: ['age', 'income', 'yearsExperience']
});

// Use the AI-selected distributions
const group = new PersonaGroup('Startup Employees');
group.generateFromDistributions(100, result.distributions);
```

### 🎯 Structured Output Generation

Generate type-safe insights from your persona groups:

```typescript
import { StructuredOutputGenerator } from '@jamesaphoenix/persona-sdk';
import { z } from 'zod';

const generator = new StructuredOutputGenerator();

const MarketingInsightsSchema = z.object({
  segments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    characteristics: z.array(z.string())
  })),
  recommendations: z.array(z.string())
});

const insights = await generator.generate(
  group,
  MarketingInsightsSchema,
  "Identify key market segments and recommendations"
);

console.log(insights.data.segments);
```

### 📸 Media-to-Persona Generation

Generate personas from text posts, images, and media content:

```typescript
import { MediaToPersonaGenerator } from '@jamesaphoenix/persona-sdk';

const generator = new MediaToPersonaGenerator();

// Generate personas from social media post
const result = await generator.fromTextPost(`
  Just finished my morning 5K run! 🏃‍♀️ Feeling energized for the day ahead. 
  Time to grab my usual oat milk latte and head to the co-working space. 
  Working on some exciting sustainability projects today.
`);

console.log(result.group.personas[0].attributes);
// {
//   age: 28,
//   occupation: 'Tech Professional',
//   interests: ['fitness', 'sustainability', 'technology']
// }

// Generate from images
const imageResult = await generator.fromImage('./lifestyle-photo.jpg');

// Generate from multiple sources
const collectionResult = await generator.fromMediaCollection([
  './post1.txt',
  './photo1.jpg',
  './blog-post.txt'
]);
```

### 🚀 REST API Server

Full HTTP API with PostgreSQL persistence:

```bash
# Start the API server
pnpm --filter @jamesaphoenix/persona-api dev

# Generate personas via HTTP
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "age": { "type": "normal", "mean": 35, "stdDev": 5 },
    "occupation": "Developer",
    "sex": "other"
  }'

# Generate groups
curl -X POST http://localhost:3000/api/generate-group \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beta Users",
    "size": 100,
    "distributions": {
      "age": { "type": "normal", "mean": 28, "stdDev": 5 }
    }
  }'
```

### ⚛️ React Integration

React hooks for seamless frontend integration:

```tsx
import { usePersonaGroup, useAIInsights } from '@jamesaphoenix/persona-sdk/react';

function AudienceAnalytics() {
  const { group, generate } = usePersonaGroup('Users');
  const { insights, generate: generateInsights } = useAIInsights();

  const handleGenerate = async () => {
    await generate({
      size: 1000,
      distributions: {
        age: new NormalDistribution(32, 8),
        occupation: 'Developer'
      }
    });

    if (group) {
      await generateInsights(group, "Marketing segments analysis");
    }
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Audience</button>
      {insights && (
        <div>
          <h3>Market Segments</h3>
          {insights.segments.map(segment => (
            <div key={segment.name}>{segment.name}: {segment.size}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 🎯 Prompt Optimization

Automatically optimize prompts for better AI performance:

```typescript
import { BootstrapOptimizer, ExactMatch } from '@jamesaphoenix/persona-sdk';

// Create a module to optimize
const sentimentModule = new Module(
  `Classify sentiment as positive, negative, or neutral.
  
  Examples:
  {examples}
  
  Text: {input}
  Sentiment:`
);

// Training data
const trainData = [
  { input: "This product is amazing!", output: "positive" },
  { input: "Terrible experience", output: "negative" },
  { input: "It's okay", output: "neutral" }
];

// Optimize
const optimizer = new BootstrapOptimizer({
  maxLabeled: 5,
  metric: ExactMatch
});

const result = await optimizer.optimize(sentimentModule, trainData);
console.log(`Final accuracy: ${result.finalScore}`);
```


## Advanced Usage

### Reproducible Generation

```typescript
import { SeedManager } from '@jamesaphoenix/persona-sdk';

// Set global test seed
SeedManager.setTestSeed(12345);

// Context-specific seeds
SeedManager.setSeed('age-distribution', 100);
const ageWithSeed = new NormalDistribution(30, 5, 'age-distribution');
```

### Filtering and Analysis

```typescript
// Filter personas
const millennials = group.filter(p => {
  const age = p.attributes.age as number;
  return age >= 25 && age <= 40;
});

// Get statistics
const ageStats = group.getStatistics('age');
console.log(`Average age: ${ageStats.mean}`);
```





## Real-World Examples

### CTR Prediction for Marketing Campaigns

Predict click-through rates before launching:

```typescript
import { PersonaGroup, StructuredOutputGenerator } from '@jamesaphoenix/persona-sdk';
import { z } from 'zod';

// Model your target audience
const audience = await PersonaGroup.generate({
  size: 1000,
  segments: [
    {
      name: "Tech Enthusiasts",
      weight: 0.4,
      attributes: {
        age: new NormalDistribution(28, 5),
        tech_savviness: new BetaDistribution(8, 2)
      }
    },
    {
      name: "Business Users",
      weight: 0.6,
      attributes: {
        age: new NormalDistribution(38, 8),
        decision_power: new BetaDistribution(7, 3)
      }
    }
  ]
});

// Predict CTR with AI
const CTRSchema = z.object({
  predicted_ctr: z.number(),
  best_segment: z.string(),
  optimization_tips: z.array(z.string())
});

const generator = new StructuredOutputGenerator();
const prediction = await generator.generate(
  audience,
  CTRSchema,
  "Predict CTR for B2B SaaS campaign"
);

console.log(`Predicted CTR: ${prediction.data.predicted_ctr}%`);
console.log(`Best segment: ${prediction.data.best_segment}`);
```

### Comment Engagement Prediction

Maximize social media engagement:

```typescript
// Test different content hooks
const hooks = [
  "AI will replace 50% of jobs by 2030...",
  "After analyzing 10,000 AI implementations...",
  "Unpopular opinion: Most companies aren't ready for AI..."
];

const EngagementSchema = z.object({
  predicted_comments: z.number(),
  sentiment_breakdown: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number()
  }),
  viral_probability: z.number()
});

// Find the winner
const results = await Promise.all(
  hooks.map(hook => 
    generator.generate(audience, EngagementSchema, `Analyze: ${hook}`)
  )
);

const bestHook = results.reduce((best, current) => 
  current.data.predicted_comments > best.data.predicted_comments ? current : best
);

console.log(`Best hook: ${bestHook.data.predicted_comments} comments`);
```

### Voting & Polling Systems

Accurate preference modeling:

```typescript
// Model voting behavior
const votingPopulation = await PersonaGroup.generate({
  size: 5000,
  attributes: {
    age: new NormalDistribution(45, 15),
    political_leaning: new BetaDistribution(5, 5), // Centered
    voting_likelihood: new BetaDistribution(6, 4)  // Skewed high
  }
});

// Predict outcomes
const VotingSchema = z.object({
  winner: z.string(),
  margin: z.number(),
  turnout: z.number(),
  demographic_breakdown: z.record(z.string(), z.number())
});

const prediction = await generator.generate(
  votingPopulation,
  VotingSchema,
  "Predict election outcome based on demographics"
);

console.log(`Predicted winner: ${prediction.data.winner}`);
console.log(`Expected turnout: ${prediction.data.turnout}%`);
```

### Market Research Surveys

Generate statistically valid responses:

```typescript
// Define target market segments
const market = await PersonaGroup.generate({
  size: 1000,
  segments: [
    {
      name: "Enterprise Buyers",
      weight: 0.2,
      attributes: {
        company_size: new NormalDistribution(500, 200),
        budget: new NormalDistribution(50000, 15000)
      }
    },
    {
      name: "SMB Owners",
      weight: 0.8,
      attributes: {
        company_size: new NormalDistribution(50, 30),
        budget: new NormalDistribution(5000, 2000)
      }
    }
  ]
});

// Generate survey responses
const SurveySchema = z.object({
  product_interest: z.object({
    very_interested: z.number(),
    interested: z.number(),
    neutral: z.number(),
    not_interested: z.number()
  }),
  pricing_sensitivity: z.object({
    optimal_price: z.number(),
    price_elasticity: z.number()
  })
});

const surveyResults = await generator.generate(
  market,
  SurveySchema,
  "Generate market research survey responses"
);

console.log(`Optimal price: $${surveyResults.data.pricing_sensitivity.optimal_price}`);
console.log(`Interest breakdown:`, surveyResults.data.product_interest);
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

The SDK uses `gpt-4o-mini` as the default model for all AI features.



## TypeScript Support

This SDK is written in TypeScript and provides full type definitions:

```typescript
import type { 
  PersonaAttributes,
  Distribution,
  DistributionMap,
  StructuredOutput 
} from '@jamesaphoenix/persona-sdk';
```

## Documentation

Full documentation: [https://persona-sdk-docs.vercel.app](https://persona-sdk-docs.vercel.app)

## API Reference

See the [API documentation](https://persona-sdk-docs.vercel.app/docs/api) for detailed type definitions and method signatures.

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## License

MIT