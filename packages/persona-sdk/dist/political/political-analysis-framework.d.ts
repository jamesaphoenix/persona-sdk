import { PersonaGroup } from '../persona-group';
import { ElectionContext, ElectionPrediction, PoliticalContext, VotingPrediction, CandidateProfile, PoliticalAnalysisConfig } from './types';
/**
 * Multi-step political reasoning framework for election prediction using synthetic personas
 */
export declare class PoliticalAnalysisFramework {
    private _apiKey;
    private voterPersonas;
    private structuredOutputGenerator;
    private config;
    constructor(_apiKey: string, voterPersonas: PersonaGroup, config?: Partial<PoliticalAnalysisConfig>);
    /**
     * Predict election outcome using multi-step reasoning
     */
    predictElectionOutcome(election: ElectionContext): Promise<ElectionPrediction>;
    /**
     * Analyze demographic influence on voting patterns
     */
    analyzeDemographics(election: ElectionContext): Promise<{
        segments: {
            name: string;
            turnout_likelihood: number;
            size_percentage: number;
            key_characteristics: string[];
            candidate_preferences: Record<string, number>;
            swing_potential: number;
        }[];
        key_swing_demographics: string[];
        demographic_trends: string[];
    }>;
    /**
     * Analyze ideological alignment between voters and candidates
     */
    analyzeIdeology(election: ElectionContext): Promise<{
        candidate_positioning: Record<string, {
            overall_ideology: number;
            issue_positions: Record<string, number>;
            coalition_appeal: string[];
            potential_conflicts: string[];
        }>;
        voter_candidate_alignment: Record<string, {
            alignment_score: number;
            issue_alignment: Record<string, number>;
            enthusiasm_level: number;
        }>;
        cross_pressures: {
            voter_segment: string;
            conflicting_preferences: string;
            resolution_likelihood: number;
        }[];
    }>;
    /**
     * Analyze temporal dynamics affecting the election
     */
    analyzeTemporalDynamics(election: ElectionContext): Promise<{
        momentum_analysis: Record<string, {
            current_momentum: number;
            momentum_drivers: string[];
            sustainability: number;
        }>;
        event_impacts: {
            event: string;
            impact_magnitude: number;
            affected_groups: string[];
            duration_estimate: string;
        }[];
        late_deciding_factors: string[];
        external_risks: {
            probability: number;
            risk: string;
            potential_impact: number;
        }[];
    }>;
    /**
     * Perform chain-of-thought reasoning for final prediction
     */
    chainOfThoughtPrediction(analysis: {
        demographics: any;
        ideology: any;
        temporal: any;
        personas: PersonaGroup;
        election: ElectionContext;
    }): Promise<ElectionPrediction>;
    /**
     * Simulate voter response to campaign events or policy changes
     */
    simulateVoterResponse(voters: PersonaGroup, candidates: CandidateProfile[], context: PoliticalContext): Promise<VotingPrediction>;
    private buildDemographicAnalysisPrompt;
    private buildIdeologicalAnalysisPrompt;
    private buildTemporalAnalysisPrompt;
    private buildChainOfThoughtPrompt;
    private buildVoterResponsePrompt;
    private calculateElectoralVotes;
    private getStateElectoralVotes;
    private extractMomentum;
    private calculateExternalEventImpact;
}
//# sourceMappingURL=political-analysis-framework.d.ts.map