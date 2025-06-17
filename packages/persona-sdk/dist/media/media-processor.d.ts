/**
 * Media processor for converting various media types to persona-friendly formats
 * @module media/media-processor
 */
import { BaseMessage } from '@langchain/core/messages';
/**
 * Supported media types for processing
 */
export declare const SUPPORTED_MEDIA_TYPES: {
    readonly IMAGE: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
    readonly TEXT: readonly ["text/plain", "text/markdown", "text/html"];
    readonly DOCUMENT: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    readonly AUDIO: readonly ["audio/mpeg", "audio/wav", "audio/ogg"];
    readonly VIDEO: readonly ["video/mp4", "video/webm", "video/ogg"];
};
/**
 * Media content interface
 */
export interface MediaContent {
    type: 'text' | 'image' | 'audio' | 'video' | 'document';
    mimeType: string;
    content: string;
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
export declare class MediaProcessor {
    private model;
    private tokenEncoder;
    constructor(apiKey?: string, modelName?: string);
    /**
     * Count tokens in a string
     */
    countTokens(text: string): number;
    /**
     * Process a file from URL or local path
     */
    processFile(filePathOrUrl: string): Promise<MediaContent>;
    /**
     * Convert media content to chat messages
     */
    mediaToMessages(media: MediaContent, prompt?: string): Promise<BaseMessage[]>;
    /**
     * Analyze media and extract persona-relevant attributes
     */
    analyzeMediaForPersona(media: MediaContent, analysisPrompt?: string): Promise<MediaProcessingResult>;
    /**
     * Process text post to extract persona insights
     */
    processTextPost(text: string): Promise<MediaProcessingResult>;
    /**
     * Batch process multiple media files
     */
    processMediaBatch(filePaths: string[], batchPrompt?: string): Promise<{
        results: MediaProcessingResult[];
        totalUsage: UsageMetadata;
    }>;
    /**
     * Estimate cost based on token usage
     */
    estimateCost(usage: UsageMetadata, model?: string): {
        inputCost: number;
        outputCost: number;
        totalCost: number;
    };
}
//# sourceMappingURL=media-processor.d.ts.map