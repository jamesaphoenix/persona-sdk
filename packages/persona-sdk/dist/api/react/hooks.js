import { jsx as _jsx } from "react/jsx-runtime";
/**
 * React Hooks for Persona SDK API
 */
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { PersonaApiClient } from '../client.js';
// Create API client instance
let apiClient = null;
export function useApiClient(config) {
    if (!apiClient || apiClient.url !== config.baseUrl) {
        apiClient = new PersonaApiClient(config);
    }
    return apiClient;
}
// ============ Base Hooks ============
function useQuery(queryFn, deps = []) {
    const [state, setState] = useState({
        data: null,
        loading: true,
        error: null,
    });
    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const data = await queryFn();
            setState({ data, loading: false, error: null });
        }
        catch (error) {
            setState({ data: null, loading: false, error: error });
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
function useMutation(mutationFn) {
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null,
    });
    const mutate = useCallback(async (...args) => {
        setState({ data: null, loading: true, error: null });
        try {
            const data = await mutationFn(...args);
            setState({ data, loading: false, error: null });
            return data;
        }
        catch (error) {
            setState({ data: null, loading: false, error: error });
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
export function usePersona(id, config) {
    const client = useApiClient(config);
    return useQuery(() => client.getPersona(id), [id]);
}
export function usePersonas(query = {
    limit: 20,
    offset: 0,
    orderBy: 'created_at',
    orderDirection: 'desc'
}, config) {
    const client = useApiClient(config);
    const [allData, setAllData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async (pageNum, reset = false) => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.queryPersonas({
                ...query,
                offset: (pageNum - 1) * (query.limit || 20),
            });
            if (reset) {
                setAllData(result.data);
            }
            else {
                setAllData(prev => [...prev, ...result.data]);
            }
            setHasMore(result.hasMore);
            setPage(pageNum);
        }
        catch (err) {
            setError(err);
        }
        finally {
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
export function useCreatePersona(config) {
    const client = useApiClient(config);
    return useMutation((data) => client.createPersona(data));
}
export function useUpdatePersona(config) {
    const client = useApiClient(config);
    return useMutation((args) => client.updatePersona(args.id, args.data));
}
export function useDeletePersona(config) {
    const client = useApiClient(config);
    return useMutation((id) => client.deletePersona(id));
}
export function useBulkCreatePersonas(config) {
    const client = useApiClient(config);
    return useMutation((data) => client.bulkCreatePersonas(data));
}
// ============ Persona Group Hooks ============
export function usePersonaGroup(id, config) {
    const client = useApiClient(config);
    return useQuery(() => client.getGroup(id), [id]);
}
export function usePersonaGroups(query = {
    limit: 20,
    offset: 0,
    includeStats: false,
    includeMembers: false
}, config) {
    const client = useApiClient(config);
    const [allData, setAllData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async (pageNum, reset = false) => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.queryGroups({
                ...query,
                offset: (pageNum - 1) * (query.limit || 20),
            });
            if (reset) {
                setAllData(result.data);
            }
            else {
                setAllData(prev => [...prev, ...result.data]);
            }
            setHasMore(result.hasMore);
            setPage(pageNum);
        }
        catch (err) {
            setError(err);
        }
        finally {
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
export function usePersonaGroupWithMembers(id, config) {
    const client = useApiClient(config);
    return useQuery(() => client.getGroupWithMembers(id), [id]);
}
export function useCreatePersonaGroup(config) {
    const client = useApiClient(config);
    return useMutation((data) => client.createGroup(data));
}
export function useUpdatePersonaGroup(config) {
    const client = useApiClient(config);
    return useMutation((args) => client.updateGroup(args.id, args.data));
}
export function useDeletePersonaGroup(config) {
    const client = useApiClient(config);
    return useMutation((id) => client.deleteGroup(id));
}
// ============ Group Membership Hooks ============
export function useAddToGroup(config) {
    const client = useApiClient(config);
    return useMutation((args) => client.addPersonaToGroup(args.personaId, args.groupId));
}
export function useRemoveFromGroup(config) {
    const client = useApiClient(config);
    return useMutation((args) => client.removePersonaFromGroup(args.personaId, args.groupId));
}
export function usePersonaGroupMemberships(personaId, config) {
    const client = useApiClient(config);
    return useQuery(() => client.getPersonaGroups(personaId), [personaId]);
}
// ============ Stats Hook ============
export function useStats(config) {
    const client = useApiClient(config);
    return useQuery(() => client.getStats(), []);
}
// ============ Context Provider ============
const ApiConfigContext = createContext(null);
export function PersonaApiProvider({ config, children }) {
    return (_jsx(ApiConfigContext.Provider, { value: config, children: children }));
}
function useApiConfig() {
    const config = useContext(ApiConfigContext);
    if (!config) {
        throw new Error('useApiConfig must be used within PersonaApiProvider');
    }
    return config;
}
// Convenience hooks that use context
export const usePersonaWithContext = (id) => usePersona(id, useApiConfig());
export const usePersonasWithContext = (query) => usePersonas(query, useApiConfig());
export const useCreatePersonaWithContext = () => useCreatePersona(useApiConfig());
export const useUpdatePersonaWithContext = () => useUpdatePersona(useApiConfig());
export const useDeletePersonaWithContext = () => useDeletePersona(useApiConfig());
export const useBulkCreatePersonasWithContext = () => useBulkCreatePersonas(useApiConfig());
export const usePersonaGroupWithContext = (id) => usePersonaGroup(id, useApiConfig());
export const usePersonaGroupsWithContext = (query) => usePersonaGroups(query, useApiConfig());
export const usePersonaGroupWithMembersWithContext = (id) => usePersonaGroupWithMembers(id, useApiConfig());
export const useCreatePersonaGroupWithContext = () => useCreatePersonaGroup(useApiConfig());
export const useUpdatePersonaGroupWithContext = () => useUpdatePersonaGroup(useApiConfig());
export const useDeletePersonaGroupWithContext = () => useDeletePersonaGroup(useApiConfig());
export const useAddToGroupWithContext = () => useAddToGroup(useApiConfig());
export const useRemoveFromGroupWithContext = () => useRemoveFromGroup(useApiConfig());
export const usePersonaGroupMembershipsWithContext = (personaId) => usePersonaGroupMemberships(personaId, useApiConfig());
export const useStatsWithContext = () => useStats(useApiConfig());
//# sourceMappingURL=hooks.js.map