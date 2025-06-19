import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { PersonaGroup, StructuredOutputGenerator } from '@jamesaphoenix/persona-sdk';
import { isTestMode } from '../utils/config.js';
import { MockOpenAIService } from '../services/mock-openai.js';

// Request schemas
const analyzeRequestSchema = z.object({
  personas: z.array(z.object({
    id: z.string(),
    name: z.string(),
    attributes: z.record(z.any()),
  })).min(1).max(10000),
  analysis_type: z.enum([
    'market_insights',
    'content_performance',
    'user_behavior',
    'feature_preferences',
    'pricing_sensitivity',
    'custom'
  ]),
  custom_prompt: z.string().optional(),
  output_schema: z.record(z.any()).optional(),
});

const predictRequestSchema = z.object({
  personas: z.array(z.object({
    id: z.string(),
    name: z.string(),
    attributes: z.record(z.any()),
  })).min(1).max(10000),
  content: z.object({
    title: z.string(),
    type: z.enum(['blog', 'video', 'social', 'email', 'landing_page']),
    description: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  metrics: z.array(z.enum([
    'ctr',
    'engagement_rate',
    'conversion_rate',
    'viral_probability',
    'sentiment'
  ])).default(['ctr', 'engagement_rate']),
});

const segmentRequestSchema = z.object({
  personas: z.array(z.object({
    id: z.string(),
    name: z.string(),
    attributes: z.record(z.any()),
  })).min(10).max(10000),
  segment_count: z.number().int().min(2).max(10).default(3),
  segment_by: z.array(z.string()).optional(),
});

// Response schemas
const insightResponseSchema = z.object({
  analysis_id: z.string(),
  type: z.string(),
  insights: z.record(z.any()),
  metadata: z.object({
    persona_count: z.number(),
    generated_at: z.string(),
    model: z.string(),
  }),
});

const predictionResponseSchema = z.object({
  prediction_id: z.string(),
  content: z.record(z.any()),
  predictions: z.record(z.number()),
  confidence_intervals: z.record(z.object({
    lower: z.number(),
    upper: z.number(),
  })).optional(),
  recommendations: z.array(z.string()),
  metadata: z.object({
    persona_count: z.number(),
    generated_at: z.string(),
    model: z.string(),
  }),
});

const segmentResponseSchema = z.object({
  segmentation_id: z.string(),
  segments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    percentage: z.number(),
    characteristics: z.array(z.string()),
    typical_persona: z.record(z.any()),
  })),
  insights: z.array(z.string()),
  metadata: z.object({
    persona_count: z.number(),
    segment_count: z.number(),
    generated_at: z.string(),
    model: z.string(),
  }),
});

