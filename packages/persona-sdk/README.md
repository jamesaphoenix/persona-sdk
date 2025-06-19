# @jamesaphoenix/persona-sdk

A TypeScript SDK for generating personas from statistical distributions with AI-powered insights.

## Features

- 🎲 **Statistical Distributions**: Generate personas using Normal, Uniform, Exponential, Beta, and Categorical distributions
- 👥 **PersonaGroup Management**: Organize and analyze collections of personas
- 🤖 **AI-Powered Tools**: Automatic distribution selection, correlation generation, and structured output generation using LangChain
- 🪄 **Auto-Correlation Generation**: AI automatically generates realistic relationships between persona attributes
- 🔗 **Realistic Correlations**: Built-in correlation system ensures personas have believable attribute relationships
- 📊 **Statistical Analysis**: Built-in statistics for persona attributes
- 🔧 **Clean API**: Simple, modular, and type-safe interface
- 🌱 **Reproducible**: Seedable random generation for consistent results
- 📸 **Media-to-Persona**: Generate personas from text posts, images, and other media content
- 🎬 **Media Diet**: Apply media consumption influences to persona groups
- 📊 **Token Usage Tracking**: Built-in token counting and cost estimation for all AI operations
- 🔄 **LangChain Integration**: Full LangChain support for structured outputs and tool use
- 🎯 **Practical Examples**: CTR prediction, engagement analysis, voting systems, and survey simulation
- 🌱 **Deterministic Testing**: Comprehensive seeding system for reproducible tests and simulations

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
  CategoricalDistribution,
  generateWithAutoCorrelations  // NEW: Auto-correlation generation
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

### 🪄 Automatic Correlation Generation (NEW!)

Generate correlations and conditional relationships automatically using AI! Perfect for users who want realistic personas without manually configuring complex relationships:

```typescript
import { generateWithAutoCorrelations } from '@jamesaphoenix/persona-sdk';

// Just define your attributes - AI handles all the correlations!
const realisticTeam = await generateWithAutoCorrelations({
  attributes: {
    age: new UniformDistribution(25, 55),
    yearsExperience: new NormalDistribution(8, 6),
    salary: new NormalDistribution(85000, 30000),
    height: new NormalDistribution(170, 10),  // cm
    weight: new NormalDistribution(75, 15),   // kg
    fitnessLevel: new UniformDistribution(1, 10),
    commuteMins: new ExponentialDistribution(0.03),
    hasKids: new CategoricalDistribution([
      { value: true, probability: 0.4 },
      { value: false, probability: 0.6 }
    ]),
    occupation: 'Software Engineer',
    sex: 'other'
  },
  count: 100,
  context: 'Tech professionals in Seattle',
  domain: 'workplace',  // Helps AI understand the context
  groupName: 'Seattle Tech Team'
});

// AI automatically generates:
// ✅ Age-Income correlation (older = higher salary)
// ✅ Age-Experience conditional (experience ≤ age - 22)
// ✅ Height-Weight correlation (BMI-based)
// ✅ Fitness-Commute relationship (fit people bike to work)
// ✅ HasKids-CommuteMins (parents drive, others walk/bike)
// ✅ All relationships are realistic and domain-aware!

console.log(realisticTeam.size); // 100 realistic personas
```

#### Manual Control with Auto-Generation

For more control, use the `AutoCorrelationGenerator` directly:

```typescript
import { AutoCorrelationGenerator, PersonaBuilder } from '@jamesaphoenix/persona-sdk';

const generator = new AutoCorrelationGenerator(); // Uses OPENAI_API_KEY

// Generate correlation config for your attributes
const correlationConfig = await generator.generate({
  attributes: {
    age: new UniformDistribution(30, 60),
    income: new NormalDistribution(75000, 25000),
    stressLevel: new UniformDistribution(1, 10),
    exerciseHours: new NormalDistribution(3, 2),
    sleepQuality: new UniformDistribution(1, 10),
    occupation: 'Manager',
    sex: 'other'
  },
  context: 'Corporate middle management',
  domain: 'workplace'
});

// Review and modify the AI suggestions
console.log('AI-generated correlations:', correlationConfig.correlations);
console.log('AI-generated conditionals:', correlationConfig.conditionals);

// Use with PersonaBuilder
const buildConfig = generator.toBuildConfig(correlationConfig);
const persona = PersonaBuilder.create()
  .withAttributes(attributes)
  .buildWithCorrelations(buildConfig);
```

#### Supported Transform Types

The AI can generate these common correlation patterns:

