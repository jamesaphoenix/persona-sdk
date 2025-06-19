import { PersonaGroup } from '../persona-group';
import { PoliticalAnalysisFramework } from './political-analysis-framework';
import { TemporalPoliticalModel } from './temporal-political-model';
import { VoterPersonaGenerator } from './voter-persona-generator';
import { ANESDataProcessor } from './anes-data-processor';
/**
 * Main engine for election prediction using synthetic voter personas and multi-dimensional analysis
 */
export class ElectionPredictionEngine {
    apiKey;
    config;
    politicalFramework;
    temporalModel;
    voterGenerator;
    anesProcessor;
    constructor(apiKey, config = {}) {
        this.apiKey = apiKey;
        this.config = config;
        this.temporalModel = new TemporalPoliticalModel();
        this.voterGenerator = new VoterPersonaGenerator();
        this.anesProcessor = new ANESDataProcessor();
        // Initialize with default voter sample
        const defaultVoters = new PersonaGroup('Default Voters');
        this.politicalFramework = new PoliticalAnalysisFramework(apiKey, defaultVoters, {
            reasoning_depth: 'comprehensive',
            temporal_window_days: config.prediction_horizon_days || 30,
            confidence_threshold: config.confidence_threshold || 0.7
        });
    }
    /**
     * Run complete election prediction with all analysis steps
     */
    async predictElection(election, voterPopulation) {
        console.log(`Starting election prediction for ${election.type} election on ${election.date.toDateString()}`);
        // Step 1: Generate or use provided voter population
        const voters = voterPopulation || await this.generateVoterPopulation(election);
        console.log(`Using voter population of ${voters.personas.length} personas`);
        // Step 2: Update framework with current voter population
        this.politicalFramework = new PoliticalAnalysisFramework(this.apiKey, voters);
        // Step 3: Apply temporal updates to candidates if enabled
        if (this.config.enable_temporal_tracking) {
            election = await this.applyTemporalUpdates(election);
        }
        // Step 4: Run multi-step prediction
        const prediction = await this.politicalFramework.predictElectionOutcome(election);
        // Step 5: Enhance prediction with additional analysis
        const enhancedPrediction = await this.enhancePrediction(prediction, election, voters);
        console.log(`Prediction complete: ${enhancedPrediction.winner} wins with ${enhancedPrediction.confidence.toFixed(3)} confidence`);
        return enhancedPrediction;
    }
    /**
     * Simulate election under different scenarios
     */
    async simulateScenarios(baseElection, scenarios) {
        const results = [];
        for (const scenario of scenarios) {
            console.log(`Running scenario: ${scenario.name}`);
            // Apply scenario changes to election context
            const modifiedElection = this.applyScenarioChanges(baseElection, scenario.changes);
            // Generate appropriate voter population for this scenario
            const voters = await this.generateScenarioVoters(modifiedElection, scenario.changes);
            // Run prediction
            const prediction = await this.predictElection(modifiedElection, voters);
            results.push({
                scenario: scenario.name,
                prediction
            });
        }
        return results;
    }
    /**
     * Track prediction accuracy by comparing against actual results
     */
    async validatePrediction(prediction, actualResults) {
        const validation = {
            overall_accuracy: 0,
            winner_correct: prediction.winner === actualResults.winner,
            vote_share_error: {},
            state_prediction_accuracy: 0,
            detailed_analysis: ''
        };
        // Calculate vote share accuracy
        let totalError = 0;
        Object.keys(prediction.vote_share).forEach(candidate => {
            const predicted = prediction.vote_share[candidate];
            const actual = actualResults.vote_share[candidate] || 0;
            const error = Math.abs(predicted - actual);
            validation.vote_share_error[candidate] = error;
            totalError += error;
        });
        // Calculate state-level accuracy
        let correctStates = 0;
        const totalStates = Object.keys(prediction.state_results).length;
        Object.keys(prediction.state_results).forEach(state => {
            const predictedWinner = prediction.state_results[state].winner;
            const actualWinner = actualResults.state_results[state]?.winner;
            if (predictedWinner === actualWinner) {
                correctStates++;
            }
        });
        validation.state_prediction_accuracy = correctStates / totalStates;
        validation.overall_accuracy = validation.winner_correct ? 0.7 : 0.0;
        validation.overall_accuracy += (1 - totalError / Object.keys(prediction.vote_share).length) * 0.3;
        validation.detailed_analysis = this.generateValidationAnalysis(prediction, actualResults, validation);
        return validation;
    }
    /**
     * Generate real-time prediction updates as new data becomes available
     */
    async updatePrediction(currentPrediction, newData) {
        console.log('Updating prediction with new data...');
        // Create modified election context
        const updatedElection = this.incorporateNewData(currentPrediction, newData);
        // Re-run prediction with updated context
        const updatedPrediction = await this.politicalFramework.predictElectionOutcome(updatedElection);
        // Calculate prediction change momentum
        const momentum = this.calculatePredictionMomentum(currentPrediction, updatedPrediction);
        console.log(`Prediction updated. Momentum: ${JSON.stringify(momentum)}`);
        return updatedPrediction;
    }
    /**
     * Generate synthetic voter population for the election
     */
    async generateVoterPopulation(election) {
        const sampleSize = this.config.voter_sample_size || 1000;
        if (this.config.use_anes_data) {
            // Use ANES data if available
            const anesYear = this.determineANESYear(election.date);
            const anesData = await this.anesProcessor.loadANESData(anesYear);
            return await this.anesProcessor.generateSyntheticVoters(anesData, sampleSize);
        }
        else {
            // Generate based on election context
            const demographicProfile = this.inferDemographicProfile(election);
            const politicalLean = this.inferPoliticalLean(election);
            return await this.voterGenerator.generateVoterPersonas(sampleSize, {
                demographicProfile,
                politicalLean,
                year: election.date.getFullYear()
            });
        }
    }
    /**
     * Apply temporal updates to candidate positions and context
     */
    async applyTemporalUpdates(election) {
        const updatedCandidates = await Promise.all(election.candidates.map(candidate => this.temporalModel.updateCandidatePositions(candidate, new Date())));
        return {
            ...election,
            candidates: updatedCandidates
        };
    }
    /**
     * Enhance prediction with additional analysis
     */
    async enhancePrediction(prediction, election, voters) {
        // Add late-campaign dynamics analysis
        const lateDynamics = this.temporalModel.predictLateCampaignDynamics(election.candidates, new Date(), election.date, prediction.vote_share);
        // Enhance with voter simulation results
        const voterSimulation = await this.runVoterSimulation(voters, election);
        return {
            ...prediction,
            temporal_factors: {
                ...prediction.temporal_factors,
                late_swing_probability: lateDynamics.late_swing_probability,
                volatile_segments: lateDynamics.most_volatile_segments,
                momentum_sustainability: lateDynamics.momentum_sustainability
            },
            demographic_analysis: {
                ...prediction.demographic_analysis,
                simulation_results: voterSimulation
            }
        };
    }
    /**
     * Apply scenario changes to election context
     */
    applyScenarioChanges(baseElection, changes) {
        const modified = JSON.parse(JSON.stringify(baseElection)); // Deep copy
        // Apply economic changes
        if (changes.economic_shift && modified.economic_indicators) {
            modified.economic_indicators.gdp_growth += changes.economic_shift;
        }
        // Add major events
        if (changes.major_event) {
            modified.recent_events.push({
                date: new Date(),
                type: 'external_event',
                description: changes.major_event,
                estimated_impact: 0.2
            });
        }
        // Apply candidate position shifts
        if (changes.candidate_position_shifts) {
            Object.keys(changes.candidate_position_shifts).forEach(candidateName => {
                const candidate = modified.candidates.find((c) => c.biography.name === candidateName);
                if (candidate) {
                    Object.keys(changes.candidate_position_shifts[candidateName]).forEach(issue => {
                        if (candidate.policy_positions[issue]) {
                            candidate.policy_positions[issue].position += changes.candidate_position_shifts[candidateName][issue];
                        }
                    });
                }
            });
        }
        return modified;
    }
    /**
     * Generate voter population adjusted for scenario
     */
    async generateScenarioVoters(election, changes) {
        const baseVoters = await this.generateVoterPopulation(election);
        // Apply turnout variations if specified
        if (changes.turnout_variation) {
            // Modify turnout likelihood for all personas
            baseVoters.personas.forEach(persona => {
                const currentTurnout = persona.attributes.turnout_likelihood || 0.7;
                persona.attributes.turnout_likelihood = Math.max(0, Math.min(1, currentTurnout + changes.turnout_variation));
            });
        }
        return baseVoters;
    }
    /**
     * Run detailed voter simulation
     */
    async runVoterSimulation(voters, election) {
        const context = {
            national_mood: election.approval_ratings?.president ?
                (election.approval_ratings.president - 50) / 50 : 0,
            polarization_level: 0.7, // High polarization assumption
            issue_salience: election.key_issues.reduce((acc, issue) => {
                acc[issue] = 0.8; // High salience for key issues
                return acc;
            }, {}),
            media_attention: {}
        };
        return await this.politicalFramework.simulateVoterResponse(voters, election.candidates, context);
    }
    /**
     * Generate validation analysis text
     */
    generateValidationAnalysis(_prediction, actual, validation) {
        let analysis = `Prediction Validation Analysis:\n\n`;
        analysis += `Winner Prediction: ${validation.winner_correct ? 'CORRECT' : 'INCORRECT'}\n`;
        analysis += `Predicted: ${validation.predicted_winner || 'Unknown'}, Actual: ${actual.winner}\n\n`;
        analysis += `Vote Share Accuracy:\n`;
        Object.keys(validation.vote_share_error).forEach(candidate => {
            analysis += `  ${candidate}: ${validation.vote_share_error[candidate].toFixed(2)}% error\n`;
        });
        analysis += `\nState-Level Accuracy: ${(validation.state_prediction_accuracy * 100).toFixed(1)}%\n`;
        analysis += `Overall Accuracy Score: ${(validation.overall_accuracy * 100).toFixed(1)}%\n`;
        return analysis;
    }
    /**
     * Incorporate new data into election context
     */
    incorporateNewData(_prediction, newData) {
        // This would create an updated election context based on new data
        // For now, returning a simplified structure
        return {
            date: new Date(),
            type: 'presidential',
            candidates: [],
            key_issues: [],
            recent_events: (newData.new_events || []).map(event => ({
                date: event.date,
                type: event.type,
                description: event.description,
                estimated_impact: event.impact
            }))
        };
    }
    /**
     * Calculate momentum between predictions
     */
    calculatePredictionMomentum(previous, current) {
        const momentum = {};
        Object.keys(current.vote_share).forEach(candidate => {
            const prevShare = previous.vote_share[candidate] || 0;
            const currShare = current.vote_share[candidate] || 0;
            momentum[candidate] = currShare - prevShare;
        });
        return momentum;
    }
    /**
     * Determine appropriate ANES year for election
     */
    determineANESYear(electionDate) {
        const year = electionDate.getFullYear();
        if (year >= 2022)
            return 2024;
        if (year >= 2018)
            return 2020;
        return 2016;
    }
    /**
     * Infer demographic profile from election context
     */
    inferDemographicProfile(_election) {
        // Simplified logic - could be enhanced based on election type and location
        return 'national';
    }
    /**
     * Infer political lean from election context
     */
    inferPoliticalLean(election) {
        // Analyze candidate positions to determine overall political landscape
        if (election.candidates.length < 2)
            return 'mixed';
        const avgIdeology = election.candidates.reduce((sum, candidate) => {
            const positions = Object.values(candidate.policy_positions);
            const avgPosition = positions.reduce((s, p) => s + p.position, 0) / positions.length;
            return sum + avgPosition;
        }, 0) / election.candidates.length;
        if (avgIdeology < -0.5)
            return 'left';
        if (avgIdeology > 0.5)
            return 'right';
        return 'center';
    }
}
//# sourceMappingURL=election-prediction-engine.js.map