// Pre-defined analysis schemas
const analysisSchemas = {
  market_insights: z.object({
    target_segments: z.array(z.object({
      name: z.string(),
      size_percentage: z.number(),
      key_characteristics: z.array(z.string()),
    })),
    opportunities: z.array(z.string()),
    challenges: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  
  content_performance: z.object({
    predicted_ctr: z.number(),
    engagement_score: z.number(),
    viral_potential: z.enum(['low', 'medium', 'high', 'very_high']),
    best_channels: z.array(z.string()),
    optimization_tips: z.array(z.string()),
  }),
  
  user_behavior: z.object({
    usage_patterns: z.array(z.object({
      pattern: z.string(),
      frequency: z.number(),
      user_percentage: z.number(),
    })),
    pain_points: z.array(z.string()),
    satisfaction_drivers: z.array(z.string()),
    churn_risks: z.array(z.string()),
  }),
  
  feature_preferences: z.object({
    must_have_features: z.array(z.string()),
    nice_to_have_features: z.array(z.string()),
    feature_priorities: z.array(z.object({
      feature: z.string(),
      importance: z.number(),
      adoption_likelihood: z.number(),
    })),
    feature_gaps: z.array(z.string()),
  }),
  
  pricing_sensitivity: z.object({
    optimal_price_point: z.number(),
    price_elasticity: z.number(),
    willingness_to_pay: z.object({
      min: z.number(),
      max: z.number(),
      average: z.number(),
    }),
    pricing_tiers: z.array(z.object({
      name: z.string(),
      price: z.number(),
      target_segment: z.string(),
      features: z.array(z.string()),
    })),
  }),
};

export const insightsRoutes: FastifyPluginAsync = async (fastify) => {
  // Analyze personas
  fastify.post('/analyze', async (request, reply) => {
    const { personas, analysis_type, custom_prompt, output_schema } = 
      analyzeRequestSchema.parse(request.body);
    
    // Create PersonaGroup from request
    const group = new PersonaGroup('Analysis Group');
    personas.forEach(p => {
      // Ensure required attributes exist with defaults
      const attributes = {
        age: 30,
        occupation: 'Professional',
        sex: 'other',
        ...p.attributes
      };
      
      group.addRaw({
        id: p.id,
        name: p.name,
        attributes: attributes as any,
      });
    });
    
    // Get appropriate schema
    let schema;
    if (output_schema) {
      // For custom schemas, we need to build a proper Zod schema
      // For now, we'll use a simple object schema
      schema = z.object({
        insights: z.record(z.any()),
        recommendations: z.array(z.string()).optional(),
        confidence: z.string().optional(),
      });
    } else {
      schema = analysisSchemas[analysis_type as keyof typeof analysisSchemas];
    }
    
    // Generate insights
    const generator = isTestMode() 
      ? new MockOpenAIService() as any
      : new StructuredOutputGenerator();
    
    const prompt = custom_prompt || `Generate ${analysis_type.replace('_', ' ')} for this audience`;
    
    const result = await generator.generateCustom(
      group,
      schema,
      prompt
    );
    
    return {
      analysis_id: `analysis-${Date.now()}`,
      type: analysis_type,
      insights: result.data,
      metadata: {
        persona_count: personas.length,
        generated_at: new Date().toISOString(),
        model: isTestMode() ? 'mock' : 'gpt-4o-mini',
      },
    };
  });

  // Predict content performance
  fastify.post('/predict', async (request, reply) => {
    const { personas, content, metrics } = predictRequestSchema.parse(request.body);
    
    // Create PersonaGroup
    const group = new PersonaGroup('Prediction Group');
    personas.forEach(p => {
      // Ensure required attributes exist with defaults
      const attributes = {
        age: 30,
        occupation: 'Professional',
        sex: 'other',
        ...p.attributes
      };
      
      group.addRaw({
        id: p.id,
        name: p.name,
        attributes: attributes as any,
      });
    });
    
    // Build prediction schema based on requested metrics
    const predictionSchema = z.object({
      predictions: z.object(
        Object.fromEntries(
          metrics.map(metric => [metric, z.number()])
        )
      ),
      confidence_intervals: z.object(
        Object.fromEntries(
          metrics.map(metric => [
            metric,
            z.object({ lower: z.number(), upper: z.number() })
          ])
        )
      ).optional(),
      recommendations: z.array(z.string()),
      key_insights: z.array(z.string()),
    });
    
    const generator = isTestMode() 
      ? new MockOpenAIService() as any
      : new StructuredOutputGenerator();
    
    const result = await generator.generateCustom(
      group,
      predictionSchema,
      `Predict ${metrics.join(', ')} for this content: ${JSON.stringify(content)}`
    );
    
    return {
      prediction_id: `pred-${Date.now()}`,
      content,
      predictions: result.data.predictions,
      confidence_intervals: result.data.confidence_intervals,
      recommendations: result.data.recommendations,
      metadata: {
        persona_count: personas.length,
        generated_at: new Date().toISOString(),
        model: isTestMode() ? 'mock' : 'gpt-4o-mini',
      },
    };
  });

  // Segment personas
  fastify.post('/segment', async (request, reply) => {
    const { personas, segment_count, segment_by } = 
      segmentRequestSchema.parse(request.body);
    
    // Create PersonaGroup
    const group = new PersonaGroup('Segmentation Group');
    personas.forEach(p => {
      // Ensure required attributes exist with defaults
      const attributes = {
        age: 30,
        occupation: 'Professional',
        sex: 'other',
        ...p.attributes
      };
      
      group.addRaw({
        id: p.id,
        name: p.name,
        attributes: attributes as any,
      });
    });
    
    const generator = isTestMode() 
      ? new MockOpenAIService() as any
      : new StructuredOutputGenerator();
    
    const result = await generator.generateSegments(group, segment_count);
    
    return {
      segmentation_id: `seg-${Date.now()}`,
      segments: result.data.segments.map((seg: any, idx: number) => ({
        id: `segment-${idx + 1}`,
        name: seg.name,
        size: seg.size,
        percentage: (seg.size / personas.length) * 100,
        characteristics: seg.keyCharacteristics,
        typical_persona: seg.typicalPersona.attributes,
      })),
      insights: result.data.insights,
      metadata: {
        persona_count: personas.length,
        segment_count: result.data.segments.length,
        generated_at: new Date().toISOString(),
        model: isTestMode() ? 'mock' : 'gpt-4o-mini',
      },
    };
  });

  // Quick insights endpoint
  fastify.post('/quick', async (request, reply) => {
    const quickRequestSchema = z.object({
      personas: z.array(z.object({
        id: z.string(),
        name: z.string(),
        attributes: z.record(z.any()),
      })).min(1),
      question: z.string().min(1),
    });
    
    const { personas, question } = quickRequestSchema.parse(request.body);
    
    // Create PersonaGroup
    const group = new PersonaGroup('Quick Analysis');
    personas.forEach((p: any) => {
      // Ensure required attributes exist with defaults
      const attributes = {
        age: 30,
        occupation: 'Professional',
        sex: 'other',
        ...p.attributes
      };
      
      group.addRaw({
        id: p.id,
        name: p.name,
        attributes: attributes,
      });
    });
    
    const schema = z.object({
      answer: z.string(),
      confidence: z.enum(['low', 'medium', 'high']),
      supporting_data: z.array(z.string()).optional(),
    });
    
    const generator = isTestMode() 
      ? new MockOpenAIService() as any
      : new StructuredOutputGenerator();
    
    const result = await generator.generateCustom(
      group,
      schema,
      question
    );
    
    return result.data;
  });
};