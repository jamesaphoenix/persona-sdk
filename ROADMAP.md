# Persona SDK Roadmap

## 🎯 Core Infrastructure Improvements

### 1. ✅ Seed Utilities for Deterministic Testing
**Status: COMPLETED**
**Priority: Critical**
**Estimated Effort: 1-2 days**

#### Description
Create seed utilities to reduce false positives during test runs by ensuring deterministic random number generation.

#### Implementation Details

```typescript
// Core seed manager
export class SeedManager {
  private static instance: SeedManager;
  private seeds: Map<string, number>;
  
  static setSeed(context: string, seed: number): void;
  static getSeed(context: string): number;
  static reset(): void;
}

// Seeded distribution wrappers
export class SeededNormalDistribution extends NormalDistribution {
  constructor(mean: number, stdDev: number, seed?: number);
}

// Test utilities
export const testWithSeed = (name: string, fn: () => void, seed = 12345) => {
  it(name, () => {
    SeedManager.setSeed('test', seed);
    fn();
    SeedManager.reset();
  });
};
```

#### Features
- Global seed management for reproducible tests
- Seeded versions of all distributions
- Test helpers for deterministic testing
- Performance benchmark stabilization

#### Acceptance Criteria
- All performance tests use seeded randomness
- No more flaky tests in CI
- Clear documentation on seed usage
- Migration guide for existing tests

---

### 2. ✅ Type Safety & Generics Enhancement
**Status: COMPLETED**
**Priority: High**
**Estimated Effort: 2-3 days**

#### Description
Maximize type safety with advanced generics and utility types following TanStack + Zod patterns.

#### Type Improvements

```typescript
// Enhanced persona types with branded types
type PersonaId = string & { readonly __brand: 'PersonaId' };
type GroupId = string & { readonly __brand: 'GroupId' };

// Strict attribute typing with inference
type InferAttributes<T extends DistributionMap> = {
  [K in keyof T]: T[K] extends Distribution<infer U> ? U : T[K];
};

// Builder pattern with type inference
class PersonaBuilder<T extends Partial<PersonaAttributes> = {}> {
  withAttribute<K extends string, V>(
    key: K,
    value: V
  ): PersonaBuilder<T & Record<K, V>>;
  
  build(): Persona<InferAttributes<T>>;
}

// Zod-style schema validation
const PersonaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  attributes: z.record(z.unknown())
}).brand<'Persona'>();

type ValidatedPersona = z.infer<typeof PersonaSchema>;
```

#### Utility Types
```typescript
// Deep partial with proper handling
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

// Exact types for strict validation
type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

// TanStack-style query keys
type QueryKey = readonly [scope: string, ...args: unknown[]];
```

#### Acceptance Criteria
- Full type inference throughout the API
- No `any` types except where absolutely necessary
- Branded types for IDs and entities
- Compile-time validation of API usage
- Auto-completion for all builder methods

---

## 🎯 Practical Examples & Use Cases

### 3. ✅ Media Analysis & Structured Outputs
**Status: COMPLETED**
**Priority: High**
**Estimated Effort: 2-3 days**

#### Description
Build comprehensive examples showing how to transform media inputs into structured outputs using PersonaGroups for realistic user behavior simulation.

#### Examples to Implement

##### A. CTR Distribution Analysis
```typescript
// Example: Analyze click-through rates for different media types
const mediaPost = {
  title: "10 Ways to Improve Your Code",
  type: "blog",
  thumbnail: "tech-thumbnail.jpg",
  category: "technology"
};

const techAudience = await PersonaGroup.generate({
  size: 1000,
  attributes: {
    interests: ['technology', 'programming'],
    age: new NormalDistribution(28, 8)
  }
});

const ctrDistribution = await analyzeCTR(techAudience, mediaPost);
// Output: { mean: 0.12, std: 0.03, percentiles: {...} }
```

