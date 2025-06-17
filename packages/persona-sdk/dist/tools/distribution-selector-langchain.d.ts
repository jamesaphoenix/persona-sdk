/**
 * AI-powered distribution selector using LangChain
 * @module tools/distribution-selector-langchain
 */
import { Distribution } from '../types/index.js';
import { DistributionSelectionParams } from './types.js';
import { UsageMetadata } from '../media/media-processor.js';
/**
 * AI-powered distribution selector using LangChain
 */
export declare class DistributionSelectorLangChain {
    private model;
    private tokenEncoder;
    constructor(apiKey?: string, modelName?: string);
    /**
     * Count tokens in text
     */
    private countTokens;
    /**
     * Select appropriate distribution based on context
     */
    selectDistribution(params: DistributionSelectionParams): Promise<{
        distribution: Distribution;
        usage: UsageMetadata;
        reasoning: string;
    }>;
    /**
     * Recommend distributions for multiple attributes
     */
    recommendDistributions(attributes: string[], context?: string): Promise<{
        distributions: Map<string, Distribution>;
        usage: UsageMetadata;
        recommendations: any[];
    }>;
    /**
     * Create distribution from natural language description
     */
    fromDescription(description: string): Promise<{
        distribution: Distribution;
        usage: UsageMetadata;
        interpretation: string;
    }>;
    /**
     * Estimate API cost for distribution selection
     */
    estimateCost(attributeCount: number, model?: string): {
        estimatedTokens: number;
        estimatedCost: number;
    };
}
//# sourceMappingURL=distribution-selector-langchain.d.ts.map