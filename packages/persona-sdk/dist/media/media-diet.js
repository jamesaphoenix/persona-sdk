/**
 * Media diet system for persona groups
 * @module media/media-diet
 */
import { PersonaGroup } from '../persona-group.js';
import { Persona } from '../persona.js';
import { MediaProcessor } from './media-processor.js';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
/**
 * Media diet schema for structured output
 */
const MediaInfluenceSchema = z.object({
    influences: z.object({
        interests: z.array(z.string()).describe('New or reinforced interests'),
        values: z.array(z.string()).describe('Influenced values and beliefs'),
        vocabulary: z.array(z.string()).describe('New vocabulary or phrases adopted'),
        opinions: z.array(z.object({
            topic: z.string(),
            stance: z.string(),
            confidence: z.number().min(0).max(1)
        })).describe('Formed opinions on various topics'),
        behaviors: z.array(z.string()).describe('Behavioral changes or tendencies'),
        knowledge: z.array(z.object({
            domain: z.string(),
            level: z.enum(['basic', 'intermediate', 'advanced'])
        })).describe('Knowledge gained in different domains')
    }),
    personalityShifts: z.object({
        openness: z.number().min(-1).max(1).describe('Change in openness to experience'),
        conscientiousness: z.number().min(-1).max(1).describe('Change in conscientiousness'),
        extraversion: z.number().min(-1).max(1).describe('Change in extraversion'),
        agreeableness: z.number().min(-1).max(1).describe('Change in agreeableness'),
        neuroticism: z.number().min(-1).max(1).describe('Change in neuroticism')
    }),
    overallImpact: z.enum(['minimal', 'moderate', 'significant', 'transformative'])
});
/**
 * Media diet manager for applying media influences to personas
 */
