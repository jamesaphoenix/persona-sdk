import { PersonaGroup } from '../persona-group';
import { StructuredOutputGenerator } from '../tools/structured-output-generator';
import { 
  ElectionContext, 
  ElectionPrediction, 
  PoliticalContext, 
  VotingPrediction,
  CandidateProfile,
  PoliticalAnalysisConfig
} from './types';
import { z } from 'zod';

/**
 * Multi-step political reasoning framework for election prediction using synthetic personas
 */
export class PoliticalAnalysisFramework {
  private structuredOutputGenerator: StructuredOutputGenerator;
  private config: PoliticalAnalysisConfig;

  constructor(
    private _apiKey: string,
    private voterPersonas: PersonaGroup,
    config: Partial<PoliticalAnalysisConfig> = {}
  ) {
    this.structuredOutputGenerator = new StructuredOutputGenerator(this._apiKey);
    this.config = {
      reasoning_depth: 'comprehensive',
      temporal_window_days: 30,
      confidence_threshold: 0.7,
      demographic_granularity: 'state',
      include_uncertainty: true,
      validation_mode: false,
      ...config
    };
  }

  /**
   * Predict election outcome using multi-step reasoning
   */
  async predictElectionOutcome(election: ElectionContext): Promise<ElectionPrediction> {
    console.log(`Predicting election outcome for ${election.type} election on ${election.date}`);
    
    // Step 1: Demographic analysis
    const demographicInfluence = await this.analyzeDemographics(election);
    
    // Step 2: Ideological positioning
    const ideologicalAlignment = await this.analyzeIdeology(election);
    
    // Step 3: Temporal dynamics (policy changes, events)
    const temporalFactors = await this.analyzeTemporalDynamics(election);
    
    // Step 4: Chain of Thought integration
    const prediction = await this.chainOfThoughtPrediction({
      demographics: demographicInfluence,
      ideology: ideologicalAlignment,
      temporal: temporalFactors,
      personas: this.voterPersonas,
      election
    });
    
    console.log(`Prediction completed with ${prediction.confidence.toFixed(3)} confidence`);
    return prediction;
  }

  /**
   * Analyze demographic influence on voting patterns
   */
  async analyzeDemographics(election: ElectionContext) {
    const DemographicAnalysisSchema = z.object({
      segments: z.array(z.object({
        name: z.string().describe('Name of demographic segment'),
        size_percentage: z.number().describe('Percentage of electorate'),
        key_characteristics: z.array(z.string()).describe('Defining demographic traits'),
        candidate_preferences: z.record(z.number()).describe('Support levels for each candidate'),
        turnout_likelihood: z.number().describe('Expected turnout rate 0-1'),
        swing_potential: z.number().describe('Likelihood to change vote 0-1')
      })),
      key_swing_demographics: z.array(z.string()).describe('Most important swing demographics'),
      demographic_trends: z.array(z.string()).describe('Notable demographic trends affecting this election')
    });

    const prompt = this.buildDemographicAnalysisPrompt(election);
    
    const result = await this.structuredOutputGenerator.generateCustom(
      this.voterPersonas,
      DemographicAnalysisSchema,
      prompt
    );

    return result.data;
  }

  /**
   * Analyze ideological alignment between voters and candidates
   */
  async analyzeIdeology(election: ElectionContext) {
    const IdeologicalAnalysisSchema = z.object({
      candidate_positioning: z.record(z.object({
        overall_ideology: z.number().describe('Ideology score -3 to 3'),
        issue_positions: z.record(z.number()).describe('Position on key issues -3 to 3'),
        coalition_appeal: z.array(z.string()).describe('Voter groups most appealing to'),
        potential_conflicts: z.array(z.string()).describe('Ideological conflicts or weaknesses')
      })),
      voter_candidate_alignment: z.record(z.object({
        alignment_score: z.number().describe('Overall alignment 0-1'),
        issue_alignment: z.record(z.number()).describe('Alignment on specific issues'),
        enthusiasm_level: z.number().describe('Voter enthusiasm 0-1')
      })),
      cross_pressures: z.array(z.object({
        voter_segment: z.string(),
        conflicting_preferences: z.string(),
        resolution_likelihood: z.number()
      }))
    });

    const prompt = this.buildIdeologicalAnalysisPrompt(election);
    
    const result = await this.structuredOutputGenerator.generateCustom(
      this.voterPersonas,
      IdeologicalAnalysisSchema,
      prompt
    );

    return result.data;
  }

