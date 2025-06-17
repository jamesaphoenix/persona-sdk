import { NormalDistribution } from './normal';
/**
 * Generates correlated values for multiple attributes
 */
export class CorrelatedDistribution {
    attributes;
    correlations = new Map();
    conditionals = new Map();
    baseDistributions = new Map();
    constructor(attributes) {
        this.attributes = attributes;
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
    addCorrelation(correlation) {
        const { attribute1, attribute2 } = correlation;
        if (!this.correlations.has(attribute1)) {
            this.correlations.set(attribute1, []);
        }
        if (!this.correlations.has(attribute2)) {
            this.correlations.set(attribute2, []);
        }
        this.correlations.get(attribute1).push(correlation);
        this.correlations.get(attribute2).push({
            ...correlation,
            attribute1: attribute2,
            attribute2: attribute1
        });
        return this;
    }
    /**
     * Add conditional distribution
     */
    addConditional(conditional) {
        this.conditionals.set(conditional.attribute, conditional);
        // Also ensure the base distribution is registered
        this.baseDistributions.set(conditional.attribute, conditional.baseDistribution);
        return this;
    }
    /**
     * Generate correlated values
     */
    generate() {
        const result = {};
        const generated = new Set();
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
        // Generate conditional attributes
        let previousSize = generated.size;
        let iterations = 0;
        const maxIterations = 10;
        while (generated.size < this.baseDistributions.size && iterations < maxIterations) {
            this.conditionals.forEach((conditional, attr) => {
                if (!generated.has(attr)) {
                    // Check if all dependencies are satisfied
                    const satisfiedConditions = conditional.conditions.filter(cond => result[cond.dependsOn] !== undefined);
                    // Generate with base distribution and apply available transforms
                    let value = conditional.baseDistribution.sample();
                    // Apply transformations for satisfied conditions
                    satisfiedConditions.forEach(cond => {
                        value = cond.transform(value, result[cond.dependsOn]);
                    });
                    result[attr] = value;
                    generated.add(attr);
                }
            });
            // Prevent infinite loop
            if (generated.size === previousSize) {
                // Generate remaining attributes without conditions
                this.conditionals.forEach((conditional, attr) => {
                    if (!generated.has(attr)) {
                        result[attr] = conditional.baseDistribution.sample();
                        generated.add(attr);
                    }
                });
                if (generated.size === previousSize) {
                    console.warn('Circular dependency detected in conditional distributions');
                    break;
                }
            }
            previousSize = generated.size;
            iterations++;
        }
        // Apply correlations for numeric attributes
        this.applyCorrelations(result);
        return result;
    }
    /**
     * Apply correlations between numeric attributes
     */
    applyCorrelations(result) {
        const processed = new Set();
        this.correlations.forEach((correlations, attr1) => {
            if (processed.has(attr1) || typeof result[attr1] !== 'number')
                return;
            correlations.forEach(({ attribute2, correlation, type = 'linear' }) => {
                if (processed.has(attribute2) || typeof result[attribute2] !== 'number')
                    return;
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
                    result[attribute2] = value2 * (1 - Math.abs(correlation)) + targetValue2 * Math.abs(correlation);
                }
            });
            processed.add(attr1);
        });
    }
    /**
     * Get approximate mean for an attribute
     */
    getMean(attribute) {
        const dist = this.baseDistributions.get(attribute);
        if (!dist)
            return 0;
        // Use the distribution's mean() method
        if (typeof dist.mean === 'function') {
            return dist.mean();
        }
        return 0;
    }
    /**
     * Get variance for an attribute
     */
    getVariance(attribute) {
        const dist = this.baseDistributions.get(attribute);
        if (!dist)
            return 1;
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
    ageIncome: (baseIncome, age) => {
        // Income tends to increase with age until retirement
        const peakAge = 55;
        const factor = age < peakAge
            ? 1 + (age - 25) * 0.02
            : 1 + (peakAge - 25) * 0.02 - (age - peakAge) * 0.015;
        return Math.max(0, baseIncome * Math.max(0.5, factor));
    },
    ageExperience: (baseExp, age) => {
        // Work experience is bounded by age
        const workingAge = Math.max(0, age - 22); // Assuming start work at 22
        return Math.max(0, Math.min(baseExp, workingAge));
    },
    // Physical correlations
    heightWeight: (baseWeight, height) => {
        // BMI-based correlation
        const heightM = height / 100; // Convert cm to m
        const targetBMI = 22 + (Math.random() - 0.5) * 8; // BMI 18-26
        const idealWeight = heightM * heightM * targetBMI;
        // Blend base weight with ideal weight
        return baseWeight * 0.3 + idealWeight * 0.7;
    },
    // Socioeconomic correlations
    educationIncome: (baseIncome, educationYears) => {
        // Higher education correlates with higher income
        const factor = 1 + (educationYears - 12) * 0.1;
        return baseIncome * Math.max(0.7, factor);
    },
    // Location correlations
    urbanRuralIncome: (baseIncome, isUrban) => {
        // Urban areas typically have higher incomes
        return isUrban ? baseIncome * 1.2 : baseIncome * 0.85;
    }
};
/**
 * Preset correlation configurations for common persona types
 */
export class PersonaCorrelationPresets {
    static REALISTIC_ADULT = new CorrelatedDistribution({})
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
    static PROFESSIONAL = new CorrelatedDistribution({})
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
//# sourceMappingURL=correlated-distribution.js.map