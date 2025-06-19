import { PersonaGroup } from '../persona-group';
import { ANESVoterData } from './types';
/**
 * Generates realistic voter personas with correlated political and demographic attributes
 */
export declare class VoterPersonaGenerator {
    /**
     * Generate voter personas based on demographic and political distributions
     */
    generateVoterPersonas(count: number, options?: {
        demographicProfile?: 'national' | 'suburban' | 'urban' | 'rural';
        politicalLean?: 'left' | 'center' | 'right' | 'mixed';
        state?: string;
        year?: number;
    }): Promise<PersonaGroup>;
    /**
     * Generate voter personas from real ANES patterns
     */
    generateFromANESPatterns(anes_data: ANESVoterData[], target_count: number, _scaling_factor?: number): Promise<PersonaGroup>;
    /**
     * Create specialized voter segments for analysis
     */
    generateVoterSegments(segments: Array<{
        name: string;
        size: number;
        characteristics: {
            age_range: [number, number];
            education_levels: string[];
            income_range: [number, number];
            party_preferences: Record<string, number>;
            ideology_range: [number, number];
            geography: string[];
        };
    }>): Promise<PersonaGroup>;
    /**
     * Generate swing voter personas with specific characteristics
     */
    generateSwingVoters(count: number, swingProfile: {
        uncertainty_level: number;
        cross_pressures: string[];
        demographic_profile: string;
    }): Promise<PersonaGroup>;
    /**
     * Create realistic voter distributions based on demographic profile
     */
    private createVoterDistributions;
    private createAgeDistribution;
    private createEducationDistribution;
    private createIncomeDistribution;
    private createPartyDistribution;
    private createIdeologyDistribution;
    private createTurnoutDistribution;
    private createGeographyDistribution;
    /**
     * Generate a voter with correlated demographic and political attributes
     */
    private generateCorrelatedVoter;
    private generateVotingHistory;
    private generateIssuePositions;
    private convertVoterToPersona;
    private convertANESToPersona;
    private analyzeANESPatterns;
    private generateFromPatterns;
    private generateSegmentPersonas;
    private generateSegmentVoter;
    private generateSwingVoter;
    private inferOccupation;
}
//# sourceMappingURL=voter-persona-generator.d.ts.map