- **`age_income`**: Income increases with age until retirement
- **`age_experience`**: Experience bounded by working years (age - 22)
- **`height_weight`**: BMI-based weight correlation 
- **`education_income`**: Higher education correlates with income
- **`custom`**: AI can write custom formulas for unique relationships

#### Context-Aware Generation

Different domains produce different correlation patterns:

```typescript
// Health domain - focuses on physical relationships
const healthCorrelations = await generator.generate({
  attributes: { age: new NormalDistribution(40, 15), weight: new NormalDistribution(75, 15), exerciseHours: new NormalDistribution(3, 2) },
  domain: 'health',
  context: 'Fitness app users'
});

// Workplace domain - focuses on career relationships  
const workCorrelations = await generator.generate({
  attributes: { age: new UniformDistribution(25, 65), salary: new NormalDistribution(80000, 30000), yearsExperience: new UniformDistribution(0, 40) },
  domain: 'workplace', 
  context: 'Corporate employees'
});

// Academic domain - focuses on education relationships
const academicCorrelations = await generator.generate({
  attributes: { age: new UniformDistribution(18, 80), income: new NormalDistribution(50000, 20000), educationYears: new UniformDistribution(12, 20) },
  domain: 'academic',
  context: 'University professors'  
});
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

### 📸 Media-to-Persona Generation (NEW!)

Generate personas from text posts, images, and other media content:

```typescript
import { MediaToPersonaGenerator } from '@jamesaphoenix/persona-sdk';

const generator = new MediaToPersonaGenerator('your-api-key');

// Generate persona from a social media post
const textResult = await generator.fromTextPost(`
  Just finished my morning 5K run! 🏃‍♀️ Feeling energized for the day ahead. 
  Time to grab my usual oat milk latte and head to the co-working space. 
  Working on some exciting sustainability projects today. 
  Who else is passionate about green tech? #StartupLife #Sustainability
`);

console.log(textResult.personas[0].attributes);
// {
//   age: 28,
//   occupation: 'Tech Professional',
//   sex: 'female',
//   interests: ['fitness', 'sustainability', 'technology'],
//   values: ['environmental consciousness', 'health', 'innovation'],
//   personality: { openness: 0.8, conscientiousness: 0.7, ... }
// }

// Generate multiple varied personas
const multiplePersonas = await generator.fromTextPost(postText, {
  generateMultiple: true,
  count: 10,
  includeDistributions: true
});

// Generate from images
const imageResult = await generator.fromImage('./lifestyle-photo.jpg');

// Generate from media collection
const mediaCollection = await generator.fromMediaCollection([
  './article1.txt',
  './photo1.jpg',
  './blog-post.txt'
]);

// Track token usage
console.log(`Tokens used: ${textResult.usage.total_tokens}`);
console.log(`Estimated cost: $${generator.estimateProcessingCost(1, ['text'], 'gpt-4-turbo-preview').estimatedCost}`);
```

### 🎬 Media Diet & Persona Influence (NEW!)

Model how media consumption influences personas over time:

```typescript
import { MediaDietManager, MediaProcessor } from '@jamesaphoenix/persona-sdk';

const dietManager = new MediaDietManager('your-api-key');

// Create a media diet from files
const mediaDiet = await dietManager.createMediaDiet([
  './tech-articles/ai-news.txt',
  './videos/documentary.mp4',
  './podcasts/startup-interview.mp3'
]);

// Apply media influence to a persona
const influencedPersona = await dietManager.applyMediaInfluence(
  originalPersona,
  mediaDiet
);

console.log(influencedPersona.influences);
// {
//   interests: ['technology', 'innovation', 'AI'],
//   values: ['progress', 'efficiency'],
//   vocabulary: ['algorithm', 'optimization'],
//   opinions: [{ topic: 'AI', stance: 'positive', confidence: 0.8 }]
// }

// Apply to entire persona group with variation
const { influencedGroup, results, totalUsage } = await dietManager.applyToPersonaGroup(
  personaGroup,
  mediaDiet,
  {
    variationFactor: 0.3,  // 30% variation in diet per persona
    sampleSize: 100        // Apply to subset of group
  }
);

// Get media recommendations for a persona
const recommendations = await dietManager.recommendMedia(
  persona,
  availableMediaContent,
  {
    desiredInfluences: ['creativity', 'technical skills'],
    avoidTopics: ['politics', 'controversy']
  }
);
```

### 📊 Token Usage & Cost Tracking (NEW!)

All AI operations now include comprehensive token usage tracking:

```typescript
// Every AI operation returns usage metadata
const result = await generator.fromTextPost(text);
console.log(result.usage);
// {
//   input_tokens: 245,
//   output_tokens: 156,
//   total_tokens: 401
// }

