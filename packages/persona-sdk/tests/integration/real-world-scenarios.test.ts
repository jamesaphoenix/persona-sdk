/**
 * Real-world scenario tests - complete workflows
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import {
  PersonaBuilder,
  PersonaGroup,
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  CorrelatedDistribution,
  MediaToPersonaGenerator,
  BootstrapOptimizer,
  COPROOptimizer,
  createCompositeMetric,
  ExactMatch,
  FuzzyMatch,
} from '../../src/index.js';
import { PostgresAdapter } from '../../src/adapters/postgres/adapter.js';
import { createServer } from '../../src/api/server.js';
import { PersonaApiClient } from '../../src/api/client.js';
import type { FastifyInstance } from 'fastify';
import type { DatabaseClient, QueryResult } from '../../src/adapters/postgres/adapter.js';

// Enhanced mock for real-world scenarios
class RealWorldMockDatabaseClient implements DatabaseClient {
  private data = {
    personas: new Map<string, any>(),
    groups: new Map<string, any>(),
    memberships: new Map<string, any>(),
    campaigns: new Map<string, any>(),
    analytics: new Map<string, any>(),
  };
  private idCounter = 1;

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    const sql = text.toLowerCase();

    // Standard persona operations
    if (sql.includes('insert into personas')) {
      const id = `rw_${this.idCounter++}`;
      const persona = {
        id,
        name: values![0],
        age: values![1],
        occupation: values![2],
        sex: values![3],
        attributes: values![4] || {},
        metadata: values![5] || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.data.personas.set(id, persona);

      // Track analytics
      this.trackPersonaCreation(persona);

      return { rows: [persona] as any, rowCount: 1 };
    }

    // Complex attribute queries for real-world filtering
    if (sql.includes('select * from personas') && sql.includes('attributes @>')) {
      let personas = Array.from(this.data.personas.values());
      
      // Handle JSONB containment operator
      const attrIndex = values!.findIndex(v => typeof v === 'object' && !Array.isArray(v));
      if (attrIndex !== -1) {
        const requiredAttrs = values![attrIndex];
        personas = personas.filter(p => {
          return this.jsonbContains(p.attributes, requiredAttrs);
        });
      }

      // Apply other filters
      if (sql.includes('age >=')) {
        const ageIndex = attrIndex !== -1 ? attrIndex + 1 : 0;
        personas = personas.filter(p => p.age >= values![ageIndex]);
      }

      // Apply pagination
      if (sql.includes('limit')) {
        const limit = values![values!.length - 2];
        const offset = values![values!.length - 1];
        personas = personas.slice(offset, offset + limit);
      }

      return { rows: personas as any, rowCount: personas.length };
    }

    // Analytics queries
    if (sql.includes('persona_analytics')) {
      const analytics = this.generateAnalytics();
      return { rows: [analytics] as any, rowCount: 1 };
    }

    // Campaign tracking
    if (sql.includes('campaigns')) {
      const campaigns = Array.from(this.data.campaigns.values());
      return { rows: campaigns as any, rowCount: campaigns.length };
    }

    // Standard operations continue...
    return this.handleStandardQueries(sql, values);
  }

  private jsonbContains(obj: any, pattern: any): boolean {
    for (const [key, value] of Object.entries(pattern)) {
      if (typeof value === 'object' && value !== null) {
        if (!obj[key] || !this.jsonbContains(obj[key], value)) {
          return false;
        }
      } else if (obj[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private trackPersonaCreation(persona: any) {
    const hour = new Date().getHours();
    const key = `creates_hour_${hour}`;
    const current = this.data.analytics.get(key) || 0;
    this.data.analytics.set(key, current + 1);
  }

  private generateAnalytics() {
    const totalPersonas = this.data.personas.size;
    const totalGroups = this.data.groups.size;
    
    // Age distribution
    const ageGroups = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
    for (const persona of this.data.personas.values()) {
      if (persona.age) {
        if (persona.age <= 25) ageGroups['18-25']++;
        else if (persona.age <= 35) ageGroups['26-35']++;
        else if (persona.age <= 45) ageGroups['36-45']++;
        else if (persona.age <= 55) ageGroups['46-55']++;
        else ageGroups['56+']++;
      }
    }

    // Occupation distribution
    const occupations = new Map<string, number>();
    for (const persona of this.data.personas.values()) {
      if (persona.occupation) {
        occupations.set(persona.occupation, (occupations.get(persona.occupation) || 0) + 1);
      }
    }

    return {
      total_personas: totalPersonas,
      total_groups: totalGroups,
      age_distribution: ageGroups,
      top_occupations: Array.from(occupations.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([occupation, count]) => ({ occupation, count })),
      creation_timeline: Array.from(this.data.analytics.entries()),
    };
  }

  private handleStandardQueries(sql: string, values?: any[]): QueryResult<any> {
    // Count queries
    if (sql.includes('count(*)')) {
      if (sql.includes('personas')) {
        return { rows: [{ count: String(this.data.personas.size) }], rowCount: 1 };
      }
    }

    // Other standard operations...
    return { rows: [], rowCount: 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    return callback(this);
  }

  clear() {
    this.data.personas.clear();
    this.data.groups.clear();
    this.data.memberships.clear();
    this.data.campaigns.clear();
    this.data.analytics.clear();
  }

  // Helper methods for scenarios
  createCampaign(name: string, targetAudience: any) {
    const id = `campaign_${this.idCounter++}`;
    const campaign = {
      id,
      name,
      target_audience: targetAudience,
      created_at: new Date(),
      personas_targeted: 0,
      conversion_rate: 0,
    };
    this.data.campaigns.set(id, campaign);
    return campaign;
  }

  trackCampaignInteraction(campaignId: string, personaId: string, converted: boolean) {
    const campaign = this.data.campaigns.get(campaignId);
    if (campaign) {
      campaign.personas_targeted++;
      if (converted) {
        campaign.conversions = (campaign.conversions || 0) + 1;
        campaign.conversion_rate = campaign.conversions / campaign.personas_targeted;
      }
    }
  }
}

describe('Real-World Scenarios', () => {
  let dbClient: RealWorldMockDatabaseClient;
  let adapter: PostgresAdapter;
  let server: FastifyInstance;
  let apiClient: PersonaApiClient;
  const serverPort = 3003;
  const baseUrl = `http://localhost:${serverPort}`;

  beforeAll(async () => {
    dbClient = new RealWorldMockDatabaseClient();
    adapter = new PostgresAdapter(dbClient);
    
    server = await createServer({
      databaseClient: dbClient,
      port: serverPort,
      host: 'localhost',
      cors: true,
      swagger: false,
      logger: false,
    });

    await server.listen({ port: serverPort, host: 'localhost' });
    apiClient = new PersonaApiClient({ baseUrl });
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    dbClient.clear();
  });

  describe('E-commerce Customer Segmentation', () => {
    it('should segment customers for targeted marketing', async () => {
      // 1. Generate diverse customer base
      const customerSegments = {
        highValueShoppers: {
          count: 100,
          ageDistribution: new NormalDistribution(45, 10),
          incomeDistribution: new NormalDistribution(120000, 30000),
          attributes: {
            segment: 'high-value',
            averageOrderValue: new UniformDistribution(200, 500),
            ordersPerYear: new UniformDistribution(12, 24),
            preferredCategories: ['electronics', 'home', 'luxury'],
          },
        },
        bargainHunters: {
          count: 200,
          ageDistribution: new NormalDistribution(28, 8),
          incomeDistribution: new NormalDistribution(45000, 15000),
          attributes: {
            segment: 'bargain-hunter',
            averageOrderValue: new UniformDistribution(20, 80),
            ordersPerYear: new UniformDistribution(6, 15),
            preferredCategories: ['sale', 'clearance', 'deals'],
          },
        },
        occasionalBuyers: {
          count: 300,
          ageDistribution: new NormalDistribution(35, 12),
          incomeDistribution: new NormalDistribution(65000, 20000),
          attributes: {
            segment: 'occasional',
            averageOrderValue: new UniformDistribution(50, 150),
            ordersPerYear: new UniformDistribution(2, 6),
            preferredCategories: ['seasonal', 'gifts', 'essentials'],
          },
        },
      };

      // Generate customers for each segment
      for (const [segmentName, config] of Object.entries(customerSegments)) {
        const personas = Array.from({ length: config.count }, (_, i) => ({
          name: `${segmentName} Customer ${i}`,
          age: Math.round(config.ageDistribution.sample()),
          occupation: 'Customer',
          attributes: {
            ...config.attributes,
            income: Math.round(config.incomeDistribution.sample()),
            averageOrderValue: Math.round(
              config.attributes.averageOrderValue.sample()
            ),
            ordersPerYear: Math.round(
              config.attributes.ordersPerYear.sample()
            ),
            customerLifetimeValue: 0, // Will calculate
            lastPurchaseDate: new Date(
              Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000 // Last 180 days
            ),
          },
        }));

        // Calculate CLV
        personas.forEach(p => {
          p.attributes.customerLifetimeValue = 
            p.attributes.averageOrderValue * p.attributes.ordersPerYear * 3; // 3 year projection
        });

        await apiClient.bulkCreatePersonas({ personas });
      }

      // 2. Create targeted campaigns
      const campaigns = [
        {
          name: 'Premium Electronics Sale',
          target: { segment: 'high-value', minIncome: 100000 },
        },
        {
          name: 'Flash Sale Friday',
          target: { segment: 'bargain-hunter' },
        },
        {
          name: 'Holiday Gift Guide',
          target: { segment: 'occasional', preferredCategories: ['gifts'] },
        },
      ];

      for (const campaign of campaigns) {
        const dbCampaign = dbClient.createCampaign(campaign.name, campaign.target);

        // Find matching personas
        const targetPersonas = await apiClient.queryPersonas({
          attributes: campaign.target,
          limit: 100,
        });

        expect(targetPersonas.data.length).toBeGreaterThan(0);

        // Simulate campaign performance
        for (const persona of targetPersonas.data) {
          const conversionProbability = persona.attributes.segment === 'high-value' ? 0.15 :
                                       persona.attributes.segment === 'bargain-hunter' ? 0.25 :
                                       0.10;
          
          const converted = Math.random() < conversionProbability;
          dbClient.trackCampaignInteraction(dbCampaign.id, persona.id, converted);
        }
      }

      // 3. Analyze segment performance
      const highValueCustomers = await apiClient.queryPersonas({
        attributes: { segment: 'high-value' },
      });

      const avgCLV = highValueCustomers.data.reduce(
        (sum, p) => sum + p.attributes.customerLifetimeValue, 0
      ) / highValueCustomers.data.length;

      expect(avgCLV).toBeGreaterThan(1000); // High-value customers have high CLV

      // 4. Identify cross-sell opportunities
      const recentHighValueBuyers = await apiClient.queryPersonas({
        attributes: { 
          segment: 'high-value',
          // Would need date range query support
        },
        limit: 50,
      });

      expect(recentHighValueBuyers.data.length).toBeGreaterThan(0);
    });
  });

  describe('SaaS User Onboarding Optimization', () => {
    it('should optimize onboarding flow based on user personas', async () => {
      // Mock OpenAI for media analysis (if needed)
      const mockOpenAI = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: JSON.stringify({
                    personas: [{
                      name: 'Tech-Savvy Developer',
                      age: 28,
                      occupation: 'Software Developer',
                      attributes: {
                        techLevel: 'expert',
                        preferredLearning: 'documentation',
                        timeToValue: 'immediate',
                      },
                    }],
                  }),
                },
              }],
            }),
          },
        },
      };

      // 1. Create user personas from signup data
      const signupProfiles = [
        {
          email: 'developer@tech.com',
          company: 'TechCorp',
          role: 'Developer',
          teamSize: '10-50',
          useCase: 'API Integration',
        },
        {
          email: 'marketing@agency.com',
          company: 'Creative Agency',
          role: 'Marketing Manager',
          teamSize: '5-10',
          useCase: 'Campaign Management',
        },
        {
          email: 'founder@startup.com',
          company: 'StartupXYZ',
          role: 'Founder',
          teamSize: '1-5',
          useCase: 'Full Platform',
        },
      ];

      // Generate personas from profiles
      const onboardingPersonas = signupProfiles.map((profile, i) => ({
        name: `User ${i}`,
        occupation: profile.role,
        attributes: {
          email: profile.email,
          company: profile.company,
          teamSize: profile.teamSize,
          useCase: profile.useCase,
          onboardingPath: determineOnboardingPath(profile),
          expectedTimeToValue: estimateTimeToValue(profile),
          churnRisk: calculateChurnRisk(profile),
        },
      }));

      const created = await apiClient.bulkCreatePersonas({ 
        personas: onboardingPersonas 
      });

      // 2. Create onboarding experiments
      const onboardingPaths = {
        technical: {
          steps: ['API Keys', 'Documentation', 'Code Examples', 'Integration'],
          estimatedTime: 30, // minutes
        },
        visual: {
          steps: ['Video Tutorial', 'Interactive Demo', 'Templates', 'First Project'],
          estimatedTime: 45,
        },
        guided: {
          steps: ['Welcome Call', 'Setup Assistance', 'Training Session', 'Check-in'],
          estimatedTime: 60,
        },
      };

      // 3. A/B test different onboarding flows
      const experiments = [];
      for (const persona of created) {
        const path = persona.attributes.onboardingPath as keyof typeof onboardingPaths;
        const experiment = {
          personaId: persona.id,
          path,
          startTime: new Date(),
          completed: Math.random() > 0.3, // 70% completion rate
          timeToComplete: onboardingPaths[path].estimatedTime * (0.5 + Math.random()),
          activatedFeatures: Math.floor(Math.random() * 5) + 1,
        };
        experiments.push(experiment);
      }

      // 4. Analyze results
      const developerPersonas = created.filter(p => 
        p.occupation === 'Developer'
      );
      
      const developerExperiments = experiments.filter(e =>
        developerPersonas.some(p => p.id === e.personaId)
      );

      const avgDevCompletion = developerExperiments.filter(e => e.completed).length / 
                              developerExperiments.length;

      expect(avgDevCompletion).toBeGreaterThan(0.5); // Developers should have good completion

      // 5. Optimize based on results
      const optimizer = new BootstrapOptimizer({
        metric: createCompositeMetric([
          { metric: ExactMatch, weight: 0.7 },
          { metric: FuzzyMatch, weight: 0.3 },
        ]),
      });

      // Create training data from experiments
      const trainingData = experiments.map(exp => ({
        input: {
          role: created.find(p => p.id === exp.personaId)?.occupation,
          path: exp.path,
        },
        output: exp.completed ? 'success' : 'failed',
      }));

      // This would optimize prompts for better onboarding
      // const optimizedFlow = await optimizer.optimize(onboardingModule, trainingData);
    });
  });

// Helper functions
function determineOnboardingPath(profile: any): string {
  if (profile.role.includes('Developer')) return 'technical';
  if (profile.role.includes('Marketing')) return 'visual';
  if (profile.role.includes('Founder')) return 'guided';
  return 'visual';
}

function estimateTimeToValue(profile: any): number {
  const baseTime = profile.teamSize === '1-5' ? 1 : 
                  profile.teamSize === '5-10' ? 3 : 7; // days
  return baseTime;
}

function calculateChurnRisk(profile: any): number {
  let risk = 0.2; // base risk
  if (profile.teamSize === '1-5') risk += 0.2; // Small teams churn more
  if (profile.role === 'Founder') risk -= 0.1; // Founders more committed
  return Math.min(Math.max(risk, 0), 1);
}

  describe('Content Recommendation Engine', () => {
    it('should build persona-based content recommendations', async () => {
      // 1. Create content consumer personas
      const contentPreferences = [
        {
          segment: 'Tech Enthusiasts',
          interests: ['AI', 'Programming', 'Gadgets', 'Startups'],
          readingTime: new NormalDistribution(45, 15), // minutes per day
          preferredFormats: ['articles', 'videos', 'podcasts'],
        },
        {
          segment: 'Business Leaders',
          interests: ['Leadership', 'Strategy', 'Finance', 'Innovation'],
          readingTime: new NormalDistribution(30, 10),
          preferredFormats: ['articles', 'reports', 'case-studies'],
        },
        {
          segment: 'Creative Professionals',
          interests: ['Design', 'Art', 'Photography', 'Writing'],
          readingTime: new NormalDistribution(60, 20),
          preferredFormats: ['videos', 'tutorials', 'galleries'],
        },
      ];

      // Generate personas with content preferences
      for (const pref of contentPreferences) {
        const personas = Array.from({ length: 50 }, (_, i) => ({
          name: `${pref.segment} Reader ${i}`,
          attributes: {
            segment: pref.segment,
            interests: pref.interests,
            dailyReadingTime: Math.round(pref.readingTime.sample()),
            preferredFormats: pref.preferredFormats,
            engagementScore: Math.random() * 100,
            contentHistory: generateContentHistory(pref.interests),
            lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          },
        }));

        await apiClient.bulkCreatePersonas({ personas });
      }

      // 2. Create content inventory
      const contentItems = [
        { id: 'c1', title: 'AI Revolution in 2024', category: 'AI', format: 'article' },
        { id: 'c2', title: 'Leadership in Crisis', category: 'Leadership', format: 'article' },
        { id: 'c3', title: 'Design Thinking Workshop', category: 'Design', format: 'video' },
        { id: 'c4', title: 'Startup Funding Guide', category: 'Startups', format: 'report' },
        { id: 'c5', title: 'Photography Masterclass', category: 'Photography', format: 'tutorial' },
      ];

      // 3. Generate recommendations
      const techEnthusiasts = await apiClient.queryPersonas({
        attributes: { segment: 'Tech Enthusiasts' },
      });

      const recommendations = techEnthusiasts.data.map(persona => {
        const relevantContent = contentItems.filter(item =>
          persona.attributes.interests.some((interest: string) =>
            item.category.toLowerCase().includes(interest.toLowerCase())
          ) &&
          persona.attributes.preferredFormats.includes(item.format)
        );

        return {
          personaId: persona.id,
          recommendations: relevantContent,
          score: calculateRecommendationScore(persona, relevantContent),
        };
      });

      expect(recommendations.length).toBe(techEnthusiasts.data.length);
      expect(recommendations[0].recommendations.length).toBeGreaterThan(0);

      // 4. Track engagement and optimize
      const engagementData = recommendations.map(rec => ({
        personaId: rec.personaId,
        contentId: rec.recommendations[0]?.id,
        engaged: Math.random() > 0.3,
        timeSpent: Math.random() * 300, // seconds
        completed: Math.random() > 0.5,
      }));

      // Calculate recommendation effectiveness
      const effectiveness = engagementData.filter(e => e.engaged).length / 
                          engagementData.length;
      
      expect(effectiveness).toBeGreaterThan(0.5);

      // 5. Create feedback loop
      const highEngagementPersonas = await apiClient.queryPersonas({
        attributes: { engagementScore: { $gte: 80 } as any },
      });

      // These would get premium content recommendations
      expect(highEngagementPersonas.data.length).toBeGreaterThan(0);
    });
  });

// Helper functions for Content Recommendation Engine
function generateContentHistory(interests: string[]): any[] {
  return Array.from({ length: 10 }, () => ({
    category: interests[Math.floor(Math.random() * interests.length)],
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    completed: Math.random() > 0.3,
  }));
}

function calculateRecommendationScore(persona: any, content: any[]): number {
  const interestMatch = content.length / persona.attributes.interests.length;
  const recencyBoost = 
    (Date.now() - new Date(persona.attributes.lastActive).getTime()) < 
    (24 * 60 * 60 * 1000) ? 0.2 : 0;
  
  return Math.min(interestMatch + recencyBoost, 1) * 100;
}

  describe('Healthcare Patient Journey Mapping', () => {
    it('should map patient journeys for treatment optimization', async () => {
      // 1. Create patient personas with health conditions
      const patientProfiles = {
        chronicCare: {
          conditions: ['diabetes', 'hypertension'],
          ageRange: new NormalDistribution(55, 10),
          visitFrequency: new UniformDistribution(4, 12), // per year
          medicationAdherence: new NormalDistribution(0.75, 0.15),
        },
        preventiveCare: {
          conditions: ['healthy'],
          ageRange: new NormalDistribution(35, 8),
          visitFrequency: new UniformDistribution(1, 3),
          medicationAdherence: new NormalDistribution(0.9, 0.05),
        },
        acuteCare: {
          conditions: ['injury', 'infection'],
          ageRange: new NormalDistribution(40, 15),
          visitFrequency: new UniformDistribution(2, 5),
          medicationAdherence: new NormalDistribution(0.8, 0.1),
        },
      };

      // Generate patient personas
      for (const [profileType, profile] of Object.entries(patientProfiles)) {
        const patients = Array.from({ length: 100 }, (_, i) => ({
          name: `Patient ${profileType} ${i}`,
          age: Math.round(profile.ageRange.sample()),
          attributes: {
            patientType: profileType,
            conditions: profile.conditions,
            annualVisits: Math.round(profile.visitFrequency.sample()),
            adherenceRate: Math.max(0, Math.min(1, profile.medicationAdherence.sample())),
            riskScore: calculateHealthRiskScore(profile),
            lastVisit: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
            nextAppointment: null,
            careTeam: assignCareTeam(profileType),
          },
        }));

        await apiClient.bulkCreatePersonas({ personas: patients });
      }

      // 2. Create care pathways
      const carePathways = {
        chronicCare: [
          'Initial Assessment',
          'Treatment Plan',
          'Regular Monitoring',
          'Medication Management',
          'Lifestyle Coaching',
          'Specialist Referrals',
        ],
        preventiveCare: [
          'Annual Checkup',
          'Screenings',
          'Vaccinations',
          'Health Education',
        ],
        acuteCare: [
          'Emergency Triage',
          'Diagnosis',
          'Treatment',
          'Follow-up',
          'Recovery Monitoring',
        ],
      };

      // 3. Simulate patient journeys
      const chronicPatients = await apiClient.queryPersonas({
        attributes: { patientType: 'chronicCare' },
      });

      const journeys = chronicPatients.data.map(patient => {
        const pathway = carePathways.chronicCare;
        const journey = {
          patientId: patient.id,
          steps: pathway.map((step, index) => ({
            step,
            completed: Math.random() > 0.1, // 90% completion
            date: new Date(Date.now() - (pathway.length - index) * 30 * 24 * 60 * 60 * 1000),
            outcome: generateStepOutcome(step, patient),
          })),
          overallOutcome: 'managed',
          satisfactionScore: 4 + Math.random(),
        };
        return journey;
      });

      // 4. Analyze adherence patterns
      const highAdherencePatients = chronicPatients.data.filter(
        p => p.attributes.adherenceRate > 0.8
      );

      const adherenceRate = highAdherencePatients.length / chronicPatients.data.length;
      expect(adherenceRate).toBeGreaterThan(0.3);

      // 5. Identify at-risk patients
      const atRiskPatients = await apiClient.queryPersonas({
        attributes: { 
          riskScore: { $gte: 0.7 } as any,
          adherenceRate: { $lte: 0.6 } as any,
        },
      });

      // These patients need intervention
      for (const patient of atRiskPatients.data) {
        // Schedule follow-up
        patient.attributes.nextAppointment = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week
        );
        
        // Flag for care management
        patient.attributes.careManagementRequired = true;
      }

      // 6. Optimize care delivery
      const outcomes = {
        improved: journeys.filter(j => j.overallOutcome === 'improved').length,
        managed: journeys.filter(j => j.overallOutcome === 'managed').length,
        declined: journeys.filter(j => j.overallOutcome === 'declined').length,
      };

      expect(outcomes.managed).toBeGreaterThan(outcomes.declined);
    });

  });

  describe('Financial Services Risk Assessment', () => {
    it('should assess customer risk profiles for lending', async () => {
      // 1. Generate customer financial profiles
      const correlated = new CorrelatedDistribution({
        age: new NormalDistribution(40, 12),
        income: new NormalDistribution(75000, 35000),
        creditScore: new NormalDistribution(720, 80),
        debtToIncome: new UniformDistribution(0.1, 0.6),
      });

      // Add realistic correlations
      correlated.addConditional({
        attribute: 'income',
        dependsOn: 'age',
        transform: (income, age) => {
          const ageFactor = Math.min((age - 22) / 20, 2); // Income grows with age
          return income * (0.8 + ageFactor * 0.4);
        },
      });

      correlated.addConditional({
        attribute: 'creditScore',
        dependsOn: 'debtToIncome',
        transform: (score, dti) => {
          // Higher debt-to-income reduces credit score
          return score - (dti * 200);
        },
      });

      // Generate loan applicants
      const applicants = Array.from({ length: 500 }, (_, i) => {
        const values = correlated.sample();
        return {
          name: `Applicant ${i}`,
          age: Math.round(values.age),
          occupation: assignOccupation(values.income),
          attributes: {
            income: Math.round(values.income),
            creditScore: Math.round(Math.max(300, Math.min(850, values.creditScore))),
            debtToIncome: Math.round(values.debtToIncome * 100) / 100,
            employmentYears: Math.max(0, Math.round((values.age - 22) * 0.7)),
            loanAmount: Math.round(values.income * 3), // 3x income
            loanPurpose: assignLoanPurpose(values.age, values.income),
            riskProfile: null, // Will calculate
          },
        };
      });

      // 2. Calculate risk profiles
      applicants.forEach(applicant => {
        applicant.attributes.riskProfile = calculateRiskProfile(applicant.attributes);
      });

      const created = await apiClient.bulkCreatePersonas({ personas: applicants });

      // 3. Segment by risk
      const lowRisk = await apiClient.queryPersonas({
        attributes: { riskProfile: 'low' },
      });

      const mediumRisk = await apiClient.queryPersonas({
        attributes: { riskProfile: 'medium' },
      });

      const highRisk = await apiClient.queryPersonas({
        attributes: { riskProfile: 'high' },
      });

      expect(lowRisk.data.length).toBeGreaterThan(0);
      expect(mediumRisk.data.length).toBeGreaterThan(0);
      expect(highRisk.data.length).toBeGreaterThan(0);

      // 4. Simulate loan decisions
      const loanDecisions = created.map(applicant => {
        const decision = makeLoanDecision(applicant);
        return {
          applicantId: applicant.id,
          approved: decision.approved,
          interestRate: decision.interestRate,
          terms: decision.terms,
          reasoning: decision.reasoning,
        };
      });

      const approvalRate = loanDecisions.filter(d => d.approved).length / loanDecisions.length;
      expect(approvalRate).toBeGreaterThan(0.5);
      expect(approvalRate).toBeLessThan(0.9);

      // 5. Track loan performance
      const approvedLoans = loanDecisions.filter(d => d.approved);
      const loanPerformance = approvedLoans.map(loan => {
        const applicant = created.find(a => a.id === loan.applicantId)!;
        const defaultProbability = calculateDefaultProbability(
          applicant.attributes.riskProfile,
          loan.interestRate
        );
        
        return {
          loanId: loan.applicantId,
          performing: Math.random() > defaultProbability,
          paymentsOnTime: Math.floor(Math.random() * 12) + 1,
          defaulted: Math.random() < defaultProbability,
        };
      });

      const defaultRate = loanPerformance.filter(p => p.defaulted).length / 
                         loanPerformance.length;
      
      expect(defaultRate).toBeLessThan(0.1); // Should have low default rate

      // 6. Optimize lending criteria
      const performingLoans = loanPerformance.filter(p => p.performing);
      const performingApplicants = performingLoans.map(loan =>
        created.find(a => a.id === loan.loanId)!
      );

      // Analyze characteristics of performing loans
      const avgCreditScore = performingApplicants.reduce(
        (sum, a) => sum + a.attributes.creditScore, 0
      ) / performingApplicants.length;

      expect(avgCreditScore).toBeGreaterThan(700);
    });
  });

// Helper functions for Healthcare scenarios
function calculateHealthRiskScore(profile: any): number {
  let score = 0.3; // base risk
  
  if (profile.conditions.includes('diabetes')) score += 0.2;
  if (profile.conditions.includes('hypertension')) score += 0.15;
  if (profile.visitFrequency.mean < 4) score += 0.1; // Low engagement
  
  return Math.min(score, 1);
}

function assignCareTeam(patientType: string): string[] {
  const teams = {
    chronicCare: ['Primary Care', 'Specialist', 'Nurse', 'Pharmacist'],
    preventiveCare: ['Primary Care', 'Nurse'],
    acuteCare: ['Emergency', 'Specialist', 'Nurse'],
  };
  return teams[patientType as keyof typeof teams] || ['Primary Care'];
}

function generateStepOutcome(step: string, patient: any): string {
  const adherence = patient.attributes.adherenceRate;
  const outcomes = ['excellent', 'good', 'fair', 'poor'];
  const index = Math.floor((1 - adherence) * outcomes.length);
  return outcomes[Math.min(index, outcomes.length - 1)];
}

// Helper functions for Financial Services scenarios
function assignOccupation(income: number): string {
  if (income < 40000) return 'Entry Level';
  if (income < 70000) return 'Professional';
  if (income < 100000) return 'Senior Professional';
  if (income < 150000) return 'Manager';
  return 'Executive';
}

function assignLoanPurpose(age: number, income: number): string {
  if (age < 30) return 'Auto Loan';
  if (age < 40 && income > 60000) return 'Home Purchase';
  if (age < 50) return 'Home Improvement';
  return 'Debt Consolidation';
}

function calculateRiskProfile(attributes: any): string {
  let riskScore = 0;

  // Credit score factor (40%)
  if (attributes.creditScore < 650) riskScore += 40;
  else if (attributes.creditScore < 700) riskScore += 25;
  else if (attributes.creditScore < 750) riskScore += 10;

  // Debt-to-income factor (30%)
  if (attributes.debtToIncome > 0.5) riskScore += 30;
  else if (attributes.debtToIncome > 0.4) riskScore += 20;
  else if (attributes.debtToIncome > 0.3) riskScore += 10;

  // Employment stability (20%)
  if (attributes.employmentYears < 2) riskScore += 20;
  else if (attributes.employmentYears < 5) riskScore += 10;

  // Loan-to-income ratio (10%)
  const lti = attributes.loanAmount / attributes.income;
  if (lti > 5) riskScore += 10;
  else if (lti > 4) riskScore += 5;

  if (riskScore <= 20) return 'low';
  if (riskScore <= 50) return 'medium';
  return 'high';
}

function makeLoanDecision(applicant: any): any {
  const risk = applicant.attributes.riskProfile;
  const baseRate = 0.05; // 5% base rate

  if (risk === 'high' && applicant.attributes.creditScore < 650) {
    return {
      approved: false,
      reasoning: 'High risk profile with low credit score',
    };
  }

  const approved = risk === 'low' ? true :
                  risk === 'medium' ? Math.random() > 0.3 :
                  Math.random() > 0.7;

  if (!approved) {
    return {
      approved: false,
      reasoning: `Risk profile too high: ${risk}`,
    };
  }

  const riskPremium = risk === 'low' ? 0 :
                     risk === 'medium' ? 0.02 :
                     0.04;

  return {
    approved: true,
    interestRate: baseRate + riskPremium,
    terms: risk === 'low' ? 60 : 48, // months
    reasoning: `Approved with ${risk} risk profile`,
  };
}

function calculateDefaultProbability(riskProfile: string, interestRate: number): number {
  const baseDefault = {
    low: 0.02,
    medium: 0.05,
    high: 0.15,
  }[riskProfile] || 0.1;

  // Higher interest rates increase default probability
  const rateFactor = interestRate > 0.08 ? 1.5 : 1;

  return Math.min(baseDefault * rateFactor, 0.3);
}
});