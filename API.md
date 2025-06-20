# Persona SDK API Reference

Complete API documentation for @jamesaphoenix/persona-sdk.

## Table of Contents

- [Core Classes](#core-classes)
  - [Persona](#persona)
  - [PersonaBuilder](#personabuilder)
  - [PersonaGroup](#personagroup)
- [AI Features](#ai-features)
  - [PersonaAI](#personaai)
  - [StructuredOutputGenerator](#structuredoutputgenerator)
  - [DistributionSelector](#distributionselector)
- [Distributions](#distributions)
  - [BaseDistribution](#basedistribution)
  - [NormalDistribution](#normaldistribution)
  - [UniformDistribution](#uniformdistribution)
  - [ExponentialDistribution](#exponentialdistribution)
  - [BetaDistribution](#betadistribution)
  - [CategoricalDistribution](#categoricaldistribution)
- [Types](#types)

## Core Classes

### Persona

The core class representing an individual persona.

```typescript
class Persona<T extends PersonaAttributes = PersonaAttributes>
```

#### Constructor

```typescript
constructor(name: string, attributes: T)
```

#### Properties

- `id: string` - Unique identifier (UUID)
- `name: string` - Persona's name
- `age: number` - Persona's age
- `occupation: string` - Persona's occupation
- `sex: 'male' | 'female' | 'other'` - Persona's sex
- `createdAt: Date` - Creation timestamp

#### Methods

##### getAttribute(key: string): AttributeValue | undefined
Get a custom attribute value.

```typescript
const location = persona.getAttribute('location');
```

##### getAttributes(): T
Get all attributes.

```typescript
const attrs = persona.getAttributes();
```

##### hasAttribute(key: string): boolean
Check if an attribute exists.

```typescript
if (persona.hasAttribute('skills')) {
  // ...
}
```

##### clone(newName?: string): Persona<T>
Create a copy of the persona.

```typescript
const copy = persona.clone('New Name');
```

##### toJSON(): object
Convert to JSON representation.

```typescript
const json = persona.toJSON();
```

### PersonaBuilder

Fluent builder for creating personas.

```typescript
class PersonaBuilder<T extends PersonaAttributes = PersonaAttributes>
```

#### Static Methods

##### create(): PersonaBuilder
Start building a new persona.

```typescript
const builder = PersonaBuilder.create();
```

#### Instance Methods

##### withName(name: string): this
Set the persona's name.

##### withAge(age: number): this
Set the persona's age (must be positive, max 150).

##### withOccupation(occupation: string): this
Set the persona's occupation.

##### withSex(sex: 'male' | 'female' | 'other'): this
Set the persona's sex.

##### withCustomAttribute(key: string, value: AttributeValue): this
Add a custom attribute.

```typescript
builder.withCustomAttribute('skills', ['JavaScript', 'Python']);
```

##### withDistribution(key: string, distribution: Distribution): this
Use a distribution to generate an attribute value.

```typescript
builder.withDistribution('income', new NormalDistribution(75000, 15000));
```

##### build(): Persona<T>
Create the persona. Throws if required attributes are missing.

### PersonaGroup

Manages collections of personas with statistical analysis.

```typescript
class PersonaGroup<T extends PersonaAttributes = PersonaAttributes>
```

#### Constructor

```typescript
constructor(personas?: Persona<T>[])
```

#### Properties

- `size: number` - Number of personas in the group

#### Methods

##### add(persona: Persona<T>): void
Add a persona to the group.

##### remove(id: string): boolean
Remove a persona by ID. Returns true if removed.

##### findById(id: string): Persona<T> | undefined
Find a persona by ID.

##### getAll(): Persona<T>[]
Get all personas in the group.

##### filter(predicate: (persona: Persona<T>) => boolean): Persona<T>[]
Filter personas by a condition.

```typescript
const adults = group.filter(p => p.age >= 18);
```

##### map<U>(transform: (persona: Persona<T>) => U): U[]
Transform personas.

```typescript
const names = group.map(p => p.name);
```

##### clear(): void
Remove all personas from the group.

##### generateStatistics(): GroupStatistics
Generate statistical summary of the group.

```typescript
const stats = group.generateStatistics();
// {
//   count: 10,
//   age: { mean: 32.5, median: 31, stdDev: 5.2, min: 25, max: 45 },
//   sex: { male: 0.5, female: 0.4, other: 0.1 },
//   occupations: { Engineer: 3, Designer: 2, ... }
// }
```

##### generateFromDistributions(count: number, distributions: DistributionMap): void
Generate multiple personas using distributions.

```typescript
group.generateFromDistributions(100, {
  age: new NormalDistribution(30, 5),
  occupation: new CategoricalDistribution([
    { value: 'Engineer', probability: 0.6 },
    { value: 'Designer', probability: 0.4 }
  ]),
  sex: new CategoricalDistribution([
    { value: 'male', probability: 0.5 },
    { value: 'female', probability: 0.5 }
  ])
});
```

##### static fromArray(personas: Persona<T>[]): PersonaGroup<T>
Create a group from an array of personas.

## AI Features

### PersonaAI

AI-powered persona generation using OpenAI.

```typescript
class PersonaAI
```

#### Static Methods

##### fromPrompt(prompt: string, options: PersonaAIOptions): Promise<Persona>
Generate a single persona from a natural language prompt.

```typescript
const persona = await PersonaAI.fromPrompt(
  'Create a 30-year-old software engineer in Seattle',
  { apiKey: process.env.OPENAI_API_KEY }
);
```

Options:
- `apiKey: string` - OpenAI API key (required)
- `model?: string` - Model to use (default: 'gpt-4-turbo-preview')
- `temperature?: number` - Creativity (0-2, default: 0.7)

##### generateMultiple(options: GenerateMultipleOptions): Promise<PersonaGroup>
Generate multiple diverse personas.

```typescript
const team = await PersonaAI.generateMultiple({
  count: 5,
  context: 'startup founding team',
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.9
});
```

Options:
- `count: number` - Number of personas to generate
- `context: string` - Context for generation
- `apiKey: string` - OpenAI API key
- `model?: string` - Model to use
- `temperature?: number` - Creativity (higher = more diverse)

##### optimizePrompt(prompt: string, options: PersonaAIOptions): Promise<string>
Enhance a prompt for better persona generation.

```typescript
const optimized = await PersonaAI.optimizePrompt(
  'developer',
  { apiKey: process.env.OPENAI_API_KEY }
);
// Returns: "Create a 28-year-old full-stack developer..."
```

##### suggestAttributes(context: string, options: PersonaAIOptions): Promise<string[]>
Get AI-suggested attributes for a context.

```typescript
const attrs = await PersonaAI.suggestAttributes(
  'e-commerce customer',
  { apiKey: process.env.OPENAI_API_KEY }
);
// Returns: ['purchaseHistory', 'preferredBrands', 'priceRange', ...]
```

### StructuredOutputGenerator

Generate type-safe structured outputs from persona groups using LangChain.

```typescript
class StructuredOutputGenerator
```

#### Constructor

```typescript
constructor(apiKey: string, modelName?: string)
```

#### Methods

##### generate<T>(group: PersonaGroup, schema: z.ZodSchema<T>, prompt: string): Promise<StructuredOutput<T>>
Generate structured output matching a Zod schema.

```typescript
const schema = z.object({
  segments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    characteristics: z.array(z.string())
  }))
});

const result = await generator.generate(
  personaGroup,
  schema,
  'Segment these personas into market categories'
);
```

##### generateInsights(group: PersonaGroup, options?: InsightOptions): Promise<StructuredOutput<MarketInsights>>
Generate market insights with predefined schema.

```typescript
const insights = await generator.generateInsights(group, {
  focus: 'product-market fit',
  attributes: ['age', 'interests', 'income']
});
```

##### generateSegmentation(group: PersonaGroup, options: SegmentationOptions): Promise<StructuredOutput<Segmentation>>
Generate customer segments.

```typescript
const segments = await generator.generateSegmentation(group, {
  segmentCount: 4,
  attributes: ['age', 'behavior', 'values']
});
```

##### generateCustom<T>(group: PersonaGroup, schema: z.ZodSchema<T>, systemPrompt: string, userPrompt: string): Promise<StructuredOutput<T>>
Generate with custom system and user prompts.

### DistributionSelector

AI-powered selection of appropriate statistical distributions.

```typescript
class DistributionSelector
```

#### Constructor

```typescript
constructor(apiKey: string, modelName?: string)
```

#### Methods

##### selectDistribution(attributeName: string, context: string, constraints?: DistributionConstraints): Promise<Distribution>
Select appropriate distribution for an attribute.

```typescript
const dist = await selector.selectDistribution(
  'income',
  'annual household income in urban areas',
  { min: 20000, max: 500000 }
);
```

##### recommendDistributions(attributes: Record<string, string>): Promise<Record<string, Distribution>>
Get distribution recommendations for multiple attributes.

```typescript
const dists = await selector.recommendDistributions({
  age: 'age of mobile game players',
  sessionTime: 'daily playing time in minutes',
  spending: 'monthly in-app purchases'
});
```

## Distributions

### BaseDistribution

Abstract base class for all distributions.

```typescript
abstract class BaseDistribution<T = number> implements Distribution<T>
```

#### Constructor

```typescript
constructor(seed?: number)
```

#### Abstract Methods

- `sample(): T` - Sample a value
- `mean(): T` - Get expected value
- `variance?(): number` - Get variance
- `toString(): string` - Get description

### NormalDistribution

Normal (Gaussian) distribution.

```typescript
class NormalDistribution extends BaseDistribution<number>
```

#### Constructor

```typescript
constructor(mean: number, stdDev: number, seed?: number)
```

#### Example

```typescript
const age = new NormalDistribution(35, 5);
console.log(age.sample()); // e.g., 33.7
console.log(age.mean()); // 35
console.log(age.variance()); // 25
```

### UniformDistribution

Uniform distribution between min and max.

```typescript
class UniformDistribution extends BaseDistribution<number>
```

#### Constructor

```typescript
constructor(min: number, max: number, seed?: number)
```

### ExponentialDistribution

Exponential distribution with rate parameter.

```typescript
class ExponentialDistribution extends BaseDistribution<number>
```

#### Constructor

```typescript
constructor(rate: number, seed?: number)
```

### BetaDistribution

Beta distribution for values between 0 and 1.

```typescript
class BetaDistribution extends BaseDistribution<number>
```

#### Constructor

```typescript
constructor(alpha: number, beta: number, seed?: number)
```

### CategoricalDistribution

Discrete distribution over categories.

```typescript
class CategoricalDistribution<T = string> extends BaseDistribution<T>
```

#### Constructor

```typescript
constructor(categories: Array<{ value: T; probability: number }>, seed?: number)
```

#### Example

```typescript
const occupation = new CategoricalDistribution([
  { value: 'Engineer', probability: 0.4 },
  { value: 'Designer', probability: 0.3 },
  { value: 'Manager', probability: 0.3 }
]);
```

## Types

### PersonaAttributes

```typescript
type PersonaAttributes = BasePersonaAttributes & Record<string, AttributeValue>
```

### BasePersonaAttributes

```typescript
interface BasePersonaAttributes {
  age: number;
  occupation: string;
  sex: 'male' | 'female' | 'other';
}
```

### AttributeValue

```typescript
type AttributeValue = string | number | boolean | string[] | number[] | Record<string, any>
```

### StructuredOutput<T>

```typescript
interface StructuredOutput<T = any> {
  data: T;
  metadata: {
    distribution?: string;
    model?: string;
    timestamp: Date;
    [key: string]: any;
  };
}
```

### GroupStatistics

```typescript
interface GroupStatistics {
  count: number;
  age: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
  sex: {
    male: number;
    female: number;
    other: number;
  };
  occupations: Record<string, number>;
  customAttributes?: Record<string, any>;
}
```