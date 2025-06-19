/**
 * Branded types for enhanced type safety
 */
/**
 * Brand type helper
 */
type Brand<K, T> = K & {
    readonly __brand: T;
};
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
export declare const isPersonaId: (value: unknown) => value is PersonaId;
export declare const isGroupId: (value: unknown) => value is GroupId;
/**
 * Branded type constructors
 */
export declare const createPersonaId: (id?: string) => PersonaId;
export declare const createGroupId: (id?: string) => GroupId;
export declare const createDistributionId: (id?: string) => DistributionId;
export declare const createAnalysisId: (id?: string) => AnalysisId;
/**
 * Utility type for exact object matching
 */
export type Exact<T, Shape> = T extends Shape ? Exclude<keyof T, keyof Shape> extends never ? T : never : never;
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
export type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
/**
 * Helper to create successful result
 */
export declare const ok: <T>(data: T) => Result<T>;
/**
 * Helper to create error result
 */
export declare const err: <E = Error>(error: E) => Result<never, E>;
export {};
//# sourceMappingURL=branded.d.ts.map