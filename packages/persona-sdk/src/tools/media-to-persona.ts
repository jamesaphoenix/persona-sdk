/**
 * Media to persona generator using LangChain
 * @module tools/media-to-persona
 */

import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { Persona } from '../persona.js';
// import { PersonaGroup } from '../persona-group.js';
import { MediaProcessor, UsageMetadata } from '../media/media-processor.js';
import { BasePersonaAttributesSchema } from '../types/index.js';
import { 
  NormalDistribution, 
  UniformDistribution
} from '../distributions/index.js';

/**
 * Extended persona attributes for media-based generation
 */
const MediaPersonaAttributesSchema = BasePersonaAttributesSchema.extend({
  interests: z.array(z.string()).optional(),
  values: z.array(z.string()).optional(),
  personality: z.object({
    openness: z.number().min(0).max(1),
    conscientiousness: z.number().min(0).max(1),
    extraversion: z.number().min(0).max(1),
    agreeableness: z.number().min(0).max(1),
    neuroticism: z.number().min(0).max(1)
  }).optional(),
  communicationStyle: z.object({
    formality: z.enum(['very_informal', 'informal', 'neutral', 'formal', 'very_formal']),
    tone: z.enum(['serious', 'professional', 'casual', 'humorous', 'emotional']),
    vocabulary: z.enum(['basic', 'intermediate', 'advanced', 'specialized'])
  }).optional(),
  demographics: z.object({
    location: z.string().optional(),
    educationLevel: z.string().optional(),
    incomeRange: z.string().optional(),
    familyStatus: z.string().optional()
  }).optional()
});

/**
 * Media analysis schema
 */
const MediaAnalysisSchema = z.object({
  authorProfile: MediaPersonaAttributesSchema,
  confidence: z.object({
    overall: z.number().min(0).max(1),
    attributes: z.record(z.string(), z.number().min(0).max(1))
  }),
  distributions: z.object({
    age: z.object({
      type: z.literal('normal'),
      mean: z.number(),
      stdDev: z.number()
    }),
    personality: z.record(z.string(), z.object({
      type: z.literal('beta'),
      alpha: z.number(),
      beta: z.number()
    }))
  }).optional(),
  reasoning: z.string()
});

/**
 * Options for media to persona conversion
 */
export interface MediaToPersonaOptions {
  generateMultiple?: boolean;
  count?: number;
  includeDistributions?: boolean;
  focusAttributes?: string[];
  apiKey?: string;
  modelName?: string;
}

/**
 * Result of media to persona conversion
 */
export interface MediaToPersonaResult {
  personas: Persona[];
  distributions?: Record<string, any>;
  analysis: {
    confidence: number;
    reasoning: string;
    extractedAttributes: Record<string, any>;
  };
  usage: UsageMetadata;
}

/**
 * Convert media content to personas
 */
export class MediaToPersonaGenerator {
  private model: ChatOpenAI;
  private mediaProcessor: MediaProcessor;

