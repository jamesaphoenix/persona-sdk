/**
 * Branded types for enhanced type safety
 */

/**
 * Brand type helper
 */
type Brand<K, T> = K & { readonly __brand: T };

/**
 * Branded ID types for entities
 */
export type PersonaId = Brand<string, 'PersonaId'>;
export type GroupId = Brand<string, 'GroupId'>;
export type DistributionId = Brand<string, 'DistributionId'>;
export type AnalysisId = Brand<string, 'AnalysisId'>;

/**
 * Type guards for branded types
 */
export const isPersonaId = (value: unknown): value is PersonaId => {
  return typeof value === 'string' && value.length > 0;
};

export const isGroupId = (value: unknown): value is GroupId => {
  return typeof value === 'string' && value.length > 0;
};

/**
 * Branded type constructors
 */
export const createPersonaId = (id: string = crypto.randomUUID()): PersonaId => {
  return id as PersonaId;
};

export const createGroupId = (id: string = crypto.randomUUID()): GroupId => {
  return id as GroupId;
};

export const createDistributionId = (id: string = crypto.randomUUID()): DistributionId => {
  return id as DistributionId;
};

export const createAnalysisId = (id: string = crypto.randomUUID()): AnalysisId => {
  return id as AnalysisId;
};

/**
 * Utility type for exact object matching
 */
export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

/**
 * Deep partial type with proper handling
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = T extends object ? {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
} : T;

/**
 * Query key type for caching (TanStack style)
 */
export type QueryKey = readonly [scope: string, ...args: unknown[]];

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper to create successful result
 */
export const ok = <T>(data: T): Result<T> => ({
  success: true,
  data
});

/**
 * Helper to create error result
 */
export const err = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error
});