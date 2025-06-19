/**
 * Zod schemas for API validation
 */
import { z } from 'zod';
export declare const personaAttributesSchema: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
export declare const metadataSchema: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
export declare const createPersonaSchema: z.ZodObject<{
    name: z.ZodString;
    age: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occupation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sex: z.ZodOptional<z.ZodNullable<z.ZodEnum<["male", "female", "other"]>>>;
    attributes: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    metadata: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    attributes?: Record<string, any> | undefined;
    age?: number | null | undefined;
    occupation?: string | null | undefined;
    sex?: "male" | "female" | "other" | null | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    name: string;
    attributes?: Record<string, any> | undefined;
    age?: number | null | undefined;
    occupation?: string | null | undefined;
    sex?: "male" | "female" | "other" | null | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const updatePersonaSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    age: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    occupation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sex: z.ZodOptional<z.ZodNullable<z.ZodEnum<["male", "female", "other"]>>>;
    attributes: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    metadata: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    attributes?: Record<string, any> | undefined;
    age?: number | null | undefined;
    occupation?: string | null | undefined;
    sex?: "male" | "female" | "other" | null | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    name?: string | undefined;
    attributes?: Record<string, any> | undefined;
    age?: number | null | undefined;
    occupation?: string | null | undefined;
    sex?: "male" | "female" | "other" | null | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const personaQuerySchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    age: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, any, string>, z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        min?: number | undefined;
        max?: number | undefined;
    }, {
        min?: number | undefined;
        max?: number | undefined;
    }>]>, any, string | {
        min?: number | undefined;
        max?: number | undefined;
    }>>;
    occupation: z.ZodOptional<z.ZodString>;
    sex: z.ZodOptional<z.ZodString>;
    attributes: z.ZodEffects<z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>, Record<string, any> | undefined, unknown>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    orderBy: z.ZodDefault<z.ZodEnum<["name", "age", "created_at", "updated_at"]>>;
    orderDirection: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    orderBy: "name" | "age" | "created_at" | "updated_at";
    orderDirection: "asc" | "desc";
    name?: string | undefined;
    attributes?: Record<string, any> | undefined;
    age?: any;
    occupation?: string | undefined;
    sex?: string | undefined;
    id?: string | undefined;
}, {
    name?: string | undefined;
    attributes?: unknown;
    age?: string | {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    occupation?: string | undefined;
    sex?: string | undefined;
    id?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    orderBy?: "name" | "age" | "created_at" | "updated_at" | undefined;
    orderDirection?: "asc" | "desc" | undefined;
}>;
export declare const createPersonaGroupSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    metadata?: Record<string, any> | undefined;
    description?: string | undefined;
}, {
    name: string;
    metadata?: Record<string, any> | undefined;
    description?: string | undefined;
}>;
export declare const updatePersonaGroupSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    metadata?: Record<string, any> | undefined;
    description?: string | null | undefined;
}, {
    name?: string | undefined;
    metadata?: Record<string, any> | undefined;
    description?: string | null | undefined;
}>;
export declare const personaGroupQuerySchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    includeStats: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
    includeMembers: z.ZodEffects<z.ZodDefault<z.ZodBoolean>, boolean, unknown>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    includeStats: boolean;
    includeMembers: boolean;
    name?: string | undefined;
    id?: string | undefined;
}, {
    name?: string | undefined;
    id?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    includeStats?: unknown;
    includeMembers?: unknown;
}>;
export declare const bulkCreatePersonasSchema: z.ZodObject<{
    personas: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        age: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        occupation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sex: z.ZodOptional<z.ZodNullable<z.ZodEnum<["male", "female", "other"]>>>;
        attributes: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        metadata: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        attributes?: Record<string, any> | undefined;
        age?: number | null | undefined;
        occupation?: string | null | undefined;
        sex?: "male" | "female" | "other" | null | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        name: string;
        attributes?: Record<string, any> | undefined;
        age?: number | null | undefined;
        occupation?: string | null | undefined;
        sex?: "male" | "female" | "other" | null | undefined;
        metadata?: Record<string, any> | undefined;
    }>, "many">;
    groupId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    personas: {
        name: string;
        attributes?: Record<string, any> | undefined;
        age?: number | null | undefined;
        occupation?: string | null | undefined;
        sex?: "male" | "female" | "other" | null | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    groupId?: string | undefined;
}, {
    personas: {
        name: string;
        attributes?: Record<string, any> | undefined;
        age?: number | null | undefined;
        occupation?: string | null | undefined;
        sex?: "male" | "female" | "other" | null | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    groupId?: string | undefined;
}>;
export declare const generatePersonasSchema: z.ZodObject<{
    count: z.ZodNumber;
    distributionId: z.ZodOptional<z.ZodString>;
    groupId: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    count: number;
    attributes?: Record<string, any> | undefined;
    groupId?: string | undefined;
    distributionId?: string | undefined;
}, {
    count: number;
    attributes?: Record<string, any> | undefined;
    groupId?: string | undefined;
    distributionId?: string | undefined;
}>;
export declare const addToGroupSchema: z.ZodObject<{
    personaId: z.ZodString;
    groupId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    personaId: string;
    groupId: string;
}, {
    personaId: string;
    groupId: string;
}>;
export declare const removeFromGroupSchema: z.ZodObject<{
    personaId: z.ZodString;
    groupId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    personaId: string;
    groupId: string;
}, {
    personaId: string;
    groupId: string;
}>;
export declare const personaResponseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    age: z.ZodNullable<z.ZodNumber>;
    occupation: z.ZodNullable<z.ZodString>;
    sex: z.ZodNullable<z.ZodString>;
    attributes: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    attributes: Record<string, any>;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    metadata: Record<string, any>;
    id: string;
    created_at: Date;
    updated_at: Date;
}, {
    name: string;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
    attributes?: Record<string, any> | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const personaGroupResponseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    metadata: Record<string, any>;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
}, {
    name: string;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
    metadata?: Record<string, any> | undefined;
}>;
export declare const paginatedResponseSchema: <T extends z.ZodType>(itemSchema: T) => z.ZodObject<{
    data: z.ZodArray<T, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    data: T["_output"][];
    total: number;
    pageSize: number;
    page: number;
    hasMore: boolean;
}, {
    data: T["_input"][];
    total: number;
    pageSize: number;
    page: number;
    hasMore: boolean;
}>;
export declare const statsResponseSchema: z.ZodObject<{
    totalPersonas: z.ZodNumber;
    totalGroups: z.ZodNumber;
    avgGroupSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalPersonas: number;
    totalGroups: number;
    avgGroupSize: number;
}, {
    totalPersonas: number;
    totalGroups: number;
    avgGroupSize: number;
}>;
export declare const errorResponseSchema: z.ZodObject<{
    error: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    error: string;
    code?: string | undefined;
    details?: any;
}, {
    error: string;
    code?: string | undefined;
    details?: any;
}>;
export type CreatePersonaInput = z.infer<typeof createPersonaSchema>;
export type UpdatePersonaInput = z.infer<typeof updatePersonaSchema>;
export type PersonaQuery = z.infer<typeof personaQuerySchema>;
export type CreatePersonaGroupInput = z.infer<typeof createPersonaGroupSchema>;
export type UpdatePersonaGroupInput = z.infer<typeof updatePersonaGroupSchema>;
export type PersonaGroupQuery = z.infer<typeof personaGroupQuerySchema>;
export type BulkCreatePersonasInput = z.infer<typeof bulkCreatePersonasSchema>;
export type GeneratePersonasInput = z.infer<typeof generatePersonasSchema>;
export type PersonaResponse = z.infer<typeof personaResponseSchema>;
export type PersonaGroupResponse = z.infer<typeof personaGroupResponseSchema>;
export type StatsResponse = z.infer<typeof statsResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
//# sourceMappingURL=schemas.d.ts.map