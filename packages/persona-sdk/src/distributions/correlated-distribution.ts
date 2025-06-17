import { Distribution } from '../types';
import { NormalDistribution } from './normal';

/**
 * Represents a correlation between two attributes
 */
export interface AttributeCorrelation {
  attribute1: string;
  attribute2: string;
  correlation: number; // -1 to 1
  type?: 'linear' | 'exponential' | 'logarithmic';
}

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
    return this;
  }

  /**
   * Generate correlated values
   */
  generate(): Record<string, any> {
    const result: Record<string, any> = {};
    const generated = new Set<string>();

    // First, copy all static values
    Object.entries(this.attributes).forEach(([key, value]) => {
      if (!(typeof value === 'object' && value !== null && 'sample' in value)) {
        result[key] = value;
      }
    });

    // Generate base attributes (those without dependencies)
    this.baseDistributions.forEach((dist, attr) => {
      if (!this.conditionals.has(attr)) {
        result[attr] = dist.sample();
        generated.add(attr);
      }
    });

    // Generate conditional attributes
    let previousSize = generated.size;
    while (generated.size < this.baseDistributions.size) {
      this.conditionals.forEach((conditional, attr) => {
        if (!generated.has(attr)) {
          // Check if all dependencies are satisfied
          const canGenerate = conditional.conditions.every(
            cond => result[cond.dependsOn] !== undefined
          );

          if (canGenerate) {
            let value = conditional.baseDistribution.sample();
            
            // Apply transformations based on conditions
            conditional.conditions.forEach(cond => {
              value = cond.transform(value, result[cond.dependsOn]);
            });

            result[attr] = value;
            generated.add(attr);
          }
        }
      });

      // Prevent infinite loop
      if (generated.size === previousSize) {
        console.warn('Circular dependency detected in conditional distributions');
        break;
      }
      previousSize = generated.size;
    }

    // Apply correlations for numeric attributes
    this.applyCorrelations(result);

    return result;
  }

  /**
   * Apply correlations between numeric attributes
   */
  private applyCorrelations(result: Record<string, any>): void {
    const processed = new Set<string>();

    this.correlations.forEach((correlations, attr1) => {
      if (processed.has(attr1) || typeof result[attr1] !== 'number') return;

      correlations.forEach(({ attribute2, correlation, type = 'linear' }) => {
        if (processed.has(attribute2) || typeof result[attribute2] !== 'number') return;

        const value1 = result[attr1];
        const value2 = result[attribute2];

        // Apply correlation adjustment
        if (type === 'linear') {
          // Simple linear correlation adjustment
          const adjustment = correlation * (value1 - this.getMean(attr1)) * 0.3;
          result[attribute2] = value2 + adjustment;
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