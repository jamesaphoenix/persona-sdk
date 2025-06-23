import { Distribution } from '../types/index.js';
import { DistributionSelectionParams } from './types.js';
/**
 * AI-powered distribution selector
 */
export declare class DistributionSelector {
    private openai;
    constructor(apiKey?: string);
    /**
     * Select appropriate distribution based on context
     */
    selectDistribution(params: DistributionSelectionParams): Promise<Distribution>;
    /**
     * Create distribution instance from selection
     */
    private createDistribution;
    /**
     * Get distribution recommendations for multiple attributes
     */
    recommendDistributions(attributes: string[], context: string): Promise<Map<string, Distribution>>;
}
//# sourceMappingURL=distribution-selector.d.ts.map