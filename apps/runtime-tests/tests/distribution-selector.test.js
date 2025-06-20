import * as PersonaSDK from '@internal/persona-sdk-minimal';

const { DistributionSelector, NormalDistribution, UniformDistribution, ExponentialDistribution, BetaDistribution, CategoricalDistribution } = PersonaSDK;

export const distributionSelectorTests = [
  // Basic distribution selection tests
  {
    name: 'DistributionSelector.selectDistribution - Age attribute',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const distribution = await selector.selectDistribution({
        attribute: 'age',
        context: 'Working professionals in tech industry',
        constraints: { min: 22, max: 65 }
      });
      
      if (!distribution) {
        throw new Error('Should return a distribution');
      }
      
      // Age should typically use Normal distribution
      if (!(distribution instanceof NormalDistribution)) {
        console.warn('Expected Normal distribution for age, got:', distribution.constructor.name);
      }
      
      // Test sampling
      const samples = Array.from({ length: 10 }, () => distribution.sample());
      const validSamples = samples.filter(s => s >= 22 && s <= 65);
      
      if (validSamples.length < 7) {
        throw new Error('Most samples should be within constraints');
      }
      
      return { success: true, distribution, samples };
    }
  },

  {
    name: 'DistributionSelector.selectDistribution - Income attribute',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const distribution = await selector.selectDistribution({
        attribute: 'annual_income',
        context: 'Software engineers in San Francisco',
        constraints: { min: 80000, max: 300000 }
      });
      
      if (!distribution) {
        throw new Error('Should return a distribution');
      }
      
      // Test mean and variance
      const mean = distribution.mean();
      const variance = distribution.variance();
      
      if (mean < 80000 || mean > 300000) {
        throw new Error('Mean should be within constraints');
      }
      
      return { success: true, distribution, mean, variance };
    }
  },

  {
    name: 'DistributionSelector.selectDistribution - Categorical occupation',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const distribution = await selector.selectDistribution({
        attribute: 'occupation',
        context: 'Tech company employees',
        constraints: {
          categories: ['engineer', 'designer', 'product_manager', 'data_scientist', 'marketing']
        }
      });
      
      if (!(distribution instanceof CategoricalDistribution)) {
        throw new Error('Occupation should use Categorical distribution');
      }
      
      // Test sampling produces valid categories
      const samples = Array.from({ length: 20 }, () => distribution.sample());
      const uniqueValues = new Set(samples);
      
      if (uniqueValues.size < 2) {
        throw new Error('Should produce diverse occupation samples');
      }
      
      return { success: true, distribution, samples: samples.slice(0, 5) };
    }
  },

  {
    name: 'DistributionSelector.selectDistribution - Time-based attribute',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const distribution = await selector.selectDistribution({
        attribute: 'days_between_purchases',
        context: 'E-commerce customer behavior',
        constraints: { min: 1, typical: 30 }
      });
      
      // Time between events often uses Exponential
      if (!(distribution instanceof ExponentialDistribution)) {
        console.warn('Expected Exponential for time-based attribute');
      }
      
      return { success: true, distribution };
    }
  },

  {
    name: 'DistributionSelector.selectDistribution - Percentage attribute',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const distribution = await selector.selectDistribution({
        attribute: 'task_completion_rate',
        context: 'Employee performance metrics',
        constraints: { min: 0, max: 1, description: 'percentage as decimal' }
      });
      
      // Percentages often use Beta distribution
      if (!(distribution instanceof BetaDistribution)) {
        console.warn('Expected Beta distribution for percentage');
      }
      
      // All samples should be between 0 and 1
      const samples = Array.from({ length: 10 }, () => distribution.sample());
      const validSamples = samples.filter(s => s >= 0 && s <= 1);
      
      if (validSamples.length !== samples.length) {
        throw new Error('All percentage samples should be between 0 and 1');
      }
      
      return { success: true, distribution, samples };
    }
  },

  // recommendDistributions tests
  {
    name: 'DistributionSelector.recommendDistributions - Multiple attributes',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const recommendations = await selector.recommendDistributions(
        ['age', 'income', 'satisfaction_score', 'department'],
        'Corporate employee profiles for HR analytics'
      );
      
      if (!(recommendations instanceof Map)) {
        throw new Error('Should return a Map of recommendations');
      }
      
      if (recommendations.size !== 4) {
        throw new Error('Should have distribution for each attribute');
      }
      
      // Verify each attribute has appropriate distribution
      const ageDistribution = recommendations.get('age');
      const departmentDistribution = recommendations.get('department');
      
      if (!ageDistribution || !departmentDistribution) {
        throw new Error('Missing distributions for key attributes');
      }
      
      return { 
        success: true, 
        distributions: Object.fromEntries(
          Array.from(recommendations.entries()).map(([k, v]) => [k, v.constructor.name])
        )
      };
    }
  },

  {
    name: 'DistributionSelector.recommendDistributions - Gaming personas',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const attributes = [
        'player_level',
        'hours_per_week',
        'skill_rating',
        'preferred_genre',
        'spending_amount',
        'session_duration'
      ];
      
      const recommendations = await selector.recommendDistributions(
        attributes,
        'Video game player personas for game analytics and monetization'
      );
      
      // Verify gaming-appropriate distributions
      const genreDistribution = recommendations.get('preferred_genre');
      if (!(genreDistribution instanceof CategoricalDistribution)) {
        throw new Error('Game genre should be categorical');
      }
      
      return { 
        success: true,
        count: recommendations.size,
        distributions: Object.fromEntries(
          Array.from(recommendations.entries()).map(([k, v]) => [k, v.constructor.name])
        )
      };
    }
  },

  // Edge cases and error handling
  {
    name: 'DistributionSelector.selectDistribution - Custom constraints',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const distribution = await selector.selectDistribution({
        attribute: 'response_time_ms',
        context: 'API performance monitoring',
        constraints: {
          min: 10,
          p50: 100,
          p95: 500,
          p99: 1000,
          description: 'Response times with long tail'
        }
      });
      
      if (!distribution) {
        throw new Error('Should handle complex constraints');
      }
      
      return { success: true, distribution };
    }
  },

  {
    name: 'DistributionSelector.selectDistribution - Boolean attribute',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const distribution = await selector.selectDistribution({
        attribute: 'is_premium_member',
        context: 'SaaS customer base with 30% premium adoption',
        constraints: {
          type: 'boolean',
          true_probability: 0.3
        }
      });
      
      // Boolean should use Categorical with two categories
      if (!(distribution instanceof CategoricalDistribution)) {
        throw new Error('Boolean should use Categorical distribution');
      }
      
      // Test probability roughly matches constraint
      const samples = Array.from({ length: 100 }, () => distribution.sample());
      const trueCount = samples.filter(s => s === true || s === 'true' || s === 1).length;
      const trueRatio = trueCount / samples.length;
      
      if (Math.abs(trueRatio - 0.3) > 0.15) {
        throw new Error(`True ratio ${trueRatio} too far from expected 0.3`);
      }
      
      return { success: true, distribution, trueRatio };
    }
  },

  // Real-world scenario tests
  {
    name: 'DistributionSelector - E-commerce customer attributes',
    category: 'Distribution Selection',
    cassette: true,
    fn: async () => {
      const selector = new DistributionSelector(process.env.OPENAI_API_KEY || 'test-key');
      
      const customerAttributes = await selector.recommendDistributions(
        [
          'customer_lifetime_value',
          'purchase_frequency',
          'cart_abandonment_rate',
          'preferred_category',
          'loyalty_tier',
          'days_since_last_purchase'
        ],
        'E-commerce platform customer analytics for retention and personalization'
      );
      
      // Verify business logic
      const clvDist = customerAttributes.get('customer_lifetime_value');
      const frequencyDist = customerAttributes.get('purchase_frequency');
      
      if (!clvDist || !frequencyDist) {
        throw new Error('Missing critical e-commerce distributions');
      }
      
      return { 
        success: true,
        distributions: Object.fromEntries(
          Array.from(customerAttributes.entries()).map(([k, v]) => [k, v.constructor.name])
        )
      };
    }
  }
];