  constructor(apiKey?: string, modelName: string = 'gpt-4-turbo-preview') {
    this.model = new ChatOpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      modelName,
      temperature: 0.8
    });
    this.mediaProcessor = new MediaProcessor(apiKey, modelName);
  }

  /**
   * Generate personas from a text post
   */
  async fromTextPost(
    text: string,
    options?: MediaToPersonaOptions
  ): Promise<MediaToPersonaResult> {
    const systemPrompt = `You are an expert at inferring persona characteristics from written content.
Analyze the given text and create a detailed persona profile of the author.
Consider writing style, vocabulary, expressed opinions, emotional tone, and any demographic clues.
${options?.focusAttributes ? `Focus especially on: ${options.focusAttributes.join(', ')}` : ''}`;

    const structuredModel = this.model.withStructuredOutput(MediaAnalysisSchema);
    
    const response = await structuredModel.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this text and create a persona profile:\n\n${text}` }
    ]);

    // Create personas based on analysis
    const personas: Persona[] = [];
    const baseAttributes = response.authorProfile;

    if (options?.generateMultiple && options.count && options.count > 1) {
      // Generate multiple personas with variations
      const distributions = this.createDistributionsFromAnalysis(response);
      
      for (let i = 0; i < options.count; i++) {
        const variedAttributes = this.varyAttributes(baseAttributes, distributions);
        personas.push(new Persona(`Generated Persona ${i + 1}`, variedAttributes));
      }
    } else {
      // Single persona
      personas.push(new Persona('Generated Persona', baseAttributes));
    }

    // Calculate usage
    const usage: UsageMetadata = {
      input_tokens: this.mediaProcessor.countTokens(text + systemPrompt),
      output_tokens: this.mediaProcessor.countTokens(JSON.stringify(response)),
      total_tokens: 0
    };
    usage.total_tokens = usage.input_tokens + usage.output_tokens;

    return {
      personas,
      distributions: options?.includeDistributions ? response.distributions : undefined,
      analysis: {
        confidence: response.confidence.overall,
        reasoning: response.reasoning,
        extractedAttributes: baseAttributes
      },
      usage
    };
  }

  /**
   * Generate personas from image content
   */
  async fromImage(
    imagePath: string,
    _options?: MediaToPersonaOptions
  ): Promise<MediaToPersonaResult> {
    const media = await this.mediaProcessor.processFile(imagePath);
    
    const analysisPrompt = `Analyze this image and create persona profiles for:
1. The photographer/creator (based on composition, style, subject choice)
2. Any people visible in the image
3. The target audience this image might appeal to

Consider visual style, setting, clothing, activities, and any cultural markers.`;

    const result = await this.mediaProcessor.analyzeMediaForPersona(media, analysisPrompt);
    
    // Parse the analysis to create personas
    const personas = this.parseAnalysisToPersonas(result.analysis);

    return {
      personas,
      analysis: {
        confidence: 0.7, // Default confidence for image analysis
        reasoning: result.analysis,
        extractedAttributes: {}
      },
      usage: result.usage || {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0
      }
    };
  }

  /**
   * Generate personas from multiple media sources
   */
  async fromMediaCollection(
    mediaPaths: string[],
    _options?: MediaToPersonaOptions
  ): Promise<MediaToPersonaResult> {
    // const _group = new PersonaGroup('Media-Generated Personas');
    let totalUsage: UsageMetadata = {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0
    };

    const allAnalyses: string[] = [];

    // Process each media item
    for (const path of mediaPaths) {
      try {
        const media = await this.mediaProcessor.processFile(path);
        const result = await this.mediaProcessor.analyzeMediaForPersona(media);
        
        allAnalyses.push(result.analysis);
        
        if (result.usage) {
          totalUsage.input_tokens += result.usage.input_tokens;
          totalUsage.output_tokens += result.usage.output_tokens;
        }
      } catch (error) {
        console.error(`Error processing ${path}:`, error);
      }
    }

    // Synthesize all analyses into coherent personas
    const synthesisPrompt = `Based on the following media analyses, create 3-5 distinct but related personas that might consume or create this type of content:

${allAnalyses.join('\n\n---\n\n')}

Create diverse personas that represent different segments of the audience or creator community.`;

    const structuredModel = this.model.withStructuredOutput(z.object({
      personas: z.array(MediaPersonaAttributesSchema),
      reasoning: z.string()
    }));

    const synthesis = await structuredModel.invoke([
      { role: 'system', content: 'You are an expert at creating persona profiles from media analysis.' },
      { role: 'user', content: synthesisPrompt }
    ]);

    const personas = synthesis.personas.map((attrs, i) => 
      new Persona(`Media Persona ${i + 1}`, attrs)
    );

    totalUsage.total_tokens = totalUsage.input_tokens + totalUsage.output_tokens;

    return {
      personas,
      analysis: {
        confidence: 0.8,
        reasoning: synthesis.reasoning,
        extractedAttributes: {}
      },
      usage: totalUsage
    };
  }

  /**
   * Create distributions from analysis
   */
  private createDistributionsFromAnalysis(analysis: any): Record<string, any> {
    const distributions: Record<string, any> = {};

    // Age distribution
    if (analysis.distributions?.age) {
      distributions.age = new NormalDistribution(
        analysis.distributions.age.mean,
        analysis.distributions.age.stdDev
      );
    }

    // Personality distributions
    if (analysis.distributions?.personality) {
      Object.entries(analysis.distributions.personality).forEach(([trait, params]: [string, any]) => {
        if (params.type === 'beta') {
          distributions[trait] = new UniformDistribution(0, 1); // Simplified
        }
      });
    }

    return distributions;
  }

  /**
   * Vary attributes based on distributions
   */
  private varyAttributes(
    baseAttributes: any,
    distributions: Record<string, any>
  ): any {
    const varied = { ...baseAttributes };

    // Apply distributions
    Object.entries(distributions).forEach(([key, dist]: [string, any]) => {
      if (dist && typeof dist.sample === 'function') {
        if (key === 'age') {
          varied.age = Math.round(Math.max(18, Math.min(90, dist.sample())));
        } else if (varied.personality && varied.personality[key] !== undefined) {
          varied.personality[key] = Math.max(0, Math.min(1, dist.sample()));
        }
      }
    });

    return varied;
  }

  /**
   * Parse free-form analysis into personas
   */
  private parseAnalysisToPersonas(analysis: string): Persona[] {
    // This is a simplified parser - in production would use more sophisticated NLP
    const personas: Persona[] = [];
    
    // Look for persona indicators in the text
    const personaMatches = analysis.match(/(?:persona|profile|character)[\s\S]{0,500}?(?=persona|profile|character|$)/gi) || [];
    
    personaMatches.forEach((match, i) => {
      const attributes: any = {
        age: 30, // Default
        occupation: 'Unknown',
        sex: 'other'
      };

      // Extract age if mentioned
      const ageMatch = match.match(/(\d{1,2})\s*(?:years?\s*old|yo)/i);
      if (ageMatch) {
        attributes.age = parseInt(ageMatch[1]);
      }

      // Extract occupation if mentioned
      const occupationMatch = match.match(/(?:occupation|job|profession|works? as|is a)\s*:?\s*([^,.\n]+)/i);
      if (occupationMatch) {
        attributes.occupation = occupationMatch[1].trim();
      }

      personas.push(new Persona(`Extracted Persona ${i + 1}`, attributes));
    });

    // If no personas found, create a default one
    if (personas.length === 0) {
      personas.push(new Persona('Default Persona', {
        age: 30,
        occupation: 'Content Consumer',
        sex: 'other'
      }));
    }

    return personas;
  }

  /**
   * Estimate cost for media processing
   */
  estimateProcessingCost(
    mediaCount: number,
    mediaTypes: string[],
    model: string = 'gpt-4-turbo-preview'
  ): {
    estimatedTokens: number;
    estimatedCost: number;
  } {
    // Rough estimates based on media type
    const tokenEstimates: Record<string, number> = {
      text: 500,
      image: 1000,
      document: 2000,
      audio: 3000,
      video: 5000
    };

    const estimatedTokens = mediaTypes.reduce((sum, type) => 
      sum + (tokenEstimates[type] || 1000), 0
    ) * mediaCount;

    const usage: UsageMetadata = {
      input_tokens: estimatedTokens * 0.7,
      output_tokens: estimatedTokens * 0.3,
      total_tokens: estimatedTokens
    };

    const cost = this.mediaProcessor.estimateCost(usage, model);

    return {
      estimatedTokens,
      estimatedCost: cost.totalCost
    };
  }
}