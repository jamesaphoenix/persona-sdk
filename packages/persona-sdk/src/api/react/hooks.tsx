/**
 * React Hooks for Persona SDK API
 */

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { PersonaApiClient } from '../client.js';
import type {
  PersonaResponse,
  PersonaGroupResponse,
  CreatePersonaInput,
  UpdatePersonaInput,
  PersonaQuery,
  CreatePersonaGroupInput,
  UpdatePersonaGroupInput,
  PersonaGroupQuery,
  StatsResponse,
} from '../schemas.js';
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

// Create API client instance
let apiClient: PersonaApiClient | null = null;

export function useApiClient(config: UseApiConfig): PersonaApiClient {
  if (!apiClient || apiClient.url !== config.baseUrl) {
    apiClient = new PersonaApiClient(config);
  }
  return apiClient;
}

// ============ Base Hooks ============

function useQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = []
): QueryState<T> {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await queryFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

function useMutation<TArgs extends any[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>
): MutationState<TResult> {
  const [state, setState] = useState<{
    data: TResult | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await mutationFn(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      return null;
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// ============ Persona Hooks ============

export function usePersona(id: string, config: UseApiConfig): QueryState<PersonaResponse> {
  const client = useApiClient(config);
  return useQuery(() => client.getPersona(id), [id]);
}

export function usePersonas(
  query: PersonaQuery | undefined = {
    limit: 20,
    offset: 0,
    orderBy: 'created_at',
    orderDirection: 'desc'
  },
  config: UseApiConfig
): PaginatedQueryState<PersonaResponse> {
  const client = useApiClient(config);
  const [allData, setAllData] = useState<PersonaResponse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.queryPersonas({
        ...query,
        offset: (pageNum - 1) * (query.limit || 20),
      });
      
      if (reset) {
        setAllData(result.data);
      } else {
        setAllData(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [client, query]);

  useEffect(() => {
    fetchData(1, true);
  }, [JSON.stringify(query)]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchData(page + 1);
    }
  }, [loading, hasMore, page, fetchData]);

  const reset = useCallback(() => {
    setAllData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1, true);
  }, [fetchData]);

  return {
    data: {
      data: allData,
      total: allData.length,
      page,
      pageSize: query.limit || 20,
      hasMore,
    },
    loading,
    error,
    refetch: () => fetchData(1, true),
    loadMore,
    hasMore,
    reset,
  };
}

export function useCreatePersona(config: UseApiConfig) {
  const client = useApiClient(config);
  return useMutation((data: CreatePersonaInput) => client.createPersona(data));
}

export function useUpdatePersona(config: UseApiConfig) {
  const client = useApiClient(config);
  return useMutation((args: { id: string; data: UpdatePersonaInput }) =>
    client.updatePersona(args.id, args.data)
  );
}

export function useDeletePersona(config: UseApiConfig) {
  const client = useApiClient(config);
  return useMutation((id: string) => client.deletePersona(id));
}

export function useBulkCreatePersonas(config: UseApiConfig) {
  const client = useApiClient(config);
  return useMutation((data: { personas: CreatePersonaInput[]; groupId?: string }) =>
    client.bulkCreatePersonas(data)
  );
}

// ============ Persona Group Hooks ============

export function usePersonaGroup(id: string, config: UseApiConfig): QueryState<PersonaGroupResponse> {
  const client = useApiClient(config);
  return useQuery(() => client.getGroup(id), [id]);
}

export function usePersonaGroups(
  query: PersonaGroupQuery | undefined = {
    limit: 20,
    offset: 0,
    includeStats: false,
    includeMembers: false
  },
  config: UseApiConfig
): PaginatedQueryState<PersonaGroupResponse> {
  const client = useApiClient(config);
  const [allData, setAllData] = useState<PersonaGroupResponse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.queryGroups({
        ...query,
        offset: (pageNum - 1) * (query.limit || 20),
      });
      
      if (reset) {
        setAllData(result.data);
      } else {
        setAllData(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [client, query]);

  useEffect(() => {
    fetchData(1, true);
  }, [JSON.stringify(query)]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchData(page + 1);
    }
  }, [loading, hasMore, page, fetchData]);

  const reset = useCallback(() => {
    setAllData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1, true);
  }, [fetchData]);

  return {
    data: {
      data: allData,
      total: allData.length,
      page,
      pageSize: query.limit || 20,
      hasMore,
    },
    loading,
    error,
    refetch: () => fetchData(1, true),
    loadMore,
    hasMore,
    reset,
  };
}

