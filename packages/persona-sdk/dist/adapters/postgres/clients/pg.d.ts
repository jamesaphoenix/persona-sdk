/**
 * PostgreSQL client implementation using node-postgres (pg)
 */
import type { DatabaseClient, QueryResult } from '../adapter.js';
import type { DatabaseConfig } from '../types.js';
export declare class PgDatabaseClient implements DatabaseClient {
    private pool;
    constructor(config: DatabaseConfig);
    query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>>;
    transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
}
//# sourceMappingURL=pg.d.ts.map