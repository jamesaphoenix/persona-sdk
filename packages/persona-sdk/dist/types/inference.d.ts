/**
 * Advanced type inference utilities
 */
import type { Distribution } from './distribution';
/**
 * Distribution map type
 */
export type DistributionMap = Record<string, Distribution<any> | any>;
/**
 * Infer attribute types from distribution map
 */
export type InferAttributes<T extends DistributionMap> = {
    [K in keyof T]: T[K] extends Distribution<infer U> ? U : T[K];
};
/**
 * Strict keys type
 */
export type StrictKeys<T> = keyof T extends never ? string : keyof T;
/**
 * Attribute value type inference
 */
export type AttributeValue<T> = T extends Distribution<infer U> ? U : T;
/**
 * Persona builder attribute constraints
 */
export type BuilderAttributes = {
    [key: string]: Distribution<any> | string | number | boolean | unknown;
};
/**
 * Builder state type
 */
export type BuilderState<T extends BuilderAttributes = {}> = {
    name?: string;
    attributes: T;
};
/**
 * Infer final persona type from builder state
 */
export type InferPersona<T extends BuilderState> = {
    id: string;
    name: T['name'] extends string ? T['name'] : string;
    attributes: InferAttributes<T['attributes']>;
    createdAt: Date;
    updatedAt: Date;
};
/**
 * Segment definition type
 */
export type SegmentDefinition<T extends DistributionMap = DistributionMap> = {
    name: string;
    weight: number;
    attributes: T;
};
/**
 * Group generation config type
 */
export type GroupGenerationConfig<T extends DistributionMap = DistributionMap> = {
    size: number;
    attributes?: T;
    segments?: Array<SegmentDefinition<T>>;
    correlations?: CorrelationConfig[];
    conditionals?: ConditionalConfig[];
};
/**
 * Correlation configuration
 */
export type CorrelationConfig = {
    attribute1: string;
    attribute2: string;
    correlation: number;
};
/**
 * Conditional configuration
 */
export type ConditionalConfig = {
    attribute: string;
    dependsOn: string | string[];
    transform: (dependencies: Record<string, any>) => any;
};
/**
 * Analysis result type
 */
export type AnalysisResult<T = unknown> = {
    id: string;
    timestamp: Date;
    data: T;
    metadata?: Record<string, unknown>;
};
/**
 * Structured output config
 */
export type StructuredOutputConfig<T> = {
    schema: T;
    prompt: string;
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
};
/**
 * Token usage tracking
 */
export type TokenUsage = {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
};
/**
 * AI operation result
 */
export type AIOperationResult<T> = {
    data: T;
    usage: TokenUsage;
    cost?: {
        input: number;
        output: number;
        total: number;
    };
};
//# sourceMappingURL=inference.d.ts.map