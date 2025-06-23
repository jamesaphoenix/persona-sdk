import { Persona } from '../persona.js';
export interface AIOptions {
    apiKey: string;
    model?: string;
    temperature?: number;
}
/**
 * AI-powered persona generation methods
 */
export declare class PersonaAI {
    /**
     * Generate a persona from a text prompt using OpenAI
     */
    static fromPrompt(prompt: string, options: AIOptions): Promise<Persona>;
    /**
     * Generate multiple diverse personas from a prompt
     */
    static generateMultiple(prompt: string, count: number, options: AIOptions): Promise<Persona[]>;
    /**
     * Optimize a prompt for better persona generation
     */
    static optimizePrompt(basePrompt: string, options: AIOptions): Promise<string>;
    /**
     * Suggest attributes based on context
     */
    static suggestAttributes(context: Record<string, any>, options: AIOptions): Promise<string[]>;
}
//# sourceMappingURL=persona-ai.d.ts.map