  /**
   * Analyze temporal dynamics affecting the election
   */
  async analyzeTemporalDynamics(election: ElectionContext) {
    const TemporalAnalysisSchema = z.object({
      momentum_analysis: z.record(z.object({
        current_momentum: z.number().describe('Current momentum -1 to 1'),
        momentum_drivers: z.array(z.string()).describe('Factors driving momentum'),
        sustainability: z.number().describe('Likelihood momentum continues 0-1')
      })),
      event_impacts: z.array(z.object({
        event: z.string(),
        impact_magnitude: z.number().describe('Impact strength -1 to 1'),
        affected_groups: z.array(z.string()),
        duration_estimate: z.string()
      })),
      late_deciding_factors: z.array(z.string()).describe('Issues likely to influence late deciders'),
      external_risks: z.array(z.object({
        risk: z.string(),
        probability: z.number(),
        potential_impact: z.number()
      }))
    });

    const prompt = this.buildTemporalAnalysisPrompt(election);
    
    const result = await this.structuredOutputGenerator.generateCustom(
      this.voterPersonas,
      TemporalAnalysisSchema,
      prompt
    );

    return result.data;
  }

  /**
   * Perform chain-of-thought reasoning for final prediction
   */
  async chainOfThoughtPrediction(analysis: {
    demographics: any;
    ideology: any;
    temporal: any;
    personas: PersonaGroup;
    election: ElectionContext;
  }): Promise<ElectionPrediction> {
    
    const PredictionSchema = z.object({
      reasoning_chain: z.array(z.string()).describe('Step by step reasoning process'),
      winner: z.string().describe('Predicted winner'),
      confidence: z.number().describe('Prediction confidence 0-1'),
      vote_share: z.record(z.number()).describe('Predicted vote share for each candidate'),
      state_results: z.record(z.object({
        winner: z.string(),
        margin: z.number(),
        confidence: z.number()
      })).describe('State-by-state predictions'),
      key_factors: z.array(z.string()).describe('Most important factors in prediction'),
      uncertainty_sources: z.array(z.string()).describe('Main sources of uncertainty'),
      turnout_prediction: z.object({
        overall_turnout: z.number(),
        demographic_variations: z.record(z.number())
      }),
      sensitivity_analysis: z.array(z.object({
        factor: z.string(),
        impact_if_changed: z.string()
      }))
    });

    const prompt = this.buildChainOfThoughtPrompt(analysis);
    
    const result = await this.structuredOutputGenerator.generateCustom(
      analysis.personas,
      PredictionSchema,
      prompt
    );

    const prediction = result.data;

    // Process and enhance the prediction
    const enhancedPrediction: ElectionPrediction = {
      winner: prediction.winner,
      confidence: prediction.confidence,
      vote_share: prediction.vote_share,
      electoral_votes: this.calculateElectoralVotes(prediction.state_results),
      state_results: prediction.state_results,
      demographic_analysis: {
        segments: analysis.demographics.segments,
        key_swing_groups: analysis.demographics.key_swing_demographics
      },
      temporal_factors: {
        momentum: this.extractMomentum(analysis.temporal),
        late_deciding_voters: 0.08, // Typical estimate
        external_event_impact: this.calculateExternalEventImpact(analysis.temporal)
      }
    };

    return enhancedPrediction;
  }

  /**
   * Simulate voter response to campaign events or policy changes
   */
  async simulateVoterResponse(
    voters: PersonaGroup,
    candidates: CandidateProfile[],
    context: PoliticalContext
  ): Promise<VotingPrediction> {
    
    const ResponseSimulationSchema = z.object({
      candidate_support: z.record(z.number()).describe('Support levels for each candidate'),
      turnout_probability: z.number().describe('Overall turnout probability'),
      confidence_level: z.number().describe('Confidence in predictions'),
      demographic_breakdown: z.record(z.record(z.number())).describe('Support by demographic group'),
      swing_factors: z.array(z.string()).describe('Factors most likely to change votes'),
      volatility_indicators: z.array(z.string()).describe('Signs of potential vote changes')
    });

    const prompt = this.buildVoterResponsePrompt(candidates, context);
    
    const result = await this.structuredOutputGenerator.generateCustom(
      voters,
      ResponseSimulationSchema,
      prompt
    );

    return result.data;
  }

  // Private methods for building prompts

  private buildDemographicAnalysisPrompt(election: ElectionContext): string {
    return `Analyze the demographic composition of voters in this ${election.type} election and predict voting patterns.

Election Context:
- Date: ${election.date.toDateString()}
- Type: ${election.type}
- Key Issues: ${election.key_issues.join(', ')}
- Candidates: ${election.candidates.map(c => c.biography.name).join(', ')}

For each significant demographic segment in the voter personas:
1. Identify the segment's key characteristics (age, education, race, geography, etc.)
2. Estimate their size as a percentage of the electorate
3. Predict candidate preferences based on historical patterns and current issues
4. Assess their turnout likelihood
5. Evaluate their potential as swing voters

Focus on segments that could be decisive in this election. Consider how demographic trends and generational changes might affect traditional voting patterns.`;
  }

