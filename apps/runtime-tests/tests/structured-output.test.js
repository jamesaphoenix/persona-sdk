import * as PersonaSDK from '@jamesaphoenix/persona-sdk';
import { z } from 'zod';

const { StructuredOutputGenerator, PersonaGroup, PersonaBuilder } = PersonaSDK;

// Helper function to create test persona groups
function createTestPersonaGroup(name, size = 5) {
  const group = new PersonaGroup(name);
  
  const occupations = ['Engineer', 'Designer', 'Manager', 'Analyst', 'Developer'];
  const locations = ['New York', 'San Francisco', 'Austin', 'Seattle', 'Boston'];
  
  for (let i = 0; i < size; i++) {
    const persona = PersonaBuilder.create()
      .withName(`Test Person ${i + 1}`)
      .withAge(25 + Math.floor(Math.random() * 20))
      .withOccupation(occupations[i % occupations.length])
      .withSex(['male', 'female', 'other'][Math.floor(Math.random() * 3)])
      .withAttribute('location', locations[i % locations.length])
      .withAttribute('experience_years', 1 + Math.floor(Math.random() * 10))
      .withAttribute('interests', ['tech', 'travel', 'fitness', 'reading'].slice(0, 2 + Math.floor(Math.random() * 2)))
      .build();
    
    group.add(persona);
  }
  
  return group;
}