##### B. Comment Engagement Patterns
```typescript
// Example: Predict comment rates across different demographics
const contentPiece = {
  topic: "AI Ethics",
  complexity: "high",
  controversial: true
};

const diverseAudience = await PersonaGroup.generate({
  size: 5000,
  segments: [
    { occupation: 'tech', weight: 0.3 },
    { occupation: 'academic', weight: 0.2 },
    { occupation: 'general', weight: 0.5 }
  ]
});

const commentDistribution = await analyzeCommentEngagement(
  diverseAudience, 
  contentPiece
);
```

##### C. Multi-Media Voting System
```typescript
// Example: 5 media pieces with structured voting output
const MediaVotingSchema = z.object({
  mediaId: z.string(),
  votes: z.object({
    upvotes: z.number(),
    downvotes: z.number(),
    engagement_rate: z.number()
  }),
  demographics: z.object({
    age_groups: z.record(z.number()),
    occupations: z.record(z.number())
  })
});

const votingResults = await simulateVoting(
  personaGroup,
  mediaItems,
  MediaVotingSchema
);
```

#### Acceptance Criteria
- Working examples with realistic distributions
- Jupyter notebooks showing visualizations
- Export functions for CSV/JSON outputs
- Statistical validation of results

---

### 4. ✅ Survey & MCQ Response Simulation
**Status: COMPLETED**
**Priority: High**
**Estimated Effort: 2 days**

#### Description
Create examples for simulating survey responses and multiple-choice questions with realistic response patterns.

#### Examples to Implement

##### A. Market Research Survey
```typescript
const surveySchema = z.object({
  product_interest: z.enum(['very_interested', 'interested', 'neutral', 'not_interested']),
  price_sensitivity: z.number().min(1).max(10),
  purchase_likelihood: z.number().min(0).max(1),
  preferred_features: z.array(z.string()).max(3)
});

const responses = await simulateSurvey(
  targetAudience,
  surveyQuestions,
  surveySchema
);
```

##### B. A/B Testing Simulation
```typescript
// Example: Test two different UI designs
const testVariants = {
  A: { color: 'blue', cta: 'Get Started' },
  B: { color: 'green', cta: 'Try Now' }
};

const conversionRates = await simulateABTest(
  userPersonas,
  testVariants,
  { duration: '7days', confidence: 0.95 }
);
```

#### Acceptance Criteria
- Response distributions match real-world patterns
- Support for different question types
- Correlation handling between responses
- Export to standard survey formats

---

### 5. ✅ REST API Server with PostgreSQL
**Status: COMPLETED**
**Priority: High**
**Estimated Effort: 3-4 days**

#### Description
Build a production-ready REST API server that exposes persona generation and media analysis capabilities.

#### Features
- RESTful endpoints for persona CRUD operations
- Media analysis endpoints
- Survey simulation endpoints
- PostgreSQL for persistence
- Request validation with Zod
- OpenAPI documentation
- Docker support

#### Key Endpoints
```
POST   /api/personas/generate
POST   /api/groups/generate
POST   /api/media/analyze-ctr
POST   /api/media/analyze-engagement
POST   /api/surveys/simulate
GET    /api/results/:id
```

#### Acceptance Criteria
- Full API documentation with examples
- Docker Compose for local development
- Database migrations with TypeORM/Prisma
- 95%+ test coverage
- Response time < 200ms for most operations

---

### 6. ✅ PostgreSQL Persistence Layer
**Status: COMPLETED**
**Priority: High**
**Estimated Effort: 2 days**

#### Description
Implement PostgreSQL adapter for storing personas, analysis results, and historical data.

#### Schema Design
```sql
-- Core tables
personas (id, attributes, created_at, group_id)
persona_groups (id, name, metadata, created_at)
media_analyses (id, media_data, results, created_at)
survey_simulations (id, survey_data, responses, created_at)
```

#### Features
- Efficient bulk inserts for large persona groups
- Query optimization for analytics
- Time-series data for tracking trends
- Data archival strategies

#### Acceptance Criteria
- Migration system in place
- Indexed for common queries
- Backup/restore procedures
- Connection pooling configured

---

### 7. 📈 Analytics Dashboard Examples
**Priority: Medium**
**Estimated Effort: 2 days**

#### Description
Create example dashboards showing how to visualize persona-based insights.

