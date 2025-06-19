import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { PersonaGroup } from '../../src/persona-group';
import { PersonaBuilder } from '../../src/persona-builder';
import { 
  PoliticalAnalysisFramework,
  ElectionPredictionEngine,
  TemporalPoliticalModel,
  VoterPersonaGenerator,
  ANESDataProcessor
} from '../../src/political';
import { 
  ElectionContext,
  CandidateProfile,
  PoliticalContext,
  ANESVoterData
} from '../../src/political/types';
import { mockLangChain } from '../mocks/langchain';

// Mock LangChain before imports
mockLangChain();

describe('Political Analysis Runtime Tests', () => {
  let apiKey: string;

  beforeAll(() => {
    apiKey = process.env.OPENAI_API_KEY || 'test-key';
  });

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  describe('VoterPersonaGenerator Runtime', () => {
    it('should generate realistic voter personas with correlations', async () => {
      const generator = new VoterPersonaGenerator();
      
      const voterGroup = await generator.generateVoterPersonas(50, {
        demographicProfile: 'national',
        politicalLean: 'mixed',
        year: 2024
      });

      expect(voterGroup).toBeInstanceOf(PersonaGroup);
      expect(voterGroup.personas).toHaveLength(50);
      
      // Verify realistic demographic distributions
      const ages = voterGroup.personas.map(p => p.age);
      const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
      expect(avgAge).toBeGreaterThan(30);
      expect(avgAge).toBeLessThan(60);
      
      // Verify political attributes exist
      const firstVoter = voterGroup.personas[0];
      expect(firstVoter.getAttribute('party_identification')).toBeDefined();
      expect(firstVoter.getAttribute('ideology_scale')).toBeDefined();
      expect(firstVoter.getAttribute('turnout_likelihood')).toBeDefined();
    });

    it('should generate swing voters with specific characteristics', async () => {
      const generator = new VoterPersonaGenerator();
      
      const swingVoters = await generator.generateSwingVoters(25, {
        uncertainty_level: 0.8,
        cross_pressures: ['economy vs environment', 'social issues vs fiscal policy'],
        demographic_profile: 'suburban_women'
      });

      expect(swingVoters.personas).toHaveLength(25);
      
      // Verify swing characteristics
      const uncertainties = swingVoters.personas.map(p => 
        p.getAttribute('uncertainty') as number || 0
      );
      const avgUncertainty = uncertainties.reduce((sum, u) => sum + u, 0) / uncertainties.length;
      expect(avgUncertainty).toBeGreaterThan(0.5);
    });

    it('should generate voter segments with targeted characteristics', async () => {
      const generator = new VoterPersonaGenerator();
      
      const segments = await generator.generateVoterSegments([
        {
          name: 'Young Urban Professionals',
          size: 30,
          characteristics: {
            age_range: [25, 40],
            education_levels: ['College Grad', 'Graduate'],
            income_range: [60000, 120000],
            party_preferences: { 'Democrat': 0.6, 'Independent': 0.3, 'Republican': 0.1 },
            ideology_range: [-2, 0],
            geography: ['urban']
          }
        },
        {
          name: 'Rural Conservative Base',
          size: 20,
          characteristics: {
            age_range: [40, 70],
            education_levels: ['High School', 'Some College'],
            income_range: [30000, 70000],
            party_preferences: { 'Republican': 0.7, 'Independent': 0.2, 'Democrat': 0.1 },
            ideology_range: [0.5, 3],
            geography: ['rural']
          }
        }
      ]);

      expect(segments.personas).toHaveLength(50);
      
      // Verify segment characteristics
      const ages = segments.personas.map(p => p.age);
      expect(Math.min(...ages)).toBeGreaterThanOrEqual(25);
      expect(Math.max(...ages)).toBeLessThanOrEqual(70);
    });
  });

  describe('ANESDataProcessor Runtime', () => {
    it('should load and process ANES data for multiple years', async () => {
      const processor = new ANESDataProcessor();
      
      const anes2020 = await processor.loadANESData(2020, {
        year: 2020,
        filter_criteria: {
          min_age: 18,
          max_age: 100,
          states: ['California', 'Texas', 'Florida']
        }
      });

      expect(anes2020).toBeInstanceOf(Array);
      expect(anes2020.length).toBeGreaterThan(100);
      
      // Verify ANES data structure
      const firstVoter = anes2020[0];
      expect(firstVoter.demographics).toBeDefined();
      expect(firstVoter.ideology).toBeDefined();
      expect(firstVoter.voting_history).toBeDefined();
      expect(firstVoter.demographics.age).toBeGreaterThanOrEqual(18);
    });

    it('should generate synthetic voters from ANES patterns', async () => {
      const processor = new ANESDataProcessor();
      
      const baseData = await processor.loadANESData(2020);
      const syntheticVoters = await processor.generateSyntheticVoters(baseData.slice(0, 100), 200);

      expect(syntheticVoters).toBeInstanceOf(PersonaGroup);
      expect(syntheticVoters.personas).toHaveLength(200);
      
      // Verify synthetic voters maintain realistic patterns
      const educationLevels = syntheticVoters.personas.map(p => 
        p.getAttribute('education') as string
      );
      const uniqueEducation = new Set(educationLevels);
      expect(uniqueEducation.size).toBeGreaterThan(3); // Multiple education levels
    });

    it('should analyze voter patterns comprehensively', async () => {
      const processor = new ANESDataProcessor();
      
      const anesData = await processor.loadANESData(2020, { year: 2020 });
      const patterns = processor.analyzeVoterPatterns(anesData.slice(0, 200));

      expect(patterns.demographics).toBeDefined();
      expect(patterns.ideology).toBeDefined();
      expect(patterns.voting_behavior).toBeDefined();
      
      // Verify demographic patterns
      expect(patterns.demographics.age.mean).toBeGreaterThan(0);
      expect(patterns.demographics.education).toBeDefined();
      expect(patterns.demographics.income.mean).toBeGreaterThan(0);
      
      // Verify ideological patterns
      expect(patterns.ideology.party_id).toBeDefined();
      expect(patterns.ideology.political_views).toBeDefined();
    });
  });

  describe('TemporalPoliticalModel Runtime', () => {
    let temporalModel: TemporalPoliticalModel;
    let sampleCandidate: CandidateProfile;

    beforeAll(() => {
      temporalModel = new TemporalPoliticalModel();
      sampleCandidate = {
        biography: {
          name: 'Test Candidate',
          age: 55,
          experience: ['Senator', 'Governor'],
          background: 'Career politician',
          party: 'Democrat'
        },
        policy_positions: {
          economy: { issue: 'economy', position: -1.2, salience: 0.9 },
          healthcare: { issue: 'healthcare', position: -1.5, salience: 0.8 },
          immigration: { issue: 'immigration', position: -0.8, salience: 0.7 },
          environment: { issue: 'environment', position: -2.0, salience: 0.6 },
          education: { issue: 'education', position: -1.0, salience: 0.5 },
          foreign_policy: { issue: 'foreign_policy', position: 0.2, salience: 0.7 },
          social_issues: { issue: 'social_issues', position: -1.8, salience: 0.6 }
        },
        temporal_changes: {
          position_shifts: {
            healthcare: [
              {
                date: new Date('2024-01-15'),
                previous_position: -1.2,
                new_position: -1.5,
                reason: 'Responded to primary pressure',
                impact_score: 0.3
              }
            ]
          },
          campaign_events: [
            {
              date: new Date('2024-02-01'),
              type: 'debate',
              description: 'Strong debate performance on healthcare',
              candidate: 'Test Candidate',
              estimated_impact: 0.15,
              affected_demographics: ['seniors', 'suburban_women']
            }
          ]
        },
        polling_data: {
          date: new Date('2024-02-15'),
          national_support: 47.5,
          state_support: { 'California': 52.1, 'Texas': 43.2 },
          demographic_support: { 'college_educated': 54.2, 'seniors': 41.8 }
        }
      };
    });

    it('should update candidate positions based on temporal changes', async () => {
      const futureDate = new Date('2024-03-01');
      
      const updatedCandidate = await temporalModel.updateCandidatePositions(
        sampleCandidate,
        futureDate
      );

      expect(updatedCandidate.policy_positions.healthcare.position).toBe(-1.5);
      expect(updatedCandidate.polling_data?.national_support).toBeGreaterThan(47.5);
    });

    it('should calculate campaign momentum accurately', async () => {
      const recentPolling = [
        { date: new Date('2024-02-01'), support: 45.2 },
        { date: new Date('2024-02-08'), support: 46.1 },
        { date: new Date('2024-02-15'), support: 47.5 },
        { date: new Date('2024-02-22'), support: 48.2 }
      ];

      const recentEvents = sampleCandidate.temporal_changes.campaign_events;
      
      const momentum = temporalModel.calculateMomentum(
        'Test Candidate',
        recentPolling,
        recentEvents
      );

      expect(momentum.momentum).toBeGreaterThan(0); // Rising trend
      expect(momentum.trend).toBe('rising');
      expect(momentum.confidence).toBeGreaterThan(0.5);
    });

    it('should predict position evolution under campaign pressures', async () => {
      const predictedCandidate = temporalModel.predictPositionEvolution(
        sampleCandidate,
        {
          primary_pressure: -0.3, // Move left for primary
          general_pressure: 0.1,  // Slight move right for general
          issue_salience: {
            economy: 0.9,
            healthcare: 0.8,
            environment: 0.4
          }
        },
        60 // 60 days ahead
      );

      // Should have predicted shifts on high-salience issues
      expect(predictedCandidate.temporal_changes.position_shifts.economy).toBeDefined();
      expect(predictedCandidate.temporal_changes.position_shifts.healthcare).toBeDefined();
    });

    it('should model external event impacts correctly', async () => {
      const economicEvent = {
        type: 'economic_data' as const,
        description: 'Strong jobs report released',
        magnitude: 0.6,
        date: new Date('2024-03-01')
      };

      const candidates = [sampleCandidate];
      const context: PoliticalContext = {
        national_mood: 0.1,
        polarization_level: 0.7,
        issue_salience: { economy: 0.9, healthcare: 0.7 }
      };

      const impact = temporalModel.modelExternalEventImpact(
        economicEvent,
        candidates,
        context
      );

      expect(impact.candidate_impacts).toBeDefined();
      expect(impact.issue_salience_changes.economy).toBeGreaterThan(0);
      expect(impact.overall_mood_shift).toBeGreaterThan(0);
    });

    it('should predict late campaign dynamics', async () => {
      const candidates = [sampleCandidate];
      const currentDate = new Date('2024-10-01');
      const electionDate = new Date('2024-11-05');
      const currentPolling = { 'Test Candidate': 48.5, 'Opponent': 47.2 };

      const lateDynamics = temporalModel.predictLateCampaignDynamics(
        candidates,
        currentDate,
        electionDate,
        currentPolling
      );

      expect(lateDynamics.late_swing_probability).toBeGreaterThan(0);
      expect(lateDynamics.most_volatile_segments).toContain('Independent voters');
      expect(lateDynamics.momentum_sustainability['Test Candidate']).toBeDefined();
      expect(lateDynamics.october_surprise_impact).toBeGreaterThan(0);
    });
  });

  describe('PoliticalAnalysisFramework Runtime', () => {
    let framework: PoliticalAnalysisFramework;
    let voterPersonas: PersonaGroup;
    let sampleElection: ElectionContext;

    beforeAll(async () => {
      // Create realistic voter personas
      voterPersonas = new PersonaGroup('Test Voters');
      
      // Add diverse voter personas
      const voterProfiles = [
        { name: 'Urban Professional', age: 32, party: 'Democrat', ideology: -1.2, education: 'Graduate', income: 85000 },
        { name: 'Rural Conservative', age: 58, party: 'Republican', ideology: 1.8, education: 'High School', income: 45000 },
        { name: 'Suburban Moderate', age: 45, party: 'Independent', ideology: 0.2, education: 'College Grad', income: 65000 },
        { name: 'Young Progressive', age: 26, party: 'Democrat', ideology: -2.1, education: 'College Grad', income: 52000 },
        { name: 'Senior Conservative', age: 72, party: 'Republican', ideology: 2.2, education: 'Some College', income: 38000 }
      ];

      voterProfiles.forEach(profile => {
        const persona = PersonaBuilder.create()
          .withName(profile.name)
          .withAge(profile.age)
          .withOccupation('Worker')
          .withSex('female')
          .withAttribute('party_identification', profile.party)
          .withAttribute('ideology_scale', profile.ideology)
          .withAttribute('education', profile.education)
          .withAttribute('income', profile.income)
          .withAttribute('turnout_likelihood', 0.75)
          .build();
        voterPersonas.add(persona);
      });

      framework = new PoliticalAnalysisFramework(apiKey, voterPersonas, {
        reasoning_depth: 'comprehensive',
        temporal_window_days: 30,
        confidence_threshold: 0.7
      });

      // Create sample election
      sampleElection = {
        date: new Date('2024-11-05'),
        type: 'presidential',
        candidates: [
          {
            biography: {
              name: 'Progressive Candidate',
              age: 52,
              experience: ['Senator', 'Governor'],
              background: 'Former prosecutor, education advocate',
              party: 'Democrat'
            },
            policy_positions: {
              economy: { issue: 'economy', position: -1.5, salience: 0.9 },
              healthcare: { issue: 'healthcare', position: -2.0, salience: 0.8 },
              immigration: { issue: 'immigration', position: -1.2, salience: 0.7 },
              environment: { issue: 'environment', position: -2.5, salience: 0.6 },
              education: { issue: 'education', position: -1.8, salience: 0.7 },
              foreign_policy: { issue: 'foreign_policy', position: -0.5, salience: 0.6 },
              social_issues: { issue: 'social_issues', position: -2.2, salience: 0.8 }
            },
            temporal_changes: {
              position_shifts: {},
              campaign_events: []
            }
          },
          {
            biography: {
              name: 'Conservative Candidate',
              age: 61,
              experience: ['Business Executive', 'Governor'],
              background: 'Former CEO, military veteran',
              party: 'Republican'
            },
            policy_positions: {
              economy: { issue: 'economy', position: 1.8, salience: 0.9 },
              healthcare: { issue: 'healthcare', position: 1.5, salience: 0.7 },
              immigration: { issue: 'immigration', position: 2.2, salience: 0.8 },
              environment: { issue: 'environment', position: 1.9, salience: 0.4 },
              education: { issue: 'education', position: 1.3, salience: 0.5 },
              foreign_policy: { issue: 'foreign_policy', position: 1.7, salience: 0.7 },
              social_issues: { issue: 'social_issues', position: 2.0, salience: 0.6 }
            },
            temporal_changes: {
              position_shifts: {},
              campaign_events: []
            }
          }
        ],
        key_issues: ['economy', 'healthcare', 'immigration'],
        recent_events: [
          {
            date: new Date('2024-10-15'),
            type: 'debate',
            description: 'First presidential debate',
            estimated_impact: 0.1
          }
        ],
        economic_indicators: {
          gdp_growth: 2.3,
          unemployment_rate: 3.8,
          inflation_rate: 2.1
        }
      };
    });

    it('should analyze demographics comprehensively', async () => {
      const demographicAnalysis = await framework.analyzeDemographics(sampleElection);

      expect(demographicAnalysis.segments).toBeInstanceOf(Array);
      expect(demographicAnalysis.segments.length).toBeGreaterThan(0);
      
      const firstSegment = demographicAnalysis.segments[0];
      expect(firstSegment.name).toBeDefined();
      expect(firstSegment.size_percentage).toBeGreaterThan(0);
      expect(firstSegment.candidate_preferences).toBeDefined();
      expect(firstSegment.turnout_likelihood).toBeGreaterThan(0);
      
      expect(demographicAnalysis.key_swing_demographics).toBeInstanceOf(Array);
      expect(demographicAnalysis.demographic_trends).toBeInstanceOf(Array);
    });

    it('should analyze ideological alignment accurately', async () => {
      const ideologicalAnalysis = await framework.analyzeIdeology(sampleElection);

      expect(ideologicalAnalysis.candidate_positioning).toBeDefined();
      expect(ideologicalAnalysis.voter_candidate_alignment).toBeDefined();
      expect(ideologicalAnalysis.cross_pressures).toBeInstanceOf(Array);
      
      // Verify candidate positioning
      const progressivePositioning = ideologicalAnalysis.candidate_positioning['Progressive Candidate'];
      expect(progressivePositioning.overall_ideology).toBeLessThan(0); // Liberal
      
      const conservativePositioning = ideologicalAnalysis.candidate_positioning['Conservative Candidate'];
      expect(conservativePositioning.overall_ideology).toBeGreaterThan(0); // Conservative
    });

    it('should analyze temporal dynamics effectively', async () => {
      const temporalAnalysis = await framework.analyzeTemporalDynamics(sampleElection);

      expect(temporalAnalysis.momentum_analysis).toBeDefined();
      expect(temporalAnalysis.event_impacts).toBeInstanceOf(Array);
      expect(temporalAnalysis.late_deciding_factors).toBeInstanceOf(Array);
      expect(temporalAnalysis.external_risks).toBeInstanceOf(Array);
      
      // Verify momentum analysis
      Object.values(temporalAnalysis.momentum_analysis).forEach((momentum: any) => {
        expect(momentum.current_momentum).toBeGreaterThanOrEqual(-1);
        expect(momentum.current_momentum).toBeLessThanOrEqual(1);
        expect(momentum.sustainability).toBeGreaterThanOrEqual(0);
        expect(momentum.sustainability).toBeLessThanOrEqual(1);
      });
    });

    it('should perform complete election prediction with chain of thought', async () => {
      const prediction = await framework.predictElectionOutcome(sampleElection);

      expect(prediction.winner).toBeDefined();
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.vote_share).toBeDefined();
      expect(prediction.state_results).toBeDefined();
      
      // Verify vote shares sum appropriately
      const totalVoteShare = Object.values(prediction.vote_share).reduce(
        (sum: number, share: any) => sum + share, 0
      );
      expect(totalVoteShare).toBeCloseTo(100, 1);
      
      expect(prediction.demographic_analysis).toBeDefined();
      expect(prediction.temporal_factors).toBeDefined();
    });

    it('should simulate voter response to political context', async () => {
      const politicalContext: PoliticalContext = {
        national_mood: -0.2, // Slightly favoring change
        polarization_level: 0.7,
        issue_salience: {
          economy: 0.9,
          healthcare: 0.8,
          immigration: 0.7
        },
        media_attention: {
          economy: 0.8,
          healthcare: 0.6
        }
      };

      const voterResponse = await framework.simulateVoterResponse(
        voterPersonas,
        sampleElection.candidates,
        politicalContext
      );

      expect(voterResponse.candidate_support).toBeDefined();
      expect(voterResponse.turnout_probability).toBeGreaterThan(0);
      expect(voterResponse.confidence_level).toBeGreaterThan(0);
      expect(voterResponse.demographic_breakdown).toBeDefined();
      expect(voterResponse.swing_factors).toBeInstanceOf(Array);
    });
  });

  describe('ElectionPredictionEngine Integration', () => {
    let predictionEngine: ElectionPredictionEngine;

    beforeAll(() => {
      predictionEngine = new ElectionPredictionEngine(apiKey, {
        voter_sample_size: 100,
        prediction_horizon_days: 30,
        confidence_threshold: 0.7,
        enable_temporal_tracking: true,
        use_anes_data: false
      });
    });

    it('should run complete election prediction with generated voters', async () => {
      const election: ElectionContext = {
        date: new Date('2024-11-05'),
        type: 'presidential',
        candidates: [
          {
            biography: {
              name: 'Candidate A',
              age: 55,
              experience: ['Senator'],
              background: 'Career politician',
              party: 'Democrat'
            },
            policy_positions: {
              economy: { issue: 'economy', position: -1.0, salience: 0.9 },
              healthcare: { issue: 'healthcare', position: -1.5, salience: 0.8 },
              immigration: { issue: 'immigration', position: -0.8, salience: 0.7 },
              environment: { issue: 'environment', position: -2.0, salience: 0.6 },
              education: { issue: 'education', position: -1.2, salience: 0.7 },
              foreign_policy: { issue: 'foreign_policy', position: 0.2, salience: 0.6 },
              social_issues: { issue: 'social_issues', position: -1.8, salience: 0.8 }
            },
            temporal_changes: {
              position_shifts: {},
              campaign_events: []
            }
          }
        ],
        key_issues: ['economy', 'healthcare'],
        recent_events: []
      };

      const prediction = await predictionEngine.predictElection(election);

      expect(prediction.winner).toBe('Candidate A');
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.vote_share).toBeDefined();
      expect(prediction.demographic_analysis).toBeDefined();
    });

    it('should simulate multiple election scenarios', async () => {
      const baseElection: ElectionContext = {
        date: new Date('2024-11-05'),
        type: 'presidential',
        candidates: [
          {
            biography: {
              name: 'Incumbent',
              age: 60,
              experience: ['President'],
              background: 'Current president',
              party: 'Democrat'
            },
            policy_positions: {
              economy: { issue: 'economy', position: -0.5, salience: 0.9 },
              healthcare: { issue: 'healthcare', position: -1.0, salience: 0.8 },
              immigration: { issue: 'immigration', position: -0.3, salience: 0.7 },
              environment: { issue: 'environment', position: -1.5, salience: 0.6 },
              education: { issue: 'education', position: -0.8, salience: 0.7 },
              foreign_policy: { issue: 'foreign_policy', position: 0.0, salience: 0.7 },
              social_issues: { issue: 'social_issues', position: -1.2, salience: 0.8 }
            },
            temporal_changes: {
              position_shifts: {},
              campaign_events: []
            }
          }
        ],
        key_issues: ['economy', 'foreign_policy'],
        recent_events: [],
        economic_indicators: {
          gdp_growth: 2.1,
          unemployment_rate: 4.2,
          inflation_rate: 2.8
        }
      };

      const scenarios = [
        {
          name: 'Economic Boom',
          changes: { economic_shift: 1.5 }
        },
        {
          name: 'Economic Recession',
          changes: { economic_shift: -2.0 }
        },
        {
          name: 'International Crisis',
          changes: { major_event: 'Major international conflict breaks out' }
        }
      ];

      const scenarioResults = await predictionEngine.simulateScenarios(baseElection, scenarios);

      expect(scenarioResults).toHaveLength(3);
      
      scenarioResults.forEach(result => {
        expect(result.scenario).toBeDefined();
        expect(result.prediction.winner).toBeDefined();
        expect(result.prediction.confidence).toBeGreaterThan(0);
      });
    });

    it('should validate predictions against actual results', async () => {
      const testPrediction = {
        winner: 'Test Candidate',
        confidence: 0.8,
        vote_share: { 'Test Candidate': 52.3, 'Opponent': 47.7 },
        state_results: {
          'California': { winner: 'Test Candidate', margin: 15.2, confidence: 0.9 },
          'Texas': { winner: 'Opponent', margin: 8.1, confidence: 0.8 }
        },
        electoral_votes: { 'Test Candidate': 312, 'Opponent': 226 },
        demographic_analysis: {
          segments: [],
          key_swing_groups: ['suburban_women', 'independent_voters']
        },
        temporal_factors: {
          momentum: { 'Test Candidate': 0.1 },
          late_deciding_voters: 0.08,
          external_event_impact: 0.15
        }
      };

      const actualResults = {
        winner: 'Test Candidate',
        vote_share: { 'Test Candidate': 51.8, 'Opponent': 48.2 },
        state_results: {
          'California': { winner: 'Test Candidate', margin: 14.5 },
          'Texas': { winner: 'Opponent', margin: 7.8 }
        },
        turnout: 0.66
      };

      const validation = await predictionEngine.validatePrediction(testPrediction, actualResults);

      expect(validation.overall_accuracy).toBeGreaterThan(0.7);
      expect(validation.winner_correct).toBe(true);
      expect(validation.vote_share_error['Test Candidate']).toBeLessThan(1);
      expect(validation.state_prediction_accuracy).toBeGreaterThan(0.8);
      expect(validation.detailed_analysis).toContain('CORRECT');
    });
  });
});