export function usePersonaGroupWithMembers(id: string, config: UseApiConfig) {
  const client = useApiClient(config);
  return useQuery(() => client.getGroupWithMembers(id), [id]);
}

export function useCreatePersonaGroup(config: UseApiConfig) {
  const client = useApiClient(config);
  return useMutation((data: CreatePersonaGroupInput) => client.createGroup(data));
}

export function useUpdatePersonaGroup(config: UseApiConfig) {
  const client = useApiClient(config);
  return useMutation((args: { id: string; data: UpdatePersonaGroupInput }) =>
    client.updateGroup(args.id, args.data)
  );
}

export function useDeletePersonaGroup(config: UseApiConfig) {
  const client = useApiClient(config);
  return useMutation((id: string) => client.deleteGroup(id));
}

// ============ Group Membership Hooks ============

export function useAddToGroup(config: UseApiConfig) {
  const client = useApiClient(config);
  return useMutation((args: { personaId: string; groupId: string }) =>
    client.addPersonaToGroup(args.personaId, args.groupId)
  );
}

export function useRemoveFromGroup(config: UseApiConfig) {
  const client = useApiClient(config);
  return useMutation((args: { personaId: string; groupId: string }) =>
    client.removePersonaFromGroup(args.personaId, args.groupId)
  );
}

export function usePersonaGroupMemberships(personaId: string, config: UseApiConfig) {
  const client = useApiClient(config);
  return useQuery(() => client.getPersonaGroups(personaId), [personaId]);
}

// ============ Stats Hook ============

export function useStats(config: UseApiConfig): QueryState<StatsResponse> {
  const client = useApiClient(config);
  return useQuery(() => client.getStats(), []);
}

// ============ Context Provider ============

const ApiConfigContext = createContext<UseApiConfig | null>(null);

export interface PersonaApiProviderProps {
  config: UseApiConfig;
  children: ReactNode;
}

export function PersonaApiProvider({ config, children }: PersonaApiProviderProps) {
  return (
    <ApiConfigContext.Provider value={config}>
      {children}
    </ApiConfigContext.Provider>
  );
}

function useApiConfig(): UseApiConfig {
  const config = useContext(ApiConfigContext);
  if (!config) {
    throw new Error('useApiConfig must be used within PersonaApiProvider');
  }
  return config;
}

// Convenience hooks that use context
export const usePersonaWithContext = (id: string) => usePersona(id, useApiConfig());
export const usePersonasWithContext = (query?: PersonaQuery) => usePersonas(query, useApiConfig());
export const useCreatePersonaWithContext = () => useCreatePersona(useApiConfig());
export const useUpdatePersonaWithContext = () => useUpdatePersona(useApiConfig());
export const useDeletePersonaWithContext = () => useDeletePersona(useApiConfig());
export const useBulkCreatePersonasWithContext = () => useBulkCreatePersonas(useApiConfig());
export const usePersonaGroupWithContext = (id: string) => usePersonaGroup(id, useApiConfig());
export const usePersonaGroupsWithContext = (query?: PersonaGroupQuery) => usePersonaGroups(query, useApiConfig());
export const usePersonaGroupWithMembersWithContext = (id: string) => usePersonaGroupWithMembers(id, useApiConfig());
export const useCreatePersonaGroupWithContext = () => useCreatePersonaGroup(useApiConfig());
export const useUpdatePersonaGroupWithContext = () => useUpdatePersonaGroup(useApiConfig());
export const useDeletePersonaGroupWithContext = () => useDeletePersonaGroup(useApiConfig());
export const useAddToGroupWithContext = () => useAddToGroup(useApiConfig());
export const useRemoveFromGroupWithContext = () => useRemoveFromGroup(useApiConfig());
export const usePersonaGroupMembershipsWithContext = (personaId: string) => usePersonaGroupMemberships(personaId, useApiConfig());
export const useStatsWithContext = () => useStats(useApiConfig());