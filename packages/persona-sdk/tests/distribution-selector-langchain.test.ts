/**
 * Tests for LangChain-based distribution selector
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DistributionSelectorLangChain } from '../src/tools/distribution-selector-langchain';
import { 
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CategoricalDistribution
} from '../src/distributions';
import { DistributionSelectionParams } from '../src/tools/types';

// Mock dependencies
vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    withStructuredOutput: vi.fn().mockReturnValue({
      invoke: vi.fn().mockImplementation((messages) => {
        // Mock different responses based on input
        const userContent = messages[1].content.toLowerCase();
        
        // Check for percentage first since 'age' might be part of 'percentage'
        if (userContent.includes('percentage') || userContent.includes('probability')) {
          return Promise.resolve({
            distribution_type: 'beta',
            parameters: { alpha: 2, beta: 5 },
            reasoning: 'Percentages are bounded between 0 and 1, making beta distribution ideal'
          });
        } else if (userContent.includes('income')) {
          return Promise.resolve({
            distribution_type: 'exponential',
            parameters: { rate: 0.00002 },
            reasoning: 'Income often follows an exponential or log-normal distribution'
          });
        } else if (userContent.includes('category') || userContent.includes('occupation')) {
          return Promise.resolve({
            distribution_type: 'categorical',
            parameters: {
              categories: [
                { value: 'Engineer', probability: 0.3 },
                { value: 'Designer', probability: 0.2 },
                { value: 'Manager', probability: 0.25 },
                { value: 'Other', probability: 0.25 }
              ]
            },
            reasoning: 'Discrete categories require categorical distribution'
          });
        } else if (userContent.includes('age')) {
          return Promise.resolve({
            distribution_type: 'normal',
            parameters: { mean: 35, std_dev: 10 },
            reasoning: 'Age typically follows a normal distribution in most populations'
          });
        } else {
          return Promise.resolve({
            distribution_type: 'uniform',
            parameters: { min: 0, max: 100 },
            reasoning: 'Uniform distribution for evenly distributed values'
          });
        }
      })
    })
  }))
}));

vi.mock('tiktoken', () => ({
  encoding_for_model: vi.fn().mockReturnValue({
    encode: vi.fn().mockImplementation((text: string) => 
      Array(Math.ceil(text.length / 4))
    )
  })
}));

describe('DistributionSelectorLangChain', () => {
  let selector: DistributionSelectorLangChain;

  beforeEach(() => {
    selector = new DistributionSelectorLangChain('test-api-key');
  });

  describe('Single distribution selection', () => {
    it('should select normal distribution for age', async () => {
      const params: DistributionSelectionParams = {
        attribute: 'age',
        context: 'General population survey'
      };

      const { distribution, usage, reasoning } = await selector.selectDistribution(params);

      expect(distribution).toBeInstanceOf(NormalDistribution);
      expect((distribution as NormalDistribution).mean()).toBe(35);
      expect((distribution as NormalDistribution).variance()).toBe(100); // stdDev^2
      expect(reasoning).toContain('normal distribution');
      expect(usage.total_tokens).toBeGreaterThan(0);
    });

    it('should select exponential distribution for income', async () => {
      const params: DistributionSelectionParams = {
        attribute: 'annual_income',
        context: 'Working professionals',
        constraints: { min: 20000, max: 500000 }
      };

      const { distribution } = await selector.selectDistribution(params);

      expect(distribution).toBeInstanceOf(ExponentialDistribution);
      expect((distribution as ExponentialDistribution).mean()).toBeCloseTo(50000, 0); // 1/rate
    });

    it('should select beta distribution for percentages', async () => {
      const params: DistributionSelectionParams = {
        attribute: 'task_completion_percentage',
        context: 'Employee performance metrics'
      };

      const { distribution, reasoning } = await selector.selectDistribution(params);

      // The mock returns normal distribution for everything except specific keywords
      // Since 'task_completion_percentage' contains 'percentage', it should return beta
      expect(reasoning).toContain('Percentages are bounded between 0 and 1');
      expect(distribution).toBeInstanceOf(BetaDistribution);
      // Beta distribution parameters are private, just verify it's created
      expect(distribution.mean()).toBeDefined();
    });

    it('should select categorical distribution for discrete values', async () => {
      const params: DistributionSelectionParams = {
        attribute: 'occupation',
        context: 'Tech company employees'
      };

      const { distribution } = await selector.selectDistribution(params);

      expect(distribution).toBeInstanceOf(CategoricalDistribution);
      const categories = (distribution as CategoricalDistribution).getProbabilities();
      expect(categories.length).toBeGreaterThan(0);
      
      // Check probabilities sum to 1
      const totalProb = categories.reduce((sum, cat) => sum + cat.probability, 0);
      expect(totalProb).toBeCloseTo(1, 5);
    });

    it('should handle constraints in selection', async () => {
      const params: DistributionSelectionParams = {
        attribute: 'test_score',
        context: 'Standardized test results',
        constraints: { min: 0, max: 100 }
      };

      const { distribution, reasoning } = await selector.selectDistribution(params);

      expect(distribution).toBeDefined();
      expect(reasoning).toBeDefined();
    });
  });

  describe('Multiple distribution recommendations', () => {
    it('should recommend distributions for multiple attributes', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          recommendations: [
            {
              attribute: 'age',
              distribution_type: 'normal',
              parameters: { mean: 30, std_dev: 8 },
              reasoning: 'Age follows normal distribution'
            },
            {
              attribute: 'income',
              distribution_type: 'exponential',
              parameters: { rate: 0.00001 },
              reasoning: 'Income follows exponential distribution'
            },
            {
              attribute: 'satisfaction',
              distribution_type: 'beta',
              parameters: { alpha: 3, beta: 2 },
              reasoning: 'Satisfaction score between 0-1'
            }
          ]
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distributions, usage, recommendations } = await selector.recommendDistributions(
        ['age', 'income', 'satisfaction'],
        'Customer demographics study'
      );

      expect(distributions.size).toBe(3);
      expect(distributions.get('age')).toBeInstanceOf(NormalDistribution);
      expect(distributions.get('income')).toBeInstanceOf(ExponentialDistribution);
      expect(distributions.get('satisfaction')).toBeInstanceOf(BetaDistribution);
      expect(recommendations).toHaveLength(3);
      expect(usage.total_tokens).toBeGreaterThan(0);
    });

    it('should consider relationships between attributes', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          recommendations: [
            {
              attribute: 'age',
              distribution_type: 'normal',
              parameters: { mean: 35, std_dev: 10 },
              reasoning: 'Working age population'
            },
            {
              attribute: 'years_experience',
              distribution_type: 'normal',
              parameters: { mean: 10, std_dev: 5 },
              reasoning: 'Correlated with age, but starting from career begin'
            }
          ]
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { recommendations } = await selector.recommendDistributions(
        ['age', 'years_experience'],
        'Professional workforce'
      );

      // Check that the reasoning considers relationships
      expect(recommendations[1].reasoning).toContain('Correlated with age');
    });

    it('should handle empty attribute list', async () => {
      // Mock empty response for empty attributes
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          recommendations: []
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distributions } = await selector.recommendDistributions([], 'No context');

      expect(distributions.size).toBe(0);
    });
  });

  describe('Natural language to distribution', () => {
    it('should convert descriptive text to distribution', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          distribution_type: 'normal',
          parameters: { mean: 25, std_dev: 5 },
          reasoning: 'Young adults typically center around 25 with some variation'
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distribution, interpretation } = await selector.fromDescription(
        'mostly young adults with ages clustered around mid-twenties'
      );

      expect(distribution).toBeInstanceOf(NormalDistribution);
      expect(interpretation).toContain('Young adults');
    });

    it('should handle range descriptions', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          distribution_type: 'uniform',
          parameters: { min: 0, max: 100 },
          reasoning: 'Evenly distributed across the entire range'
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distribution } = await selector.fromDescription(
        'evenly spread from 0 to 100'
      );

      expect(distribution).toBeInstanceOf(UniformDistribution);
      expect((distribution as UniformDistribution).min).toBe(0);
      expect((distribution as UniformDistribution).max).toBe(100);
    });

    it('should handle probability descriptions', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          distribution_type: 'beta',
          parameters: { alpha: 7, beta: 3 },
          reasoning: '70% success rate implies beta distribution skewed towards 0.7'
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distribution } = await selector.fromDescription(
        'success rate around 70%'
      );

      expect(distribution).toBeInstanceOf(BetaDistribution);
    });

    it('should handle categorical descriptions', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          distribution_type: 'categorical',
          parameters: {
            categories: [
              { value: 'Software Engineer', probability: 0.4 },
              { value: 'Data Scientist', probability: 0.3 },
              { value: 'Product Manager', probability: 0.2 },
              { value: 'Designer', probability: 0.1 }
            ]
          },
          reasoning: 'Job titles in tech company'
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distribution } = await selector.fromDescription(
        'mix of software engineers, data scientists, product managers, and designers'
      );

      expect(distribution).toBeInstanceOf(CategoricalDistribution);
    });
  });

  describe('Token usage and cost estimation', () => {
    it('should accurately count tokens', async () => {
      const params: DistributionSelectionParams = {
        attribute: 'test_attribute',
        context: 'This is a longer context to test token counting accuracy'
      };

      const { usage } = await selector.selectDistribution(params);

      expect(usage.input_tokens).toBeGreaterThan(0);
      expect(usage.output_tokens).toBeGreaterThan(0);
      expect(usage.total_tokens).toBe(usage.input_tokens + usage.output_tokens);
    });

    it('should estimate costs for different models', () => {
      const gpt4Estimate = selector.estimateCost(10, 'gpt-4');
      const gpt35Estimate = selector.estimateCost(10, 'gpt-3.5-turbo');
      const gpt4TurboEstimate = selector.estimateCost(10, 'gpt-4-turbo-preview');

      // GPT-4 should be most expensive
      expect(gpt4Estimate.estimatedCost).toBeGreaterThan(gpt4TurboEstimate.estimatedCost);
      expect(gpt4TurboEstimate.estimatedCost).toBeGreaterThan(gpt35Estimate.estimatedCost);
      
      // All should have positive costs
      expect(gpt4Estimate.estimatedCost).toBeGreaterThan(0);
      expect(gpt35Estimate.estimatedCost).toBeGreaterThan(0);
      expect(gpt4TurboEstimate.estimatedCost).toBeGreaterThan(0);
    });

    it('should scale cost with attribute count', () => {
      const cost5 = selector.estimateCost(5, 'gpt-4-turbo-preview');
      const cost20 = selector.estimateCost(20, 'gpt-4-turbo-preview');

      expect(cost20.estimatedTokens).toBeGreaterThan(cost5.estimatedTokens);
      expect(cost20.estimatedCost).toBeGreaterThan(cost5.estimatedCost);
      
      // Should scale roughly linearly
      const ratio = cost20.estimatedCost / cost5.estimatedCost;
      expect(ratio).toBeGreaterThan(3);
      expect(ratio).toBeLessThan(5);
    });
  });

  describe('Error handling', () => {
    it('should fallback to normal distribution on unknown type', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          distribution_type: 'unknown_type',
          parameters: {},
          reasoning: 'Unknown distribution type'
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distribution } = await selector.selectDistribution({
        attribute: 'test',
        context: 'test'
      });

      expect(distribution).toBeInstanceOf(NormalDistribution);
    });

    it('should handle missing parameters gracefully', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          distribution_type: 'normal',
          parameters: {}, // Missing mean and std_dev
          reasoning: 'Test'
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distribution } = await selector.selectDistribution({
        attribute: 'test',
        context: 'test'
      });

      expect(distribution).toBeInstanceOf(NormalDistribution);
      expect((distribution as NormalDistribution).mean()).toBe(0); // Default
      expect((distribution as NormalDistribution).variance()).toBe(1); // Default stdDev^2
    });

    it('should handle API errors', async () => {
      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue({
        invoke: vi.fn().mockRejectedValue(new Error('API Error'))
      });

      await expect(selector.selectDistribution({
        attribute: 'test',
        context: 'test'
      })).rejects.toThrow('API Error');
    });

    it('should handle empty categorical distribution', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          distribution_type: 'categorical',
          parameters: { categories: [] }, // Empty categories
          reasoning: 'Test'
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distribution } = await selector.selectDistribution({
        attribute: 'test',
        context: 'test'
      });

      expect(distribution).toBeInstanceOf(CategoricalDistribution);
      // The implementation should handle empty categories by providing a default
    });
  });

  describe('Advanced selection scenarios', () => {
    it('should handle complex constraints', async () => {
      const params: DistributionSelectionParams = {
        attribute: 'employee_age',
        context: 'Tech startup with age discrimination laws',
        constraints: {
          min: 21, // Legal working age
          max: 65, // Retirement age
          mean: 32, // Target average
          excludeValues: [25, 30, 35] // Round numbers to avoid
        }
      };

      const { distribution, reasoning } = await selector.selectDistribution(params);

      expect(distribution).toBeDefined();
      expect(reasoning).toBeDefined();
    });

    it('should select appropriate distribution for time-series data', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          distribution_type: 'exponential',
          parameters: { rate: 0.1 },
          reasoning: 'Time between events follows exponential distribution'
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distribution } = await selector.selectDistribution({
        attribute: 'time_between_purchases',
        context: 'E-commerce customer behavior'
      });

      expect(distribution).toBeInstanceOf(ExponentialDistribution);
    });

    it('should handle multimodal descriptions', async () => {
      const mockModel = {
        invoke: vi.fn().mockResolvedValue({
          distribution_type: 'categorical',
          parameters: {
            categories: [
              { value: 'young_cluster', probability: 0.4 },
              { value: 'middle_aged_cluster', probability: 0.4 },
              { value: 'senior_cluster', probability: 0.2 }
            ]
          },
          reasoning: 'Multimodal distribution represented as categorical clusters'
        })
      };

      vi.mocked((selector as any).model.withStructuredOutput).mockReturnValue(mockModel);

      const { distribution, interpretation } = await selector.fromDescription(
        'two distinct age groups: young professionals (25-35) and senior management (45-55)'
      );

      expect(distribution).toBeInstanceOf(CategoricalDistribution);
      expect(interpretation).toContain('Multimodal');
    });
  });
});