import { ANESVoterData, ANESProcessingOptions } from './types';
import { PersonaGroup } from '../persona-group';
/**
 * Processes ANES (American National Election Studies) data for voter persona generation
 */
export declare class ANESDataProcessor {
    /**
     * Load ANES data for a specific election year
     */
    loadANESData(year: 2016 | 2020 | 2024, options?: ANESProcessingOptions): Promise<ANESVoterData[]>;
    /**
     * Generate synthetic voters based on real ANES patterns
     */
    generateSyntheticVoters(baseData: ANESVoterData[], targetCount: number): Promise<PersonaGroup>;
    /**
     * Convert ANES voter data to PersonaGroup
     */
    convertANESToPersonas(data: ANESVoterData[]): Promise<PersonaGroup>;
    /**
     * Analyze demographic and political patterns in ANES data
     */
    analyzeVoterPatterns(data: ANESVoterData[]): {
        demographics: {
            age: {
                mean: number;
                std: number;
                min: number;
                max: number;
            };
            education: Record<string, number>;
            income: {
                mean: number;
                std: number;
                min: number;
                max: number;
            };
            race: Record<string, number>;
            geography: Record<string, number>;
        };
        ideology: {
            party_id: Record<string, number>;
            political_views: Record<string, number>;
            issue_correlations: Record<string, Record<string, number>>;
        };
        voting_behavior: {
            turnout_patterns: {
                mean: number;
                distribution: number[];
            };
            vote_method_preferences: Record<string, number>;
        };
    };
    /**
     * Generate a synthetic ANES voter record
     */
    private generateSyntheticANESRecord;
    /**
     * Generate correlated ideology based on demographics
     */
    private generateIdeology;
    /**
     * Convert ideology scale to descriptive views
     */
    private scaleToViews;
    /**
     * Generate issue positions based on ideology
     */
    private generateIssuePositions;
    /**
     * Convert ANESVoterData to Persona
     */
    private convertToPersona;
    private calculateAgeDistribution;
    private calculateEducationDistribution;
    private calculateIncomeDistribution;
    private calculateRaceDistribution;
    private calculateGeographyDistribution;
    private calculatePartyDistribution;
    private calculateIdeologyDistribution;
    private calculateIssueCorrelations;
    private calculateTurnoutPatterns;
    private calculateVoteMethodDistribution;
    private determineSampleSize;
    private passesFilters;
    private generateIncome;
    private generateVotingHistory;
    private generateTurnoutLikelihood;
    private generateNewsSources;
    private generateSocialMedia;
    private inferOccupation;
    private generateSyntheticVoter;
    private calculateCorrelation;
}
//# sourceMappingURL=anes-data-processor.d.ts.map