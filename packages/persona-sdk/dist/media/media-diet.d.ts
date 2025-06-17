/**
 * Media diet system for persona groups
 * @module media/media-diet
 */
import { PersonaGroup } from '../persona-group.js';
import { Persona } from '../persona.js';
import { MediaContent, UsageMetadata } from './media-processor.js';
/**
 * Media diet item with consumption patterns
 */
export interface MediaDietItem {
    content: MediaContent;
    frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
    duration?: number;
    engagement: 'passive' | 'active' | 'interactive';
    source: string;
    category: string;
}
/**
 * Media consumption pattern
 */
export interface MediaConsumptionPattern {
    preferredTypes: string[];
    peakHours: number[];
    avgDailyConsumption: number;
    platforms: string[];
    interests: string[];
}
/**
 * Media diet configuration
 */
export interface MediaDietConfig {
    items: MediaDietItem[];
    patterns: MediaConsumptionPattern;
    personaAttributes?: string[];
}
/**
 * Media influence result
 */
export interface MediaInfluenceResult {
    persona: Persona;
    influences: Record<string, any>;
    confidence: number;
    usage?: UsageMetadata;
}
/**
 * Media diet manager for applying media influences to personas
 */
export declare class MediaDietManager {
    private mediaProcessor;
    private model;
    constructor(apiKey?: string);
    /**
     * Create a media diet from a collection of files
     */
    createMediaDiet(files: string[], defaultPattern?: Partial<MediaConsumptionPattern>): Promise<MediaDietConfig>;
    /**
     * Apply media diet influences to a single persona
     */
    applyMediaInfluence(persona: Persona, diet: MediaDietConfig): Promise<MediaInfluenceResult>;
    /**
     * Apply media diet to entire persona group
     */
    applyToPersonaGroup(group: PersonaGroup, diet: MediaDietConfig, options?: {
        sampleSize?: number;
        variationFactor?: number;
    }): Promise<{
        influencedGroup: PersonaGroup;
        results: MediaInfluenceResult[];
        totalUsage: UsageMetadata;
    }>;
    /**
     * Create variations in media diet for different personas
     */
    private varyMediaDiet;
    /**
     * Generate media recommendations for a persona
     */
    recommendMedia(persona: Persona, availableMedia: MediaContent[], preferences?: {
        desiredInfluences?: string[];
        avoidTopics?: string[];
    }): Promise<{
        recommendations: MediaDietItem[];
        reasoning: string;
        usage?: UsageMetadata;
    }>;
}
//# sourceMappingURL=media-diet.d.ts.map