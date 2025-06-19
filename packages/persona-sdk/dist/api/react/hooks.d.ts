/**
 * React Hooks for Persona SDK API
 */
import { type ReactNode } from 'react';
import { PersonaApiClient } from '../client.js';
import type { PersonaResponse, PersonaGroupResponse, PersonaQuery, PersonaGroupQuery, StatsResponse } from '../schemas.js';
import type { PaginatedResponse } from '../client.js';
export interface UseApiConfig {
    baseUrl: string;
    headers?: Record<string, string>;
}
export interface QueryState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
export interface MutationState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    mutate: (...args: any[]) => Promise<T | null>;
    reset: () => void;
}
export interface PaginatedQueryState<T> extends QueryState<PaginatedResponse<T>> {
    loadMore: () => Promise<void>;
    hasMore: boolean;
    reset: () => void;
}
export declare function useApiClient(config: UseApiConfig): PersonaApiClient;
export declare function usePersona(id: string, config: UseApiConfig): QueryState<PersonaResponse>;
export declare function usePersonas(query: PersonaQuery | undefined, config: UseApiConfig): PaginatedQueryState<PersonaResponse>;
export declare function useCreatePersona(config: UseApiConfig): MutationState<{
    name: string;
    attributes: Record<string, any>;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    metadata: Record<string, any>;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare function useUpdatePersona(config: UseApiConfig): MutationState<{
    name: string;
    attributes: Record<string, any>;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    metadata: Record<string, any>;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare function useDeletePersona(config: UseApiConfig): MutationState<void>;
export declare function useBulkCreatePersonas(config: UseApiConfig): MutationState<{
    name: string;
    attributes: Record<string, any>;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    metadata: Record<string, any>;
    id: string;
    created_at: Date;
    updated_at: Date;
}[]>;
export declare function usePersonaGroup(id: string, config: UseApiConfig): QueryState<PersonaGroupResponse>;
export declare function usePersonaGroups(query: PersonaGroupQuery | undefined, config: UseApiConfig): PaginatedQueryState<PersonaGroupResponse>;
export declare function usePersonaGroupWithMembers(id: string, config: UseApiConfig): QueryState<{
    group_id: string;
    group_name: string;
    group_description: string | null;
    personas: PersonaResponse[];
}>;
export declare function useCreatePersonaGroup(config: UseApiConfig): MutationState<{
    name: string;
    metadata: Record<string, any>;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare function useUpdatePersonaGroup(config: UseApiConfig): MutationState<{
    name: string;
    metadata: Record<string, any>;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare function useDeletePersonaGroup(config: UseApiConfig): MutationState<void>;
export declare function useAddToGroup(config: UseApiConfig): MutationState<{
    success: boolean;
}>;
export declare function useRemoveFromGroup(config: UseApiConfig): MutationState<{
    success: boolean;
}>;
export declare function usePersonaGroupMemberships(personaId: string, config: UseApiConfig): QueryState<{
    name: string;
    metadata: Record<string, any>;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
}[]>;
export declare function useStats(config: UseApiConfig): QueryState<StatsResponse>;
export interface PersonaApiProviderProps {
    config: UseApiConfig;
    children: ReactNode;
}
export declare function PersonaApiProvider({ config, children }: PersonaApiProviderProps): import("react/jsx-runtime.js").JSX.Element;
export declare const usePersonaWithContext: (id: string) => QueryState<{
    name: string;
    attributes: Record<string, any>;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    metadata: Record<string, any>;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare const usePersonasWithContext: (query?: PersonaQuery) => PaginatedQueryState<{
    name: string;
    attributes: Record<string, any>;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    metadata: Record<string, any>;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare const useCreatePersonaWithContext: () => MutationState<{
    name: string;
    attributes: Record<string, any>;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    metadata: Record<string, any>;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare const useUpdatePersonaWithContext: () => MutationState<{
    name: string;
    attributes: Record<string, any>;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    metadata: Record<string, any>;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare const useDeletePersonaWithContext: () => MutationState<void>;
export declare const useBulkCreatePersonasWithContext: () => MutationState<{
    name: string;
    attributes: Record<string, any>;
    age: number | null;
    occupation: string | null;
    sex: string | null;
    metadata: Record<string, any>;
    id: string;
    created_at: Date;
    updated_at: Date;
}[]>;
export declare const usePersonaGroupWithContext: (id: string) => QueryState<{
    name: string;
    metadata: Record<string, any>;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare const usePersonaGroupsWithContext: (query?: PersonaGroupQuery) => PaginatedQueryState<{
    name: string;
    metadata: Record<string, any>;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare const usePersonaGroupWithMembersWithContext: (id: string) => QueryState<{
    group_id: string;
    group_name: string;
    group_description: string | null;
    personas: PersonaResponse[];
}>;
export declare const useCreatePersonaGroupWithContext: () => MutationState<{
    name: string;
    metadata: Record<string, any>;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare const useUpdatePersonaGroupWithContext: () => MutationState<{
    name: string;
    metadata: Record<string, any>;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
}>;
export declare const useDeletePersonaGroupWithContext: () => MutationState<void>;
export declare const useAddToGroupWithContext: () => MutationState<{
    success: boolean;
}>;
export declare const useRemoveFromGroupWithContext: () => MutationState<{
    success: boolean;
}>;
export declare const usePersonaGroupMembershipsWithContext: (personaId: string) => QueryState<{
    name: string;
    metadata: Record<string, any>;
    description: string | null;
    id: string;
    created_at: Date;
    updated_at: Date;
}[]>;
export declare const useStatsWithContext: () => QueryState<{
    totalPersonas: number;
    totalGroups: number;
    avgGroupSize: number;
}>;
//# sourceMappingURL=hooks.d.ts.map