// Estimate costs before processing
const estimate = generator.estimateProcessingCost(
  5,  // number of media items
  ['text', 'image', 'text', 'video', 'document'],
  'gpt-4-turbo-preview'
);
console.log(`Estimated cost: $${estimate.estimatedCost}`);

// Cost calculation utilities
const processor = new MediaProcessor('your-api-key');
const cost = processor.estimateCost(
  { input_tokens: 1000, output_tokens: 500, total_tokens: 1500 },
  'gpt-4'
);
// { inputCost: 0.03, outputCost: 0.03, totalCost: 0.06 }
```

### 🔄 LangChain Integration (NEW!)

The SDK now uses LangChain for all AI operations, providing better structure and tool use:

```typescript
import { DistributionSelectorLangChain } from '@jamesaphoenix/persona-sdk';

const selector = new DistributionSelectorLangChain('your-api-key');

// Select distribution with structured output
const { distribution, usage, reasoning } = await selector.selectDistribution({
  attribute: 'customer_lifetime_value',
  context: 'E-commerce platform users',
  constraints: { min: 0, max: 10000 }
});

// Get multiple recommendations
const { distributions, recommendations } = await selector.recommendDistributions(
  ['age', 'purchase_frequency', 'average_order_value'],
  'Online shoppers demographic'
);

// Natural language to distribution
const { distribution: nlDist } = await selector.fromDescription(
  'mostly young adults in their 20s and 30s, centered around 27'
);
```

## Real-World Examples

### 🎯 CTR Prediction for Marketing Campaigns

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
        tech_savviness: new BetaDistribution(8, 2),
        ad_responsiveness: new BetaDistribution(3, 7)
      }
    },
    {
      name: "Business Users",
      weight: 0.6,
      attributes: {
        age: new NormalDistribution(38, 8),
        decision_power: new BetaDistribution(7, 3),
        budget_conscious: new BetaDistribution(6, 4)
      }
    }
  ]
});

// Predict CTR for your campaign
const CTRSchema = z.object({
  predicted_ctr: z.number(),
  confidence_interval: z.object({ lower: z.number(), upper: z.number() }),
  best_segment: z.string(),
  optimization_tips: z.array(z.string())
});

const prediction = await generator.generateCustom(
  audience,
  CTRSchema,
  "Predict CTR for B2B SaaS product launch campaign"
);
```

### 💬 Comment Engagement Prediction

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
    generator.generateCustom(audience, EngagementSchema, `Analyze: ${hook}`)
  )
);
```

### 🗳️ Voting & Polling Systems

Accurate preference modeling:

```typescript
// Model voting behavior
const votingPopulation = await PersonaGroup.generate({
  size: 5000,
  attributes: {
    age: new NormalDistribution(45, 15),
    political_leaning: new BetaDistribution(5, 5), // Centered
    voting_likelihood: new CorrelatedDistribution({
      age: (age) => age < 30 ? 0.3 : age > 60 ? 0.8 : 0.5
    })
  }
});

// Predict outcomes
const VotingSchema = z.object({
  winner: z.string(),
  margin: z.number(),
  turnout: z.number(),
  demographic_breakdown: z.record(z.string(), z.number())
});
```

### 📊 Market Research Surveys

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
        budget: new NormalDistribution(50000, 15000),
        pain_points: ['scalability', 'integration', 'cost']
      }
    },
    {
      name: "SMB Owners",
      weight: 0.8,
      attributes: {
        company_size: new NormalDistribution(50, 30),
        budget: new NormalDistribution(5000, 2000),
        pain_points: ['cost', 'ease-of-use', 'support']
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
  }),
  feature_priorities: z.array(z.object({
    feature: z.string(),
    importance: z.number()
  }))
});
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
} from '@jamesaphoenix/persona-sdk';
```

## Documentation

Full documentation with interactive examples: [https://jamesaphoenix.github.io/persona-sdk/](https://jamesaphoenix.github.io/persona-sdk/)

## API Reference

See the [API documentation](https://jamesaphoenix.github.io/persona-sdk/api) for detailed type definitions and method signatures.

## Contributing

This project was created entirely by [Claude Code](https://claude.ai/code). If you find a bug or want to add a feature:

1. **Submit a PR** - Create a pull request with your changes
2. **Claude Code reviews** - The AI will review your contribution
3. **Automatic merge** - Valid PRs will be reviewed and merged

We welcome all contributions!

## License

MIT