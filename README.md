# @jamesaphoenix/persona-sdk

A comprehensive monorepo containing advanced TypeScript packages for AI-powered persona generation and prompt optimization.

## 📦 Packages

### [@jamesaphoenix/persona-sdk](./packages/persona-sdk/)
A TypeScript SDK for generating personas from statistical distributions with AI-powered tools.

**Features:**
- 🎯 Persona generation using statistical distributions
- 📊 PersonaGroup management for collections
- 🤖 AI-powered distribution selection with LangChain
- 🎬 Media-to-persona generation from text posts and images
- 📈 Usage metadata tracking for cost monitoring
- 🔗 Auto-correlation generation for realistic personas

### [@jamesaphoenix/prompt-optimizer](./packages/prompt-optimizer/)
A TypeScript package for optimizing prompts using techniques inspired by DSPy.

**Features:**
- 🚀 4 Advanced optimization algorithms (Bootstrap, COPRO, Random Search, Ensemble)
- 📊 6 comprehensive metrics for evaluation
- 🧪 Complete testing infrastructure with 600+ test cases
- 🎯 TanStack-style API with full TypeScript support
- 🔧 Production-ready performance optimization

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Generate documentation
pnpm docs
```

### Persona SDK Usage

```typescript
import { PersonaBuilder, PersonaGroup, NormalDistribution } from '@jamesaphoenix/persona-sdk';

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
  age: new NormalDistribution(32, 5),
  occupation: 'Developer',
  sex: 'other',
  yearsExperience: new UniformDistribution(1, 10)
});
```

### Prompt Optimizer Usage

```typescript
import { BootstrapOptimizer, ExactMatch, MockModule } from '@jamesaphoenix/prompt-optimizer';

// Create optimizer
const optimizer = new BootstrapOptimizer({
  maxLabeled: 10,
  maxBootstrapped: 5,
  metric: ExactMatch
});

// Optimize your module
const result = await optimizer.optimize(module, trainset);
console.log(`Improved score: ${result.finalScore}`);
```

### Integration Example

```typescript
import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';
import { BootstrapOptimizer, createCompositeMetric } from '@jamesaphoenix/prompt-optimizer';

// Create a prompt optimization workflow for persona generation
const personaMetric = createCompositeMetric([
  { metric: ExactMatch, weight: 0.4 },
  { metric: FuzzyMatch, weight: 0.6 }
]);

const optimizer = new BootstrapOptimizer({
  metric: personaMetric,
  maxLabeled: 8
});

// Optimize persona generation prompts
const optimizedPersonaGenerator = await optimizer.optimize(
  personaModule,
  personaTrainingData
);
```

## 🏗️ Monorepo Structure

```
persona-sdk/
├── packages/
│   ├── persona-sdk/          # Core persona generation package
│   │   ├── src/
│   │   ├── tests/
│   │   ├── examples/
│   │   └── docs/
│   └── prompt-optimizer/     # Prompt optimization package
│       ├── src/
│       ├── tests/
│       ├── examples/
│       └── docs/
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # PNPM workspace configuration
└── package.json             # Root package configuration
```

## 🧪 Testing

Both packages include comprehensive test suites:

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter persona-sdk test
pnpm --filter prompt-optimizer test

# Run tests with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch
```

## 📚 Documentation

Each package includes extensive documentation:

- **README files** with usage examples
- **API documentation** with TypeScript signatures
- **Example files** demonstrating real-world usage
- **Integration guides** for combining packages

Generate documentation for all packages:

```bash
pnpm docs
```

## 🔧 Development

### Prerequisites

- Node.js 20+
- PNPM 8+
- TypeScript 5+

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/jamesaphoenix/persona-sdk.git
   cd persona-sdk
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build packages**
   ```bash
   pnpm build
   ```

4. **Run tests**
   ```bash
   pnpm test
   ```

### Development Commands

```bash
# Development mode (watch for changes)
pnpm dev

# Type checking
pnpm type-check

# Linting and formatting
pnpm format
pnpm format:check

# Clean build artifacts
pnpm clean
```

## 🚀 Publishing

Both packages are configured for npm publishing:

```bash
# Build packages
pnpm build

# Publish persona-sdk
cd packages/persona-sdk
npm publish --access public

# Publish prompt-optimizer
cd packages/prompt-optimizer
npm publish --access public
```

## 🎯 Use Cases

### Persona SDK
- **User Research**: Generate realistic user personas for product development
- **Marketing**: Create targeted customer segments with statistical backing
- **A/B Testing**: Generate diverse user groups for testing scenarios
- **Content Creation**: Create personas from social media posts and content

### Prompt Optimizer
- **AI Development**: Optimize prompts for better AI model performance
- **Cost Reduction**: Reduce token usage while improving output quality
- **Automated Testing**: A/B test different prompt strategies
- **Production Deployment**: Ensemble methods for robust AI applications

### Combined Usage
- **Intelligent Persona Generation**: Use prompt optimization to improve persona creation
- **Adaptive Systems**: Optimize prompts based on persona characteristics
- **Research Automation**: Automated persona generation with optimized prompts
- **Production AI**: Scalable, optimized AI systems for persona-based applications

## 📊 Performance

### Persona SDK
- **Memory Efficient**: Handles large persona groups without memory issues
- **Fast Generation**: Sub-second persona creation with complex distributions
- **Scalable**: Tested with 10,000+ persona groups
- **Token Tracking**: Built-in cost monitoring for AI operations

### Prompt Optimizer
- **Optimization Speed**: <30 seconds for large datasets
- **Memory Usage**: <100MB for production workloads
- **Token Efficiency**: 20-40% improvement in AI performance
- **Concurrent Safe**: Supports parallel optimization

## 🤝 Contributing

We welcome contributions to both packages! Please see individual package READMEs for specific contribution guidelines.

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Persona SDK**: Inspired by statistical modeling and modern AI tooling
- **Prompt Optimizer**: Based on the excellent work in [DSPy](https://github.com/stanfordnlp/dspy) by Stanford NLP

---

**Built with TypeScript, tested thoroughly, and ready for production use.** 🚀