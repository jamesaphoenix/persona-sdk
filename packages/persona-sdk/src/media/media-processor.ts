/**
 * Media processor for converting various media types to persona-friendly formats
 * @module media/media-processor
 */

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { encoding_for_model } from 'tiktoken';
import * as fs from 'fs/promises';
import * as mimeTypes from 'mime-types';

/**
 * Supported media types for processing
 */
export const SUPPORTED_MEDIA_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  TEXT: ['text/plain', 'text/markdown', 'text/html'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg']
} as const;

/**
 * Media content interface
 */
export interface MediaContent {
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  mimeType: string;
  content: string; // Base64 for non-text
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * Usage metadata following LangChain's format
 */
export interface UsageMetadata {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  input_token_details?: {
    audio?: number;
    cache_creation?: number;
    cache_read?: number;
  };
  output_token_details?: {
    audio?: number;
    reasoning?: number;
  };
}

/**
 * Media processing result
 */
export interface MediaProcessingResult {
  messages: BaseMessage[];
  analysis: string;
  extractedAttributes?: Record<string, any>;
  usage?: UsageMetadata;
}

/**
 * Media processor for handling various media types
 */
export class MediaProcessor {
  private model: ChatOpenAI;
  private tokenEncoder: any;

  constructor(
    apiKey?: string,
    modelName: string = 'gpt-4-vision-preview'
  ) {
    this.model = new ChatOpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      modelName,
      temperature: 0.7,
      // returnUsageMetadata: true // This option may not be available in current version
    });
    
