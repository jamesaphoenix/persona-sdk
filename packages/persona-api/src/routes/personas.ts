import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { 
  PersonaBuilder, 
  PersonaGroup,
  NormalDistribution,
  UniformDistribution,
  BetaDistribution,
  ExponentialDistribution
} from '@jamesaphoenix/persona-sdk';
import type { PersonaAttributes } from '@jamesaphoenix/persona-sdk';

// Request/Response schemas
const generatePersonaSchema = z.object({
  name: z.string().optional(),
  attributes: z.object({
    age: z.number().int().min(0).max(150).optional(),
    occupation: z.string().optional(),
    sex: z.enum(['male', 'female', 'other']).optional(),
  }).passthrough().optional(),
});

const generatePersonaGroupSchema = z.object({
  size: z.number().int().min(1).max(10000).default(100),
  name: z.string().optional(),
  attributes: z.record(z.any()).optional(),
  distributions: z.object({
    age: z.object({
      type: z.enum(['normal', 'uniform', 'beta', 'exponential']),
      params: z.record(z.number()),
    }).optional(),
    income: z.object({
      type: z.enum(['normal', 'uniform', 'beta', 'exponential']),
      params: z.record(z.number()),
    }).optional(),
  }).optional(),
  segments: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0).max(1),
    attributes: z.record(z.any()),
  })).optional(),
});

const personaResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  attributes: z.record(z.any()),
  created_at: z.string(),
});

const personaGroupResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  personas: z.array(personaResponseSchema),
  statistics: z.record(z.any()),
  created_at: z.string(),
});

// Helper to create distributions
const createDistribution = (config: any) => {
  const { type, params } = config;
  
  switch (type) {
    case 'normal':
      return new NormalDistribution(params.mean, params.stdDev);
    case 'uniform':
      return new UniformDistribution(params.min, params.max);
    case 'beta':
      return new BetaDistribution(params.alpha, params.beta);
    case 'exponential':
      return new ExponentialDistribution(params.lambda);
    default:
      throw new Error(`Unknown distribution type: ${type}`);
  }
};

export const personaRoutes: FastifyPluginAsync = async (fastify) => {
  // Generate a single persona
  fastify.post('/', async (request, reply) => {
    const { name, attributes } = generatePersonaSchema.parse(request.body);
    
    let builder = PersonaBuilder.create();
    
    // Set name with default if not provided
    builder = builder.withName(name || 'Generated Persona');
    
    // Set required attributes with defaults
    builder = builder.withAge(attributes?.age || 30);
    builder = builder.withOccupation(attributes?.occupation || 'Professional');
    builder = builder.withSex(attributes?.sex || 'other');
    
    // Add any additional attributes
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (!['age', 'occupation', 'sex'].includes(key)) {
          builder = builder.withAttribute(key, value as any);
        }
      });
    }
    
    const persona = builder.build();
    
    reply.status(201).send({
      id: persona.id,
      name: persona.name,
      attributes: persona.attributes,
      created_at: new Date().toISOString(),
    });
  });

  // Generate a persona group
  fastify.post('/groups', async (request, reply) => {
    const { size, name, attributes, distributions, segments } = 
      generatePersonaGroupSchema.parse(request.body);
    
    const group = new PersonaGroup(name || `Group-${Date.now()}`);
    
    if (segments && segments.length > 0) {
      // Generate segmented personas
      const generatedGroup = await PersonaGroup.generate({
        size,
        segments: segments.map(segment => ({
          ...segment,
          attributes: {
            // Ensure required fields have defaults
            age: new NormalDistribution(30, 5),
            occupation: 'Professional',
            sex: 'other',
            // Add segment-specific attributes
            ...segment.attributes,
          } as any,
        })),
      });
      // Add all personas from generated group to our group
      generatedGroup.personas.forEach(p => group.add(p));
    } else if (distributions) {
      // Generate with distributions
      const distConfig: any = {};
      
      if (distributions.age) {
        distConfig.age = createDistribution(distributions.age);
      }
      if (distributions.income) {
        distConfig.income = createDistribution(distributions.income);
      }
      
      // Ensure required fields have defaults if not provided
      if (!distConfig.age && !attributes?.age) {
        distConfig.age = new NormalDistribution(30, 5);
      }
      if (!distConfig.occupation && !attributes?.occupation) {
        distConfig.occupation = 'Professional';
      }
      if (!distConfig.sex && !attributes?.sex) {
        distConfig.sex = 'other';
      }
      
      // Add any static attributes
      if (attributes) {
        Object.assign(distConfig, attributes);
      }
      
      group.generateFromDistributions(size, distConfig);
    } else {
      // Generate with static attributes
      for (let i = 0; i < size; i++) {
        const persona = PersonaBuilder.create()
          .withName(`Person ${i + 1}`)
          .withAge(30)
          .withOccupation('Professional')
          .withSex('other')
          .withAttribute('index', i)
          .build();
        group.add(persona);
      }
    }
    
    // Calculate statistics
    const stats: any = {};
    const numericAttributes = ['age', 'income', 'score'];
    
    numericAttributes.forEach(attr => {
      try {
        const attrStats = group.getStatistics(attr);
        if (attrStats.count > 0) {
          stats[attr] = attrStats;
        }
      } catch (e) {
        // Attribute doesn't exist
      }
    });
    
    reply.status(201).send({
      id: `group-${Date.now()}`,
      name: group.name,
      size: group.size,
      personas: group.personas.slice(0, 10).map(p => ({
        id: p.id,
        name: p.name,
        attributes: p.attributes,
        created_at: new Date().toISOString(),
      })),
      statistics: stats,
      created_at: new Date().toISOString(),
    });
  });

  // Batch generate personas
  fastify.post('/batch', async (request, reply) => {
    const { count, template } = request.body as any;
    const personas = [];
    
    for (let i = 0; i < count; i++) {
      let builder = PersonaBuilder.create();
      
      // Set name with default
      builder = builder.withName(template?.name ? `${template.name} ${i + 1}` : `Person ${i + 1}`);
      
      // Set required attributes with defaults
      const attrs = template?.attributes || {};
      builder = builder.withAge(attrs.age || 30);
      builder = builder.withOccupation(attrs.occupation || 'Professional');
      builder = builder.withSex(attrs.sex || 'other');
      
      const persona = builder.build();
      personas.push({
        id: persona.id,
        name: persona.name,
        attributes: persona.attributes,
        created_at: new Date().toISOString(),
      });
    }
    
    reply.status(201).send({
      personas,
      count: personas.length,
    });
  });

  // Generate random persona
  fastify.get('/random', async (request, reply) => {
    // Create a seeded distribution for consistency
    const ages = new NormalDistribution(35, 12, Math.floor(Math.random() * 10000));
    const occupations = ['Engineer', 'Designer', 'Manager', 'Analyst', 'Consultant'];
    
    const persona = PersonaBuilder.create()
      .withName('Random Persona')
      .withAge(Math.max(18, Math.min(80, Math.round(ages.sample()))))
      .withOccupation(occupations[Math.floor(Math.random() * occupations.length)])
      .withSex(['male', 'female', 'other'][Math.floor(Math.random() * 3)] as any)
      .withAttribute('generated_type', 'random')
      .build();
    
    return {
      id: persona.id,
      name: persona.name,
      attributes: persona.attributes,
      created_at: new Date().toISOString(),
    };
  });
};