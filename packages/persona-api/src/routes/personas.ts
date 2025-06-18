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
  fastify.post('/', {
    schema: {
      description: 'Generate a single persona',
      tags: ['personas'],
      body: generatePersonaSchema,
      response: {
        201: personaResponseSchema,
      },
    },
  }, async (request, reply) => {
    const { name, attributes } = generatePersonaSchema.parse(request.body);
    
    let builder = PersonaBuilder.create();
    
    if (name) builder = builder.withName(name);
    if (attributes?.age) builder = builder.withAge(attributes.age);
    if (attributes?.occupation) builder = builder.withOccupation(attributes.occupation);
    if (attributes?.sex) builder = builder.withSex(attributes.sex);
    
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
  fastify.post('/groups', {
    schema: {
      description: 'Generate a group of personas',
      tags: ['personas'],
      body: generatePersonaGroupSchema,
      response: {
        201: personaGroupResponseSchema,
      },
    },
  }, async (request, reply) => {
    const { size, name, attributes, distributions, segments } = 
      generatePersonaGroupSchema.parse(request.body);
    
    const group = new PersonaGroup(name || `Group-${Date.now()}`);
    
    if (segments && segments.length > 0) {
      // Generate segmented personas
      await PersonaGroup.generate({
        size,
        segments: segments.map(segment => ({
          ...segment,
          attributes: segment.attributes as any,
        })),
      });
    } else if (distributions) {
      // Generate with distributions
      const distConfig: any = {};
      
      if (distributions.age) {
        distConfig.age = createDistribution(distributions.age);
      }
      if (distributions.income) {
        distConfig.income = createDistribution(distributions.income);
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
  fastify.post('/batch', {
    schema: {
      description: 'Generate multiple personas in batch',
      tags: ['personas'],
      body: z.object({
        count: z.number().int().min(1).max(1000).default(10),
        template: generatePersonaSchema.optional(),
      }),
      response: {
        201: z.object({
          personas: z.array(personaResponseSchema),
          count: z.number(),
        }),
      },
    },
  }, async (request, reply) => {
    const { count, template } = request.body as any;
    const personas = [];
    
    for (let i = 0; i < count; i++) {
      let builder = PersonaBuilder.create();
      
      if (template?.name) {
        builder = builder.withName(`${template.name} ${i + 1}`);
      }
      
      if (template?.attributes) {
        const attrs = template.attributes;
        if (attrs.age) builder = builder.withAge(attrs.age);
        if (attrs.occupation) builder = builder.withOccupation(attrs.occupation);
        if (attrs.sex) builder = builder.withSex(attrs.sex);
      }
      
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
  fastify.get('/random', {
    schema: {
      description: 'Generate a random persona',
      tags: ['personas'],
      response: {
        200: personaResponseSchema,
      },
    },
  }, async (request, reply) => {
    const ages = new NormalDistribution(35, 12);
    const occupations = ['Engineer', 'Designer', 'Manager', 'Analyst', 'Consultant'];
    
    const persona = PersonaBuilder.create()
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