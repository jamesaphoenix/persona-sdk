/**
 * Example: Media processing and persona generation
 * 
 * This example demonstrates:
 * 1. Converting text posts to personas
 * 2. Processing images and files to generate personas
 * 3. Applying media diets to persona groups
 * 4. Token usage tracking and cost estimation
 */

import { 
  MediaToPersonaGenerator,
  MediaDietManager,
  MediaProcessor,
  PersonaGroup,
  DistributionSelectorLangChain
} from '@jamesaphoenix/persona-sdk';

// Initialize with API key
const API_KEY = process.env.OPENAI_API_KEY;

async function textToPersonaExample() {
  console.log('=== Text to Persona Example ===\n');
  
  const generator = new MediaToPersonaGenerator(API_KEY);
  
  // Example social media post
  const textPost = `
    Just finished my morning 5K run! 🏃‍♀️ Feeling energized for the day ahead. 
    Time to grab my usual oat milk latte and head to the co-working space. 
    Working on some exciting sustainability projects today. 
    Who else is passionate about green tech? #StartupLife #Sustainability #MorningRun
  `;
  
  // Generate persona from text
  const result = await generator.fromTextPost(textPost, {
    generateMultiple: true,
    count: 3,
    includeDistributions: true,
    focusAttributes: ['age', 'occupation', 'interests', 'values']
  });
  
  console.log('Generated Personas:');
  result.personas.forEach((persona, i) => {
    console.log(`\nPersona ${i + 1}: ${persona.name}`);
    console.log('Attributes:', persona.attributes);
  });
  
  console.log('\nAnalysis Confidence:', result.analysis.confidence);
  console.log('Reasoning:', result.analysis.reasoning);
  
  // Token usage and cost
  console.log('\nToken Usage:');
  console.log(`- Input tokens: ${result.usage.input_tokens}`);
  console.log(`- Output tokens: ${result.usage.output_tokens}`);
  console.log(`- Total tokens: ${result.usage.total_tokens}`);
  
  const processor = new MediaProcessor(API_KEY);
  const cost = processor.estimateCost(result.usage, 'gpt-4-turbo-preview');
  console.log(`\nEstimated Cost: $${cost.totalCost}`);
}

async function imageToPersonaExample() {
  console.log('\n\n=== Image to Persona Example ===\n');
  
  const generator = new MediaToPersonaGenerator(API_KEY);
  
  // Process an image (replace with actual image path)
  const imagePath = './examples/sample-image.jpg';
  
  try {
    const result = await generator.fromImage(imagePath);
    
    console.log('Generated Personas from Image:');
    result.personas.forEach((persona, i) => {
      console.log(`\nPersona ${i + 1}: ${persona.name}`);
      console.log('Attributes:', persona.attributes);
    });
    
    console.log('\nToken Usage:', result.usage);
  } catch (error) {
    console.log('Note: Replace with actual image path to test this feature');
  }
}

async function mediaDietExample() {
  console.log('\n\n=== Media Diet Example ===\n');
  
  const dietManager = new MediaDietManager(API_KEY);
  
  // Create a persona group
  const group = new PersonaGroup('Target Audience');
  
  // Generate some test personas
  const selector = new DistributionSelectorLangChain(API_KEY);
  const { distributions } = await selector.recommendDistributions(
    ['age', 'income', 'tech_savviness'],
    'Millennial professionals interested in sustainability'
  );
  
  group.generateFromDistributions(10, Object.fromEntries(distributions));
  
  // Create a media diet (using placeholder files)
  const mediaDiet = await dietManager.createMediaDiet([
    './examples/sustainability-article.txt',
    './examples/tech-blog-post.txt',
    './examples/fitness-video.mp4'
  ], {
    peakHours: [7, 8, 12, 20, 21],
    avgDailyConsumption: 150,
    platforms: ['mobile', 'laptop', 'smart-tv']
  });
  
  console.log('Media Diet Created:');
  console.log(`- Items: ${mediaDiet.items.length}`);
  console.log(`- Categories: ${mediaDiet.items.map(i => i.category).join(', ')}`);
  console.log(`- Preferred types: ${mediaDiet.patterns.preferredTypes.join(', ')}`);
  
  // Apply media diet to persona group
  const { influencedGroup, totalUsage } = await dietManager.applyToPersonaGroup(
    group,
    mediaDiet,
    {
      sampleSize: 5,
      variationFactor: 0.2
    }
  );
  
  console.log('\nInfluenced Personas:');
  const influenced = influencedGroup.getPersonas();
  influenced.slice(0, 3).forEach((persona, i) => {
    console.log(`\nPersona ${i + 1}: ${persona.name}`);
    console.log('New interests:', persona.attributes.interests);
    console.log('Vocabulary:', persona.attributes.vocabulary?.slice(0, 5));
  });
  
  console.log('\nTotal Token Usage for Media Diet Application:');
  console.log(totalUsage);
}

