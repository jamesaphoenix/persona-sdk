
/**
 * ANES (American National Election Studies) voter data structure
 */
export interface ANESVoterData {
  demographics: {
    age: number;
    education: string;
    income: number;
    race: string;
    gender: string;
    geography: string;
    state?: string;
    county?: string;
    urbanicity?: 'urban' | 'suburban' | 'rural';
  };
  ideology: {
    party_identification: string;
    political_views: string;
    issue_positions: Record<string, number>;
    ideology_scale?: number; // -3 (very liberal) to +3 (very conservative)
  };
  voting_history: {
    past_elections: string[];
    turnout_likelihood: number;
    primary_participation?: boolean;
    vote_method?: 'in_person' | 'mail' | 'early';
  };
  media_consumption?: {
    news_sources: string[];
    social_media_platforms: string[];
    news_frequency: number;
  };
}

/**
 * Policy position on a specific issue
 */
export interface PolicyPosition {
  issue: string;
  position: number; // -3 (very liberal) to +3 (very conservative)
  salience: number; // 0-1, how important this issue is
  detailed_stance?: string;
  supporting_evidence?: string[];
}

/**
 * Change in policy position over time
 */
export interface PolicyShift {
  date: Date;
  previous_position: number;
  new_position: number;
  reason: string;
  impact_score?: number;
}

/**
 * Campaign event that might influence voter behavior
 */
export interface CampaignEvent {
  date: Date;
  type: 'debate' | 'speech' | 'controversy' | 'endorsement' | 'policy_announcement' | 'scandal';
  description: string;
  candidate?: string;
  estimated_impact: number; // -1 to +1
  affected_demographics?: string[];
}

/**
 * Candidate profile for election modeling
 */
export interface CandidateProfile {
  biography: {
    name: string;
    age: number;
    experience: string[];
    background: string;
    party: string;
    previous_offices?: string[];
  };
  policy_positions: {
    economy: PolicyPosition;
    healthcare: PolicyPosition;
    immigration: PolicyPosition;
    environment: PolicyPosition;
    education: PolicyPosition;
    foreign_policy: PolicyPosition;
    social_issues: PolicyPosition;
    [key: string]: PolicyPosition;
  };
  temporal_changes: {
    position_shifts: Record<string, PolicyShift[]>;
    campaign_events: CampaignEvent[];
  };
  polling_data?: {
    date: Date;
    national_support: number;
    state_support?: Record<string, number>;
    demographic_support?: Record<string, number>;
  };
}

/**
 * Context for a specific election
 */
export interface ElectionContext {
  date: Date;
  type: 'presidential' | 'congressional' | 'gubernatorial' | 'local';
  candidates: CandidateProfile[];
  key_issues: string[];
  recent_events: CampaignEvent[];
  economic_indicators?: {
    gdp_growth: number;
    unemployment_rate: number;
    inflation_rate: number;
  };
  approval_ratings?: {
    president: number;
    congress: number;
  };
}

/**
 * Political context affecting voter behavior
 */
export interface PoliticalContext {
  national_mood: number; // -1 (change) to +1 (status quo)
  polarization_level: number; // 0-1
  issue_salience: Record<string, number>;
  media_attention: Record<string, number>;
  external_events?: string[];
}

/**
 * Prediction for voting behavior
 */
export interface VotingPrediction {
  candidate_support: Record<string, number>;
  turnout_probability: number;
  confidence_level: number;
  demographic_breakdown: Record<string, Record<string, number>>;
  swing_factors: string[];
}

/**
 * Voter segment for analysis
 */
export interface VoterSegment {
  name: string;
  description: string;
  demographics: Partial<ANESVoterData['demographics']>;
  size_percentage: number;
  voting_patterns: {
    historical_turnout: number;
    party_loyalty: number;
    issue_priorities: string[];
  };
}

/**
 * Complete election prediction result
 */
export interface ElectionPrediction {
  winner: string;
  confidence: number;
  vote_share: Record<string, number>;
  electoral_votes?: Record<string, number>;
  state_results: Record<string, {
    winner: string;
    margin: number;
    confidence: number;
  }>;
  demographic_analysis: {
    segments: VoterSegment[];
    key_swing_groups: string[];
    simulation_results?: any;
  };
  temporal_factors: {
    momentum: Record<string, number>;
    late_deciding_voters: number;
    external_event_impact: number;
    late_swing_probability?: number;
    volatile_segments?: string[];
    momentum_sustainability?: Record<string, number>;
  };
  validation_metrics?: ElectionValidation;
}

/**
 * Validation results against actual election data
 */
export interface ElectionValidation {
  accuracy_score: number;
  state_level_accuracy: number;
  demographic_accuracy: Record<string, number>;
  prediction_date: Date;
  actual_results?: {
    winner: string;
    vote_share: Record<string, number>;
    turnout: number;
  };
}

/**
 * Configuration for ANES data processing
 */
export interface ANESProcessingOptions {
  year: 2016 | 2020 | 2024;
  include_weights?: boolean;
  filter_criteria?: {
    min_age?: number;
    max_age?: number;
    states?: string[];
    education_levels?: string[];
  };
  synthetic_scaling?: {
    target_population: number;
    preserve_correlations: boolean;
    add_temporal_variation: boolean;
  };
}

/**
 * Configuration for political analysis
 */
export interface PoliticalAnalysisConfig {
  reasoning_depth: 'basic' | 'comprehensive' | 'academic';
  temporal_window_days: number;
  confidence_threshold: number;
  demographic_granularity: 'state' | 'county' | 'precinct';
  include_uncertainty: boolean;
  validation_mode?: boolean;
}