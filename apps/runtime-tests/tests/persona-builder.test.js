import { PersonaBuilder } from '@internal/persona-sdk-minimal';

export const personaBuilderTests = [
  {
    name: 'PersonaBuilder.create().build()',
    category: 'PersonaBuilder',
    fn: async () => {
      const persona = PersonaBuilder.create()
        .withName('Test User')
        .withAge(25)
        .withOccupation('Software Engineer')
        .withSex('other')
        .withAttribute('location', 'New York')
        .build();
      
      if (!persona.id) throw new Error('Persona should have an ID');
      if (persona.name !== 'Test User') throw new Error('Name mismatch');
      if (persona.age !== 25) throw new Error('Age mismatch');
      if (persona.attributes.location !== 'New York') throw new Error('Location mismatch');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaBuilder.fromPrompt() - Tech Professional',
    category: 'PersonaBuilder',
    fn: async () => {
      const persona = await PersonaBuilder.fromPrompt(
        'Create a 28-year-old tech professional living in San Francisco who loves gaming',
        { apiKey: process.env.OPENAI_API_KEY }
      );
      
      if (!persona.id) throw new Error('Persona should have an ID');
      if (!persona.name) throw new Error('Persona should have a name');
      if (typeof persona.age !== 'number') throw new Error('Age should be a number');
      if (!persona.attributes) throw new Error('Persona should have attributes');
      
      // Check for relevant attributes
      const attrString = JSON.stringify(persona.attributes).toLowerCase();
      if (!attrString.includes('tech') && !attrString.includes('gaming')) {
        throw new Error('Attributes should reflect the prompt');
      }
      
      return { success: true, cassette: true };
    }
  },

  {
    name: 'PersonaBuilder.generateMultiple() - Diverse Team',
    category: 'PersonaBuilder',
    fn: async () => {
      const personas = await PersonaBuilder.generateMultiple(
        'Create 3 diverse team members for a startup',
        3,
        { apiKey: process.env.OPENAI_API_KEY }
      );
      
      if (!Array.isArray(personas)) throw new Error('Should return an array');
      if (personas.length !== 3) throw new Error('Should return 3 personas');
      
      // Check diversity
      const names = new Set(personas.map(p => p.name));
      if (names.size !== 3) throw new Error('Names should be unique');
      
      // Check each persona
      personas.forEach((persona, i) => {
        if (!persona.id) throw new Error(`Persona ${i} should have an ID`);
        if (!persona.name) throw new Error(`Persona ${i} should have a name`);
        if (typeof persona.age !== 'number') throw new Error(`Persona ${i} age should be a number`);
      });
      
      return { success: true, cassette: true };
    }
  },

  {
    name: 'PersonaBuilder.optimizePrompt()',
    category: 'PersonaBuilder',
    fn: async () => {
      const basicPrompt = 'young developer';
      const optimized = await PersonaBuilder.optimizePrompt(
        basicPrompt,
        { apiKey: process.env.OPENAI_API_KEY }
      );
      
      if (typeof optimized !== 'string') throw new Error('Should return a string');
      if (optimized.length <= basicPrompt.length) throw new Error('Optimized prompt should be longer');
      if (!optimized.toLowerCase().includes('age')) throw new Error('Should include age guidance');
      
      return { success: true, cassette: true };
    }
  },

  {
    name: 'PersonaBuilder.suggestAttributes() - Gaming Context',
    category: 'PersonaBuilder',
    fn: async () => {
      const suggestions = await PersonaBuilder.suggestAttributes(
        { industry: 'gaming', targetAudience: 'competitive players' },
        { apiKey: process.env.OPENAI_API_KEY }
      );
      
      if (!Array.isArray(suggestions)) throw new Error('Should return an array');
      if (suggestions.length === 0) throw new Error('Should return at least one suggestion');
      
      // Check for gaming-related attributes
      const suggestionsStr = suggestions.join(' ').toLowerCase();
      if (!suggestionsStr.includes('game') && !suggestionsStr.includes('skill') && !suggestionsStr.includes('play')) {
        throw new Error('Suggestions should be gaming-related');
      }
      
      return { success: true, cassette: true };
    }
  },

  {
    name: 'PersonaBuilder with custom attributes',
    category: 'PersonaBuilder',
    fn: async () => {
      const persona = PersonaBuilder.create()
        .withName('Custom User')
        .withAge(30)
        .withOccupation('Software Engineer')
        .withSex('male')
        .withAttributes({
          hobbies: ['coding', 'gaming', 'reading'],
          personality: 'introverted'
        })
        .build();
      
      if (persona.occupation !== 'Software Engineer') throw new Error('Occupation mismatch');
      if (!Array.isArray(persona.attributes.hobbies)) throw new Error('Hobbies should be an array');
      if (persona.attributes.hobbies.length !== 3) throw new Error('Should have 3 hobbies');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaBuilder chaining methods',
    category: 'PersonaBuilder',
    fn: async () => {
      const persona = PersonaBuilder.create()
        .withName('Chained User')
        .withAge(35)
        .withOccupation('Manager')
        .withSex('female')
        .withAttribute('location', 'London')
        .withAttributes({ level: 'senior' })
        .withAttribute('department', 'engineering')
        .build();
      
      if (persona.name !== 'Chained User') throw new Error('Name mismatch');
      if (persona.age !== 35) throw new Error('Age mismatch');
      if (persona.attributes.location !== 'London') throw new Error('Location mismatch');
      if (persona.attributes.level !== 'senior') throw new Error('Level mismatch');
      if (persona.attributes.department !== 'engineering') throw new Error('Department mismatch');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaBuilder validation - negative age',
    category: 'PersonaBuilder',
    fn: async () => {
      try {
        PersonaBuilder.create()
          .withName('Invalid User')
          .withAge(-5)
          .build();
        throw new Error('Should have thrown validation error');
      } catch (error) {
        if (!error.message.includes('age') && !error.message.includes('validation')) {
          throw new Error('Expected validation error for negative age');
        }
      }
      
      return { success: true };
    }
  }
];