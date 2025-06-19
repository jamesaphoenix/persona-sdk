/**
 * Zod schemas for runtime validation
 */
import { z } from 'zod';
/**
 * Base persona schema
 */
export declare const PersonaSchema: z.ZodBranded<z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    attributes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    attributes: Record<string, unknown>;
    id: string;
    createdAt: Date;
    updatedAt: Date;
}, {
    name: string;
    attributes: Record<string, unknown>;
    id: string;
    createdAt: Date;
    updatedAt: Date;
}>, "Persona">;
export type ValidatedPersona = z.infer<typeof PersonaSchema>;
/**
 * Persona group schema
 */
export declare const PersonaGroupSchema: z.ZodBranded<z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    personas: z.ZodArray<z.ZodBranded<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        attributes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        name: string;
        attributes: Record<string, unknown>;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, {
        name: string;
        attributes: Record<string, unknown>;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>, "Persona">, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    personas: ({
        name: string;
        attributes: Record<string, unknown>;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } & z.BRAND<"Persona">)[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, unknown> | undefined;
}, {
    name: string;
    id: string;
    personas: {
        name: string;
        attributes: Record<string, unknown>;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, unknown> | undefined;
}>, "PersonaGroup">;
export type ValidatedPersonaGroup = z.infer<typeof PersonaGroupSchema>;
/**
 * Distribution schemas
 */
export declare const NormalDistributionSchema: z.ZodObject<{
    type: z.ZodLiteral<"normal">;
    mean: z.ZodNumber;
    stdDev: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "normal";
    mean: number;
    stdDev: number;
    seed?: number | undefined;
}, {
    type: "normal";
    mean: number;
    stdDev: number;
    seed?: number | undefined;
}>;
export declare const UniformDistributionSchema: z.ZodEffects<z.ZodObject<{
    type: z.ZodLiteral<"uniform">;
    min: z.ZodNumber;
    max: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
}, {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
}>, {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
}, {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
}>;
export declare const ExponentialDistributionSchema: z.ZodObject<{
    type: z.ZodLiteral<"exponential">;
    lambda: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "exponential";
    lambda: number;
    seed?: number | undefined;
}, {
    type: "exponential";
    lambda: number;
    seed?: number | undefined;
}>;
export declare const BetaDistributionSchema: z.ZodObject<{
    type: z.ZodLiteral<"beta">;
    alpha: z.ZodNumber;
    beta: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    beta: number;
    type: "beta";
    alpha: number;
    seed?: number | undefined;
}, {
    beta: number;
    type: "beta";
    alpha: number;
    seed?: number | undefined;
}>;
export declare const CategoricalDistributionSchema: z.ZodEffects<z.ZodObject<{
    type: z.ZodLiteral<"categorical">;
    categories: z.ZodArray<z.ZodObject<{
        value: z.ZodUnknown;
        probability: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        probability: number;
        value?: unknown;
    }, {
        probability: number;
        value?: unknown;
    }>, "many">;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}, {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}>, {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}, {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}>;
/**
 * Union of all distribution schemas
 */
export declare const DistributionSchema: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"normal">;
    mean: z.ZodNumber;
    stdDev: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "normal";
    mean: number;
    stdDev: number;
    seed?: number | undefined;
}, {
    type: "normal";
    mean: number;
    stdDev: number;
    seed?: number | undefined;
}>, z.ZodEffects<z.ZodObject<{
    type: z.ZodLiteral<"uniform">;
    min: z.ZodNumber;
    max: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
}, {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
}>, {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
}, {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"exponential">;
    lambda: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "exponential";
    lambda: number;
    seed?: number | undefined;
}, {
    type: "exponential";
    lambda: number;
    seed?: number | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"beta">;
    alpha: z.ZodNumber;
    beta: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    beta: number;
    type: "beta";
    alpha: number;
    seed?: number | undefined;
}, {
    beta: number;
    type: "beta";
    alpha: number;
    seed?: number | undefined;
}>, z.ZodEffects<z.ZodObject<{
    type: z.ZodLiteral<"categorical">;
    categories: z.ZodArray<z.ZodObject<{
        value: z.ZodUnknown;
        probability: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        probability: number;
        value?: unknown;
    }, {
        probability: number;
        value?: unknown;
    }>, "many">;
    seed: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}, {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}>, {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}, {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}>]>;
