import { Distribution, AttributeCorrelation } from '../types';
import { NormalDistribution } from './normal';

/**
 * Configuration for conditional distributions
 */
export interface ConditionalDistribution {
  attribute: string;
  baseDistribution: Distribution;
  conditions: Array<{
    dependsOn: string;
    transform: (baseValue: number, dependentValue: any) => number;
  }>;
}

/**
 * Generates correlated values for multiple attributes
 */
export class CorrelatedDistribution {
  private correlations: Map<string, AttributeCorrelation[]> = new Map();
  private conditionals: Map<string, ConditionalDistribution> = new Map();
  private baseDistributions: Map<string, Distribution> = new Map();

  constructor(
    private attributes: Record<string, Distribution | any>
  ) {
    // Separate distributions from static values
    Object.entries(attributes).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && 'sample' in value) {
        this.baseDistributions.set(key, value);
      }
    });
  }

  /**
   * Add correlation between two attributes
   */
  addCorrelation(correlation: AttributeCorrelation): this {
    const { attribute1, attribute2 } = correlation;
    
    if (!this.correlations.has(attribute1)) {
      this.correlations.set(attribute1, []);
    }
    if (!this.correlations.has(attribute2)) {
      this.correlations.set(attribute2, []);
    }
    
    this.correlations.get(attribute1)!.push(correlation);
    this.correlations.get(attribute2)!.push({
      ...correlation,
      attribute1: attribute2,
      attribute2: attribute1
    });
    
    return this;
  }

  /**
   * Add conditional distribution
   */
  addConditional(conditional: ConditionalDistribution): this {
    this.conditionals.set(conditional.attribute, conditional);
    // Don't add to baseDistributions as it will be handled by conditionals
    return this;
  }

  /**
   * Generate correlated values
   */
  generate(): Record<string, any> {
    const result: Record<string, any> = {};
    const generated = new Set<string>();
    const remaining = new Map(this.conditionals);

    // First, copy all static values
    Object.entries(this.attributes).forEach(([key, value]) => {
      if (!(typeof value === 'object' && value !== null && 'sample' in value)) {
        result[key] = value;
        generated.add(key);
      }
    });

    // Generate base attributes (those without dependencies)
    this.baseDistributions.forEach((dist, attr) => {
      if (!this.conditionals.has(attr)) {
        result[attr] = dist.sample();
        generated.add(attr);
      }
    });

    // Generate conditional attributes in dependency order
    let iterations = 0;
    const maxIterations = 50; // Increased for more complex dependency chains
    
    while (remaining.size > 0 && iterations < maxIterations) {
      let progressMade = false;
      
      // Try to generate attributes whose dependencies are satisfied
      remaining.forEach((conditional, attr) => {
        // Check if all dependencies are available
        const allDependenciesSatisfied = conditional.conditions && conditional.conditions.every(
          cond => result[cond.dependsOn] !== undefined
        );

        if (allDependenciesSatisfied && conditional.baseDistribution) {
          // Generate with base distribution and apply all transforms
          let value = conditional.baseDistribution.sample();
          
          // Apply all transformations in sequence
          if (conditional.conditions) {
            conditional.conditions.forEach(cond => {
              value = cond.transform(value, result[cond.dependsOn]);
            });
          }

          result[attr] = value;
          generated.add(attr);
          remaining.delete(attr);
          progressMade = true;
        }
      });

      // If no progress was made, we have circular dependencies or missing dependencies
      if (!progressMade) {
        // Check for actual circular dependencies
        const hasTrueCircularDep = this.detectCircularDependency(remaining);
        
        if (hasTrueCircularDep) {
          console.warn('Circular dependency detected in conditional distributions');
        }
        
        // Generate remaining attributes with base distributions only
        remaining.forEach((conditional, attr) => {
          if (conditional.baseDistribution) {
            result[attr] = conditional.baseDistribution.sample();
            generated.add(attr);
          }
        });
        break;
      }
      
      iterations++;
    }

    // Apply correlations for numeric attributes
    this.applyCorrelations(result);

    return result;
  }

  /**
   * Detect actual circular dependencies in remaining conditionals
   */
  private detectCircularDependency(remaining: Map<string, ConditionalDistribution>): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (attr: string): boolean => {
      if (recursionStack.has(attr)) return true;
      if (visited.has(attr)) return false;
      
      visited.add(attr);
      recursionStack.add(attr);
      
      const conditional = remaining.get(attr);
      if (conditional && conditional.conditions) {
        for (const condition of conditional.conditions) {
          if (remaining.has(condition.dependsOn) && hasCycle(condition.dependsOn)) {
            return true;
          }
        }
      }
      
      recursionStack.delete(attr);
      return false;
    };
    
    // Check each remaining attribute for cycles
    for (const attr of remaining.keys()) {
      if (!visited.has(attr) && hasCycle(attr)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Apply correlations between numeric attributes
   */
  private applyCorrelations(result: Record<string, any>): void {
    const processed = new Set<string>();

    this.correlations.forEach((correlations, attr1) => {
      if (processed.has(attr1) || result[attr1] === undefined || typeof result[attr1] !== 'number') return;

      correlations.forEach(({ attribute2, correlation, type = 'linear' }) => {
        if (processed.has(attribute2) || result[attribute2] === undefined || typeof result[attribute2] !== 'number') return;

        const value1 = result[attr1];
        const value2 = result[attribute2];

        // Apply correlation adjustment
        if (type === 'linear') {
          // Linear correlation adjustment - stronger effect for higher correlations
          const mean1 = this.getMean(attr1);
          const mean2 = this.getMean(attribute2);
          const stdDev1 = Math.sqrt(this.getVariance(attr1));
          const stdDev2 = Math.sqrt(this.getVariance(attribute2));
          
          // Z-score of value1
          const z1 = stdDev1 > 0 ? (value1 - mean1) / stdDev1 : 0;
          
          // Adjust value2 based on correlation
          const targetZ2 = correlation * z1;
          const targetValue2 = mean2 + targetZ2 * stdDev2;
          
          // Blend original and target based on correlation strength
          const blendedValue = value2 * (1 - Math.abs(correlation)) + targetValue2 * Math.abs(correlation);
          
          // Ensure non-negative for certain attributes
          const nonNegativeAttrs = ['age', 'income', 'salary', 'weight', 'height', 'yearsExperience', 'yearsAtCompany', 'monthlySpending', 'savingsBalance', 'creditScore'];
          if (nonNegativeAttrs.includes(attribute2)) {
            result[attribute2] = Math.max(0, blendedValue);
          } else {
            result[attribute2] = blendedValue;
          }
        }
      });

      processed.add(attr1);
    });
  }

  /**
   * Get approximate mean for an attribute
   */
  private getMean(attribute: string): number {
    const dist = this.baseDistributions.get(attribute);
    if (!dist) return 0;

    // Use the distribution's mean() method
    if (typeof dist.mean === 'function') {
      return dist.mean();
    }
    
    return 0;
  }

  /**
   * Get variance for an attribute
   */
  private getVariance(attribute: string): number {
    const dist = this.baseDistributions.get(attribute);
    if (!dist) return 1;

    // Use the distribution's variance() method if available
    if (typeof dist.variance === 'function') {
      return dist.variance();
    }
    
    // Default variance for distributions without explicit variance
    return 1;
  }
}

/**
 * Common correlation patterns for realistic persona generation
 */
export const CommonCorrelations = {
  // Age correlations
  ageIncome: (baseIncome: number, age: number): number => {
    // Income tends to increase with age until retirement
    const peakAge = 55;
    const factor = age < peakAge 
      ? 1 + (age - 25) * 0.02 
      : 1 + (peakAge - 25) * 0.02 - (age - peakAge) * 0.015;
    return Math.max(0, baseIncome * Math.max(0.5, factor));
  },

  ageExperience: (baseExp: number, age: number): number => {
    // Work experience is bounded by age
    const workingAge = Math.max(0, age - 22); // Assuming start work at 22
    return Math.max(0, Math.min(baseExp, workingAge));
  },

  // Physical correlations
  heightWeight: (baseWeight: number, height: number): number => {
    // BMI-based correlation
    const heightM = height / 100; // Convert cm to m
    const targetBMI = 22 + (Math.random() - 0.5) * 8; // BMI 18-26
    const idealWeight = heightM * heightM * targetBMI;
    // Blend base weight with ideal weight
    return baseWeight * 0.3 + idealWeight * 0.7;
  },

  // Socioeconomic correlations
  educationIncome: (baseIncome: number, educationYears: number): number => {
    // Higher education correlates with higher income
    const factor = 1 + (educationYears - 12) * 0.1;
    return baseIncome * Math.max(0.7, factor);
  },

  // Location correlations
  urbanRuralIncome: (baseIncome: number, isUrban: boolean): number => {
    // Urban areas typically have higher incomes
    return isUrban ? baseIncome * 1.2 : baseIncome * 0.85;
  }
};

/**
 * Preset correlation configurations for common persona types
 */
export class PersonaCorrelationPresets {
  static readonly REALISTIC_ADULT = new CorrelatedDistribution({})
    .addCorrelation({
      attribute1: 'age',
      attribute2: 'income',
      correlation: 0.6
    })
    .addCorrelation({
      attribute1: 'height',
      attribute2: 'weight',
      correlation: 0.7
    })
    .addConditional({
      attribute: 'yearsExperience',
      baseDistribution: new NormalDistribution(10, 5),
      conditions: [{
        dependsOn: 'age',
        transform: CommonCorrelations.ageExperience
      }]
    });

  static readonly PROFESSIONAL = new CorrelatedDistribution({})
    .addConditional({
      attribute: 'income',
      baseDistribution: new NormalDistribution(75000, 25000),
      conditions: [
        {
          dependsOn: 'age',
          transform: CommonCorrelations.ageIncome
        },
        {
          dependsOn: 'educationYears',
          transform: CommonCorrelations.educationIncome
        }
      ]
    });
}