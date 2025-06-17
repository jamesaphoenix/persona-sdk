import { vi } from 'vitest';
import { z } from 'zod';

/**
 * Mock for LangChain's ChatOpenAI class
 */
export class MockChatOpenAI {
  modelName: string;
  temperature: number;
  
  constructor(config: any) {
    this.modelName = config.modelName || 'gpt-4.1-mini';
    this.temperature = config.temperature || 0.7;
  }

  withStructuredOutput(schema: z.ZodSchema) {
    return {
      invoke: vi.fn().mockImplementation(async (messages: any) => {
        // Return mock data based on the schema
        if (schema._def.typeName === 'ZodObject') {
          const shape = (schema as any)._def.shape();
          const mockData: any = {};
          
          for (const [key, field] of Object.entries(shape)) {
            const fieldSchema = field as z.ZodTypeAny;
            mockData[key] = getMockValueForSchema(fieldSchema);
          }
          
          return mockData;
        }
        
        return {};
      })
    };
  }
}

/**
 * Generate mock values based on Zod schema types
 */
function getMockValueForSchema(schema: z.ZodTypeAny): any {
  const typeName = schema._def.typeName;
  
  switch (typeName) {
    case 'ZodString':
      return 'Mock string value';
    case 'ZodNumber':
      return 42;
    case 'ZodBoolean':
      return true;
    case 'ZodArray':
      return ['item1', 'item2', 'item3'];
    case 'ZodObject':
      const shape = schema._def.shape();
      const obj: any = {};
      for (const [key, field] of Object.entries(shape)) {
        obj[key] = getMockValueForSchema(field as z.ZodTypeAny);
      }
      return obj;
    default:
      return 'Mock value';
  }
}

/**
 * Mock the @langchain/openai module
 */
export const mockLangChain = () => {
  vi.mock('@langchain/openai', () => ({
    ChatOpenAI: MockChatOpenAI
  }));
};