#### Examples
- Media performance heatmaps
- Demographic breakdown charts
- Engagement funnel analysis
- Survey response distributions
- A/B test result visualizations

#### Technologies
- React/Next.js components
- D3.js/Recharts for visualizations
- Export to PNG/PDF functionality

---

## Usage Examples Priority

### Immediate Value Examples
1. **Content Creator Tools**
   - Predict video engagement before publishing
   - Optimize thumbnail/title combinations
   - Schedule posts for maximum reach

2. **Market Research**
   - Product feature prioritization
   - Price sensitivity analysis
   - Brand perception studies

3. **UX Research**
   - User journey simulation
   - Feature adoption predictions
   - Usability testing at scale

### Integration Examples
```typescript
// Example: Complete media analysis workflow
import { PersonaSDK, MediaAnalyzer } from '@jamesaphoenix/persona-sdk';

// 1. Define your audience
const audience = await PersonaSDK.generateAudience({
  size: 10000,
  template: 'tech-enthusiasts'
});

// 2. Analyze multiple media pieces
const mediaItems = [
  { type: 'video', duration: 300, topic: 'web3' },
  { type: 'article', readTime: 5, topic: 'ai' },
  // ... more items
];

// 3. Get structured insights
const insights = await MediaAnalyzer.analyze(audience, mediaItems);

// 4. Export for further analysis
await insights.exportToCSV('media-analysis-results.csv');
```

---

### 8. 🧪 Comprehensive Runtime Testing Suite
**Priority: Critical**
**Estimated Effort: 3-4 days**

#### Description
Since we've written so much code across React, API, and SDK packages, we need comprehensive runtime testing to catch bugs that unit tests might miss. **This MUST include a dedicated React test application and VCR cassettes for all OpenAI API calls** to ensure reliable, repeatable testing without API costs.

#### Core Requirements
- **React Test Application**: Dedicated app for testing all SDK integrations
- **VCR Cassettes**: Record/replay OpenAI API calls to avoid repeated costs
- **Multi-Service Setup**: Postgres + API + React App + Documentation
- **Manual Runtime Testing**: Every function tested at least once in real environment

#### Testing Strategy

##### A. SDK Function Testing
```typescript
// Test every distribution at runtime
const testAllDistributions = async () => {
  const distributions = [
    new NormalDistribution(30, 5),
    new UniformDistribution(18, 65),
    new CategoricalDistribution([...]),
    new ExponentialDistribution(0.1),
    // ... all other distributions
  ];
  
  for (const dist of distributions) {
    // Test sampling
    const samples = dist.sampleMany(1000);
    assert(samples.length === 1000);
    assert(samples.every(s => typeof s === 'number'));
    
    // Test statistics
    const stats = calculateStats(samples);
    assert(stats.mean !== undefined);
    // ... more assertions
  }
};
```

##### B. API Endpoint Testing
```typescript
// Test every API endpoint with real data
const testAllAPIEndpoints = async () => {
  const baseUrl = 'http://localhost:3000';
  
  // Test persona creation
  const persona = await fetch(`${baseUrl}/personas`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test', age: 30 })
  });
  assert(persona.status === 201);
  
  // Test group creation
  const group = await fetch(`${baseUrl}/groups`, {
    method: 'POST', 
    body: JSON.stringify({ name: 'Test Group' })
  });
  assert(group.status === 201);
  
  // Test every endpoint systematically...
};
```

##### C. React Hook Testing
```typescript
// Test all React hooks with real renders
const testAllReactHooks = () => {
  render(
    <PersonaApiProvider config={{ baseUrl: 'http://localhost:3000' }}>
      <TestComponent />
    </PersonaApiProvider>
  );
  
  // Test usePersonas
  // Test useCreatePersona
  // Test useGroups
  // etc...
};
```

