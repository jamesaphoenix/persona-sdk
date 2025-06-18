/**
 * TypeScript API Client for Persona SDK
 */
import type { PersonaResponse, PersonaGroupResponse, CreatePersonaInput, UpdatePersonaInput, PersonaQuery, CreatePersonaGroupInput, UpdatePersonaGroupInput, PersonaGroupQuery, BulkCreatePersonasInput, StatsResponse } from './schemas.js';
export interface ApiClientConfig {
    baseUrl: string;
    headers?: Record<string, string>;
    fetch?: typeof fetch;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
export declare class PersonaApiClient {
    private baseUrl;
    private headers;
    private fetch;
    constructor(config: ApiClientConfig);
    get url(): string;
    private request;
    createPersona(data: CreatePersonaInput): Promise<PersonaResponse>;
    getPersona(id: string): Promise<PersonaResponse>;
    updatePersona(id: string, data: UpdatePersonaInput): Promise<PersonaResponse>;
    deletePersona(id: string): Promise<void>;
    queryPersonas(query?: PersonaQuery): Promise<PaginatedResponse<PersonaResponse>>;
    bulkCreatePersonas(data: BulkCreatePersonasInput): Promise<PersonaResponse[]>;
    createGroup(data: CreatePersonaGroupInput): Promise<PersonaGroupResponse>;
    getGroup(id: string): Promise<PersonaGroupResponse>;
    updateGroup(id: string, data: UpdatePersonaGroupInput): Promise<PersonaGroupResponse>;
    deleteGroup(id: string): Promise<void>;
    queryGroups(query?: PersonaGroupQuery): Promise<PaginatedResponse<PersonaGroupResponse>>;
    getGroupWithMembers(id: string): Promise<{
        group_id: string;
        group_name: string;
        group_description: string | null;
        personas: PersonaResponse[];
    }>;
    addPersonaToGroup(personaId: string, groupId: string): Promise<{
        success: boolean;
    }>;
    removePersonaFromGroup(personaId: string, groupId: string): Promise<{
        success: boolean;
    }>;
    getPersonaGroups(personaId: string): Promise<PersonaGroupResponse[]>;
    getStats(): Promise<StatsResponse>;
    health(): Promise<{
        status: string;
    }>;
}
//# sourceMappingURL=client.d.ts.map