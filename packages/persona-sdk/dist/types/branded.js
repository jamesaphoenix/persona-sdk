/**
 * Branded types for enhanced type safety
 */
/**
 * Type guards for branded types
 */
export const isPersonaId = (value) => {
    return typeof value === 'string' && value.length > 0;
};
export const isGroupId = (value) => {
    return typeof value === 'string' && value.length > 0;
};
/**
 * Branded type constructors
 */
export const createPersonaId = (id = crypto.randomUUID()) => {
    return id;
};
export const createGroupId = (id = crypto.randomUUID()) => {
    return id;
};
export const createDistributionId = (id = crypto.randomUUID()) => {
    return id;
};
export const createAnalysisId = (id = crypto.randomUUID()) => {
    return id;
};
/**
 * Helper to create successful result
 */
export const ok = (data) => ({
    success: true,
    data
});
/**
 * Helper to create error result
 */
export const err = (error) => ({
    success: false,
    error
});
//# sourceMappingURL=branded.js.map