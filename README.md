# Open Persona SDK

A TypeScript SDK for generating personas from statistical distributions with AI-powered insights.

## 📦 Package

The main package is located in `packages/persona-sdk/` and is published as `@open-persona/persona-sdk` on npm.

### Installation

```bash
npm install @open-persona/persona-sdk
# or
pnpm add @open-persona/persona-sdk
# or
yarn add @open-persona/persona-sdk
```

## 🚀 Quick Start

```typescript
import { PersonaBuilder, PersonaGroup, NormalDistribution } from '@open-persona/persona-sdk';

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

// Generate AI insights (requires OpenAI API key)
const insights = await group.generateStructuredOutput(
  MarketingInsightSchema,
  'Analyze for product positioning'
);
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

- [API Documentation](https://open-persona.github.io/persona-sdk/)
- [NPM Package](https://www.npmjs.com/package/@open-persona/persona-sdk)
- [Quick Start Guide](./packages/persona-sdk/QUICKSTART.md)

## 📝 License

MIT