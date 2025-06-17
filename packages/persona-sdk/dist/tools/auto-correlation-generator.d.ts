import { z } from 'zod';
import { AttributeCorrelation, DistributionSpec, DistributionMap } from '../types';
/**
 * Schema for the auto-generated correlation configuration
 */
export declare const AutoCorrelationSchema: z.ZodObject<{
    correlations: z.ZodArray<z.ZodObject<{
        attribute1: z.ZodString;
        attribute2: z.ZodString;
        correlation: z.ZodNumber;
        reasoning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        attribute1: string;
        attribute2: string;
        correlation: number;
        reasoning: string;
    }, {
        attribute1: string;
        attribute2: string;
        correlation: number;
        reasoning: string;
    }>, "many">;
    conditionals: z.ZodArray<z.ZodObject<{
        attribute: z.ZodString;
        dependsOn: z.ZodString;
        transformType: z.ZodEnum<["age_income", "age_experience", "height_weight", "education_income", "custom"]>;
        customFormula: z.ZodOptional<z.ZodString>;
        reasoning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        attribute: string;
        reasoning: string;
        dependsOn: string;
        transformType: "custom" | "age_experience" | "age_income" | "height_weight" | "education_income";
        customFormula?: string | undefined;
    }, {
        attribute: string;
        reasoning: string;
        dependsOn: string;
        transformType: "custom" | "age_experience" | "age_income" | "height_weight" | "education_income";
        customFormula?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    correlations: {
        attribute1: string;
        attribute2: string;
        correlation: number;
        reasoning: string;
    }[];
    conditionals: {
        attribute: string;
        reasoning: string;
        dependsOn: string;
        transformType: "custom" | "age_experience" | "age_income" | "height_weight" | "education_income";
        customFormula?: string | undefined;
    }[];
}, {
    correlations: {
        attribute1: string;
        attribute2: string;
        correlation: number;
        reasoning: string;
    }[];
    conditionals: {
        attribute: string;
        reasoning: string;
        dependsOn: string;
        transformType: "custom" | "age_experience" | "age_income" | "height_weight" | "education_income";
        customFormula?: string | undefined;
    }[];
}>;
export type AutoCorrelationConfig = z.infer<typeof AutoCorrelationSchema>;
/**
 * Configuration for auto-generating correlations
 */
export interface AutoCorrelationOptions {
    attributes: Record<string, DistributionSpec>;
    context?: string;
    domain?: string;
    apiKey?: string;
    model?: string;
}
/**
 * Automatically generates correlations and conditionals for persona attributes using AI
 *
 * @example
 * ```typescript
 * const generator = new AutoCorrelationGenerator();
 *
 * const config = await generator.generate({
 *   attributes: {
 *     age: new UniformDistribution(18, 80),
 *     income: new NormalDistribution(50000, 20000),
 *     yearsExperience: new UniformDistribution(0, 40),
 *     fitnessLevel: new UniformDistribution(1, 10),
 *     occupation: 'Professional'
 *   },
 *   context: 'Technology professionals in Silicon Valley',
 *   domain: 'workplace'
 * });
 *
 * // Use with PersonaBuilder
 * const persona = PersonaBuilder.create()
 *   .withAttributes(attributes)
 *   .buildWithCorrelations(config);
 * ```
 */
export declare class AutoCorrelationGenerator {
    private openai;
    constructor(apiKey?: string);
    /**
     * Generate correlations and conditionals for the given attributes
     */
    generate(options: AutoCorrelationOptions): Promise<AutoCorrelationConfig>;
    /**
     * Convert the auto-generated config to the format expected by buildWithCorrelations
     */
    toBuildConfig(config: AutoCorrelationConfig): {
        correlations: AttributeCorrelation[];
        conditionals: Array<{
            attribute: string;
            dependsOn: string;
            transform: (value: number, dependentValue: any) => number;
        }>;
    };
    /**
     * Get the transform function based on type
     */
    private getTransformFunction;
    /**
     * Get attribute type description
     */
    private getAttributeType;
    /**
     * Get attribute description
     */
    private getAttributeDescription;
}
/**
 * Convenience function to generate personas with automatic correlations
 *
 * @example
 * ```typescript
 * const personas = await generateWithAutoCorrelations({
 *   attributes: {
 *     age: new UniformDistribution(25, 65),
 *     income: new NormalDistribution(60000, 20000),
 *     yearsExperience: new UniformDistribution(0, 30)
 *   },
 *   count: 100,
 *   context: 'Tech workers in San Francisco'
 * });
 * ```
 */
export declare function generateWithAutoCorrelations(options: {
    attributes: DistributionMap;
    count: number;
    context?: string;
    domain?: string;
    groupName?: string;
    apiKey?: string;
    model?: string;
}): Promise<import('../persona-group').PersonaGroup>;
//# sourceMappingURL=auto-correlation-generator.d.ts.map