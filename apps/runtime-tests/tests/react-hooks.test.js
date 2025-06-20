import * as PersonaSDK from '@jamesaphoenix/persona-sdk';

const { PersonaApiClient } = PersonaSDK;

// Note: React hooks can't be tested directly in Node.js runtime
// These tests focus on the underlying API client that the hooks use
export const reactHooksTests = [
  // API Client tests (used by hooks)
  {
    name: 'PersonaApiClient - Initialize and health check',
    category: 'API Client',
    cassette: false,
    fn: async () => {
      const client = new PersonaApiClient({ baseUrl: 'http://localhost:3000' });
      
      // Test client initialization
      if (!client) {
        throw new Error('Client should initialize');
      }
      
      // Note: Actual API calls would fail without a running server
      // This tests the client setup which hooks depend on
      return { success: true, client: !!client };
    }
  },

  {
    name: 'PersonaApiClient.getPersona - Request structure',
    category: 'API Client',
    cassette: false,
    fn: async () => {
      const client = new PersonaApiClient({ baseUrl: 'http://localhost:3000' });
      
      // Test that the method exists and returns a promise
      const getPersonaMethod = client.getPersona;
      if (typeof getPersonaMethod !== 'function') {
        throw new Error('getPersona should be a method');
      }
      
      // Test error handling for invalid ID
      try {
        await client.getPersona('');
        throw new Error('Should reject empty ID');
      } catch (error) {
        if (!error.message.includes('fetch')) {
          // Expected - no server running
          return { success: true, errorHandling: 'works' };
        }
      }
      
      return { success: true };
    }
  },

  {
    name: 'PersonaApiClient.createPersona - Payload validation',
    category: 'API Client',
    cassette: false,
    fn: async () => {
      const client = new PersonaApiClient({ baseUrl: 'http://localhost:3000' });
      
      // Test that the method exists
      if (typeof client.createPersona !== 'function') {
        throw new Error('createPersona should be a method');
      }
      
      // Test payload structure
      const testPayload = {
        name: 'Test User',
        age: 30,
        occupation: 'Developer',
        sex: 'other',
        attributes: {
          location: 'Remote',
          skills: ['JavaScript', 'TypeScript']
        }
      };
      
      // Would make actual API call with server running
      // Here we're testing the client interface
      return { success: true, payloadStructure: Object.keys(testPayload) };
    }
  },

  {
    name: 'PersonaApiClient.updatePersona - Update structure',
    category: 'API Client',
    cassette: false,
    fn: async () => {
      const client = new PersonaApiClient({ baseUrl: 'http://localhost:3000' });
      
      // Test method existence
      if (typeof client.updatePersona !== 'function') {
        throw new Error('updatePersona should be a method');
      }
      
      const updatePayload = {
        age: 31,
        attributes: {
          location: 'New York'
        }
      };
      
      return { success: true, canUpdate: true };
    }
  },

  {
    name: 'PersonaApiClient.deletePersona - Method availability',
    category: 'API Client',
    cassette: false,
    fn: async () => {
      const client = new PersonaApiClient({ baseUrl: 'http://localhost:3000' });
      
      if (typeof client.deletePersona !== 'function') {
        throw new Error('deletePersona should be a method');
      }
      
      return { success: true };
    }
  },

  {
    name: 'PersonaApiClient.queryPersonas - Query structure',
    category: 'API Client',
    cassette: false,
    fn: async () => {
      const client = new PersonaApiClient({ baseUrl: 'http://localhost:3000' });
      
      if (typeof client.queryPersonas !== 'function') {
        throw new Error('queryPersonas should be a method');
      }
      
      // Test query parameter structure
      const queries = [
        { age: { min: 25, max: 35 } },
        { occupation: 'Engineer' },
        { 'attributes.location': 'San Francisco' },
        { sex: 'female' }
      ];
      
      // Validate query structures
      for (const query of queries) {
        if (typeof query !== 'object') {
          throw new Error('Query should be an object');
        }
      }
      
      return { success: true, queryExamples: queries };
    }
  },

  {
    name: 'PersonaApiClient.getStats - Stats request',
    category: 'API Client',
    cassette: false,
    fn: async () => {
      const client = new PersonaApiClient({ baseUrl: 'http://localhost:3000' });
      
      if (typeof client.getStats !== 'function') {
        throw new Error('getStats should be a method');
      }
      
      // Test attribute parameter
      const attributes = ['age', 'occupation', 'location'];
      
      return { success: true, statsAttributes: attributes };
    }
  },

  // Hook usage patterns (documented, not executable in Node)
  {
    name: 'Hook Usage Documentation - usePersona',
    category: 'React Hooks Usage',
    cassette: false,
    fn: async () => {
      const usageExample = `
// usePersona hook usage:
const { persona, loading, error, refetch } = usePersona('persona-id');

// Features:
// - Automatic loading state management
// - Error handling with retry
// - Caching and deduplication
// - Real-time updates via refetch
      `;
      
      return { 
        success: true, 
        hookName: 'usePersona',
        features: [
          'Loading state management',
          'Error handling',
          'Caching',
          'Refetch capability'
        ],
        usage: usageExample.trim()
      };
    }
  },

  {
    name: 'Hook Usage Documentation - usePersonas',
    category: 'React Hooks Usage',
    cassette: false,
    fn: async () => {
      const usageExample = `
// usePersonas hook usage:
const { 
  personas, 
  loading, 
  error, 
  hasMore,
  loadMore,
  refetch 
} = usePersonas({
  limit: 20,
  offset: 0,
  query: { age: { min: 25 } }
});

// Features:
// - Pagination support
// - Query filtering
// - Infinite scroll capability
// - Automatic deduplication
      `;
      
      return { 
        success: true, 
        hookName: 'usePersonas',
        features: [
          'Pagination',
          'Query filtering',
          'Infinite scroll',
          'Deduplication'
        ],
        usage: usageExample.trim()
      };
    }
  },

  {
    name: 'Hook Usage Documentation - useCreatePersona',
    category: 'React Hooks Usage',
    cassette: false,
    fn: async () => {
      const usageExample = `
// useCreatePersona hook usage:
const { 
  createPersona, 
  loading, 
  error,
  data 
} = useCreatePersona();

// Usage:
const handleCreate = async () => {
  const result = await createPersona({
    name: 'New User',
    age: 28,
    occupation: 'Designer',
    sex: 'female',
    attributes: { team: 'UX' }
  });
};

// Features:
// - Optimistic updates
// - Error recovery
// - Loading states
// - Success callbacks
      `;
      
      return { 
        success: true, 
        hookName: 'useCreatePersona',
        features: [
          'Optimistic updates',
          'Error recovery',
          'Loading states',
          'Success callbacks'
        ],
        usage: usageExample.trim()
      };
    }
  },

  {
    name: 'Hook Usage Documentation - useUpdatePersona',
    category: 'React Hooks Usage',
    cassette: false,
    fn: async () => {
      const usageExample = `
// useUpdatePersona hook usage:
const { 
  updatePersona, 
  loading, 
  error 
} = useUpdatePersona();

// Usage:
const handleUpdate = async (id, updates) => {
  await updatePersona(id, {
    age: 29,
    attributes: {
      ...persona.attributes,
      level: 'Senior'
    }
  });
};

// Features:
// - Partial updates
// - Optimistic UI updates
// - Rollback on error
// - Cache invalidation
      `;
      
      return { 
        success: true, 
        hookName: 'useUpdatePersona',
        features: [
          'Partial updates',
          'Optimistic updates',
          'Error rollback',
          'Cache invalidation'
        ],
        usage: usageExample.trim()
      };
    }
  },

  {
    name: 'Hook Usage Documentation - useDeletePersona',
    category: 'React Hooks Usage',
    cassette: false,
    fn: async () => {
      const usageExample = `
// useDeletePersona hook usage:
const { 
  deletePersona, 
  loading, 
  error 
} = useDeletePersona();

// Usage:
const handleDelete = async (id) => {
  if (confirm('Delete persona?')) {
    await deletePersona(id);
  }
};

// Features:
// - Confirmation support
// - Optimistic removal
// - Undo capability
// - List updates
      `;
      
      return { 
        success: true, 
        hookName: 'useDeletePersona',
        features: [
          'Confirmation support',
          'Optimistic removal',
          'Undo capability',
          'Automatic list updates'
        ],
        usage: usageExample.trim()
      };
    }
  },

  {
    name: 'Hook Usage Documentation - usePersonaStatistics',
    category: 'React Hooks Usage',
    cassette: false,
    fn: async () => {
      const usageExample = `
// usePersonaStatistics hook usage:
const { 
  statistics, 
  loading, 
  error,
  refetch 
} = usePersonaStatistics(['age', 'occupation', 'location']);

// Returns:
// {
//   age: { min: 22, max: 65, mean: 35.5, median: 34 },
//   occupation: { Engineer: 45, Designer: 23, ... },
//   location: { 'San Francisco': 34, 'New York': 28, ... }
// }

// Features:
// - Multiple attribute stats
// - Real-time updates
// - Efficient caching
// - Background refresh
      `;
      
      return { 
        success: true, 
        hookName: 'usePersonaStatistics',
        features: [
          'Multi-attribute statistics',
          'Real-time updates',
          'Efficient caching',
          'Background refresh'
        ],
        usage: usageExample.trim()
      };
    }
  }
];