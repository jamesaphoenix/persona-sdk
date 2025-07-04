import { PersonaBuilder } from '../persona-builder.js';
/**
 * AI-powered persona generation methods
 */
export class PersonaAI {
    /**
     * Generate a persona from a text prompt using OpenAI
     */
    static async fromPrompt(prompt, options) {
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
        const data = await response.json();
        let content = data.choices[0].message.content;
        // Remove markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        // Fix common JSON issues
        // Replace smart quotes with regular quotes
        content = content.replace(/[""]/g, '"').replace(/['']/g, "'");
        // Try to extract JSON object if the response contains extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }
        let personaData;
        try {
            personaData = JSON.parse(content);
        }
        catch (e) {
            console.error('Failed to parse JSON:', content);
            throw new Error(`Failed to parse persona JSON: ${e instanceof Error ? e.message : String(e)}`);
        }
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
    static async generateMultiple(prompt, count, options) {
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
        const data = await response.json();
        let content = data.choices[0].message.content;
        // Remove markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        // Fix common JSON issues
        // Replace smart quotes with regular quotes
        content = content.replace(/[""]/g, '"').replace(/['']/g, "'");
        // Try to extract JSON array if the response contains extra text
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }
        let personasData;
        try {
            personasData = JSON.parse(content);
            if (!Array.isArray(personasData)) {
                throw new Error('Response is not an array');
            }
        }
        catch (e) {
            console.error('Failed to parse JSON:', content);
            throw new Error(`Failed to parse personas JSON: ${e instanceof Error ? e.message : String(e)}`);
        }
        return personasData.map((personaData) => {
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
    static async optimizePrompt(basePrompt, options) {
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
        const data = await response.json();
        return data.choices[0].message.content;
    }
    /**
     * Suggest attributes based on context
     */
    static async suggestAttributes(context, options) {
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
        const data = await response.json();
        let content = data.choices[0].message.content;
        // Remove markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(content);
    }
}
//# sourceMappingURL=persona-ai.js.map