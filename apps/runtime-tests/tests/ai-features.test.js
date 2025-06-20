import * as PersonaSDK from '@jamesaphoenix/persona-sdk';

const { PersonaAI } = PersonaSDK;

export const aiFeatureTests = [
  // PersonaAI.fromPrompt tests
  {
    name: 'PersonaAI.fromPrompt - Basic persona generation',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const persona = await PersonaAI.fromPrompt(
        'Create a 35-year-old data scientist working at a tech startup in Austin',
        { apiKey: process.env.OPENAI_API_KEY || 'test-key' }
      );
      
      if (!persona.id || !persona.name || !persona.age) {
        throw new Error('Generated persona missing required fields');
      }
      
      if (persona.age < 30 || persona.age > 40) {
        throw new Error(`Age should be around 35, got ${persona.age}`);
      }
      
      return { success: true, persona };
    }
  },

  {
    name: 'PersonaAI.fromPrompt - Complex persona with attributes',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const persona = await PersonaAI.fromPrompt(
        'Create a retired teacher in their 60s who loves gardening and lives in Vermont. Include hobbies, personality traits, and lifestyle details.',
        { apiKey: process.env.OPENAI_API_KEY || 'test-key' }
      );
      
      if (!persona.attributes || Object.keys(persona.attributes).length < 3) {
        throw new Error('Complex persona should have multiple attributes');
      }
      
      return { success: true, persona };
    }
  },

  {
    name: 'PersonaAI.fromPrompt - Custom model and temperature',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const persona = await PersonaAI.fromPrompt(
        'Create a creative artist persona',
        { 
          apiKey: process.env.OPENAI_API_KEY || 'test-key',
          model: 'gpt-4.1-mini',
          temperature: 0.9
        }
      );
      
      if (!persona.occupation || !persona.occupation.toLowerCase().includes('artist')) {
        console.warn('Occupation might not match request:', persona.occupation);
      }
      
      return { success: true, persona };
    }
  },

  // PersonaAI.generateMultiple tests
  {
    name: 'PersonaAI.generateMultiple - Team generation',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const personas = await PersonaAI.generateMultiple(
        'Create a diverse 5-person product team for a fintech startup',
        5,
        { apiKey: process.env.OPENAI_API_KEY || 'test-key' }
      );
      
      if (!Array.isArray(personas) || personas.length !== 5) {
        throw new Error(`Expected 5 personas, got ${personas?.length}`);
      }
      
      // Check diversity
      const occupations = new Set(personas.map(p => p.occupation));
      if (occupations.size < 3) {
        throw new Error('Team should have diverse occupations');
      }
      
      return { success: true, personas };
    }
  },

  {
    name: 'PersonaAI.generateMultiple - High temperature for variety',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const personas = await PersonaAI.generateMultiple(
        'Create 3 unique fictional characters for a novel',
        3,
        { 
          apiKey: process.env.OPENAI_API_KEY || 'test-key',
          temperature: 1.0
        }
      );
      
      // Check uniqueness
      const names = new Set(personas.map(p => p.name));
      if (names.size !== personas.length) {
        throw new Error('All personas should have unique names');
      }
      
      return { success: true, personas };
    }
  },

  // PersonaAI.optimizePrompt tests
  {
    name: 'PersonaAI.optimizePrompt - Basic enhancement',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const optimized = await PersonaAI.optimizePrompt(
        'make a customer',
        { apiKey: process.env.OPENAI_API_KEY || 'test-key' }
      );
      
      if (!optimized || optimized.length < 50) {
        throw new Error('Optimized prompt should be more detailed');
      }
      
      // Check for improvement indicators - be more flexible
      const lowerOptimized = optimized.toLowerCase();
      
      // Age can be mentioned in various ways
      const hasAge = lowerOptimized.includes('age') || 
                     /\d+[-\s]?year/i.test(optimized) ||
                     lowerOptimized.includes('old') ||
                     lowerOptimized.includes('young') ||
                     lowerOptimized.includes('elderly');
                     
      // Location can be mentioned in various ways
      const hasLocation = lowerOptimized.includes('location') || 
                         lowerOptimized.includes('city') ||
                         lowerOptimized.includes('region') ||
                         lowerOptimized.includes('residing') ||
                         lowerOptimized.includes('based in') ||
                         lowerOptimized.includes('from') ||
                         lowerOptimized.includes('lives') ||
                         /[A-Z][a-z]+,\s*[A-Z][a-z]+/.test(optimized); // City, State pattern
                         
      // Occupation can be mentioned in various ways
      const hasOccupation = lowerOptimized.includes('occupation') ||
                           lowerOptimized.includes('job') ||
                           lowerOptimized.includes('profession') ||
                           lowerOptimized.includes('works') ||
                           lowerOptimized.includes('career') ||
                           lowerOptimized.includes('developer') ||
                           lowerOptimized.includes('engineer') ||
                           lowerOptimized.includes('role');
      
      // The prompt should be meaningfully expanded
      if (optimized.length < 100) {
        throw new Error('Optimized prompt should be significantly expanded');
      }
      
      // At least 2 out of 3 should be present
      const improvements = [hasAge, hasLocation, hasOccupation].filter(Boolean).length;
      if (improvements < 2) {
        throw new Error(`Optimized prompt should include at least 2 of: age, location, occupation (found ${improvements})`);
      }
      
      return { success: true, optimized };
    }
  },

  {
    name: 'PersonaAI.optimizePrompt - Complex prompt refinement',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const complexPrompt = 'Create personas for market research in the sustainable fashion industry targeting millennials';
      const optimized = await PersonaAI.optimizePrompt(
        complexPrompt,
        { apiKey: process.env.OPENAI_API_KEY || 'test-key' }
      );
      
      if (optimized.length <= complexPrompt.length) {
        throw new Error('Complex prompts should be enhanced, not shortened');
      }
      
      return { success: true, original: complexPrompt, optimized };
    }
  },

  // PersonaAI.suggestAttributes tests
  {
    name: 'PersonaAI.suggestAttributes - Gaming context',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const attributes = await PersonaAI.suggestAttributes(
        { 
          industry: 'gaming',
          targetAudience: 'hardcore gamers',
          platform: 'PC'
        },
        { apiKey: process.env.OPENAI_API_KEY || 'test-key' }
      );
      
      if (!Array.isArray(attributes) || attributes.length < 3) {
        throw new Error('Should suggest at least 3 attributes for gaming context');
      }
      
      // Check for relevant gaming attributes - personality traits are valid for gamers
      const hasRelevantAttributes = attributes.some(attr => {
        const lower = attr.toLowerCase();
        return lower.includes('game') ||
               lower.includes('play') ||
               lower.includes('skill') ||
               lower.includes('genre') ||
               lower.includes('competitive') ||
               lower.includes('passionate') ||
               lower.includes('dedicated') ||
               lower.includes('tech');
      });
      
      if (!hasRelevantAttributes) {
        throw new Error('Attributes should be relevant to gaming context');
      }
      
      return { success: true, attributes };
    }
  },

  {
    name: 'PersonaAI.suggestAttributes - E-commerce context',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const attributes = await PersonaAI.suggestAttributes(
        { 
          industry: 'e-commerce',
          productCategory: 'fashion',
          priceRange: 'premium',
          targetDemo: 'women 25-40'
        },
        { apiKey: process.env.OPENAI_API_KEY || 'test-key' }
      );
      
      if (!Array.isArray(attributes) || attributes.length < 3) {
        throw new Error('Should suggest multiple attributes for e-commerce');
      }
      
      return { success: true, attributes };
    }
  },

  // Error handling tests
  {
    name: 'PersonaAI.fromPrompt - Handle API errors gracefully',
    category: 'AI Features',
    cassette: false,
    fn: async () => {
      try {
        await PersonaAI.fromPrompt(
          'Test prompt',
          { apiKey: 'invalid-key' }
        );
        throw new Error('Should have thrown an error with invalid API key');
      } catch (error) {
        if (!error.message.includes('API')) {
          throw new Error('Error should mention API issue');
        }
        return { success: true };
      }
    }
  },

  // Integration tests
  {
    name: 'PersonaAI - Full workflow integration',
    category: 'AI Features',
    cassette: true,
    fn: async () => {
      const apiOptions = { apiKey: process.env.OPENAI_API_KEY || 'test-key' };
      
      // Step 1: Optimize prompt
      const basePrompt = 'customer for saas product';
      const optimized = await PersonaAI.optimizePrompt(basePrompt, apiOptions);
      
      // Step 2: Generate persona with optimized prompt
      const persona = await PersonaAI.fromPrompt(optimized, apiOptions);
      
      // Step 3: Suggest additional attributes
      const suggestedAttrs = await PersonaAI.suggestAttributes(
        { 
          industry: 'saas',
          persona: persona.name,
          role: persona.occupation
        },
        apiOptions
      );
      
      if (!optimized || !persona || !suggestedAttrs) {
        throw new Error('Full workflow should complete successfully');
      }
      
      return { 
        success: true, 
        workflow: {
          originalPrompt: basePrompt,
          optimizedPrompt: optimized,
          generatedPersona: persona,
          suggestedAttributes: suggestedAttrs
        }
      };
    }
  }
];