/**
 * Tests for API Client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersonaApiClient } from '../../src/api/client.js';
import type { CreatePersonaInput, UpdatePersonaInput } from '../../src/api/schemas.js';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = global.fetch as any;

describe('PersonaApiClient', () => {
  let client: PersonaApiClient;
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new PersonaApiClient({ baseUrl });
  });

  describe('Personas', () => {
    it('should create a persona', async () => {
      const input: CreatePersonaInput = {
        name: 'John Doe',
        age: 30,
        occupation: 'Engineer',
      };

      const response = {
        id: '123',
        ...input,
        attributes: {},
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => response,
      });

      const result = await client.createPersona(input);

      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/personas',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(input),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should get a persona by ID', async () => {
      const persona = {
        id: '123',
        name: 'John Doe',
        age: 30,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => persona,
      });

      const result = await client.getPersona('123');

      expect(result).toEqual(persona);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/personas/123',
        expect.any(Object)
      );
    });

    it('should update a persona', async () => {
      const update: UpdatePersonaInput = {
        name: 'Jane Doe',
        age: 31,
      };

      const updated = {
        id: '123',
        name: 'Jane Doe',
        age: 31,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updated,
      });

      const result = await client.updatePersona('123', update);

      expect(result).toEqual(updated);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/personas/123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(update),
        })
      );
    });

    it('should delete a persona', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await client.deletePersona('123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/personas/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should query personas with filters', async () => {
      const response = {
        data: [{ id: '1', name: 'Person 1' }],
        total: 1,
        page: 1,
        pageSize: 20,
        hasMore: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await client.queryPersonas({
        name: 'Person',
        age: { min: 20, max: 30 },
        limit: 10,
      });

      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/personas?'),
        expect.any(Object)
      );

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('name=Person');
      expect(url).toContain('limit=10');
    });

    it('should bulk create personas', async () => {
      const personas = [
        { name: 'Person 1' },
        { name: 'Person 2' },
      ];

      const response = personas.map((p, i) => ({
        id: String(i + 1),
        ...p,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => response,
      });

      const result = await client.bulkCreatePersonas({ personas });

      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/personas/bulk',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ personas }),
        })
      );
    });
  });

  describe('Groups', () => {
    it('should create a group', async () => {
      const input = {
        name: 'Test Group',
        description: 'A test group',
      };

      const response = {
        id: '123',
        ...input,
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => response,
      });

      const result = await client.createGroup(input);

      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/groups',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(input),
        })
      );
    });

    it('should get group with members', async () => {
      const response = {
        group_id: '123',
        group_name: 'Test Group',
        group_description: 'Description',
        personas: [
          { id: '1', name: 'Person 1' },
          { id: '2', name: 'Person 2' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await client.getGroupWithMembers('123');

      expect(result).toEqual(response);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/groups/123/members',
        expect.any(Object)
      );
    });
  });

  describe('Memberships', () => {
    it('should add persona to group', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true }),
      });

      const result = await client.addPersonaToGroup('persona-123', 'group-456');

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/memberships',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            personaId: 'persona-123',
            groupId: 'group-456',
          }),
        })
      );
    });

    it('should remove persona from group', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await client.removePersonaFromGroup('persona-123', 'group-456');

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/memberships',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({
            personaId: 'persona-123',
            groupId: 'group-456',
          }),
        })
      );
    });
  });

  describe('Stats', () => {
    it('should get statistics', async () => {
      const stats = {
        totalPersonas: 100,
        totalGroups: 10,
        avgGroupSize: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => stats,
      });

      const result = await client.getStats();

      expect(result).toEqual(stats);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/stats',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(client.getPersona('123')).rejects.toThrow('Not found');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.getPersona('123')).rejects.toThrow('Network error');
    });

    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(client.getPersona('123')).rejects.toThrow('HTTP 500');
    });
  });

  describe('Health Check', () => {
    it('should check health', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      const result = await client.health();

      expect(result).toEqual({ status: 'ok' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/health',
        expect.any(Object)
      );
    });
  });
});