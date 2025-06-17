/**
 * Media to persona generator using LangChain
 * @module tools/media-to-persona
 */
import { Persona } from '../persona.js';
import { UsageMetadata } from '../media/media-processor.js';
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
export declare class MediaToPersonaGenerator {
    private model;
    private mediaProcessor;
    constructor(apiKey?: string, modelName?: string);
    /**
     * Generate personas from a text post
     */
    fromTextPost(text: string, options?: MediaToPersonaOptions): Promise<MediaToPersonaResult>;
    /**
     * Generate personas from image content
     */
    fromImage(imagePath: string, _options?: MediaToPersonaOptions): Promise<MediaToPersonaResult>;
    /**
     * Generate personas from multiple media sources
     */
    fromMediaCollection(mediaPaths: string[], _options?: MediaToPersonaOptions): Promise<MediaToPersonaResult>;
    /**
     * Create distributions from analysis
     */
    private createDistributionsFromAnalysis;
    /**
     * Vary attributes based on distributions
     */
    private varyAttributes;
    /**
     * Parse free-form analysis into personas
     */
    private parseAnalysisToPersonas;
    /**
     * Estimate cost for media processing
     */
    estimateProcessingCost(mediaCount: number, mediaTypes: string[], model?: string): {
        estimatedTokens: number;
        estimatedCost: number;
    };
}
//# sourceMappingURL=media-to-persona.d.ts.map