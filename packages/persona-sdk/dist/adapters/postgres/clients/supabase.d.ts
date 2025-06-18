/**
 * Supabase client implementation
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseClient, QueryResult } from '../adapter.js';
export declare class SupabaseDatabaseClient implements DatabaseClient {
    private supabase;
    constructor(supabase: SupabaseClient);
    query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>>;
    transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
}
export declare const SUPABASE_EXECUTE_SQL_FUNCTION = "\nCREATE OR REPLACE FUNCTION execute_sql(query text, params jsonb DEFAULT '[]'::jsonb)\nRETURNS jsonb\nLANGUAGE plpgsql\nSECURITY DEFINER\nAS $$\nDECLARE\n  result jsonb;\nBEGIN\n  -- This is a simplified version. In production, you'd want proper parameter binding\n  -- and security checks\n  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query) INTO result;\n  RETURN COALESCE(result, '[]'::jsonb);\nEND;\n$$;\n";
//# sourceMappingURL=supabase.d.ts.map