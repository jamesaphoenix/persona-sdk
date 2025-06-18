/**
 * TypeScript API Client for Persona SDK
 */
export class PersonaApiClient {
    baseUrl;
    headers;
    fetch;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.headers = {
            'Content-Type': 'application/json',
            ...config.headers,
        };
        this.fetch = config.fetch || globalThis.fetch;
    }
    get url() {
        return this.baseUrl;
    }
    async request(path, options = {}) {
        const url = `${this.baseUrl}${path}`;
        // Filter out undefined header values
        const headers = Object.fromEntries(Object.entries({
            ...this.headers,
            ...options.headers,
        }).filter(([_, value]) => value !== undefined));
        const response = await this.fetch(url, {
            ...options,
            headers,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        if (response.status === 204) {
            return null;
        }
        return response.json();
    }
    // ============ Personas ============
    async createPersona(data) {
        return this.request('/personas', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async getPersona(id) {
        return this.request(`/personas/${id}`);
    }
    async updatePersona(id, data) {
        return this.request(`/personas/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async deletePersona(id) {
        await this.request(`/personas/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': undefined,
            },
        });
    }
    async queryPersonas(query) {
        const params = new URLSearchParams();
        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (typeof value === 'object') {
                        params.append(key, JSON.stringify(value));
                    }
                    else {
                        params.append(key, String(value));
                    }
                }
            });
        }
        const queryString = params.toString();
        const path = queryString ? `/personas?${queryString}` : '/personas';
        return this.request(path);
    }
    async bulkCreatePersonas(data) {
        return this.request('/personas/bulk', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // ============ Persona Groups ============
    async createGroup(data) {
        return this.request('/groups', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async getGroup(id) {
        return this.request(`/groups/${id}`);
    }
    async updateGroup(id, data) {
        return this.request(`/groups/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async deleteGroup(id) {
        await this.request(`/groups/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': undefined,
            },
        });
    }
    async queryGroups(query) {
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
        return this.request(path);
    }
    async getGroupWithMembers(id) {
        return this.request(`/groups/${id}/members`);
    }
    // ============ Group Membership ============
    async addPersonaToGroup(personaId, groupId) {
        return this.request('/memberships', {
            method: 'POST',
            body: JSON.stringify({ personaId, groupId }),
        });
    }
    async removePersonaFromGroup(personaId, groupId) {
        return this.request('/memberships', {
            method: 'DELETE',
            body: JSON.stringify({ personaId, groupId }),
        });
    }
    async getPersonaGroups(personaId) {
        return this.request(`/personas/${personaId}/groups`);
    }
    // ============ Stats ============
    async getStats() {
        return this.request('/stats');
    }
    // ============ Health ============
    async health() {
        return this.request('/health');
    }
}
//# sourceMappingURL=client.js.map