export type ValidatedDistribution = z.infer<typeof DistributionSchema>;
/**
 * Correlation config schema
 */
export declare const CorrelationConfigSchema: z.ZodObject<{
    attribute1: z.ZodString;
    attribute2: z.ZodString;
    correlation: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    attribute1: string;
    attribute2: string;
    correlation: number;
}, {
    attribute1: string;
    attribute2: string;
    correlation: number;
}>;
export type ValidatedCorrelationConfig = z.infer<typeof CorrelationConfigSchema>;
/**
 * Conditional config schema
 */
export declare const ConditionalConfigSchema: z.ZodObject<{
    attribute: z.ZodString;
    dependsOn: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    transform: z.ZodFunction<z.ZodTuple<[z.ZodRecord<z.ZodString, z.ZodUnknown>], z.ZodUnknown>, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    attribute: string;
    dependsOn: string | string[];
    transform: (args_0: Record<string, unknown>, ...args: unknown[]) => unknown;
}, {
    attribute: string;
    dependsOn: string | string[];
    transform: (args_0: Record<string, unknown>, ...args: unknown[]) => unknown;
}>;
export type ValidatedConditionalConfig = z.infer<typeof ConditionalConfigSchema>;
/**
 * Group generation config schema
 */
export declare const GroupGenerationConfigSchema: z.ZodObject<{
    size: z.ZodNumber;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    segments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        weight: z.ZodNumber;
        attributes: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        attributes: Record<string, unknown>;
        weight: number;
    }, {
        name: string;
        attributes: Record<string, unknown>;
        weight: number;
    }>, "many">>;
    correlations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        attribute1: z.ZodString;
        attribute2: z.ZodString;
        correlation: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        attribute1: string;
        attribute2: string;
        correlation: number;
    }, {
        attribute1: string;
        attribute2: string;
        correlation: number;
    }>, "many">>;
    conditionals: z.ZodOptional<z.ZodArray<z.ZodObject<{
        attribute: z.ZodString;
        dependsOn: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
        transform: z.ZodFunction<z.ZodTuple<[z.ZodRecord<z.ZodString, z.ZodUnknown>], z.ZodUnknown>, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        attribute: string;
        dependsOn: string | string[];
        transform: (args_0: Record<string, unknown>, ...args: unknown[]) => unknown;
    }, {
        attribute: string;
        dependsOn: string | string[];
        transform: (args_0: Record<string, unknown>, ...args: unknown[]) => unknown;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    size: number;
    attributes?: Record<string, unknown> | undefined;
    segments?: {
        name: string;
        attributes: Record<string, unknown>;
        weight: number;
    }[] | undefined;
    correlations?: {
        attribute1: string;
        attribute2: string;
        correlation: number;
    }[] | undefined;
    conditionals?: {
        attribute: string;
        dependsOn: string | string[];
        transform: (args_0: Record<string, unknown>, ...args: unknown[]) => unknown;
    }[] | undefined;
}, {
    size: number;
    attributes?: Record<string, unknown> | undefined;
    segments?: {
        name: string;
        attributes: Record<string, unknown>;
        weight: number;
    }[] | undefined;
    correlations?: {
        attribute1: string;
        attribute2: string;
        correlation: number;
    }[] | undefined;
    conditionals?: {
        attribute: string;
        dependsOn: string | string[];
        transform: (args_0: Record<string, unknown>, ...args: unknown[]) => unknown;
    }[] | undefined;
}>;
export type ValidatedGroupGenerationConfig = z.infer<typeof GroupGenerationConfigSchema>;
/**
 * Media analysis request schema
 */
