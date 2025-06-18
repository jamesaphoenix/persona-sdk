/**
 * Supabase client implementation
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseClient, QueryResult } from '../adapter.js';

export class SupabaseDatabaseClient implements DatabaseClient {
  constructor(private supabase: SupabaseClient) {}

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    // Supabase uses RPC for raw SQL queries
    const { data, error, count } = await this.supabase.rpc('execute_sql', {
      query: text,
      params: values || [],
    });

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    return {
      rows: data || [],
      rowCount: count || 0,
    };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    // Supabase doesn't support client-side transactions
    // For production use, create a database function that handles the transaction
    console.warn('Supabase client-side transactions are not supported. Consider using database functions.');
    return callback(this);
  }
}

// Helper to create the execute_sql function in Supabase
export const SUPABASE_EXECUTE_SQL_FUNCTION = `
CREATE OR REPLACE FUNCTION execute_sql(query text, params jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- This is a simplified version. In production, you'd want proper parameter binding
  -- and security checks
  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query) INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
`;