  private buildIdeologicalAnalysisPrompt(election: ElectionContext): string {
    return `Analyze the ideological landscape of this election and how voter ideologies align with candidate positions.

Candidates and their general positions:
${election.candidates.map(c => `- ${c.biography.name} (${c.biography.party}): ${Object.entries(c.policy_positions).map(([issue, pos]) => `${issue}: ${pos.position}`).join(', ')}`).join('\n')}

Key Issues in this election: ${election.key_issues.join(', ')}

For each candidate:
1. Assess their overall ideological positioning (-3 very liberal to +3 very conservative)
2. Evaluate their positions on key issues
3. Identify their core coalition and potential crossover appeal
4. Note any ideological conflicts or weaknesses

For voter-candidate alignment:
1. Calculate alignment scores between voter segments and candidates
2. Identify cross-pressures where voters like some aspects but not others
3. Predict how these tensions might resolve

Consider how issue salience affects the weight of different ideological positions.`;
  }

  private buildTemporalAnalysisPrompt(election: ElectionContext): string {
    const recentEvents = election.recent_events
      .map(e => `${e.date.toDateString()}: ${e.type} - ${e.description}`)
      .join('\n');

    return `Analyze the temporal dynamics and momentum in this election campaign.

Recent Events:
${recentEvents}

Economic Context:
${election.economic_indicators ? `
- GDP Growth: ${election.economic_indicators.gdp_growth}%
- Unemployment: ${election.economic_indicators.unemployment_rate}%
- Inflation: ${election.economic_indicators.inflation_rate}%
` : 'Economic data not provided'}

Assess:
1. Current momentum for each candidate (positive/negative trends)
2. Impact of recent campaign events on voter preferences
3. Factors that could influence late-deciding voters
4. External risks that could change the race (scandals, economic changes, international events)
5. Sustainability of current trends through election day

Consider how the ${this.config.temporal_window_days}-day window leading up to the election might affect outcomes.`;
  }

  private buildChainOfThoughtPrompt(analysis: any): string {
    return `Using the comprehensive analysis provided, make a step-by-step prediction for this election outcome.

Available Analysis:
1. Demographic Analysis: ${JSON.stringify(analysis.demographics, null, 2)}
2. Ideological Analysis: ${JSON.stringify(analysis.ideology, null, 2)}
3. Temporal Analysis: ${JSON.stringify(analysis.temporal, null, 2)}

Reasoning Process:
1. Weight the importance of different factors (demographics, ideology, momentum, events)
2. Integrate findings across all analysis dimensions
3. Consider how factors interact and reinforce or conflict with each other
4. Account for uncertainty and confidence levels
5. Make state-by-state predictions based on voter composition
6. Provide overall winner prediction with vote shares

Be explicit about your reasoning chain. Explain how you weighted different factors and why certain evidence was more convincing than others. Include sensitivity analysis - how would the prediction change if key assumptions were different?

Confidence level should reflect the degree of uncertainty in the prediction. Lower confidence for close races or when conflicting signals exist.`;
  }

  private buildVoterResponsePrompt(candidates: CandidateProfile[], context: PoliticalContext): string {
    return `Simulate how these voters would respond to the current political context and candidate options.

Candidates:
${candidates.map(c => `${c.biography.name}: ${c.biography.background}`).join('\n')}

Political Context:
- National Mood: ${context.national_mood > 0 ? 'Favoring Status Quo' : 'Favoring Change'}
- Polarization Level: ${context.polarization_level}
- Key Issues: ${Object.entries(context.issue_salience).map(([issue, salience]) => `${issue} (${salience})`).join(', ')}

Analyze how each voter persona would likely:
1. Choose between candidates based on their attributes and preferences
2. Decide whether to turn out to vote
3. Respond to campaign messaging and events
4. Be influenced by social and media pressures

Provide demographic breakdowns and identify the most volatile voter segments.`;
  }

  // Helper methods

  private calculateElectoralVotes(stateResults: Record<string, any>): Record<string, number> {
    // Simplified electoral vote calculation
    // In a real implementation, this would use actual state electoral vote counts
    const electoralVotes: Record<string, number> = {};
    
    Object.entries(stateResults).forEach(([state, result]) => {
      const votes = this.getStateElectoralVotes(state);
      electoralVotes[result.winner] = (electoralVotes[result.winner] || 0) + votes;
    });

    return electoralVotes;
  }

  private getStateElectoralVotes(state: string): number {
    // Simplified mapping - in practice would use full electoral college map
    const electoralMap: Record<string, number> = {
      'California': 55, 'Texas': 38, 'Florida': 29, 'New York': 29,
      'Pennsylvania': 20, 'Illinois': 20, 'Ohio': 18
    };
    return electoralMap[state] || 3; // Default for smaller states
  }

  private extractMomentum(temporalAnalysis: any): Record<string, number> {
    const momentum: Record<string, number> = {};
    
    if (temporalAnalysis.momentum_analysis) {
      Object.entries(temporalAnalysis.momentum_analysis).forEach(([candidate, data]: [string, any]) => {
        momentum[candidate] = data.current_momentum || 0;
      });
    }
    
    return momentum;
  }

  private calculateExternalEventImpact(temporalAnalysis: any): number {
    if (!temporalAnalysis.event_impacts) return 0;
    
    return temporalAnalysis.event_impacts.reduce((total: number, event: any) => {
      return total + Math.abs(event.impact_magnitude || 0);
    }, 0) / temporalAnalysis.event_impacts.length;
  }
}