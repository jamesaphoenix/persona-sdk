import { CandidateProfile, CampaignEvent, PoliticalContext } from './types';
/**
 * Temporal political model for tracking candidate position changes and campaign dynamics over time
 */
export declare class TemporalPoliticalModel {
    /**
     * Update candidate positions based on campaign events and time progression
     */
    updateCandidatePositions(candidate: CandidateProfile, timePoint: Date): Promise<CandidateProfile>;
    /**
     * Calculate the impact of campaign events on voter preferences
     */
    calculateEventImpact(event: CampaignEvent, voterSegments: string[], timeDecay?: number): Record<string, number>;
    /**
     * Model momentum changes based on polling trends and events
     */
    calculateMomentum(candidate: string, recentPolling: Array<{
        date: Date;
        support: number;
    }>, recentEvents: CampaignEvent[]): {
        momentum: number;
        trend: 'rising' | 'falling' | 'stable';
        confidence: number;
    };
    /**
     * Predict how candidate positions will evolve based on campaign pressures
     */
    predictPositionEvolution(candidate: CandidateProfile, campaignPressures: {
        primary_pressure?: number;
        general_pressure?: number;
        issue_salience: Record<string, number>;
    }, timeHorizonDays: number): CandidateProfile;
    /**
     * Model how external events affect the political landscape
     */
    modelExternalEventImpact(event: {
        type: 'economic_data' | 'international_crisis' | 'social_issue' | 'scandal';
        description: string;
        magnitude: number;
        date: Date;
    }, candidates: CandidateProfile[], _context: PoliticalContext): {
        candidate_impacts: Record<string, number>;
        issue_salience_changes: Record<string, number>;
        overall_mood_shift: number;
    };
    /**
     * Track and predict late-campaign dynamics
     */
    predictLateCampaignDynamics(candidates: CandidateProfile[], currentDate: Date, electionDate: Date, currentPolling: Record<string, number>): {
        late_swing_probability: number;
        most_volatile_segments: string[];
        momentum_sustainability: Record<string, number>;
        october_surprise_impact: number;
    };
    private updatePollingFromEvents;
    private calculateTrendConsistency;
}
//# sourceMappingURL=temporal-political-model.d.ts.map