async function fileProcessingExample() {
  console.log('\n\n=== File Processing Example ===\n');
  
  const processor = new MediaProcessor(API_KEY);
  
  // Example: Process a URL
  const url = 'https://example.com/article.html';
  
  try {
    const media = await processor.processFile(url);
    console.log('Processed Media:');
    console.log(`- Type: ${media.type}`);
    console.log(`- MIME Type: ${media.mimeType}`);
    console.log(`- Size: ${media.metadata?.size} bytes`);
    
    // Convert to chat messages
    const messages = await processor.mediaToMessages(media, 
      'Extract key insights and author perspective from this article'
    );
    
    console.log('\nGenerated Messages:', messages.length);
    
    // Analyze for persona
    const result = await processor.analyzeMediaForPersona(media);
    console.log('\nPersona Analysis:', result.analysis.substring(0, 200) + '...');
    console.log('Token Usage:', result.usage);
    
  } catch (error) {
    console.log('Note: Replace with actual URL to test this feature');
  }
}

async function distributionSelectorExample() {
  console.log('\n\n=== LangChain Distribution Selector Example ===\n');
  
  const selector = new DistributionSelectorLangChain(API_KEY);
  
  // Select distribution for a single attribute
  const { distribution, usage, reasoning } = await selector.selectDistribution({
    attribute: 'annual_income',
    context: 'Tech professionals in Silicon Valley',
    constraints: { min: 50000, max: 500000 }
  });
  
  console.log('Selected Distribution:', distribution.constructor.name);
  console.log('Parameters:', distribution);
  console.log('Reasoning:', reasoning);
  console.log('Token Usage:', usage);
  
  // Generate some samples
  console.log('\nSample values:');
  for (let i = 0; i < 5; i++) {
    console.log(`- $${Math.round(distribution.sample()).toLocaleString()}`);
  }
  
  // Create distribution from natural language
  const { distribution: nlDist, interpretation } = await selector.fromDescription(
    'mostly young adults with a few middle-aged outliers'
  );
  
  console.log('\nNatural Language Distribution:');
  console.log('Interpretation:', interpretation);
  console.log('Sample ages:', Array.from({ length: 5 }, () => Math.round(nlDist.sample())));
}

async function costEstimationExample() {
  console.log('\n\n=== Cost Estimation Example ===\n');
  
  const generator = new MediaToPersonaGenerator(API_KEY);
  const selector = new DistributionSelectorLangChain(API_KEY);
  
  // Estimate costs for different operations
  console.log('Cost Estimates:');
  
  // Media processing
  const mediaCost = generator.estimateProcessingCost(10, ['text', 'image', 'image'], 'gpt-4-turbo-preview');
  console.log(`\n10 media files (mixed types):`);
  console.log(`- Estimated tokens: ${mediaCost.estimatedTokens}`);
  console.log(`- Estimated cost: $${mediaCost.estimatedCost}`);
  
  // Distribution selection
  const distCost = selector.estimateCost(20, 'gpt-4-turbo-preview');
  console.log(`\n20 attribute distributions:`);
  console.log(`- Estimated tokens: ${distCost.estimatedTokens}`);
  console.log(`- Estimated cost: $${distCost.estimatedCost}`);
}

// Run all examples
async function runExamples() {
  try {
    await textToPersonaExample();
    await imageToPersonaExample();
    await mediaDietExample();
    await fileProcessingExample();
    await distributionSelectorExample();
    await costEstimationExample();
  } catch (error) {
    console.error('Error running examples:', error);
    console.log('\nMake sure to set OPENAI_API_KEY environment variable');
  }
}

// Run if called directly
if (require.main === module) {
  runExamples();
}