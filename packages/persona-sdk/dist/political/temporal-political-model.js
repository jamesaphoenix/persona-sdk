/**
 * Temporal political model for tracking candidate position changes and campaign dynamics over time
 */
export class TemporalPoliticalModel {
    /**
     * Update candidate positions based on campaign events and time progression
     */
    async updateCandidatePositions(candidate, timePoint) {
        const updatedCandidate = { ...candidate };
        // Apply position shifts that occurred by this time point
        Object.keys(candidate.temporal_changes.position_shifts).forEach(issue => {
            const shifts = candidate.temporal_changes.position_shifts[issue];
            const applicableShifts = shifts.filter(shift => shift.date <= timePoint);
            if (applicableShifts.length > 0) {
                // Apply the most recent shift
                const latestShift = applicableShifts[applicableShifts.length - 1];
                updatedCandidate.policy_positions[issue] = {
                    ...updatedCandidate.policy_positions[issue],
                    position: latestShift.new_position
                };
            }
        });
        // Factor in campaign event impacts
        const applicableEvents = candidate.temporal_changes.campaign_events
            .filter(event => event.date <= timePoint);
        // Update polling based on recent events
        if (updatedCandidate.polling_data) {
            updatedCandidate.polling_data = this.updatePollingFromEvents(updatedCandidate.polling_data, applicableEvents, timePoint);
        }
        return updatedCandidate;
    }
    /**
     * Calculate the impact of campaign events on voter preferences
     */
    calculateEventImpact(event, voterSegments, timeDecay = 0.1) {
        const impact = {};
        // Base impact from the event
        const baseImpact = event.estimated_impact;
        // Apply time decay - events lose impact over time
        const daysSinceEvent = (Date.now() - event.date.getTime()) / (1000 * 60 * 60 * 24);
        const decayedImpact = baseImpact * Math.exp(-timeDecay * daysSinceEvent);
        // Distribute impact across affected demographics
        if (event.affected_demographics) {
            event.affected_demographics.forEach(demographic => {
                impact[demographic] = decayedImpact;
            });
        }
        else {
            // If no specific demographics, apply to all segments with reduced impact
            voterSegments.forEach(segment => {
                impact[segment] = decayedImpact * 0.5;
            });
        }
        return impact;
    }
    /**
     * Model momentum changes based on polling trends and events
     */
    calculateMomentum(candidate, recentPolling, recentEvents) {
        if (recentPolling.length < 2) {
            return { momentum: 0, trend: 'stable', confidence: 0.1 };
        }
        // Calculate polling trend
        const sortedPolling = recentPolling.sort((a, b) => a.date.getTime() - b.date.getTime());
        const recentSupport = sortedPolling.slice(-3); // Last 3 polls
        let momentum = 0;
        if (recentSupport.length >= 2) {
            const latest = recentSupport[recentSupport.length - 1].support;
            const previous = recentSupport[0].support;
            momentum = (latest - previous) / recentSupport.length;
        }
        // Factor in event impacts
        const eventBoost = recentEvents
            .filter(event => event.candidate === candidate)
            .reduce((total, event) => total + event.estimated_impact, 0);
        momentum += eventBoost * 0.1; // Events provide additional momentum
        // Determine trend
        let trend = 'stable';
        if (momentum > 0.02)
            trend = 'rising';
        else if (momentum < -0.02)
            trend = 'falling';
        // Calculate confidence based on consistency of trend
        const consistency = this.calculateTrendConsistency(recentSupport);
        const confidence = Math.min(0.9, 0.3 + consistency * 0.6);
        return { momentum, trend, confidence };
    }
    /**
     * Predict how candidate positions will evolve based on campaign pressures
     */
    predictPositionEvolution(candidate, campaignPressures, timeHorizonDays) {
        const predictedCandidate = JSON.parse(JSON.stringify(candidate)); // Deep copy
        // Predict position shifts based on campaign pressures
        Object.keys(candidate.policy_positions).forEach(issue => {
            const currentPosition = candidate.policy_positions[issue];
            const salience = campaignPressures.issue_salience[issue] || 0;
            if (salience > 0.5) { // Only predict changes for salient issues
                let positionShift = 0;
                // Primary pressure (appeal to base)
                if (campaignPressures.primary_pressure) {
                    positionShift += campaignPressures.primary_pressure * salience * 0.3;
                }
                // General election pressure (move to center)
                if (campaignPressures.general_pressure) {
                    const distanceFromCenter = Math.abs(currentPosition.position);
                    positionShift -= Math.sign(currentPosition.position) * distanceFromCenter * 0.2;
                }
                // Apply the predicted shift
                if (Math.abs(positionShift) > 0.1) {
                    const newPosition = Math.max(-3, Math.min(3, currentPosition.position + positionShift));
                    const predictedShift = {
                        date: new Date(Date.now() + timeHorizonDays * 24 * 60 * 60 * 1000),
                        previous_position: currentPosition.position,
                        new_position: newPosition,
                        reason: `Predicted shift due to campaign pressures`,
                        impact_score: Math.abs(positionShift)
                    };
                    if (!predictedCandidate.temporal_changes.position_shifts[issue]) {
                        predictedCandidate.temporal_changes.position_shifts[issue] = [];
                    }
                    predictedCandidate.temporal_changes.position_shifts[issue].push(predictedShift);
                }
            }
        });
        return predictedCandidate;
    }
    /**
     * Model how external events affect the political landscape
     */
    modelExternalEventImpact(event, candidates, _context) {
        const result = {
            candidate_impacts: {},
            issue_salience_changes: {},
            overall_mood_shift: 0
        };
        // Different event types have different impact patterns
        switch (event.type) {
            case 'economic_data':
                // Economic events affect incumbent vs challenger differently
                candidates.forEach(candidate => {
                    const isIncumbent = candidate.biography.previous_offices?.includes('President') || false;
                    const impact = isIncumbent ?
                        (event.magnitude > 0 ? event.magnitude * 0.3 : event.magnitude * 0.5) :
                        (event.magnitude > 0 ? -event.magnitude * 0.2 : -event.magnitude * 0.3);
                    result.candidate_impacts[candidate.biography.name] = impact;
                });
                result.issue_salience_changes['economy'] = event.magnitude * 0.4;
                result.overall_mood_shift = event.magnitude > 0 ? 0.1 : -0.15;
                break;
            case 'international_crisis':
                // International crises often benefit incumbents initially
                candidates.forEach(candidate => {
                    const hasExperience = candidate.biography.experience.some(exp => exp.includes('foreign') || exp.includes('military') || exp.includes('diplomat'));
                    result.candidate_impacts[candidate.biography.name] = hasExperience ? event.magnitude * 0.2 : 0;
                });
                result.issue_salience_changes['foreign_policy'] = event.magnitude * 0.5;
                result.overall_mood_shift = -event.magnitude * 0.1; // Crises create uncertainty
                break;
            case 'scandal':
                // Scandals typically hurt the associated candidate
                const targetCandidate = candidates.find(c => event.description.toLowerCase().includes(c.biography.name.toLowerCase()));
                if (targetCandidate) {
                    result.candidate_impacts[targetCandidate.biography.name] = -event.magnitude * 0.6;
                }
                result.overall_mood_shift = -event.magnitude * 0.05;
                break;
            case 'social_issue':
                // Social issues affect candidates based on their positions
                candidates.forEach(candidate => {
                    const relevantPositions = Object.values(candidate.policy_positions)
                        .filter(pos => pos.issue.includes('social') || pos.issue.includes('civil'));
                    if (relevantPositions.length > 0) {
                        const avgPosition = relevantPositions.reduce((sum, pos) => sum + pos.position, 0) / relevantPositions.length;
                        // Liberal positions benefit from progressive social events
                        result.candidate_impacts[candidate.biography.name] = avgPosition < 0 ? event.magnitude * 0.2 : -event.magnitude * 0.1;
                    }
                });
                result.issue_salience_changes['social_issues'] = event.magnitude * 0.3;
                break;
        }
        return result;
    }
    /**
     * Track and predict late-campaign dynamics
     */
    predictLateCampaignDynamics(candidates, currentDate, electionDate, currentPolling) {
        const daysToElection = (electionDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
        // Calculate late swing probability based on race closeness and time remaining
        const margins = Object.values(currentPolling);
        const leadMargin = margins.length > 1 ? Math.max(...margins) - Math.min(...margins) : 0;
        const lateSwingProbability = margins.length > 1 ?
            Math.max(0.1, Math.min(0.4, (0.4 - leadMargin * 0.01) * Math.min(1, daysToElection / 30))) :
            0.2; // Default for single candidate scenarios
        // Identify volatile segments (typically independents, college-educated suburbanites, etc.)
        const volatileSegments = [
            'Independent voters',
            'College-educated suburban women',
            'Moderate Republicans',
            'Low-information voters',
            'Young voters'
        ];
        // Calculate momentum sustainability
        const momentumSustainability = {};
        candidates.forEach(candidate => {
            const recentEvents = candidate.temporal_changes.campaign_events
                .filter(event => event.date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            const positiveEvents = recentEvents.filter(e => e.estimated_impact > 0).length;
            const negativeEvents = recentEvents.filter(e => e.estimated_impact < 0).length;
            // Momentum is more sustainable with consistent positive events and fewer controversies
            momentumSustainability[candidate.biography.name] =
                Math.max(0, Math.min(1, 0.5 + (positiveEvents - negativeEvents) * 0.1));
        });
        // October surprise impact diminishes closer to election (less time to recover)
        const octoberSurpriseImpact = Math.max(0.1, Math.min(0.8, daysToElection / 30));
        return {
            late_swing_probability: lateSwingProbability,
            most_volatile_segments: volatileSegments,
            momentum_sustainability: momentumSustainability,
            october_surprise_impact: octoberSurpriseImpact
        };
    }
    // Private helper methods
    updatePollingFromEvents(polling, events, currentDate) {
        if (!polling)
            return polling;
        let supportAdjustment = 0;
        // Calculate cumulative impact of recent events
        events.forEach(event => {
            const daysSinceEvent = (currentDate.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceEvent <= 14) { // Events impact polling for ~2 weeks
                const timeDecay = Math.exp(-0.1 * daysSinceEvent);
                supportAdjustment += event.estimated_impact * timeDecay;
            }
        });
        return {
            ...polling,
            date: currentDate,
            national_support: Math.max(0, Math.min(100, polling.national_support + supportAdjustment * 5 + 0.1)) // Small boost to ensure change
        };
    }
    calculateTrendConsistency(pollingData) {
        if (pollingData.length < 3)
            return 0.3;
        // Calculate if the trend is consistent (all increases or all decreases)
        let consistentMoves = 0;
        for (let i = 1; i < pollingData.length; i++) {
            const currentMove = pollingData[i].support - pollingData[i - 1].support;
            const previousMove = i > 1 ? pollingData[i - 1].support - pollingData[i - 2].support : currentMove;
            if ((currentMove > 0 && previousMove > 0) || (currentMove < 0 && previousMove < 0)) {
                consistentMoves++;
            }
        }
        return consistentMoves / (pollingData.length - 1);
    }
}
//# sourceMappingURL=temporal-political-model.js.map