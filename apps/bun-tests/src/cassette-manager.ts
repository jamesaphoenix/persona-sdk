import { createHash } from 'crypto';
import { $ } from 'bun';

interface Cassette {
  request: {
    function: string;
    args: any[];
    timestamp: string;
  };
  response: any;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
  timestamp: string;
  version: string;
}

export class BunCassetteManager {
  private cassettesDir: string;
  private mode: 'record' | 'replay';
  private maxAge: number;

  constructor(options: {
    cassettesDir?: string;
    mode?: 'record' | 'replay';
    maxAge?: number;
  } = {}) {
    this.cassettesDir = options.cassettesDir || './cassettes';
    this.mode = options.mode || (process.env.CASSETTE_MODE as any) || 'replay';
    this.maxAge = options.maxAge || 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  async init() {
    // Bun's native mkdir
    await $`mkdir -p ${this.cassettesDir}/{persona-builder,ai-features,distributions}`;
  }

  private generateCassetteId(functionName: string, args: any[]): string {
    const content = JSON.stringify({ function: functionName, args });
    return createHash('md5').update(content).digest('hex').slice(0, 8);
  }

  private getCassettePath(functionName: string, args: any[]): string {
    const category = this.getCategoryForFunction(functionName);
    const id = this.generateCassetteId(functionName, args);
    const safeName = functionName.replace(/[^a-zA-Z0-9]/g, '-');
    return `${this.cassettesDir}/${category}/${safeName}-${id}.json`;
  }

  private getCategoryForFunction(functionName: string): string {
    if (functionName.includes('PersonaBuilder')) return 'persona-builder';
    if (functionName.includes('Distribution')) return 'distributions';
    return 'ai-features';
  }

  async loadCassette(path: string): Promise<Cassette | null> {
    const file = Bun.file(path);
    
    if (!await file.exists()) {
      return null;
    }

    try {
      const cassette = await file.json() as Cassette;
      
      // Check expiration
      const age = Date.now() - new Date(cassette.timestamp).getTime();
      if (age > this.maxAge) {
        console.log(`⏰ Cassette expired: ${path}`);
        return null;
      }
      
      return cassette;
    } catch {
      return null;
    }
  }

  async saveCassette(path: string, cassette: Cassette): Promise<void> {
    // Ensure directory exists
    const dir = path.substring(0, path.lastIndexOf('/'));
    await $`mkdir -p ${dir}`;
    
    // Bun's native file writing
    await Bun.write(path, JSON.stringify(cassette, null, 2));
    console.log(`💾 Saved: ${path.split('/').pop()}`);
  }

  async intercept<T>(
    functionName: string,
    args: any[],
    executor: (...args: any[]) => Promise<T>
  ): Promise<T> {
    const cassettePath = this.getCassettePath(functionName, args);
    
    if (this.mode === 'replay') {
      const cassette = await this.loadCassette(cassettePath);
      
      if (cassette) {
        console.log(`📼 Replaying: ${functionName}`);
        
        if (cassette.error) {
          const error = new Error(cassette.error.message);
          error.name = cassette.error.name;
          error.stack = cassette.error.stack;
          throw error;
        }
        
        return cassette.response;
      }
      
      if (process.env.ALLOW_FALLBACK === 'true') {
        console.log(`🌐 No cassette, falling back to real call`);
        return this.record(functionName, args, executor, cassettePath);
      }
      
      throw new Error(
        `No cassette found for ${functionName}. Run with CASSETTE_MODE=record`
      );
    }
    
    return this.record(functionName, args, executor, cassettePath);
  }

  private async record<T>(
    functionName: string,
    args: any[],
    executor: (...args: any[]) => Promise<T>,
    cassettePath: string
  ): Promise<T> {
    console.log(`🔴 Recording: ${functionName}`);
    
    const start = performance.now();
    let response: T;
    let error: Error | null = null;
    
    try {
      response = await executor(...args);
    } catch (e) {
      error = e as Error;
    }
    
    const duration = performance.now() - start;
    console.log(`⏱️  Took ${duration.toFixed(0)}ms`);
    
    const cassette: Cassette = {
      request: {
        function: functionName,
        args: this.sanitizeArgs(args),
        timestamp: new Date().toISOString()
      },
      response: error ? null : this.sanitizeResponse(response),
      error: error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : undefined,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    await this.saveCassette(cassettePath, cassette);
    
    if (error) throw error;
    return response!;
  }

  private sanitizeArgs(args: any[]): any[] {
    return args.map(arg => {
      if (typeof arg === 'object' && arg?.apiKey) {
        return { ...arg, apiKey: '[REDACTED]' };
      }
      return arg;
    });
  }

  private sanitizeResponse(response: any): any {
    if (typeof response !== 'object') return response;
    
    const sanitized = { ...response };
    if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]';
    if (sanitized.authorization) sanitized.authorization = '[REDACTED]';
    
    return sanitized;
  }

  async getStats() {
    const stats = {
      total: 0,
      byCategory: {} as Record<string, number>,
      totalSize: 0
    };

    const categories = ['persona-builder', 'ai-features', 'distributions'];
    
    for (const category of categories) {
      const dir = `${this.cassettesDir}/${category}`;
      const files = await $`ls ${dir}/*.json 2>/dev/null || true`.text();
      const jsonFiles = files.trim().split('\n').filter(f => f);
      
      stats.byCategory[category] = jsonFiles.length;
      stats.total += jsonFiles.length;
      
      for (const file of jsonFiles) {
        if (file) {
          const bunFile = Bun.file(file);
          stats.totalSize += bunFile.size;
        }
      }
    }
    
    return stats;
  }
}