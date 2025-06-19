import { PersonaBuilder } from '../persona-builder';
import { Persona } from '../persona';

export interface AIOptions {
  apiKey: string;
  model?: string;
  temperature?: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * AI-powered persona generation methods
 */
export class PersonaAI {
  /**
   * Generate a persona from a text prompt using OpenAI
   */
  static async fromPrompt(prompt: string, options: AIOptions): Promise<Persona> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a persona generator. Generate realistic persona details. Return ONLY valid JSON (no markdown, no code blocks) with fields: name (string), age (number), occupation (string), sex (string: male/female/other), and attributes (object with relevant characteristics).'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as OpenAIResponse;
    let content = data.choices[0].message.content;
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const personaData = JSON.parse(content);

    const builder = PersonaBuilder.create()
      .withName(personaData.name || 'Generated Person')
      .withAge(typeof personaData.age === 'number' ? personaData.age : parseInt(personaData.age) || 30)
      .withOccupation(personaData.occupation || 'Professional')
      .withSex(personaData.sex || 'other');
    
    // Add location as a custom attribute
    if (personaData.location) {
      builder.withAttribute('location', personaData.location);
    }
    
    // Add other attributes
    if (personaData.attributes) {
      builder.withAttributes(personaData.attributes);
    }
    
    return builder.build();
  }

  /**
   * Generate multiple diverse personas from a prompt
   */
  static async generateMultiple(
    prompt: string, 
    count: number, 
    options: AIOptions
  ): Promise<Persona[]> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Generate ${count} diverse personas. Return ONLY a valid JSON array (no markdown, no code blocks). Each persona should have: name (string), age (number), occupation (string), sex (string: male/female/other), and attributes (object).`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as OpenAIResponse;
    let content = data.choices[0].message.content;
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const personasData = JSON.parse(content);

    return personasData.map((personaData: any) => {
      const builder = PersonaBuilder.create()
        .withName(personaData.name || 'Generated Person')
        .withAge(typeof personaData.age === 'number' ? personaData.age : parseInt(personaData.age) || 30)
        .withOccupation(personaData.occupation || 'Professional')
        .withSex(personaData.sex || 'other');
      
      // Add location as a custom attribute
      if (personaData.location) {
        builder.withAttribute('location', personaData.location);
      }
      
      // Add other attributes
      if (personaData.attributes) {
        builder.withAttributes(personaData.attributes);
      }
      
      return builder.build();
    });
  }

  /**
   * Optimize a prompt for better persona generation
   */
  static async optimizePrompt(basePrompt: string, options: AIOptions): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a prompt optimizer. Enhance the given prompt to create more detailed and realistic personas. Include guidance for age, location, occupation, and relevant attributes.'
          },
          {
            role: 'user',
            content: `Optimize this persona prompt: "${basePrompt}"`
          }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as OpenAIResponse;
    return data.choices[0].message.content;
  }

  /**
   * Suggest attributes based on context
   */
  static async suggestAttributes(
    context: Record<string, any>, 
    options: AIOptions
  ): Promise<string[]> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an attribute suggester. Based on the context, suggest relevant persona attributes. Return ONLY a valid JSON array of attribute names (strings). No markdown, no code blocks.'
          },
          {
            role: 'user',
            content: `Suggest persona attributes for: ${JSON.stringify(context)}`
          }
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as OpenAIResponse;
    let content = data.choices[0].message.content;
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(content);
  }
}