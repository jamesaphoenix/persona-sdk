import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Map test names to cassette files
const testCassetteMap = {
  // PersonaBuilder tests
  'PersonaBuilder.fromPrompt() - Tech Professional': 'persona-builder/PersonaBuilder-fromPrompt-7e82e0a1.json',
  'PersonaBuilder.generateMultiple() - Diverse Team': 'persona-builder/PersonaBuilder-generateMultiple-93cf6798.json',
  'PersonaBuilder.optimizePrompt()': 'persona-builder/PersonaBuilder-optimizePrompt-cccfbe7a.json',
  'PersonaBuilder.suggestAttributes() - Gaming Context': 'persona-builder/PersonaBuilder-suggestAttributes-da0213e2.json',
  
  // PersonaAI tests
  'PersonaAI.fromPrompt - Basic persona generation': 'ai-features/PersonaAI-fromPrompt-basic.json',
  'PersonaAI.fromPrompt - Complex persona with attributes': 'ai-features/PersonaAI-fromPrompt-complex.json',
  'PersonaAI.generateMultiple - Team generation': 'ai-features/PersonaAI-generateMultiple.json',
  'PersonaAI.optimizePrompt - Basic enhancement': 'ai-features/PersonaAI-optimizePrompt.json',
  'PersonaAI.suggestAttributes - Gaming context': 'ai-features/PersonaAI-suggestAttributes-gaming.json',
  
  // DistributionSelector tests
  'DistributionSelector.selectDistribution - Age attribute': 'distribution-selector/selectDistribution-age.json',
  'DistributionSelector.selectDistribution - Categorical occupation': 'distribution-selector/selectDistribution-occupation.json',
  
  // StructuredOutputGenerator tests
  'StructuredOutputGenerator.generate - Market insights': 'structured-output/generate-market.json',
};

async function updateCassetteUsage() {
  // Create a new cassette wrapper that uses predefined mappings
  const wrapperContent = `import { CassetteManager } from './cassette-manager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TestCassetteWrapper {
  constructor() {
    this.cassetteManager = new CassetteManager();
    this.testCassetteMap = ${JSON.stringify(testCassetteMap, null, 2)};
  }

  async init() {
    await this.cassetteManager.init();
  }

  async wrapTest(test) {
    if (test.cassette && this.testCassetteMap[test.name]) {
      const cassettePath = path.join(__dirname, '../cassettes', this.testCassetteMap[test.name]);
      
      return {
        ...test,
        fn: async () => {
          if (this.cassetteManager.mode === 'replay') {
            try {
              const cassette = await this.cassetteManager.loadCassette(cassettePath);
              if (cassette) {
                console.log(\`📼 Using cassette for: \${test.name}\`);
                // Mock the API response
                const originalFetch = global.fetch;
                global.fetch = async () => ({
                  ok: true,
                  json: async () => cassette.response
                });
                
                const result = await test.fn();
                global.fetch = originalFetch;
                return result;
              }
            } catch (e) {
              console.log(\`📼 No cassette found for: \${test.name}, running live\`);
            }
          }
          
          return test.fn();
        }
      };
    }
    
    return test;
  }
}
`;

  await fs.writeFile(
    path.join(__dirname, 'src/test-cassette-wrapper.js'),
    wrapperContent
  );
  
  console.log('✅ Created test cassette wrapper');
  console.log(`📼 Mapped ${Object.keys(testCassetteMap).length} tests to cassettes`);
}

updateCassetteUsage().catch(console.error);