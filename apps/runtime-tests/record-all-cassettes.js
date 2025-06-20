import { PersonaAI, PersonaBuilder, DistributionSelector, StructuredOutputGenerator, PersonaGroup } from '@jamesaphoenix/persona-sdk';
import { z } from 'zod';
import { CassetteManager } from './src/cassette-manager.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

async function recordAllCassettes() {
  const cassetteManager = new CassetteManager();
  await cassetteManager.init();
  
  console.log('🎬 Recording cassettes for all AI-powered features...\n');
  
  // Create directories
  const dirs = ['ai-features', 'distribution-selector', 'structured-output'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(__dirname, 'cassettes', dir), { recursive: true });
  }
  
  let recorded = 0;
  let failed = 0;
  
  // Record PersonaAI cassettes
  console.log('📁 Recording PersonaAI cassettes...');
  
  try {
    // fromPrompt - Basic
    await cassetteManager.record('PersonaAI.fromPrompt-basic', 
      ['Create a 35-year-old data scientist working at a tech startup in Austin'],
      async () => PersonaAI.fromPrompt(
        'Create a 35-year-old data scientist working at a tech startup in Austin',
        { apiKey: process.env.OPENAI_API_KEY }
      ),
      path.join(__dirname, 'cassettes/ai-features/PersonaAI-fromPrompt-basic.json')
    );
    recorded++;
  } catch (e) {
    console.error('Failed:', e.message);
    failed++;
  }
  
  try {
    // fromPrompt - Complex
    await cassetteManager.record('PersonaAI.fromPrompt-complex',
      ['Create a retired teacher in their 60s who loves gardening and lives in Vermont. Include hobbies, personality traits, and lifestyle details.'],
      async () => PersonaAI.fromPrompt(
        'Create a retired teacher in their 60s who loves gardening and lives in Vermont. Include hobbies, personality traits, and lifestyle details.',
        { apiKey: process.env.OPENAI_API_KEY }
      ),
      path.join(__dirname, 'cassettes/ai-features/PersonaAI-fromPrompt-complex.json')
    );
    recorded++;
  } catch (e) {
    console.error('Failed:', e.message);
    failed++;
  }
  
  try {
    // generateMultiple
    await cassetteManager.record('PersonaAI.generateMultiple',
      ['Create a diverse 5-person product team for a fintech startup', 5],
      async () => PersonaAI.generateMultiple(
        'Create a diverse 5-person product team for a fintech startup',
        5,
        { apiKey: process.env.OPENAI_API_KEY }
      ),
      path.join(__dirname, 'cassettes/ai-features/PersonaAI-generateMultiple.json')
    );
    recorded++;
  } catch (e) {
    console.error('Failed:', e.message);
    failed++;
  }
  
  try {
    // optimizePrompt
    await cassetteManager.record('PersonaAI.optimizePrompt',
      ['make a customer'],
      async () => PersonaAI.optimizePrompt(
        'make a customer',
        { apiKey: process.env.OPENAI_API_KEY }
      ),
      path.join(__dirname, 'cassettes/ai-features/PersonaAI-optimizePrompt.json')
    );
    recorded++;
  } catch (e) {
    console.error('Failed:', e.message);
    failed++;
  }
  
  try {
    // suggestAttributes
    await cassetteManager.record('PersonaAI.suggestAttributes-gaming',
      [{ industry: 'gaming', targetAudience: 'hardcore gamers', platform: 'PC' }],
      async () => PersonaAI.suggestAttributes(
        { industry: 'gaming', targetAudience: 'hardcore gamers', platform: 'PC' },
        { apiKey: process.env.OPENAI_API_KEY }
      ),
      path.join(__dirname, 'cassettes/ai-features/PersonaAI-suggestAttributes-gaming.json')
    );
    recorded++;
  } catch (e) {
    console.error('Failed:', e.message);
    failed++;
  }
  
  // Record DistributionSelector cassettes
  console.log('\n📁 Recording DistributionSelector cassettes...');
  
  const selector = new DistributionSelector(process.env.OPENAI_API_KEY);
  
  try {
    await cassetteManager.record('DistributionSelector.selectDistribution-age',
      [{ attribute: 'age', context: 'Working professionals in tech industry', constraints: { min: 22, max: 65 } }],
      async () => selector.selectDistribution({
        attribute: 'age',
        context: 'Working professionals in tech industry',
        constraints: { min: 22, max: 65 }
      }),
      path.join(__dirname, 'cassettes/distribution-selector/selectDistribution-age.json')
    );
    recorded++;
  } catch (e) {
    console.error('Failed:', e.message);
    failed++;
  }
  
  try {
    await cassetteManager.record('DistributionSelector.selectDistribution-occupation',
      [{ attribute: 'occupation', context: 'Tech company employees', constraints: { categories: ['engineer', 'designer', 'product_manager', 'data_scientist', 'marketing'] } }],
      async () => selector.selectDistribution({
        attribute: 'occupation',
        context: 'Tech company employees',
        constraints: { categories: ['engineer', 'designer', 'product_manager', 'data_scientist', 'marketing'] }
      }),
      path.join(__dirname, 'cassettes/distribution-selector/selectDistribution-occupation.json')
    );
    recorded++;
  } catch (e) {
    console.error('Failed:', e.message);
    failed++;
  }
  
  // Record StructuredOutputGenerator cassettes
  console.log('\n📁 Recording StructuredOutputGenerator cassettes...');
  
  const generator = new StructuredOutputGenerator(process.env.OPENAI_API_KEY);
  const testGroup = new PersonaGroup('Test Group');
  
  // Add some test personas
  for (let i = 0; i < 5; i++) {
    const persona = PersonaBuilder.create()
      .withName(`Person ${i + 1}`)
      .withAge(25 + i * 5)
      .withOccupation(['Engineer', 'Designer', 'Manager', 'Analyst', 'Developer'][i])
      .withSex(['male', 'female', 'other'][i % 3])
      .build();
    testGroup.add(persona);
  }
  
  try {
    const MarketInsightSchema = z.object({
      targetSegments: z.array(z.string()),
      keyPainPoints: z.array(z.string()),
      productOpportunities: z.array(z.string()),
      messagingRecommendations: z.object({
        primaryMessage: z.string(),
        supportingPoints: z.array(z.string())
      })
    });
    
    await cassetteManager.record('StructuredOutputGenerator.generate-market',
      [testGroup, MarketInsightSchema, 'Analyze this focus group for a new productivity SaaS product'],
      async () => generator.generate(
        testGroup,
        MarketInsightSchema,
        'Analyze this focus group for a new productivity SaaS product'
      ),
      path.join(__dirname, 'cassettes/structured-output/generate-market.json')
    );
    recorded++;
  } catch (e) {
    console.error('Failed:', e.message);
    failed++;
  }
  
  console.log(`\n✅ Recording complete!`);
  console.log(`📼 Recorded: ${recorded} cassettes`);
  console.log(`❌ Failed: ${failed} cassettes`);
  console.log(`\nCassettes saved to: ${path.join(__dirname, 'cassettes')}`);
}

recordAllCassettes().catch(console.error);