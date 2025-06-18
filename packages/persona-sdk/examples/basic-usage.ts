import { 
  Persona, 
  PersonaGroup, 
  NormalDistribution, 
  UniformDistribution,
  CategoricalDistribution,
  ExponentialDistribution,
  BetaDistribution,
  StructuredOutputGenerator
} from '../src';
import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Basic Usage Examples for @jamesaphoenix/persona-sdk
 */

async function basicPersonaCreation() {
  console.log('=== Basic Persona Creation ===\n');
  
  // Create a single persona manually
  const john = new Persona('John Doe', {
    age: 35,
    income: 75000,
    interests: ['technology', 'fitness'],
    role: 'Software Engineer'
  });
  
  console.log('Created persona:', john.toObject());
}

async function distributionBasedGeneration() {
  console.log('\n=== Distribution-Based Generation ===\n');
  
  // Define distributions for different attributes
  const distributions = {
    age: new NormalDistribution(35, 10),
    income: new NormalDistribution(75000, 20000),
    yearsExperience: new ExponentialDistribution(0.2),
    satisfactionScore: new UniformDistribution(1, 10),
    successRate: new BetaDistribution(2, 5), // Skewed towards lower values
    department: new CategoricalDistribution([
      { value: 'Engineering', probability: 0.4 },
      { value: 'Marketing', probability: 0.2 },
      { value: 'Sales', probability: 0.2 },
      { value: 'HR', probability: 0.1 },
      { value: 'Finance', probability: 0.1 }
    ])
  };
  
  // Generate a single persona
  const alice = Persona.fromDistributions('Alice Smith', distributions);
  console.log('Generated persona:', alice.toObject());
  
  // Generate multiple personas
  const employees = Persona.generateMany('Employee', 5, distributions);
  console.log('\nGenerated 5 employees:');
  employees.forEach(emp => {
    console.log(`- ${emp.name}: age=${Math.round(emp.attributes.age as number)}, dept=${emp.attributes.department}`);
  });
}

async function personaGroupManagement() {
  console.log('\n=== PersonaGroup Management ===\n');
  
  // Create a persona group
  const techTeam = new PersonaGroup('Tech Team', [], {
    maxSize: 50,
    defaultDistributions: {
      age: new NormalDistribution(30, 8),
      yearsAtCompany: new ExponentialDistribution(0.3),
      skillLevel: new UniformDistribution(1, 10)
    }
  });
  
  // Generate personas using default distributions
  techTeam.generateFromDistributions(20);
  
  console.log(`Created group: ${techTeam.name} with ${techTeam.size} members`);
  
  // Get statistics
  const ageStats = techTeam.getStatistics('age');
  console.log('\nAge statistics:');
  console.log(`- Mean: ${ageStats.mean?.toFixed(1)}`);
  console.log(`- Min: ${ageStats.min}`);
  console.log(`- Max: ${ageStats.max}`);
  console.log(`- Std Dev: ${ageStats.stdDev?.toFixed(1)}`);
  
  // Filter personas
  const seniors = techTeam.filter(p => (p.attributes.age as number) > 35);
  console.log(`\nFound ${seniors.length} team members over 35`);
  
  // Get group summary
  const summary = techTeam.getSummary();
  console.log('\nGroup summary:', {
    ...summary,
    personas: undefined // Don't log all personas
  });
}

async function aiPoweredInsights() {
  console.log('\n=== AI-Powered Insights ===\n');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('Skipping AI examples - OPENAI_API_KEY not set');
    return;
  }
  
  // Create a diverse customer group
  const customerGroup = new PersonaGroup('Premium Customers');
  
  const customerDistributions = {
    age: new NormalDistribution(42, 12),
    annualSpend: new ExponentialDistribution(0.00005), // Average $20k
    loyaltyYears: new UniformDistribution(1, 10),
    satisfactionScore: new BetaDistribution(4, 2), // Skewed high
    preferredChannel: new CategoricalDistribution([
      { value: 'Online', probability: 0.5 },
      { value: 'In-Store', probability: 0.3 },
      { value: 'Mobile', probability: 0.2 }
    ])
  };
  
  customerGroup.generateFromDistributions(50, customerDistributions);
  
  // Use structured output generator
  const generator = new StructuredOutputGenerator();
  
  // Generate distribution insights
  console.log('Generating distribution insights...');
  const insights = await generator.generateDistributionInsights(
    customerGroup,
    ['age', 'annualSpend', 'loyaltyYears']
  );
  
  console.log('\nDistribution recommendations:');
  insights.data.distributions.forEach(dist => {
    console.log(`\n${dist.attribute}:`);
    console.log(`- Suggested: ${dist.suggestedDistribution}`);
    console.log(`- Parameters: ${JSON.stringify(dist.parameters)}`);
    console.log(`- Reasoning: ${dist.reasoning}`);
  });
  
  console.log('\nSummary:', insights.data.summary);
  console.log('\nRecommendations:');
  insights.data.recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });
}