##### D. Integration Testing
```typescript
// Test complete workflows end-to-end
const testCompleteWorkflows = async () => {
  // Workflow 1: SDK -> API -> Database -> React
  const group = new PersonaGroup('Test');
  group.generateFromDistributions(100, { age: new NormalDistribution(30, 5) });
  
  // Save to API
  const saved = await apiClient.saveGroup(group);
  
  // Verify in database
  const fromDb = await dbClient.getGroup(saved.id);
  assert(fromDb.personas.length === 100);
  
  // Verify in React
  const { data } = render(<GroupDisplay id={saved.id} />);
  assert(data.personas.length === 100);
};
```

#### Testing Environment Setup
```bash
# Multi-service testing environment with React test app
docker-compose up -d postgres
npm run api:start &
npm run test-app:dev &  # React test application
npm run docs:dev &
npm run test:runtime
```

##### React Test Application
Create a dedicated React app for testing all SDK integrations:

```typescript
// apps/test-app/
├── src/
│   ├── components/
│   │   ├── PersonaTest.tsx        # Test PersonaBuilder & Persona class
│   │   ├── GroupTest.tsx          # Test PersonaGroup functionality  
│   │   ├── DistributionTest.tsx   # Test all distribution types
│   │   ├── APITest.tsx            # Test all API endpoints
│   │   ├── HooksTest.tsx          # Test all React hooks
│   │   └── AIFeaturesTest.tsx     # Test AI-powered features
│   ├── pages/
│   │   ├── index.tsx              # Test dashboard
│   │   ├── sdk-tests.tsx          # SDK function tests
│   │   ├── api-tests.tsx          # API endpoint tests
│   │   └── integration-tests.tsx  # End-to-end workflows
│   ├── utils/
│   │   ├── cassettes.ts           # VCR cassette management
│   │   └── test-helpers.ts        # Testing utilities
│   └── package.json
```

##### VCR Cassettes for OpenAI Calls
Use HTTP cassettes to record/replay OpenAI API calls:

```typescript
// utils/cassettes.ts
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import fs from 'fs';
import path from 'path';

interface CassetteConfig {
  name: string;
  record: boolean; // true = record new, false = replay existing
}

export class VCRCassettes {
  private server: any;
  private cassettePath: string;
  
  constructor(private config: CassetteConfig) {
    this.cassettePath = path.join(__dirname, '../cassettes', `${config.name}.json`);
  }
  
  async setup() {
    if (this.config.record) {
      // Record mode: proxy to real OpenAI and save responses
      this.server = setupServer(
        http.post('https://api.openai.com/v1/*', async ({ request }) => {
          const response = await fetch(request);
          const data = await response.json();
          
          // Save to cassette file
          this.saveToCassette(request.url, data);
          
          return HttpResponse.json(data);
        })
      );
    } else {
      // Replay mode: return saved responses
      const cassette = this.loadCassette();
      this.server = setupServer(
        http.post('https://api.openai.com/v1/*', ({ request }) => {
          const savedResponse = cassette[request.url];
          return HttpResponse.json(savedResponse);
        })
      );
    }
    
    this.server.listen();
  }
  
  private saveToCassette(url: string, response: any) {
    const cassette = this.loadCassette();
    cassette[url] = response;
    fs.writeFileSync(this.cassettePath, JSON.stringify(cassette, null, 2));
  }
  
  private loadCassette() {
    if (fs.existsSync(this.cassettePath)) {
      return JSON.parse(fs.readFileSync(this.cassettePath, 'utf8'));
    }
    return {};
  }
}

// Usage in tests
const cassettes = new VCRCassettes({ 
  name: 'ai-features-test',
  record: process.env.RECORD_CASSETTES === 'true'
});

await cassettes.setup();
```

