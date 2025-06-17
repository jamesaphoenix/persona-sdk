import { z } from 'zod';
import { Distribution } from '../types';
/**
 * Tool for selecting distributions based on persona context
 */
export interface DistributionTool {
    name: string;
    description: string;
    parameters: z.ZodSchema;
    execute: (params: any) => Distribution | Promise<Distribution>;
}
/**
 * Schema for structured output generation
 */
export interface OutputSchema {
    name: string;
    description: string;
    schema: z.ZodSchema;
}
/**
 * Available distribution types for tool selection
 */
export declare enum DistributionType {
    Normal = "normal",
    Uniform = "uniform",
    Exponential = "exponential",
    Beta = "beta",
    Categorical = "categorical"
}
/**
 * Parameters for distribution selection
 */
export interface DistributionSelectionParams {
    attribute: string;
    context: string;
    constraints?: {
        min?: number;
        max?: number;
        discrete?: boolean;
    };
}
//# sourceMappingURL=types.d.ts.map