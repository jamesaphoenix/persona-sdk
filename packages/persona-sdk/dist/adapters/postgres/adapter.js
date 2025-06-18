/**
 * PostgreSQL Database Adapter
 * ORM-agnostic adapter that works with any PostgreSQL client
 */
export class PostgresAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    // ============ Personas CRUD ============
    async createPersona(input) {
        const { rows } = await this.client.query(`INSERT INTO personas (name, age, occupation, sex, attributes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            input.name,
            input.age ?? null,
            input.occupation ?? null,
            input.sex ?? null,
            input.attributes ?? {},
            input.metadata ?? {},
        ]);
        return rows[0];
    }
    async getPersona(id) {
        const { rows } = await this.client.query('SELECT * FROM personas WHERE id = $1', [id]);
        return rows[0] || null;
    }
    async updatePersona(id, input) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (input.name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(input.name);
        }
        if (input.age !== undefined) {
            updates.push(`age = $${paramCount++}`);
            values.push(input.age);
        }
        if (input.occupation !== undefined) {
            updates.push(`occupation = $${paramCount++}`);
            values.push(input.occupation);
        }
        if (input.sex !== undefined) {
            updates.push(`sex = $${paramCount++}`);
            values.push(input.sex);
        }
        if (input.attributes !== undefined) {
            updates.push(`attributes = $${paramCount++}`);
            values.push(input.attributes);
        }
        if (input.metadata !== undefined) {
            updates.push(`metadata = $${paramCount++}`);
            values.push(input.metadata);
        }
        if (updates.length === 0) {
            return this.getPersona(id);
        }
        values.push(id);
        const { rows } = await this.client.query(`UPDATE personas SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`, values);
        return rows[0] || null;
    }
    async deletePersona(id) {
        const { rowCount } = await this.client.query('DELETE FROM personas WHERE id = $1', [id]);
        return rowCount > 0;
    }
    async queryPersonas(query = {}) {
        const conditions = [];
        const values = [];
        let paramCount = 1;
        if (query.id) {
            conditions.push(`id = $${paramCount++}`);
            values.push(query.id);
        }
        if (query.name) {
            conditions.push(`name ILIKE $${paramCount++}`);
            // Escape special LIKE characters to prevent them from being treated as wildcards
            const escapedName = query.name
                .replace(/\\/g, '\\\\') // Escape backslashes first
                .replace(/%/g, '\\%') // Escape percent signs
                .replace(/_/g, '\\_'); // Escape underscores
            values.push(`%${escapedName}%`);
        }
        if (query.age?.min !== undefined) {
            conditions.push(`age >= $${paramCount++}`);
            values.push(query.age.min);
        }
        if (query.age?.max !== undefined) {
            conditions.push(`age <= $${paramCount++}`);
            values.push(query.age.max);
        }
        if (query.occupation) {
            conditions.push(`occupation ILIKE $${paramCount++}`);
            values.push(`%${query.occupation}%`);
        }
        if (query.sex) {
            conditions.push(`sex = $${paramCount++}`);
            values.push(query.sex);
        }
        if (query.attributes) {
            conditions.push(`attributes @> $${paramCount++}`);
            values.push(query.attributes);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // Count total
        const countQuery = `SELECT COUNT(*) FROM personas ${whereClause}`;
        const { rows: countRows } = await this.client.query(countQuery, values);
        const total = countRows[0] ? parseInt(countRows[0].count, 10) : 0;
        // Get paginated results
        const limit = query.limit ?? 20;
        const offset = query.offset ?? 0;
        const orderBy = query.orderBy ?? 'created_at';
        const orderDirection = query.orderDirection ?? 'desc';
        const dataQuery = `
      SELECT * FROM personas 
      ${whereClause}
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
        const { rows } = await this.client.query(dataQuery, [...values, limit, offset]);
        return {
            data: rows,
            total,
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
            hasMore: offset + limit < total,
        };
    }
    async bulkCreatePersonas(input) {
        return this.client.transaction(async (txClient) => {
            const adapter = new PostgresAdapter(txClient);
            const personas = [];
            for (const personaInput of input.personas) {
                const persona = await adapter.createPersona(personaInput);
                personas.push(persona);
                if (input.groupId) {
                    await adapter.addPersonaToGroup(persona.id, input.groupId);
                }
            }
            return personas;
        });
    }
    // ============ Persona Groups CRUD ============
    async createPersonaGroup(input) {
        const { rows } = await this.client.query(`INSERT INTO persona_groups (name, description, metadata)
       VALUES ($1, $2, $3)
       RETURNING *`, [input.name, input.description ?? null, input.metadata ?? {}]);
        return rows[0];
    }
    async getPersonaGroup(id) {
        const { rows } = await this.client.query('SELECT * FROM persona_groups WHERE id = $1', [id]);
        return rows[0] || null;
    }
    async updatePersonaGroup(id, input) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (input.name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(input.name);
        }
        if (input.description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(input.description);
        }
        if (input.metadata !== undefined) {
            updates.push(`metadata = $${paramCount++}`);
            values.push(input.metadata);
        }
        if (updates.length === 0) {
            return this.getPersonaGroup(id);
        }
        values.push(id);
        const { rows } = await this.client.query(`UPDATE persona_groups SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`, values);
        return rows[0] || null;
    }
    async deletePersonaGroup(id) {
        const { rowCount } = await this.client.query('DELETE FROM persona_groups WHERE id = $1', [id]);
        return rowCount > 0;
    }
    async queryPersonaGroups(query = {}) {
        const conditions = [];
        const values = [];
        let paramCount = 1;
        if (query.id) {
            conditions.push(`id = $${paramCount++}`);
            values.push(query.id);
        }
        if (query.name) {
            conditions.push(`name ILIKE $${paramCount++}`);
            // Escape special LIKE characters to prevent them from being treated as wildcards
            const escapedName = query.name
                .replace(/\\/g, '\\\\') // Escape backslashes first
                .replace(/%/g, '\\%') // Escape percent signs
                .replace(/_/g, '\\_'); // Escape underscores
            values.push(`%${escapedName}%`);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const table = query.includeStats ? 'persona_group_stats' : 'persona_groups';
        // Count total
        const countQuery = `SELECT COUNT(*) FROM ${table} ${whereClause}`;
        const { rows: countRows } = await this.client.query(countQuery, values);
        const total = countRows[0] ? parseInt(countRows[0].count, 10) : 0;
        // Get paginated results
        const limit = query.limit ?? 20;
        const offset = query.offset ?? 0;
        const dataQuery = `
      SELECT * FROM ${table}
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
        const { rows } = await this.client.query(dataQuery, [...values, limit, offset]);
        return {
            data: rows,
            total,
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
            hasMore: offset + limit < total,
        };
    }
    async getPersonaGroupWithMembers(groupId) {
        const { rows } = await this.client.query('SELECT * FROM get_persona_group_with_members($1)', [groupId]);
        if (!rows[0])
            return null;
        // Parse the JSON personas field
        return {
            ...rows[0],
            personas: rows[0].personas,
        };
    }
    // ============ Group Membership ============
    async addPersonaToGroup(personaId, groupId) {
        try {
            await this.client.query(`INSERT INTO persona_group_members (persona_id, group_id)
         VALUES ($1, $2)
         ON CONFLICT (persona_id, group_id) DO NOTHING`, [personaId, groupId]);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async removePersonaFromGroup(personaId, groupId) {
        const { rowCount } = await this.client.query('DELETE FROM persona_group_members WHERE persona_id = $1 AND group_id = $2', [personaId, groupId]);
        return rowCount > 0;
    }
    async getPersonaGroups(personaId) {
        const { rows } = await this.client.query(`SELECT pg.* FROM persona_groups pg
       JOIN persona_group_members pgm ON pg.id = pgm.group_id
       WHERE pgm.persona_id = $1
       ORDER BY pgm.joined_at DESC`, [personaId]);
        return rows;
    }
    async getGroupMembers(groupId) {
        const { rows } = await this.client.query(`SELECT p.* FROM personas p
       JOIN persona_group_members pgm ON p.id = pgm.persona_id
       WHERE pgm.group_id = $1
       ORDER BY pgm.joined_at DESC`, [groupId]);
        return rows;
    }
    // ============ Utilities ============
    async clearAllData() {
        await this.client.query('TRUNCATE personas, persona_groups, persona_group_members CASCADE');
    }
    async getStats() {
        const { rows } = await this.client.query(`
      SELECT 
        (SELECT COUNT(*) FROM personas) as total_personas,
        (SELECT COUNT(*) FROM persona_groups) as total_groups,
        (SELECT AVG(member_count)::numeric(10,2) FROM persona_group_stats) as avg_group_size
    `);
        const stats = rows[0];
        return {
            totalPersonas: stats ? parseInt(stats.total_personas, 10) : 0,
            totalGroups: stats ? parseInt(stats.total_groups, 10) : 0,
            avgGroupSize: stats ? parseFloat(stats.avg_group_size || '0') : 0,
        };
    }
}
//# sourceMappingURL=adapter.js.map