async function customStructuredOutput() {
  console.log('\n=== Custom Structured Output ===\n');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('Skipping - OPENAI_API_KEY not set');
    return;
  }
  
  // Create a product user group
  const userGroup = new PersonaGroup('SaaS Product Users');
  
  const userDistributions = {
    companySize: new CategoricalDistribution([
      { value: 'Startup', probability: 0.3 },
      { value: 'SMB', probability: 0.4 },
      { value: 'Enterprise', probability: 0.3 }
    ]),
    monthlyUsage: new ExponentialDistribution(0.01), // Average 100 hours
    featureAdoption: new BetaDistribution(3, 2), // 0-1 scale
    npsScore: new UniformDistribution(6, 10)
  };
  
  userGroup.generateFromDistributions(30, userDistributions);
  
  // Define custom schema for product insights
  const ProductInsightsSchema = z.object({
    userSegments: z.array(z.object({
      name: z.string(),
      characteristics: z.array(z.string()),
      needsAndPainPoints: z.array(z.string())
    })),
    featureRecommendations: z.array(z.object({
      feature: z.string(),
      targetSegment: z.string(),
      expectedImpact: z.string()
    })),
    churnRiskFactors: z.array(z.string()),
    growthOpportunities: z.array(z.string())
  });
  
  console.log('Generating product insights...');
  const productInsights = await userGroup.generateStructuredOutput(
    ProductInsightsSchema,
    'Analyze this user group and provide product strategy insights including user segments, feature recommendations, churn risks, and growth opportunities.'
  );
  
  console.log('\nUser Segments:');
  productInsights.data.userSegments.forEach(segment => {
    console.log(`\n${segment.name}:`);
    console.log('Characteristics:', segment.characteristics);
    console.log('Needs & Pain Points:', segment.needsAndPainPoints);
  });
  
  console.log('\nFeature Recommendations:');
  productInsights.data.featureRecommendations.forEach(rec => {
    console.log(`- ${rec.feature} for ${rec.targetSegment}: ${rec.expectedImpact}`);
  });
}

async function marketSegmentation() {
  console.log('\n=== Market Segmentation ===\n');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('Skipping - OPENAI_API_KEY not set');
    return;
  }
  
  // Create a large, diverse customer base
  const marketGroup = new PersonaGroup('Total Market');
  
  const marketDistributions = {
    age: new NormalDistribution(38, 15),
    income: new ExponentialDistribution(0.00002), // Long tail
    urbanicity: new CategoricalDistribution([
      { value: 'Urban', probability: 0.4 },
      { value: 'Suburban', probability: 0.4 },
      { value: 'Rural', probability: 0.2 }
    ]),
    techSavvy: new BetaDistribution(2, 3), // 0-1 scale, skewed low
    brandLoyalty: new UniformDistribution(1, 5)
  };
  
  marketGroup.generateFromDistributions(100, marketDistributions);
  
  const generator = new StructuredOutputGenerator();
  
  console.log('Generating market segments...');
  const segments = await generator.generateSegments(marketGroup, 4);
  
  console.log('\nMarket Segments:');
  segments.data.segments.forEach((segment, i) => {
    console.log(`\n${i + 1}. ${segment.name} (Size: ${segment.size})`);
    console.log(`   ${segment.description}`);
    console.log('   Key Characteristics:', segment.keyCharacteristics);
    console.log('   Typical Persona:', segment.typicalPersona.attributes);
  });
  
  console.log('\nSegmentation Strategy:', segments.data.segmentationStrategy);
  console.log('\nKey Insights:');
  segments.data.insights.forEach((insight, i) => {
    console.log(`${i + 1}. ${insight}`);
  });
}

// Run all examples
async function runExamples() {
  try {
    await basicPersonaCreation();
    await distributionBasedGeneration();
    await personaGroupManagement();
    await aiPoweredInsights();
    await customStructuredOutput();
    await marketSegmentation();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Execute if running directly
if (require.main === module) {
  runExamples();
}