export class MediaDietManager {
    mediaProcessor;
    model;
    constructor(apiKey) {
        this.mediaProcessor = new MediaProcessor(apiKey);
        this.model = new ChatOpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY,
            modelName: 'gpt-4-turbo-preview',
            temperature: 0.7
        });
    }
    /**
     * Create a media diet from a collection of files
     */
    async createMediaDiet(files, defaultPattern) {
        const items = [];
        for (const file of files) {
            const content = await this.mediaProcessor.processFile(file);
            const analysis = await this.mediaProcessor.analyzeMediaForPersona(content);
            // Extract category and source from analysis
            const categoryMatch = analysis.analysis.match(/category[:\s]+([^\n,]+)/i);
            const category = categoryMatch ? categoryMatch[1].trim() : 'general';
            items.push({
                content,
                frequency: 'daily', // Default, could be inferred
                engagement: 'passive', // Default, could be inferred
                source: file,
                category
            });
        }
        const patterns = {
            preferredTypes: [...new Set(items.map(item => item.content.type))],
            peakHours: defaultPattern?.peakHours || [20, 21, 22], // Evening by default
            avgDailyConsumption: defaultPattern?.avgDailyConsumption || 120, // 2 hours
            platforms: defaultPattern?.platforms || ['web', 'mobile'],
            interests: [...new Set(items.map(item => item.category))]
        };
        return {
            items,
            patterns
        };
    }
    /**
     * Apply media diet influences to a single persona
     */
    async applyMediaInfluence(persona, diet) {
        const systemPrompt = `You are analyzing how media consumption influences a persona's characteristics.
Given a persona and their media diet, determine how their exposure to this content would shape their:
- Interests and hobbies
- Values and beliefs
- Communication style and vocabulary
- Opinions on various topics
- Knowledge domains
- Personality traits

Consider the frequency, duration, and engagement level with each media item.`;
        const personaDescription = JSON.stringify(persona.toObject(), null, 2);
        const dietDescription = JSON.stringify(diet, null, 2);
        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(`
Persona:
${personaDescription}

Media Diet:
${dietDescription}

Analyze how this media diet would influence this persona over time.
`)
        ];
        // Use structured output
        const structuredModel = this.model.withStructuredOutput(MediaInfluenceSchema);
        const result = await structuredModel.invoke(messages);
        // Apply influences to persona attributes
        const influencedAttributes = {
            ...persona.attributes
        };
        // Add new interests
        if (result.influences.interests.length > 0) {
            const currentInterests = Array.isArray(influencedAttributes.interests)
                ? influencedAttributes.interests
                : [];
            influencedAttributes.interests = [
                ...new Set([...currentInterests, ...result.influences.interests])
            ];
        }
        // Add vocabulary
        if (result.influences.vocabulary.length > 0) {
            influencedAttributes.vocabulary = result.influences.vocabulary;
        }
        // Add opinions
        if (result.influences.opinions.length > 0) {
            influencedAttributes.opinions = result.influences.opinions;
        }
        // Apply personality shifts
        const personalityAttributes = [
            'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'
        ];
        personalityAttributes.forEach(trait => {
            const shift = result.personalityShifts[trait];
            if (shift !== 0 && typeof influencedAttributes[trait] === 'number') {
                influencedAttributes[trait] = Math.max(0, Math.min(1, influencedAttributes[trait] + shift * 0.1 // Apply 10% of the shift
                ));
            }
        });
        // Create new persona with influences and ensure proper type
        const properAttributes = {
            age: influencedAttributes.age || persona.attributes.age,
            occupation: influencedAttributes.occupation || persona.attributes.occupation,
            sex: influencedAttributes.sex || persona.attributes.sex,
            ...influencedAttributes
        };
        const influencedPersona = new Persona(`${persona.name} (Media Influenced)`, properAttributes);
        // Calculate confidence based on media diet size and engagement
        const confidence = Math.min(1, diet.items.length * 0.1 + 0.5);
        return {
            persona: influencedPersona,
            influences: result.influences,
            confidence,
            usage: {
                input_tokens: this.mediaProcessor.countTokens(messages.join('\n')),
                output_tokens: this.mediaProcessor.countTokens(JSON.stringify(result)),
                total_tokens: 0
            }
        };
    }
    /**
     * Apply media diet to entire persona group
     */
    async applyToPersonaGroup(group, diet, options) {
        const personas = options?.sampleSize
            ? group.personas.slice(0, options.sampleSize)
            : group.personas;
        const results = [];
        const totalUsage = {
            input_tokens: 0,
            output_tokens: 0,
            total_tokens: 0
        };
        const influencedGroup = new PersonaGroup(`${group.name} (Media Influenced)`);
        for (const persona of personas) {
            // Apply variation if specified
            let personalizedDiet = diet;
            if (options?.variationFactor) {
                personalizedDiet = this.varyMediaDiet(diet, options.variationFactor);
            }
            const result = await this.applyMediaInfluence(persona, personalizedDiet);
            results.push(result);
            influencedGroup.add(result.persona);
            if (result.usage) {
                totalUsage.input_tokens += result.usage.input_tokens;
                totalUsage.output_tokens += result.usage.output_tokens;
            }
        }
        totalUsage.total_tokens = totalUsage.input_tokens + totalUsage.output_tokens;
        return {
            influencedGroup,
            results,
            totalUsage
        };
    }
    /**
     * Create variations in media diet for different personas
     */
    varyMediaDiet(diet, variationFactor) {
        // Randomly sample items based on variation factor
        const itemCount = Math.max(1, Math.floor(diet.items.length * (1 - variationFactor * Math.random())));
        const sampledItems = diet.items
            .sort(() => Math.random() - 0.5)
            .slice(0, itemCount);
        return {
            ...diet,
            items: sampledItems
        };
    }
    /**
     * Generate media recommendations for a persona
     */
    async recommendMedia(persona, availableMedia, preferences) {
        const prompt = `Given this persona and available media content, recommend media that would:
${preferences?.desiredInfluences ? `- Develop these qualities: ${preferences.desiredInfluences.join(', ')}` : ''}
${preferences?.avoidTopics ? `- Avoid these topics: ${preferences.avoidTopics.join(', ')}` : ''}
- Align with their current interests
- Expand their horizons appropriately
- Match their consumption patterns

Provide 3-5 media recommendations with reasoning.`;
        const messages = [
            new SystemMessage('You are a media recommendation expert.'),
            new HumanMessage(`
Persona: ${JSON.stringify(persona.toObject(), null, 2)}

Available Media: ${availableMedia.length} items
${availableMedia.slice(0, 5).map(m => `- ${m.type}: ${m.metadata?.title || 'Untitled'}`).join('\n')}

${prompt}
`)
        ];
        const response = await this.model.invoke(messages);
        // Parse recommendations (in real implementation, would use structured output)
        const recommendations = [];
        const inputTokens = this.mediaProcessor.countTokens(messages.map(m => m.content).join('\n'));
        const outputTokens = this.mediaProcessor.countTokens(response.content);
        return {
            recommendations,
            reasoning: response.content,
            usage: {
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                total_tokens: inputTokens + outputTokens
            }
        };
    }
}
//# sourceMappingURL=media-diet.js.map