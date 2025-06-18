/**
 * PostgreSQL Adapter Types
 */
export interface DatabaseConfig {
    connectionString?: string;
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    ssl?: boolean | {
        rejectUnauthorized: boolean;
    };
    poolSize?: number;
}
export interface PersonaRecord {
    id: string;
    name: string;
    age?: number | null;
    occupation?: string | null;
    sex?: string | null;
    attributes: Record<string, any>;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
export interface PersonaGroupRecord {
    id: string;
    name: string;
    description?: string | null;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
export interface PersonaGroupMemberRecord {
    id: string;
    persona_id: string;
    group_id: string;
    joined_at: Date;
}
export interface DistributionRecord {
    id: string;
    name: string;
    type: string;
    parameters: Record<string, any>;
    created_at: Date;
}
export interface GenerationHistoryRecord {
    id: string;
    group_id?: string | null;
    distribution_id?: string | null;
    count: number;
    parameters: Record<string, any>;
    created_at: Date;
}
export interface PersonaGroupStats {
    id: string;
    name: string;
    description?: string | null;
    member_count: number;
    avg_age?: number | null;
    created_at: Date;
    updated_at: Date;
}
export interface PersonaGroupWithMembers {
    group_id: string;
    group_name: string;
    group_description?: string | null;
    personas: PersonaRecord[];
}
export interface PersonaQuery {
    id?: string;
    name?: string;
    age?: {
        min?: number;
        max?: number;
    };
    occupation?: string;
    sex?: string;
    attributes?: Record<string, any>;
    limit?: number;
    offset?: number;
    orderBy?: keyof PersonaRecord;
    orderDirection?: 'asc' | 'desc';
}
export interface PersonaGroupQuery {
    id?: string;
    name?: string;
    limit?: number;
    offset?: number;
    includeStats?: boolean;
    includeMembers?: boolean;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
export interface CreatePersonaInput {
    name: string;
    age?: number;
    occupation?: string;
    sex?: string;
    attributes?: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface UpdatePersonaInput {
    name?: string;
    age?: number | null;
    occupation?: string | null;
    sex?: string | null;
    attributes?: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface CreatePersonaGroupInput {
    name: string;
    description?: string;
    metadata?: Record<string, any>;
}
export interface UpdatePersonaGroupInput {
    name?: string;
    description?: string | null;
    metadata?: Record<string, any>;
}
export interface BulkCreatePersonasInput {
    personas: CreatePersonaInput[];
    groupId?: string;
}
export interface GeneratePersonasInput {
    count: number;
    distributionId?: string;
    groupId?: string;
    attributes?: Record<string, any>;
}
//# sourceMappingURL=types.d.ts.map