export declare const MediaAnalysisRequestSchema: z.ZodObject<{
    mediaType: z.ZodEnum<["text", "image", "video", "audio"]>;
    content: z.ZodString;
    analysisType: z.ZodEnum<["ctr", "engagement", "sentiment", "demographics"]>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    mediaType: "audio" | "text" | "image" | "video";
    analysisType: "demographics" | "ctr" | "engagement" | "sentiment";
    options?: Record<string, unknown> | undefined;
}, {
    content: string;
    mediaType: "audio" | "text" | "image" | "video";
    analysisType: "demographics" | "ctr" | "engagement" | "sentiment";
    options?: Record<string, unknown> | undefined;
}>;
export type ValidatedMediaAnalysisRequest = z.infer<typeof MediaAnalysisRequestSchema>;
/**
 * Survey response schema
 */
export declare const SurveyResponseSchema: z.ZodObject<{
    personaId: z.ZodString;
    surveyId: z.ZodString;
    responses: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        answer: z.ZodUnknown;
        timestamp: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        timestamp: Date;
        questionId: string;
        answer?: unknown;
    }, {
        timestamp: Date;
        questionId: string;
        answer?: unknown;
    }>, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    personaId: string;
    surveyId: string;
    responses: {
        timestamp: Date;
        questionId: string;
        answer?: unknown;
    }[];
    metadata?: Record<string, unknown> | undefined;
}, {
    personaId: string;
    surveyId: string;
    responses: {
        timestamp: Date;
        questionId: string;
        answer?: unknown;
    }[];
    metadata?: Record<string, unknown> | undefined;
}>;
export type ValidatedSurveyResponse = z.infer<typeof SurveyResponseSchema>;
/**
 * Validation helpers
 */
export declare const validatePersona: (data: unknown) => ValidatedPersona;
export declare const validatePersonaGroup: (data: unknown) => ValidatedPersonaGroup;
export declare const validateDistribution: (data: unknown) => ValidatedDistribution;
/**
 * Safe parsing helpers
 */
export declare const safeParsePersona: (data: unknown) => z.SafeParseReturnType<{
    name: string;
    attributes: Record<string, unknown>;
    id: string;
    createdAt: Date;
    updatedAt: Date;
}, {
    name: string;
    attributes: Record<string, unknown>;
    id: string;
    createdAt: Date;
    updatedAt: Date;
} & z.BRAND<"Persona">>;
export declare const safeParsePersonaGroup: (data: unknown) => z.SafeParseReturnType<{
    name: string;
    id: string;
    personas: {
        name: string;
        attributes: Record<string, unknown>;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, unknown> | undefined;
}, {
    name: string;
    id: string;
    personas: ({
        name: string;
        attributes: Record<string, unknown>;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } & z.BRAND<"Persona">)[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, unknown> | undefined;
} & z.BRAND<"PersonaGroup">>;
export declare const safeParseDistribution: (data: unknown) => z.SafeParseReturnType<{
    type: "normal";
    mean: number;
    stdDev: number;
    seed?: number | undefined;
} | {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
} | {
    type: "exponential";
    lambda: number;
    seed?: number | undefined;
} | {
    beta: number;
    type: "beta";
    alpha: number;
    seed?: number | undefined;
} | {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}, {
    type: "normal";
    mean: number;
    stdDev: number;
    seed?: number | undefined;
} | {
    type: "uniform";
    min: number;
    max: number;
    seed?: number | undefined;
} | {
    type: "exponential";
    lambda: number;
    seed?: number | undefined;
} | {
    beta: number;
    type: "beta";
    alpha: number;
    seed?: number | undefined;
} | {
    type: "categorical";
    categories: {
        probability: number;
        value?: unknown;
    }[];
    seed?: number | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map