##### Example Test Components
```typescript
// components/AIFeaturesTest.tsx
import { useState } from 'react';
import { DistributionSelectorLangChain, StructuredOutputGenerator } from '@jamesaphoenix/persona-sdk';

export function AIFeaturesTest() {
  const [results, setResults] = useState<any>(null);
  
  const testDistributionSelector = async () => {
    const selector = new DistributionSelectorLangChain(process.env.OPENAI_API_KEY);
    
    const result = await selector.selectDistributions({
      description: "Tech startup employees in Silicon Valley",
      requirements: ["Age should skew younger", "High income variation"],
      attributes: ['age', 'income', 'experience']
    });
    
    setResults({ type: 'distribution-selector', data: result });
  };
  
  const testStructuredOutput = async () => {
    const generator = new StructuredOutputGenerator(process.env.OPENAI_API_KEY);
    // ... test structured output generation
  };
  
  return (
    <div className="ai-features-test">
      <h2>AI Features Testing</h2>
      <button onClick={testDistributionSelector}>Test Distribution Selector</button>
      <button onClick={testStructuredOutput}>Test Structured Output</button>
      {results && <pre>{JSON.stringify(results, null, 2)}</pre>}
    </div>
  );
}
```

#### Manual Testing Checklist
- [ ] All 15+ distribution types work correctly
- [ ] All 20+ API endpoints return expected responses
- [ ] All React hooks render without errors
- [ ] Database migrations run successfully
- [ ] Swagger docs load and are accurate
- [ ] All example code in docs actually works
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness
- [ ] Error handling in all edge cases
- [ ] Memory leaks under load
- [ ] Performance under 1000+ personas

#### Function Testing Diff Tracking
**CRITICAL**: We must store a diff of functions that have been tested to ensure comprehensive coverage.

```typescript
// testing-manifest.json
{
  "lastUpdated": "2024-01-15T10:30:00Z",
  "testedFunctions": {
    "PersonaBuilder": {
      "create": { "tested": true, "lastTest": "2024-01-15T10:30:00Z" },
      "withName": { "tested": true, "lastTest": "2024-01-15T10:30:00Z" },
      "withAge": { "tested": false, "lastTest": null },
      "build": { "tested": true, "lastTest": "2024-01-15T10:30:00Z" }
    },
    "PersonaGroup": {
      "constructor": { "tested": true, "lastTest": "2024-01-15T10:30:00Z" },
      "add": { "tested": false, "lastTest": null },
      "generateFromDistributions": { "tested": true, "lastTest": "2024-01-15T10:30:00Z" }
    },
    "NormalDistribution": {
      "sample": { "tested": true, "lastTest": "2024-01-15T10:30:00Z" },
      "sampleMany": { "tested": false, "lastTest": null }
    }
    // ... all other functions
  },
  "coverage": {
    "total": 245,
    "tested": 187,
    "percentage": 76.3
  }
}
```

#### Acceptance Criteria
- **MUST HAVE: Dedicated React test application** for UI/hook testing
- **MUST HAVE: VCR cassettes** for all OpenAI API interactions
- **MUST HAVE: Function testing diff tracking** with JSON manifest
- Runtime test suite covering 100% of public APIs
- Automated tracking of which functions have been tested at runtime
- Function coverage dashboard showing tested vs untested methods
- Automated end-to-end tests for critical workflows
- Performance regression testing
- Error scenario testing (network failures, bad data, etc.)
- Documentation examples must all be runnable
- CI/CD pipeline runs full runtime test suite with cassettes
- Manual testing playbook for releases
- Zero OpenAI API calls during CI/CD (all cassette-based)
- 100% function coverage before any release

---

### 9. 📊 Survey Data to Joint Distribution Pipeline
**Priority: High**
**Estimated Effort: 4-5 days**

#### Problem Statement
Current distributions lack semantic meaning - knowing age is normal and income is exponential doesn't help create semantically useful personas. What's needed is a way to input real survey data and create joint distributions that preserve correlations and relationships.

#### SynC Framework Requirements
For downscaled synthetic data to be useful, it needs to be **fair and consistent**:
- **Fair**: Simulated data should mimic realistic distributions and correlations of the true population as closely as possible
- **Consistent**: When we aggregate downscaled samples, results need to be consistent with the original data

The multi-phase SynC framework ensures that:
1. **Marginal distributions** of individual features align with real-world expectations
2. **Feature correlations** are consistent with aggregated data  
3. **Aggregated results** match the input data

#### Proposed Solution: Survey → Joint Distribution → Personas

