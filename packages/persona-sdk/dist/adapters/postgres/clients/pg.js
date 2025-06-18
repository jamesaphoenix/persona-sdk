/**
 * PostgreSQL client implementation using node-postgres (pg)
 */
export class PgDatabaseClient {
    pool;
    constructor(config) {
        // Dynamic import to avoid dependency if not used
        const { Pool } = require('pg');
        this.pool = new Pool({
            connectionString: config.connectionString,
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            ssl: config.ssl,
            max: config.poolSize ?? 10,
        });
    }
    async query(text, values) {
        const result = await this.pool.query(text, values);
        return {
            rows: result.rows,
            rowCount: result.rowCount || 0,
        };
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const txClient = new PgTransactionClient(client);
            const result = await callback(txClient);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
    }
}
class PgTransactionClient {
    client;
    constructor(client) {
        this.client = client;
    }
    async query(text, values) {
        const result = await this.client.query(text, values);
        return {
            rows: result.rows,
            rowCount: result.rowCount || 0,
        };
    }
    async transaction(callback) {
        // Nested transactions use savepoints
        const savepointName = `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.client.query(`SAVEPOINT ${savepointName}`);
        try {
            const result = await callback(this);
            await this.client.query(`RELEASE SAVEPOINT ${savepointName}`);
            return result;
        }
        catch (error) {
            await this.client.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
            throw error;
        }
    }
}
//# sourceMappingURL=pg.js.map