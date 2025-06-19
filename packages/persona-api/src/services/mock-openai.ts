import type { PersonaGroup } from '@jamesaphoenix/persona-sdk';
import type { ZodType } from 'zod';

/**
 * Mock OpenAI service for testing
 * Returns realistic but deterministic responses
 */
export class MockOpenAIService {
  async generateCustom<T = any>(
    group: PersonaGroup,
    schema: ZodType<T>,
    prompt: string
  ): Promise<{ data: T; metadata: any }> {
    // Parse the schema to understand what to generate
    const schemaShape = this.extractSchemaShape(schema);
    
    // Generate mock data based on prompt and schema
    const mockData = this.generateMockData(prompt, schemaShape, group.size);
    
    // Ensure the mock data matches the schema
    let data;
    try {
      data = schema.parse(mockData);
    } catch (error) {
      // If parsing fails, return a generic response that should match most schemas
      const genericData = {
        insights: mockData,
        recommendations: mockData.recommendations || ['Recommendation 1', 'Recommendation 2'],
        confidence: mockData.confidence || 'high',
      };
      data = schema.parse(genericData);
    }
    
    return {
      data,
      metadata: {
        model: 'mock-gpt-4',
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
      },
    };
  }

  async generateSegments(group: PersonaGroup, segmentCount: number = 3) {
    const segments = [];
    const segmentSize = Math.floor(group.size / segmentCount);
    
    const segmentNames = [
      'Power Users',
      'Regular Users',
      'Casual Users',
      'Enterprise Users',
      'Small Business',
    ];
    
    for (let i = 0; i < segmentCount; i++) {
      segments.push({
        name: segmentNames[i] || `Segment ${i + 1}`,
        size: i === segmentCount - 1 
          ? group.size - (segmentSize * (segmentCount - 1))
          : segmentSize,
        keyCharacteristics: [
          `High ${i === 0 ? 'engagement' : 'potential'}`,
          `${i === 0 ? 'Early' : i === 1 ? 'Mainstream' : 'Late'} adopters`,
          `${i === 0 ? 'Premium' : i === 1 ? 'Standard' : 'Budget'} focused`,
        ],
        typicalPersona: {
          attributes: {
            engagement_level: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
            budget: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
            adoption_stage: i === 0 ? 'early' : i === 1 ? 'mainstream' : 'late',
          },
        },
      });
    }
    
    return {
      data: {
        segments,
        segmentationStrategy: 'Behavioral and demographic clustering',
        insights: [
          'Clear distinction between power users and casual users',
          'Opportunity to convert regular users to power users',
          'Casual users need simplified onboarding',
        ],
      },
    };
  }

  async generateDistributionInsights(group: PersonaGroup, attributes: string[]) {
    const distributions = attributes.map(attr => ({
      attribute: attr,
      suggestedDistribution: 'normal',
      parameters: {
        mean: 50,
        stdDev: 15,
      },
      reasoning: `${attr} follows a normal distribution based on population analysis`,
    }));
    
    return {
      data: {
        distributions,
        summary: 'Normal distributions recommended for most attributes',
        recommendations: [
          'Use correlated distributions for related attributes',
          'Consider beta distribution for probability-based attributes',
          'Apply exponential distribution for time-based metrics',
        ],
      },
    };
  }

  private extractSchemaShape(schema: any): any {
    // Simplified schema extraction for mocking
    try {
      // For Zod schemas, check for shape property
      if (schema._def?.typeName === 'ZodObject') {
        return schema._def?.shape || {};
      }
      // For nested schemas
      if (schema._def?.innerType?._def?.typeName === 'ZodObject') {
        return schema._def?.innerType?._def?.shape || {};
      }
      // For schemas with shape as a function
      if (typeof schema._def?.shape === 'function') {
        return schema._def.shape() || {};
      }
      return {};
    } catch {
      return {};
    }
  }