##### A. Survey Data Ingestion
```typescript
interface SurveyData {
  responses: Record<string, any>[];
  schema: {
    [field: string]: {
      type: 'numeric' | 'categorical' | 'ordinal';
      description: string;
      scale?: [number, number];
    };
  };
  metadata: {
    sampleSize: number;
    demographics: Record<string, any>;
    source: string;
  };
}

class SurveyAnalyzer {
  async analyzeCorrelations(data: SurveyData): Promise<CorrelationMatrix>;
  async detectDistributions(data: SurveyData): Promise<DistributionFitting>;
  async buildJointDistribution(data: SurveyData): Promise<JointDistribution>;
}
```

##### B. Gaussian Copula Implementation
```typescript
// Based on sync gaussian copula paper approach
class GaussianCopula {
  constructor(
    private marginalDistributions: Distribution[],
    private correlationMatrix: number[][]
  ) {}
  
  sample(n: number): PersonaAttributes[] {
    // 1. Sample from multivariate normal with correlation structure
    // 2. Transform through marginal CDFs to get correlated samples
    // 3. Map back to original variable space
  }
}
```

##### C. LLM-Assisted Distribution Selection
```typescript
class SurveyToDistributionPipeline {
  async processSurveyData(surveys: SurveyData[]): Promise<PersonaGroup> {
    // 1. Analyze multiple survey datasets
    const correlations = await this.analyzeCorrelations(surveys);
    
    // 2. LLM call to interpret semantic relationships
    const distributionSpec = await this.llm.selectDistributions({
      surveyData: surveys,
      correlations: correlations,
      prompt: "Create realistic joint distribution preserving relationships"
    });
    
    // 3. Build joint distribution with correlations
    const jointDist = new GaussianCopula(
      distributionSpec.marginals,
      correlations.matrix
    );
    
    // 4. Generate semantically meaningful personas
    return PersonaGroup.fromJointDistribution(jointDist, 1000);
  }
}
```

##### D. Example Workflow
```typescript
// Input: Multiple survey datasets
const surveys = [
  await loadSurvey('consumer-preferences-2024.csv'),
  await loadSurvey('demographics-income-survey.csv'),
  await loadSurvey('tech-adoption-survey.csv')
];

// Process: Extract joint distribution
const pipeline = new SurveyToDistributionPipeline();
const personas = await pipeline.processSurveyData(surveys);

// Output: Semantically meaningful personas
console.log(personas.getCorrelationMatrix('age', 'income')); // Real correlation
console.log(personas.getSegments()); // Natural clusters from data
```

#### Key Features
- **Real Data Foundation**: Use actual survey responses as input
- **Correlation Preservation**: Maintain relationships between variables
- **Semantic Understanding**: LLM interprets what correlations mean
- **Joint Sampling**: Generate personas that respect multi-variable dependencies
- **Validation**: Compare generated personas to original survey distributions

#### Technical Implementation
1. **Data Preprocessing**: Clean and normalize survey data
2. **Correlation Analysis**: Detect linear and non-linear relationships
3. **Marginal Fitting**: Fit appropriate distributions to each variable
4. **Copula Construction**: Build Gaussian or other copula models
5. **LLM Integration**: Use AI to interpret and enhance correlations
6. **Validation Suite**: Ensure generated data matches input statistics

#### Acceptance Criteria
- Support for common survey formats (CSV, JSON, SPSS)
- Automatic detection of variable types and relationships
- Preservation of correlations in generated personas (>95% accuracy)
- LLM-powered semantic enhancement of distributions
- Documentation with real survey examples
- Performance: Generate 10,000 personas in <30 seconds

#### Benefits
- **Realistic Personas**: Based on actual human data, not arbitrary distributions
- **Preserves Relationships**: Age-income correlation, education-occupation patterns
- **Scalable**: Works with any survey data structure
- **AI-Enhanced**: LLM adds semantic understanding to statistical relationships
- **Validation**: Generated personas can be compared to original survey data

---

## Contributing

To work on any of these examples:

1. Create a feature branch: `feature/example-name`
2. Include working code examples
3. Add tests demonstrating the use case
4. Include sample outputs
5. Submit PR for review

Remember: Focus on practical examples that solve real problems for users!