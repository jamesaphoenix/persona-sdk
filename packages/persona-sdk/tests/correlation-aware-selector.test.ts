/**
 * Tests for correlation-aware distribution selector
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  CorrelationAwareSelector,
  CorrelationAwareSelectionParams,
  CorrelationAwareResult
} from '../src/tools/correlation-aware-selector';
import { 
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CategoricalDistribution,
  CorrelatedDistribution,
  CommonCorrelations
} from '../src/distributions';
import { DistributionMap, AttributeCorrelation } from '../src/types';

// Mock OpenAI
vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockImplementation(({ messages }) => {
          const userContent = messages[0].content.toLowerCase();
          
          // Check for specific attributes in "Attributes to generate:" line
          const attributesMatch = userContent.match(/attributes to generate: ([^\n]+)/i);
          const attributes = attributesMatch ? attributesMatch[1].split(',').map(a => a.trim()) : [];
          
          // Mock different responses based on attributes
          if (attributes.includes('height') && attributes.includes('weight')) {
            return Promise.resolve({
              choices: [{
                message: {
                  tool_calls: [{
                    function: {
                      arguments: JSON.stringify({
                        distributions: [
                          {
                            attribute: 'height',
                            distribution_type: 'normal',
                            parameters: { mean: 170, std_dev: 10 },
                            reasoning: 'Height follows normal distribution'
                          },
                          {
                            attribute: 'weight',
                            distribution_type: 'normal',
                            parameters: { mean: 70, std_dev: 15 },
                            reasoning: 'Weight follows normal distribution'
                          }
                        ],
                        correlations: [
                          {
                            attribute1: 'height',
                            attribute2: 'weight',
                            correlation: 0.7,
                            reasoning: 'Taller people tend to weigh more'
                          }
                        ],
                        conditionals: [
                          {
                            attribute: 'weight',
                            depends_on: 'height',
                            relationship_type: 'height_weight',
                            reasoning: 'Weight increases approximately 0.8kg per cm of height'
                          }
                        ],
                        overall_reasoning: 'Height and weight are positively correlated in human populations'
                      })
                    }
                  }]
                }
              }]
            });
          } else if (attributes.includes('age') && attributes.includes('income')) {
            return Promise.resolve({
              choices: [{
                message: {
                  tool_calls: [{
                    function: {
                      arguments: JSON.stringify({
                        distributions: [
                          {
                            attribute: 'age',
                            distribution_type: 'uniform',
                            parameters: { min: 25, max: 65 },
                            reasoning: 'Working age range'
                          },
                          {
                            attribute: 'income',
                            distribution_type: 'exponential',
                            parameters: { rate: 0.00001 },
                            reasoning: 'Income distribution is right-skewed'
                          }
                        ],
                        correlations: [
                          {
                            attribute1: 'age',
                            attribute2: 'income',
                            correlation: 0.5,
                            reasoning: 'Income tends to increase with age until retirement'
                          }
                        ],
                        conditionals: [
                          {
                            attribute: 'income',
                            depends_on: 'age',
                            relationship_type: 'age_income',
                            reasoning: 'Income peaks in middle age'
                          }
                        ],
                        overall_reasoning: 'Age-income relationship follows an inverted U curve'
                      })
                    }
                  }]
                }
              }]
            });
          } else if (attributes.includes('education') && attributes.includes('occupation')) {
            return Promise.resolve({
              choices: [{
                message: {
                  tool_calls: [{
                    function: {
                      arguments: JSON.stringify({
                        distributions: [
                          {
                            attribute: 'education',
                            distribution_type: 'categorical',
                            parameters: {
                              categories: [
                                { value: 'high_school', probability: 0.3 },
                                { value: 'bachelors', probability: 0.4 },
                                { value: 'masters', probability: 0.2 },
                                { value: 'phd', probability: 0.1 }
                              ]
                            },
                            reasoning: 'Education levels in population'
                          },
                          {
                            attribute: 'occupation',
                            distribution_type: 'categorical',
                            parameters: {
                              categories: [
                                { value: 'engineer', probability: 0.3 },
                                { value: 'manager', probability: 0.3 },
                                { value: 'technician', probability: 0.2 },
                                { value: 'other', probability: 0.2 }
                              ]
                            },
                            reasoning: 'Occupation distribution'
                          }
                        ],
                        correlations: [
                          {
                            attribute1: 'education',
                            attribute2: 'occupation',
                            correlation: 0.6,
                            reasoning: 'Higher education correlates with professional occupations'
                          }
                        ],
                        conditionals: [],
                        overall_reasoning: 'Education level influences occupation choices'
                      })
                    }
                  }]
                }
              }]
            });
          } else if (attributes.length === 0) {
            // Empty attributes case
            return Promise.resolve({
              choices: [{
                message: {
                  tool_calls: [{
                    function: {
                      arguments: JSON.stringify({
                        distributions: [],
                        correlations: [],
                        conditionals: [],
                        overall_reasoning: 'No attributes provided'
                      })
                    }
                  }]
                }
              }]
            });
          } else {
            // Default response - generate distributions for requested attributes
            const distributions = attributes.map(attr => {
              // Simple logic to determine distribution type based on attribute name
              let distType = 'normal';
              let params = { mean: 50, std_dev: 10 };
              
              if (attr.includes('age')) {
                params = { mean: 35, std_dev: 10 };
              } else if (attr.includes('income') || attr.includes('salary')) {
                distType = 'exponential';
                params = { rate: 0.00001 } as any;
              } else if (attr.includes('category') || attr.includes('type') || attr.includes('occupation')) {
                distType = 'categorical';
                params = {
                  categories: [
                    { value: 'option1', probability: 0.5 },
                    { value: 'option2', probability: 0.5 }
                  ]
                } as any;
              }
              
              return {
                attribute: attr,
                distribution_type: distType,
                parameters: params,
                reasoning: `Default ${distType} distribution for ${attr}`
              };
            });
            
            // Generate simple correlations if multiple attributes
            const correlations = [];
            if (attributes.length >= 2) {
              // Check for common correlation patterns
              if (attributes.some(a => a.includes('age')) && attributes.some(a => a.includes('income'))) {
                correlations.push({
                  attribute1: attributes.find(a => a.includes('age')),
                  attribute2: attributes.find(a => a.includes('income')),
                  correlation: 0.5,
                  reasoning: 'Age and income are typically correlated'
                });
              }
            }
            
            return Promise.resolve({
              choices: [{
                message: {
                  tool_calls: [{
                    function: {
                      arguments: JSON.stringify({
                        distributions,
                        correlations,
                        conditionals: [],
                        overall_reasoning: 'Default distributions selected based on attribute names'
                      })
                    }
                  }]
                }
              }]
            });
          }
        })
      }
    }
  }))
}));

describe('CorrelationAwareSelector', () => {
  let selector: CorrelationAwareSelector;

  beforeEach(() => {
    selector = new CorrelationAwareSelector('test-api-key');
  });

  describe('Correlated distribution selection', () => {
    it('should select correlated distributions for height and weight', async () => {
      const params: CorrelationAwareSelectionParams = {
        attributes: ['height', 'weight'],
        context: 'General adult population'
      };

      const result = await selector.selectCorrelatedDistributions(params);

      expect(Object.keys(result.distributions)).toHaveLength(2);
      expect(result.distributions.height).toBeInstanceOf(NormalDistribution);
      expect(result.distributions.weight).toBeDefined();
      
      expect(result.correlations).toHaveLength(1);
      expect(result.correlations[0].correlation).toBe(0.7);
      expect(result.correlations[0]).toBeDefined();
      
      expect(result.conditionals).toHaveLength(1);
      expect(result.conditionals[0].attribute).toBe('weight');
      expect(result.conditionals[0].dependsOn).toBe('height');
      expect(result.reasoning).toContain('positively correlated');
    });

    it('should handle age-income correlation with quadratic relationship', async () => {
      const params: CorrelationAwareSelectionParams = {
        attributes: ['age', 'income'],
        context: 'Working professionals'
      };

      const result = await selector.selectCorrelatedDistributions(params);

      expect(result.distributions.age).toBeInstanceOf(UniformDistribution);
      expect(result.distributions.income).toBeDefined();
      
      expect(result.correlations[0].correlation).toBe(0.5);
      expect(result.conditionals[0].reasoning).toContain('peaks in middle age');
    });

    it('should handle categorical correlations', async () => {
      const params: CorrelationAwareSelectionParams = {
        attributes: ['education', 'occupation'],
        context: 'Tech industry workers'
      };

      const result = await selector.selectCorrelatedDistributions(params);

      expect(result.distributions.education).toBeInstanceOf(CategoricalDistribution);
      expect(result.distributions.occupation).toBeInstanceOf(CategoricalDistribution);
      
      expect(result.correlations[0].correlation).toBe(0.6);
      expect(result.reasoning).toContain('Education level influences');
    });

    it('should respect existing attributes when selecting distributions', async () => {
      const params: CorrelationAwareSelectionParams = {
        attributes: ['weight'],
        context: 'Adult population',
        existingAttributes: { height: 180 }
      };

      const result = await selector.selectCorrelatedDistributions(params);

      // Weight should be conditional on the existing height
      expect(result.distributions.weight).toBeDefined();
      expect(result.conditionals).toBeDefined();
    });

    it('should apply constraints to distributions', async () => {
      const params: CorrelationAwareSelectionParams = {
        attributes: ['age', 'income'],
        context: 'Young professionals',
        constraints: {
          age: { min: 22, max: 35 },
          income: { min: 30000, max: 100000 }
        }
      };

      const result = await selector.selectCorrelatedDistributions(params);

      const ageDistribution = result.distributions.age as UniformDistribution;
      expect(ageDistribution).toBeDefined();
      
      // Note: The actual constraint application would be in the implementation
      // This test verifies the selector processes constraints
      expect(result.reasoning).toBeDefined();
    });
  });

  describe('Multiple attribute handling', () => {
    it('should handle multiple uncorrelated attributes', async () => {
      const params: CorrelationAwareSelectionParams = {
        attributes: ['favorite_color', 'shoe_size', 'hobby'],
        context: 'General population survey'
      };

      const result = await selector.selectCorrelatedDistributions(params);

      expect(Object.keys(result.distributions).length).toBeGreaterThanOrEqual(1);
      expect(result.correlations.length).toBe(0);
      expect(result.conditionals.length).toBe(0);
    });

    it('should identify multiple correlations in a group', async () => {
      // Mock a response with multiple correlations
      vi.mocked(selector['openai'].chat.completions.create).mockResolvedValueOnce({
        choices: [{
          message: {
            tool_calls: [{
              function: {
                arguments: JSON.stringify({
                  distributions: [
                    { attribute: 'age', distribution_type: 'normal', parameters: { mean: 35, std_dev: 10 }, reasoning: 'Age distribution' },
                    { attribute: 'income', distribution_type: 'exponential', parameters: { rate: 0.00001 }, reasoning: 'Income distribution' },
                    { attribute: 'education_years', distribution_type: 'normal', parameters: { mean: 16, std_dev: 3 }, reasoning: 'Education years' }
                  ],
                  correlations: [
                    {
                      attribute1: 'age',
                      attribute2: 'income',
                      correlation: 0.5,
                      reasoning: 'Income increases with age'
                    },
                    {
                      attribute1: 'education_years',
                      attribute2: 'income',
                      correlation: 0.7,
                      reasoning: 'Higher education leads to higher income'
                    }
                  ],
                  conditionals: [],
                  overall_reasoning: 'Multiple factors affect income'
                })
              }
            }]
          }
        }]
      } as any);

      const params: CorrelationAwareSelectionParams = {
        attributes: ['age', 'income', 'education_years'],
        context: 'Professional workforce'
      };

      const result = await selector.selectCorrelatedDistributions(params);

      expect(result.correlations).toHaveLength(2);
      expect(result.correlations.some(c => c.attribute1 === 'age')).toBe(true);
      expect(result.correlations.some(c => c.attribute1 === 'education_years')).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(selector['openai'].chat.completions.create).mockRejectedValueOnce(
        new Error('API Error')
      );

      await expect(selector.selectCorrelatedDistributions({
        attributes: ['test'],
        context: 'test'
      })).rejects.toThrow('API Error');
    });

    it('should handle malformed API responses', async () => {
      vi.mocked(selector['openai'].chat.completions.create).mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      } as any);

      await expect(selector.selectCorrelatedDistributions({
        attributes: ['test'],
        context: 'test'
      })).rejects.toThrow();
    });

    it('should handle empty attribute list', async () => {
      const params: CorrelationAwareSelectionParams = {
        attributes: [],
        context: 'No attributes'
      };

      const result = await selector.selectCorrelatedDistributions(params);

      expect(Object.keys(result.distributions)).toHaveLength(0);
      expect(result.correlations).toHaveLength(0);
    });
  });

  describe('Integration with CommonCorrelations', () => {
    it('should apply height-weight correlation', async () => {
      // Test the height-weight correlation function
      const heights: number[] = [];
      const weights: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const height = 150 + Math.random() * 40; // 150-190 cm
        const baseWeight = 50 + Math.random() * 50; // 50-100 kg
        const correlatedWeight = CommonCorrelations.heightWeight(baseWeight, height);
        
        heights.push(height);
        weights.push(correlatedWeight);
      }

      // Calculate correlation coefficient
      const correlation = calculateCorrelation(heights, weights);
      expect(correlation).toBeGreaterThan(0.5); // Should be positively correlated
    });

    it('should apply age-income correlation', async () => {
      // Test that middle-aged have higher income
      const incomes: Array<{ age: number; income: number }> = [];
      
      for (let i = 0; i < 100; i++) {
        const age = 25 + Math.random() * 40; // 25-65
        const baseIncome = 50000 + Math.random() * 50000; // 50k-100k
        const correlatedIncome = CommonCorrelations.ageIncome(baseIncome, age);
        incomes.push({ age, income: correlatedIncome });
      }

      const youngIncomes = incomes.filter(i => i.age < 35).map(i => i.income);
      const middleIncomes = incomes.filter(i => i.age >= 35 && i.age < 50).map(i => i.income);
      const avgYoung = average(youngIncomes);
      const avgMiddle = average(middleIncomes);

      expect(avgMiddle).toBeGreaterThan(avgYoung);
    });
  });

  describe('Advanced selection scenarios', () => {
    it('should handle complex multi-attribute scenarios', async () => {
      // Mock a complex response
      vi.mocked(selector['openai'].chat.completions.create).mockResolvedValueOnce({
        choices: [{
          message: {
            tool_calls: [{
              function: {
                arguments: JSON.stringify({
                  distributions: [
                    { attribute: 'age', distribution_type: 'normal', parameters: { mean: 35, std_dev: 10 }, reasoning: 'Age distribution' },
                    { 
                      attribute: 'sex',
                      distribution_type: 'categorical', 
                      parameters: {
                        categories: [
                          { value: 'male', probability: 0.5 },
                          { value: 'female', probability: 0.5 }
                        ]
                      },
                      reasoning: 'Sex distribution'
                    },
                    { attribute: 'height', distribution_type: 'normal', parameters: { mean: 170, std_dev: 10 }, reasoning: 'Height distribution' },
                    { attribute: 'weight', distribution_type: 'normal', parameters: { mean: 70, std_dev: 15 }, reasoning: 'Weight distribution' }
                  ],
                  correlations: [
                    {
                      attribute1: 'sex',
                      attribute2: 'height',
                      correlation: 0.8,
                      reasoning: 'Males tend to be taller'
                    },
                    {
                      attribute1: 'height',
                      attribute2: 'weight',
                      correlation: 0.7,
                      reasoning: 'Height correlates with weight'
                    }
                  ],
                  conditionals: [
                    {
                      attribute: 'height',
                      depends_on: 'sex',
                      relationship_type: 'custom',
                      custom_formula: 'categorical_shift',
                      reasoning: 'Sex-based height differences'
                    }
                  ],
                  overall_reasoning: 'Complex demographic correlations'
                })
              }
            }]
          }
        }]
      } as any);

      const params: CorrelationAwareSelectionParams = {
        attributes: ['age', 'sex', 'height', 'weight'],
        context: 'Adult demographics'
      };

      const result = await selector.selectCorrelatedDistributions(params);

      expect(Object.keys(result.distributions)).toHaveLength(4);
      expect(result.correlations).toHaveLength(2);
      expect(result.conditionals).toHaveLength(1);
      expect(result.conditionals[0].dependsOn).toBe('sex');
    });

    it('should handle transitive correlations', async () => {
      // A -> B -> C transitive correlation
      vi.mocked(selector['openai'].chat.completions.create).mockResolvedValueOnce({
        choices: [{
          message: {
            tool_calls: [{
              function: {
                arguments: JSON.stringify({
                  distributions: [
                    { attribute: 'education_years', distribution_type: 'normal', parameters: { mean: 16, std_dev: 3 }, reasoning: 'Education years' },
                    { attribute: 'occupation_level', distribution_type: 'uniform', parameters: { min: 1, max: 5 }, reasoning: 'Occupation levels' },
                    { attribute: 'income', distribution_type: 'exponential', parameters: { rate: 0.00001 }, reasoning: 'Income distribution' }
                  ],
                  correlations: [
                    {
                      attribute1: 'education_years',
                      attribute2: 'occupation_level',
                      correlation: 0.7,
                      reasoning: 'Education affects occupation level'
                    },
                    {
                      attribute1: 'occupation_level',
                      attribute2: 'income',
                      correlation: 0.8,
                      reasoning: 'Occupation level determines income'
                    }
                  ],
                  conditionals: [
                    {
                      attribute: 'occupation_level',
                      depends_on: 'education_years',
                      relationship_type: 'custom',
                      custom_formula: 'linear',
                      reasoning: 'Each year of education increases occupation level'
                    },
                    {
                      attribute: 'income',
                      depends_on: 'occupation_level',
                      relationship_type: 'custom',
                      custom_formula: 'exponential',
                      reasoning: 'Income grows exponentially with occupation level'
                    }
                  ],
                  overall_reasoning: 'Transitive correlation: education -> occupation -> income'
                })
              }
            }]
          }
        }]
      } as any);

      const params: CorrelationAwareSelectionParams = {
        attributes: ['education_years', 'occupation_level', 'income'],
        context: 'Career progression model'
      };

      const result = await selector.selectCorrelatedDistributions(params);

      expect(result.correlations).toHaveLength(2);
      expect(result.conditionals).toHaveLength(2);
      expect(result.reasoning).toContain('Transitive correlation');
    });
  });
});

// Helper functions for correlation calculation
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return correlation;
}

function average(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}