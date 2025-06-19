/**
 * Zod schemas for runtime validation
 */

import { z } from 'zod';

/**
 * Base persona schema
 */
export const PersonaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  attributes: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date()
}).brand('Persona');

export type ValidatedPersona = z.infer<typeof PersonaSchema>;

/**
 * Persona group schema
 */
export const PersonaGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  personas: z.array(PersonaSchema),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
}).brand('PersonaGroup');

export type ValidatedPersonaGroup = z.infer<typeof PersonaGroupSchema>;

/**
 * Distribution schemas
 */
export const NormalDistributionSchema = z.object({
  type: z.literal('normal'),
  mean: z.number(),
  stdDev: z.number().positive(),
  seed: z.number().optional()
});

export const UniformDistributionSchema = z.object({
  type: z.literal('uniform'),
  min: z.number(),
  max: z.number(),
  seed: z.number().optional()
}).refine(data => data.min < data.max, {
  message: 'Min must be less than max'
});

export const ExponentialDistributionSchema = z.object({
  type: z.literal('exponential'),
  lambda: z.number().positive(),
  seed: z.number().optional()
});

export const BetaDistributionSchema = z.object({
  type: z.literal('beta'),
  alpha: z.number().positive(),
  beta: z.number().positive(),
  seed: z.number().optional()
});

export const CategoricalDistributionSchema = z.object({
  type: z.literal('categorical'),
  categories: z.array(z.object({
    value: z.unknown(),
    probability: z.number().min(0).max(1)
  })),
  seed: z.number().optional()
}).refine(data => {
  const sum = data.categories.reduce((acc, cat) => acc + cat.probability, 0);
  return Math.abs(sum - 1) < 0.001;
}, {
  message: 'Probabilities must sum to 1'
});

/**
 * Union of all distribution schemas
 */
export const DistributionSchema = z.union([
  NormalDistributionSchema,
  UniformDistributionSchema,
  ExponentialDistributionSchema,
  BetaDistributionSchema,
  CategoricalDistributionSchema
]);

export type ValidatedDistribution = z.infer<typeof DistributionSchema>;

/**
 * Correlation config schema
 */
export const CorrelationConfigSchema = z.object({
  attribute1: z.string(),
  attribute2: z.string(),
  correlation: z.number().min(-1).max(1)
});

export type ValidatedCorrelationConfig = z.infer<typeof CorrelationConfigSchema>;

/**
 * Conditional config schema
 */
export const ConditionalConfigSchema = z.object({
  attribute: z.string(),
  dependsOn: z.union([z.string(), z.array(z.string())]),
  transform: z.function().args(z.record(z.unknown())).returns(z.unknown())
});

export type ValidatedConditionalConfig = z.infer<typeof ConditionalConfigSchema>;

/**
 * Group generation config schema
 */
export const GroupGenerationConfigSchema = z.object({
  size: z.number().positive().int(),
  attributes: z.record(z.unknown()).optional(),
  segments: z.array(z.object({
    name: z.string(),
    weight: z.number().positive(),
    attributes: z.record(z.unknown())
  })).optional(),
  correlations: z.array(CorrelationConfigSchema).optional(),
  conditionals: z.array(ConditionalConfigSchema).optional()
});

export type ValidatedGroupGenerationConfig = z.infer<typeof GroupGenerationConfigSchema>;

/**
 * Media analysis request schema
 */
export const MediaAnalysisRequestSchema = z.object({
  mediaType: z.enum(['text', 'image', 'video', 'audio']),
  content: z.string(),
  analysisType: z.enum(['ctr', 'engagement', 'sentiment', 'demographics']),
  options: z.record(z.unknown()).optional()
});

export type ValidatedMediaAnalysisRequest = z.infer<typeof MediaAnalysisRequestSchema>;

/**
 * Survey response schema
 */
export const SurveyResponseSchema = z.object({
  personaId: z.string().uuid(),
  surveyId: z.string().uuid(),
  responses: z.array(z.object({
    questionId: z.string(),
    answer: z.unknown(),
    timestamp: z.date()
  })),
  metadata: z.record(z.unknown()).optional()
});

export type ValidatedSurveyResponse = z.infer<typeof SurveyResponseSchema>;

/**
 * Validation helpers
 */
export const validatePersona = (data: unknown): ValidatedPersona => {
  return PersonaSchema.parse(data);
};

export const validatePersonaGroup = (data: unknown): ValidatedPersonaGroup => {
  return PersonaGroupSchema.parse(data);
};

export const validateDistribution = (data: unknown): ValidatedDistribution => {
  return DistributionSchema.parse(data);
};

/**
 * Safe parsing helpers
 */
export const safeParsePersona = (data: unknown) => {
  return PersonaSchema.safeParse(data);
};

export const safeParsePersonaGroup = (data: unknown) => {
  return PersonaGroupSchema.safeParse(data);
};

export const safeParseDistribution = (data: unknown) => {
  return DistributionSchema.safeParse(data);
};