export const structuredOutputTests = [
  // Basic structured output generation
  {
    name: 'StructuredOutputGenerator.generate - Market insights',
    category: 'Structured Output',
    cassette: true,
    fn: async () => {
      const generator = new StructuredOutputGenerator(
        process.env.OPENAI_API_KEY || 'test-key'
      );
      
      const group = createTestPersonaGroup('Tech Professionals', 10);
      
      const MarketInsightSchema = z.object({
        targetSegments: z.array(z.string()),
        keyPainPoints: z.array(z.string()),
        productOpportunities: z.array(z.string()),
        messagingRecommendations: z.object({
          primaryMessage: z.string(),
          supportingPoints: z.array(z.string())
        })
      });
      
      const output = await generator.generate(
        group,
        MarketInsightSchema,
        'Analyze this focus group for a new productivity SaaS product'
      );
      
      if (!output.data || !output.metadata) {
        throw new Error('Should return structured output with data and metadata');
      }
      
      if (output.data.targetSegments.length < 2) {
        throw new Error('Should identify multiple target segments');
      }
      
      if (output.data.keyPainPoints.length < 3) {
        throw new Error('Should identify several pain points');
      }
      
      return { success: true, output };
    }
  },

  {
    name: 'StructuredOutputGenerator.generateDistributionInsights - Auto insights',
    category: 'Structured Output',
    cassette: true,
    fn: async () => {
      const generator = new StructuredOutputGenerator(
        process.env.OPENAI_API_KEY || 'test-key'
      );
      
      const group = createTestPersonaGroup('Diverse Professionals', 8);
      
      const insights = await generator.generateDistributionInsights(
        group,
        ['age', 'occupation', 'location', 'experience_years']
      );
      
      if (!insights.data) {
        throw new Error('Should generate insights');
      }
      
      // Verify insights structure
      if (!Array.isArray(insights.data.distributions)) {
        throw new Error('Should include distribution recommendations');
      }
      
      if (!insights.data.summary) {
        throw new Error('Should include summary');
      }
      
      if (!Array.isArray(insights.data.recommendations)) {
        throw new Error('Should include recommendations');
      }
      
      return { success: true, insights };
    }
  },

  {
    name: 'StructuredOutputGenerator.generateSegments - Customer segments',
    category: 'Structured Output',
    cassette: true,
    fn: async () => {
      const generator = new StructuredOutputGenerator(
        process.env.OPENAI_API_KEY || 'test-key'
      );
      
      // Create diverse group for segmentation
      const group = new PersonaGroup('Customer Base');
      
      // Add varied personas
      for (let i = 0; i < 15; i++) {
        const age = 20 + Math.floor(Math.random() * 40);
        const isHighValue = Math.random() > 0.7;
        
        const persona = PersonaBuilder.create()
          .withName(`Customer ${i + 1}`)
          .withAge(age)
          .withOccupation(['Student', 'Professional', 'Executive', 'Freelancer'][Math.floor(Math.random() * 4)])
          .withSex(['male', 'female', 'other'][Math.floor(Math.random() * 3)])
          .withAttribute('spending_tier', isHighValue ? 'premium' : 'standard')
          .withAttribute('engagement_level', ['high', 'medium', 'low'][Math.floor(Math.random() * 3)])
          .withAttribute('tenure_months', Math.floor(Math.random() * 36))
          .build();
        
        group.add(persona);
      }
      
      const segmentation = await generator.generateSegments(
        group,
        4 // Request 4 segments
      );
      
      if (!segmentation.data || !segmentation.data.segments) {
        throw new Error('Should return segmentation data');
      }
      
      if (segmentation.data.segments.length !== 4) {
        throw new Error(`Expected 4 segments, got ${segmentation.data.segments.length}`);
      }
      
      // Each segment should have required fields
      for (const segment of segmentation.data.segments) {
        if (!segment.name || !segment.description || !segment.keyCharacteristics) {
          throw new Error('Each segment should have name, description, and keyCharacteristics');
        }
        
        if (typeof segment.size !== 'number' || segment.size <= 0) {
          throw new Error('Each segment should have a positive size');
        }
      }
      
      return { success: true, segmentation };
    }
  },

  // Custom schema tests
  {
    name: 'StructuredOutputGenerator.generateCustom - Product feedback',
    category: 'Structured Output',
    cassette: true,
    fn: async () => {
      const generator = new StructuredOutputGenerator(
        process.env.OPENAI_API_KEY || 'test-key'
      );
      
      const group = createTestPersonaGroup('Beta Testers', 6);
      
      const FeedbackSchema = z.object({
        overallSentiment: z.enum(['positive', 'neutral', 'negative']),
        featureRequests: z.array(z.object({
          feature: z.string(),
          priority: z.enum(['high', 'medium', 'low']),
          rationale: z.string()
        })),
        usabilityIssues: z.array(z.string()),
        competitorComparisons: z.array(z.object({
          competitor: z.string(),
          advantage: z.string(),
          disadvantage: z.string()
        })),
        netPromoterScore: z.number().min(-100).max(100)
      });
      
      const feedback = await generator.generateCustom(
        group,
        FeedbackSchema,
        'Analyze beta tester feedback for our project management tool'
      );
      
      if (!feedback.data) {
        throw new Error('Should generate feedback data');
      }
      
      if (feedback.data.featureRequests.length < 2) {
        throw new Error('Should suggest multiple feature requests');
      }
      
      if (typeof feedback.data.netPromoterScore !== 'number') {
        throw new Error('Should include NPS score');
      }
      
      return { success: true, feedback };
    }
  },

  {
    name: 'StructuredOutputGenerator.generateCustom - Campaign strategy',
    category: 'Structured Output',
    cassette: true,
    fn: async () => {
      const generator = new StructuredOutputGenerator(
        process.env.OPENAI_API_KEY || 'test-key',
        'gpt-4.1-mini',
        'You are a marketing strategist analyzing focus group data'
      );
      
      const group = createTestPersonaGroup('Target Audience', 12);
      
      const CampaignSchema = z.object({
        campaignTheme: z.string(),
        targetChannels: z.array(z.object({
          channel: z.string(),
          rationale: z.string(),
          estimatedReach: z.enum(['high', 'medium', 'low'])
        })),
        contentPillars: z.array(z.object({
          topic: z.string(),
          angle: z.string(),
          format: z.enum(['video', 'blog', 'infographic', 'podcast', 'social'])
        })),
        keyMessages: z.array(z.string()).min(3).max(5),
        callToAction: z.object({
          primary: z.string(),
          secondary: z.string()
        }),
        expectedChallenges: z.array(z.string()),
        successMetrics: z.array(z.object({
          metric: z.string(),
          target: z.string(),
          timeframe: z.string()
        }))
      });
      
      const campaign = await generator.generateCustom(
        group,
        CampaignSchema,
        'Create a comprehensive marketing campaign strategy for launching our AI-powered analytics platform'
      );
      
      if (!campaign.data.targetChannels || campaign.data.targetChannels.length < 3) {
        throw new Error('Should recommend multiple marketing channels');
      }
      
      if (!campaign.data.contentPillars || campaign.data.contentPillars.length < 3) {
        throw new Error('Should define content pillars');
      }
      
      return { success: true, campaign };
    }
  },

  // Different model and temperature tests
  {
    name: 'StructuredOutputGenerator - High temperature creative output',
    category: 'Structured Output',
    cassette: true,
    fn: async () => {
      const generator = new StructuredOutputGenerator(
        process.env.OPENAI_API_KEY || 'test-key',
        'gpt-4.1-mini',
        undefined,
        0.9 // High temperature for creativity
      );
      
      const group = createTestPersonaGroup('Creative Team', 5);
      
      const CreativeSchema = z.object({
        brandPersonality: z.object({
          traits: z.array(z.string()).min(5),
          voice: z.string(),
          tone: z.array(z.string())
        }),
        visualDirection: z.object({
          colors: z.array(z.string()),
          style: z.string(),
          mood: z.string()
        }),
        taglineOptions: z.array(z.string()).min(5).max(10),
        creativeThemes: z.array(z.object({
          theme: z.string(),
          description: z.string(),
          applications: z.array(z.string())
        }))
      });
      
      const creative = await generator.generateCustom(
        group,
        CreativeSchema,
        'Generate creative direction for a new lifestyle brand targeting young professionals'
      );
      
      if (creative.data.taglineOptions.length < 5) {
        throw new Error('High temperature should generate diverse taglines');
      }
      
      // Check for creativity/diversity in output
      const uniqueTaglines = new Set(creative.data.taglineOptions);
      if (uniqueTaglines.size < creative.data.taglineOptions.length * 0.8) {
        throw new Error('Taglines should be diverse and unique');
      }
      
      return { success: true, creative };
    }
  },

  // Error handling and edge cases
  {
    name: 'StructuredOutputGenerator - Empty persona group handling',
    category: 'Structured Output',
    cassette: true,
    fn: async () => {
      const generator = new StructuredOutputGenerator(
        process.env.OPENAI_API_KEY || 'test-key'
      );
      
      const emptyGroup = new PersonaGroup('Empty Group');
      
      try {
        const insights = await generator.generateDistributionInsights(
          emptyGroup,
          ['age', 'occupation']
        );
        
        // Should still generate some output based on group metadata
        if (!insights.data) {
          throw new Error('Should handle empty groups gracefully');
        }
        
        return { success: true, insights };
      } catch (error) {
        // Acceptable if it throws a meaningful error
        if (error.message.includes('empty') || error.message.includes('no personas')) {
          return { success: true, handledGracefully: true };
        }
        throw error;
      }
    }
  },

  // Complex multi-step analysis
  {
    name: 'StructuredOutputGenerator - Multi-phase analysis workflow',
    category: 'Structured Output',
    cassette: true,
    fn: async () => {
      const generator = new StructuredOutputGenerator(
        process.env.OPENAI_API_KEY || 'test-key'
      );
      
      const group = createTestPersonaGroup('Research Participants', 20);
      
      // Phase 1: Initial insights
      const insights = await generator.generateDistributionInsights(
        group,
        ['age', 'occupation', 'location', 'experience_years']
      );
      
      // Phase 2: Detailed segmentation
      const segments = await generator.generateSegments(group, 3);
      
      // Phase 3: Custom analysis based on segments
      const DetailedAnalysisSchema = z.object({
        segmentProfiles: z.array(z.object({
          segmentName: z.string(),
          coreNeeds: z.array(z.string()),
          preferredFeatures: z.array(z.string()),
          pricingSensitivity: z.enum(['high', 'medium', 'low']),
          adoptionLikelihood: z.number().min(0).max(1)
        })),
        crossSegmentInsights: z.union([z.string(), z.array(z.string())]).transform(val => 
          typeof val === 'string' ? [val] : val
        ),
        productRoadmapSuggestions: z.array(z.object({
          feature: z.string(),
          targetSegments: z.array(z.string()),
          priority: z.number().min(1).max(10),
          estimatedImpact: z.enum(['high', 'medium', 'low'])
        }))
      });
      
      const detailedAnalysis = await generator.generateCustom(
        group,
        DetailedAnalysisSchema,
        `Based on these segments: ${JSON.stringify(segments.data.segments.map(s => s.name))}, provide detailed product strategy`
      );
      
      if (!insights.data || !segments.data || !detailedAnalysis.data) {
        throw new Error('All analysis phases should complete');
      }
      
      if (detailedAnalysis.data.segmentProfiles.length !== 3) {
        throw new Error('Should analyze all 3 segments');
      }
      
      return { 
        success: true, 
        workflow: {
          insightsGenerated: !!insights.data,
          segmentsFound: segments.data.segments.length,
          detailedProfilesCreated: detailedAnalysis.data.segmentProfiles.length,
          roadmapItemssuggested: detailedAnalysis.data.productRoadmapSuggestions.length
        }
      };
    }
  }
];