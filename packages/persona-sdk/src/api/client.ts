/**
 * TypeScript API Client for Persona SDK
 */

import type {
  PersonaResponse,
  PersonaGroupResponse,
  CreatePersonaInput,
  UpdatePersonaInput,
  PersonaQuery,
  CreatePersonaGroupInput,
  UpdatePersonaGroupInput,
  PersonaGroupQuery,
  BulkCreatePersonasInput,
  StatsResponse,
} from './schemas.js';

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

export class PersonaApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private fetch: typeof fetch;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.fetch = config.fetch || globalThis.fetch;
  }

  get url(): string {
    return this.baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await this.fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // ============ Personas ============

  async createPersona(data: CreatePersonaInput): Promise<PersonaResponse> {
    return this.request<PersonaResponse>('/personas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPersona(id: string): Promise<PersonaResponse> {
    return this.request<PersonaResponse>(`/personas/${id}`);
  }

  async updatePersona(id: string, data: UpdatePersonaInput): Promise<PersonaResponse> {
    return this.request<PersonaResponse>(`/personas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePersona(id: string): Promise<void> {
    await this.request<void>(`/personas/${id}`, {
      method: 'DELETE',
    });
  }

  async queryPersonas(query?: PersonaQuery): Promise<PaginatedResponse<PersonaResponse>> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const queryString = params.toString();
    const path = queryString ? `/personas?${queryString}` : '/personas';
    
    return this.request<PaginatedResponse<PersonaResponse>>(path);
  }

  async bulkCreatePersonas(data: BulkCreatePersonasInput): Promise<PersonaResponse[]> {
    return this.request<PersonaResponse[]>('/personas/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ Persona Groups ============

  async createGroup(data: CreatePersonaGroupInput): Promise<PersonaGroupResponse> {
    return this.request<PersonaGroupResponse>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGroup(id: string): Promise<PersonaGroupResponse> {
    return this.request<PersonaGroupResponse>(`/groups/${id}`);
  }

  async updateGroup(id: string, data: UpdatePersonaGroupInput): Promise<PersonaGroupResponse> {
    return this.request<PersonaGroupResponse>(`/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: string): Promise<void> {
    await this.request<void>(`/groups/${id}`, {
      method: 'DELETE',
    });
  }

  async queryGroups(query?: PersonaGroupQuery): Promise<PaginatedResponse<PersonaGroupResponse>> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const path = queryString ? `/groups?${queryString}` : '/groups';
    
    return this.request<PaginatedResponse<PersonaGroupResponse>>(path);
  }

  async getGroupWithMembers(id: string): Promise<{
    group_id: string;
    group_name: string;
    group_description: string | null;
    personas: PersonaResponse[];
  }> {
    return this.request(`/groups/${id}/members`);
  }

  // ============ Group Membership ============

  async addPersonaToGroup(personaId: string, groupId: string): Promise<{ success: boolean }> {
    return this.request('/memberships', {
      method: 'POST',
      body: JSON.stringify({ personaId, groupId }),
    });
  }

  async removePersonaFromGroup(personaId: string, groupId: string): Promise<{ success: boolean }> {
    return this.request('/memberships', {
      method: 'DELETE',
      body: JSON.stringify({ personaId, groupId }),
    });
  }

  async getPersonaGroups(personaId: string): Promise<PersonaGroupResponse[]> {
    return this.request(`/personas/${personaId}/groups`);
  }

  // ============ Stats ============

  async getStats(): Promise<StatsResponse> {
    return this.request('/stats');
  }

  // ============ Health ============

  async health(): Promise<{ status: string }> {
    return this.request('/health');
  }
}