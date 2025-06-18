/**
 * PostgreSQL Database Adapter
 * ORM-agnostic adapter that works with any PostgreSQL client
 */
import type { PersonaRecord, PersonaGroupRecord, PersonaQuery, PersonaGroupQuery, CreatePersonaInput, UpdatePersonaInput, CreatePersonaGroupInput, UpdatePersonaGroupInput, PaginatedResult, PersonaGroupStats, PersonaGroupWithMembers, BulkCreatePersonasInput } from './types.js';
export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
}
export interface DatabaseClient {
    query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>>;
    transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
}
export declare class PostgresAdapter {
    private client;
    constructor(client: DatabaseClient);
    createPersona(input: CreatePersonaInput): Promise<PersonaRecord>;
    getPersona(id: string): Promise<PersonaRecord | null>;
    updatePersona(id: string, input: UpdatePersonaInput): Promise<PersonaRecord | null>;
    deletePersona(id: string): Promise<boolean>;
    queryPersonas(query?: PersonaQuery): Promise<PaginatedResult<PersonaRecord>>;
    bulkCreatePersonas(input: BulkCreatePersonasInput): Promise<PersonaRecord[]>;
    createPersonaGroup(input: CreatePersonaGroupInput): Promise<PersonaGroupRecord>;
    getPersonaGroup(id: string): Promise<PersonaGroupRecord | null>;
    updatePersonaGroup(id: string, input: UpdatePersonaGroupInput): Promise<PersonaGroupRecord | null>;
    deletePersonaGroup(id: string): Promise<boolean>;
    queryPersonaGroups(query?: PersonaGroupQuery): Promise<PaginatedResult<PersonaGroupRecord | PersonaGroupStats>>;
    getPersonaGroupWithMembers(groupId: string): Promise<PersonaGroupWithMembers | null>;
    addPersonaToGroup(personaId: string, groupId: string): Promise<boolean>;
    removePersonaFromGroup(personaId: string, groupId: string): Promise<boolean>;
    getPersonaGroups(personaId: string): Promise<PersonaGroupRecord[]>;
    getGroupMembers(groupId: string): Promise<PersonaRecord[]>;
    clearAllData(): Promise<void>;
    getStats(): Promise<{
        totalPersonas: number;
        totalGroups: number;
        avgGroupSize: number;
    }>;
}
//# sourceMappingURL=adapter.d.ts.map