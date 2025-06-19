import { PersonaGroup } from '../persona-group';
import { ElectionContext, ElectionPrediction } from './types';
/**
 * Main engine for election prediction using synthetic voter personas and multi-dimensional analysis
 */
export declare class ElectionPredictionEngine {
    private apiKey;
    private config;
    private politicalFramework;
    private temporalModel;
    private voterGenerator;
    private anesProcessor;
    constructor(apiKey: string, config?: {
        voter_sample_size?: number;
        prediction_horizon_days?: number;
        confidence_threshold?: number;
        enable_temporal_tracking?: boolean;
        use_anes_data?: boolean;
    });
    /**
     * Run complete election prediction with all analysis steps
     */
    predictElection(election: ElectionContext, voterPopulation?: PersonaGroup): Promise<ElectionPrediction>;
    /**
     * Simulate election under different scenarios
     */
    simulateScenarios(baseElection: ElectionContext, scenarios: Array<{
        name: string;
        changes: {
            economic_shift?: number;
            major_event?: string;
            candidate_position_shifts?: Record<string, Record<string, number>>;
            turnout_variation?: number;
        };
    }>): Promise<Array<{
        scenario: string;
        prediction: ElectionPrediction;
    }>>;
    /**
     * Track prediction accuracy by comparing against actual results
     */
    validatePrediction(prediction: ElectionPrediction, actualResults: {
        winner: string;
        vote_share: Record<string, number>;
        state_results: Record<string, {
            winner: string;
            margin: number;
        }>;
        turnout: number;
    }): Promise<{
        overall_accuracy: number;
        winner_correct: boolean;
        vote_share_error: Record<string, number>;
        state_prediction_accuracy: number;
        detailed_analysis: string;
    }>;
    /**
     * Generate real-time prediction updates as new data becomes available
     */
    updatePrediction(currentPrediction: ElectionPrediction, newData: {
        polling_updates?: Record<string, number>;
        new_events?: Array<{
            date: Date;
            type: string;
            description: string;
            impact: number;
        }>;
        demographic_shifts?: Record<string, number>;
    }): Promise<ElectionPrediction>;
    /**
     * Generate synthetic voter population for the election
     */
    private generateVoterPopulation;
    /**
     * Apply temporal updates to candidate positions and context
     */
    private applyTemporalUpdates;
    /**
     * Enhance prediction with additional analysis
     */
    private enhancePrediction;
    /**
     * Apply scenario changes to election context
     */
    private applyScenarioChanges;
    /**
     * Generate voter population adjusted for scenario
     */
    private generateScenarioVoters;
    /**
     * Run detailed voter simulation
     */
    private runVoterSimulation;
    /**
     * Generate validation analysis text
     */
    private generateValidationAnalysis;
    /**
     * Incorporate new data into election context
     */
    private incorporateNewData;
    /**
     * Calculate momentum between predictions
     */
    private calculatePredictionMomentum;
    /**
     * Determine appropriate ANES year for election
     */
    private determineANESYear;
    /**
     * Infer demographic profile from election context
     */
    private inferDemographicProfile;
    /**
     * Infer political lean from election context
     */
    private inferPoliticalLean;
}
//# sourceMappingURL=election-prediction-engine.d.ts.map