  private generateMockData(prompt: string, schemaShape: any, groupSize: number): any {
    const promptLower = prompt.toLowerCase();
    
    // Market insights
    if (promptLower.includes('market')) {
      return {
        target_segments: [
          {
            name: 'Early Adopters',
            size_percentage: 15,
            key_characteristics: ['Tech-savvy', 'High income', 'Risk-tolerant'],
          },
          {
            name: 'Mainstream Market',
            size_percentage: 60,
            key_characteristics: ['Price-conscious', 'Feature-focused', 'Social proof'],
          },
          {
            name: 'Laggards',
            size_percentage: 25,
            key_characteristics: ['Traditional', 'Support-focused', 'Risk-averse'],
          },
        ],
        opportunities: [
          'Untapped SMB market segment',
          'Mobile-first approach for younger demographics',
          'Partnership opportunities with complementary services',
        ],
        challenges: [
          'High competition in enterprise segment',
          'Price sensitivity in SMB market',
          'Brand awareness needs improvement',
        ],
        recommendations: [
          'Focus on product differentiation',
          'Implement freemium model for market penetration',
          'Invest in content marketing and SEO',
        ],
      };
    }
    
    // Content performance
    if (promptLower.includes('content') || promptLower.includes('ctr')) {
      return {
        predictions: {
          ctr: 0.127,
          engagement_rate: 0.234,
          conversion_rate: 0.045,
          viral_probability: 0.73,
          sentiment: 0.82,
        },
        confidence_intervals: {
          ctr: { lower: 0.11, upper: 0.14 },
          engagement_rate: { lower: 0.20, upper: 0.27 },
          conversion_rate: { lower: 0.03, upper: 0.06 },
          viral_probability: { lower: 0.65, upper: 0.81 },
          sentiment: { lower: 0.75, upper: 0.89 },
        },
        predicted_ctr: 0.127,
        engagement_score: 8.5,
        viral_potential: 'high',
        best_channels: ['LinkedIn', 'Twitter', 'Reddit'],
        optimization_tips: [
          'Add numbers to headline for 23% CTR boost',
          'Include a question to increase engagement',
          'Post on Tuesday morning for maximum reach',
        ],
        recommendations: [
          'A/B test different headlines',
          'Add social proof to increase trust',
          'Use video format for higher engagement',
        ],
        key_insights: [
          'Technical audience responds well to data-driven content',
          'Controversial angles drive higher engagement',
          'Visual content performs 40% better',
        ],
      };
    }
    
    // Pricing sensitivity
    if (promptLower.includes('pricing') || promptLower.includes('price')) {
      return {
        optimal_price_point: 49.99,
        price_elasticity: -1.8,
        willingness_to_pay: {
          min: 29.99,
          max: 99.99,
          average: 49.99,
        },
        pricing_tiers: [
          {
            name: 'Starter',
            price: 29.99,
            target_segment: 'Small teams',
            features: ['Basic features', '5 users', 'Email support'],
          },
          {
            name: 'Professional',
            price: 79.99,
            target_segment: 'Growing companies',
            features: ['All features', '50 users', 'Priority support', 'API access'],
          },
          {
            name: 'Enterprise',
            price: 199.99,
            target_segment: 'Large organizations',
            features: ['Custom features', 'Unlimited users', 'Dedicated support', 'SLA'],
          },
        ],
      };
    }
    
    // Quick insights
    if (promptLower.includes('?') || schemaShape.answer) {
      return {
        answer: `Based on analyzing ${groupSize} personas, the key insight is that 73% show high interest in productivity features, particularly automation and AI-powered tools. The primary driver is time savings, with an average expected ROI of 3.2x.`,
        confidence: 'high',
        supporting_data: [
          '73% of personas prioritize time-saving features',
          'Average willingness to pay: $49/month',
          'Expected adoption rate: 34% in first 90 days',
        ],
      };
    }
    
    // Custom analysis or default response
    if (promptLower.includes('features') || promptLower.includes('custom')) {
      return {
        insights: {
          top_features: [
            'AI-powered automation',
            'Real-time collaboration tools',
            'Advanced analytics dashboard'
          ],
          reasoning: 'Based on the technical background and productivity focus of the personas',
        },
        recommendations: ['Focus on AI features', 'Prioritize collaboration tools'],
        confidence: 'high',
      };
    }
    
    // Default response
    return {
      insights: {
        summary: 'Test insights generated successfully',
        key_findings: ['Finding 1', 'Finding 2', 'Finding 3'],
      },
      recommendations: ['Recommendation 1', 'Recommendation 2'],
      confidence: 'high',
    };
  }
}