    // Initialize token encoder
    try {
      this.tokenEncoder = encoding_for_model('gpt-4');
    } catch {
      // Fallback to cl100k_base if model-specific encoding not found
      this.tokenEncoder = encoding_for_model('gpt-4');
    }
  }

  /**
   * Count tokens in a string
   */
  countTokens(text: string): number {
    const tokens = this.tokenEncoder.encode(text);
    return tokens.length;
  }

  /**
   * Process a file from URL or local path
   */
  async processFile(filePathOrUrl: string): Promise<MediaContent> {
    let content: Buffer;
    let mimeType: string;

    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
      // Handle URL
      const response = await fetch(filePathOrUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePathOrUrl}: ${response.statusText}`);
      }
      
      content = Buffer.from(await response.arrayBuffer());
      mimeType = response.headers.get('content-type') || 'application/octet-stream';
    } else {
      // Handle local file
      content = await fs.readFile(filePathOrUrl);
      mimeType = mimeTypes.lookup(filePathOrUrl) || 'application/octet-stream';
    }

    // Determine media type
    let type: MediaContent['type'] = 'document';
    if (SUPPORTED_MEDIA_TYPES.IMAGE.includes(mimeType as any)) {
      type = 'image';
    } else if (SUPPORTED_MEDIA_TYPES.TEXT.includes(mimeType as any)) {
      type = 'text';
    } else if (SUPPORTED_MEDIA_TYPES.AUDIO.includes(mimeType as any)) {
      type = 'audio';
    } else if (SUPPORTED_MEDIA_TYPES.VIDEO.includes(mimeType as any)) {
      type = 'video';
    }

    // Convert to base64 for non-text content
    const isText = type === 'text';
    const processedContent = isText 
      ? content.toString('utf-8')
      : content.toString('base64');

    return {
      type,
      mimeType,
      content: processedContent,
      url: filePathOrUrl.startsWith('http') ? filePathOrUrl : undefined,
      metadata: {
        size: content.length,
        encoding: isText ? 'utf-8' : 'base64'
      }
    };
  }

  /**
   * Convert media content to chat messages
   */
  async mediaToMessages(media: MediaContent, prompt?: string): Promise<BaseMessage[]> {
    const messages: BaseMessage[] = [];

    if (media.type === 'text') {
      messages.push(new HumanMessage({
        content: media.content
      }));
    } else if (media.type === 'image') {
      messages.push(new HumanMessage({
        content: [
          {
            type: 'text',
            text: prompt || 'Analyze this image and describe what you see.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${media.mimeType};base64,${media.content}`
            }
          }
        ]
      }));
    } else {
      // For other media types, we'll need to use different approaches
      messages.push(new HumanMessage({
        content: `[${media.type.toUpperCase()} FILE: ${media.mimeType}]\n${prompt || 'Please analyze this media file.'}`
      }));
    }

    return messages;
  }

  /**
   * Analyze media and extract persona-relevant attributes
   */
  async analyzeMediaForPersona(
    media: MediaContent,
    analysisPrompt?: string
  ): Promise<MediaProcessingResult> {
    const defaultPrompt = `Analyze this media content and extract persona-relevant attributes such as:
- Demographics (age, gender, occupation, location)
- Interests and hobbies
- Personality traits
- Values and beliefs
- Behavioral patterns
- Communication style
- Economic status indicators
- Educational background hints

Provide a structured analysis that can be used to create realistic personas.`;

    const messages = await this.mediaToMessages(media, analysisPrompt || defaultPrompt);
    
    // Track token usage
    const inputTokens = messages.reduce((acc, msg) => {
      if (typeof msg.content === 'string') {
        return acc + this.countTokens(msg.content);
      }
      return acc + 100; // Estimate for complex content
    }, 0);

    const response = await this.model.invoke(messages as any);
    
    // Extract usage metadata
    const usage: UsageMetadata = {
      input_tokens: inputTokens,
      output_tokens: this.countTokens(response.content as string),
      total_tokens: 0
    };
    usage.total_tokens = usage.input_tokens + usage.output_tokens;

    // Parse the response to extract attributes
    const parser = new StringOutputParser();
    const analysis = await parser.parse(response.content as string);

    return {
      messages: [...messages, response as unknown as BaseMessage],
      analysis,
      usage
    };
  }

  /**
   * Process text post to extract persona insights
   */
  async processTextPost(text: string): Promise<MediaProcessingResult> {
    const media: MediaContent = {
      type: 'text',
      mimeType: 'text/plain',
      content: text
    };

    const analysisPrompt = `Analyze this text post and infer persona characteristics of the author:
- Writing style and tone
- Vocabulary level and education hints
- Emotional state and personality traits
- Interests and values expressed
- Demographic clues (age group, profession, etc.)
- Social and economic indicators

Provide insights that would help create a realistic persona of someone who would write this.`;

    return this.analyzeMediaForPersona(media, analysisPrompt);
  }

  /**
   * Batch process multiple media files
   */
  async processMediaBatch(
    filePaths: string[],
    batchPrompt?: string
  ): Promise<{
    results: MediaProcessingResult[];
    totalUsage: UsageMetadata;
  }> {
    const results: MediaProcessingResult[] = [];
    const totalUsage: UsageMetadata = {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0
    };

    for (const filePath of filePaths) {
      try {
        const media = await this.processFile(filePath);
        const result = await this.analyzeMediaForPersona(media, batchPrompt);
        results.push(result);

        if (result.usage) {
          totalUsage.input_tokens += result.usage.input_tokens;
          totalUsage.output_tokens += result.usage.output_tokens;
          totalUsage.total_tokens += result.usage.total_tokens;
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
      }
    }

    return { results, totalUsage };
  }

  /**
   * Estimate cost based on token usage
   */
  estimateCost(usage: UsageMetadata, model: string = 'gpt-4'): {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  } {
    // Pricing as of 2024 (in USD per 1000 tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
    };

    const modelPricing = pricing[model] || pricing['gpt-4'];
    
    const inputCost = (usage.input_tokens / 1000) * modelPricing.input;
    const outputCost = (usage.output_tokens / 1000) * modelPricing.output;
    const totalCost = inputCost + outputCost;

    return {
      inputCost: Math.round(inputCost * 10000) / 10000,
      outputCost: Math.round(outputCost * 10000) / 10000,
      totalCost: Math.round(totalCost * 10000) / 10000
    };
  }
}