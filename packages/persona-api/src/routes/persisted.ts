// @ts-nocheck
/**
 * Persisted persona routes using PostgreSQL
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { 
  PersonaBuilder,
  PersonaGroup,
  NormalDistribution,
  UniformDistribution,
  BetaDistribution,
  ExponentialDistribution,
  CategoricalDistribution,
  StructuredOutputGenerator
} from '@jamesaphoenix/persona-sdk';
import { v4 as uuidv4 } from 'uuid';

// Schema definitions
const GeneratePersistedPersonaSchema = z.object({
  name: z.string().optional(),
  attributes: z.object({
    age: z.union([
      z.number().int().positive(),
      z.object({
        distribution: z.literal('normal'),
        mean: z.number(),
        stdDev: z.number()
      }),
      z.object({
        distribution: z.literal('uniform'),
        min: z.number(),
        max: z.number()
      })
    ]).optional(),
    income: z.union([
      z.number().positive(),
      z.object({
        distribution: z.literal('exponential'),
        lambda: z.number().positive()
      })
    ]).optional(),
    interests: z.array(z.string()).optional(),
    occupation: z.string().optional(),
    sex: z.enum(['male', 'female', 'other']).optional(),
    satisfaction: z.union([
      z.number().min(0).max(1),
      z.object({
        distribution: z.literal('beta'),
        alpha: z.number().positive(),
        beta: z.number().positive()
      })
    ]).optional()
  }).optional()
});

const GeneratePersistedGroupSchema = z.object({
  name: z.string(),
  size: z.number().int().positive().max(1000),
  distributions: z.object({
    age: z.object({
      type: z.enum(['normal', 'uniform']),
      params: z.record(z.number())
    }).optional(),
    income: z.object({
      type: z.enum(['exponential', 'normal']),
      params: z.record(z.number())
    }).optional(),
    satisfaction: z.object({
      type: z.enum(['beta', 'uniform']),
      params: z.record(z.number())
    }).optional()
  }).optional()
});

const QueryPersonasSchema = z.object({
  filters: z.object({
    ageMin: z.number().optional(),
    ageMax: z.number().optional(),
    incomeMin: z.number().optional(),
    incomeMax: z.number().optional(),
    occupation: z.string().optional(),
    sex: z.enum(['male', 'female', 'other']).optional()
  }).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
  orderBy: z.enum(['created_at', 'age', 'income']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});

const AnalyzePersistedCTRSchema = z.object({
  groupId: z.string().uuid(),
  platforms: z.array(z.enum(['instagram', 'twitter', 'linkedin', 'tiktok'])),
  contentType: z.enum(['educational', 'promotional', 'entertainment', 'news'])
});

const SimulatePersistedSurveySchema = z.object({
  groupId: z.string().uuid(),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    type: z.enum(['multiple_choice', 'rating', 'yes_no']),
    options: z.array(z.string()).optional()
  }))
});

export const persistedRoutes: FastifyPluginAsync = async (server) => {
  // Generate and persist a single persona
  server.post('/generate', {
    schema: {
      tags: ['persisted'],
      summary: 'Generate and persist a single persona',
      description: 'Create a new persona with optional distribution-based attributes and store in PostgreSQL',
      body: GeneratePersistedPersonaSchema,
      response: {
        200: z.object({
          id: z.string(),
          persona: z.object({
            id: z.string(),
            name: z.string(),
            attributes: z.record(z.unknown()),
            createdAt: z.string()
          })
        })
      }
    }
  }, async (request, reply) => {
    if (!server.db) {
      return reply.code(503).send({
        error: 'Database not available',
        message: 'PostgreSQL connection not configured'
      });
    }

    const { name, attributes } = request.body as z.infer<typeof GeneratePersistedPersonaSchema>;
    
    // Build persona
    let builder = PersonaBuilder.create();
    
    if (name) {
      builder = builder.withName(name);
    }
    
    // Process attributes with distributions
    if (attributes?.age) {
      if (typeof attributes.age === 'number') {
        builder = builder.withAge(attributes.age);
      } else if (attributes.age.distribution === 'normal') {
        const dist = new NormalDistribution(attributes.age.mean, attributes.age.stdDev);
        builder = builder.withAge(Math.round(dist.sample()));
      } else if (attributes.age.distribution === 'uniform') {
        const dist = new UniformDistribution(attributes.age.min, attributes.age.max);
        builder = builder.withAge(Math.round(dist.sample()));
      }
    }
    
    if (attributes?.income) {
      if (typeof attributes.income === 'number') {
        builder = builder.withAttribute('income', attributes.income);
      } else if (attributes.income.distribution === 'exponential') {
        const dist = new ExponentialDistribution(attributes.income.lambda);
        builder = builder.withAttribute('income', Math.round(dist.sample()));
      }
    }
    
    if (attributes?.satisfaction) {
      if (typeof attributes.satisfaction === 'number') {
        builder = builder.withAttribute('satisfaction', attributes.satisfaction);
      } else if (attributes.satisfaction.distribution === 'beta') {
        const dist = new BetaDistribution(attributes.satisfaction.alpha, attributes.satisfaction.beta);
        builder = builder.withAttribute('satisfaction', dist.sample());
      }
    }
    
    if (attributes?.interests) {
      builder = builder.withAttribute('interests', attributes.interests);
    }
    
    if (attributes?.occupation) {
      builder = builder.withOccupation(attributes.occupation);
    }
    
    if (attributes?.sex) {
      builder = builder.withSex(attributes.sex);
    }
    
    const persona = builder.build();
    
    // Persist to database
    const result = await server.db.adapter.createPersona({
      name: persona.name,
      attributes: persona.attributes,
      metadata: {
        generatedAt: new Date().toISOString(),
        apiVersion: '1.0.0'
      }
    });
    
    return reply.send({
      id: result.id,
      persona: {
        id: result.id,
        name: result.name,
        attributes: result.attributes,
        createdAt: result.created_at
      }
    });
  });

  // Generate and persist a group of personas
  server.post('/groups/generate', {
    schema: {
      tags: ['persisted'],
      summary: 'Generate and persist a group of personas',
      description: 'Create a new group with multiple personas using statistical distributions and store in PostgreSQL',
      body: GeneratePersistedGroupSchema,
      response: {
        200: z.object({
          id: z.string(),
          group: z.object({
            id: z.string(),
            name: z.string(),
            size: z.number(),
            createdAt: z.string()
          }),
          personas: z.array(z.object({
            id: z.string(),
            name: z.string(),
            attributes: z.record(z.unknown())
          }))
        })
      }
    }
  }, async (request, reply) => {
    if (!server.db) {
      return reply.code(503).send({
        error: 'Database not available',
        message: 'PostgreSQL connection not configured'
      });
    }

    const { name, size, distributions } = request.body as z.infer<typeof GeneratePersistedGroupSchema>;
    const group = new PersonaGroup(name);
    
    // Generate personas based on distributions
    for (let i = 0; i < size; i++) {
      let builder = PersonaBuilder.create()
        .withName(`${name} Member ${i + 1}`);
      
      // Apply distributions
      if (distributions?.age) {
        if (distributions.age.type === 'normal') {
          const dist = new NormalDistribution(
            distributions.age.params.mean!,
            distributions.age.params.stdDev!
          );
          builder = builder.withAge(Math.round(dist.sample()));
        } else if (distributions.age.type === 'uniform') {
          const dist = new UniformDistribution(
            distributions.age.params.min!,
            distributions.age.params.max!
          );
          builder = builder.withAge(Math.round(dist.sample()));
        }
      }
      
      if (distributions?.income) {
        if (distributions.income.type === 'exponential') {
          const dist = new ExponentialDistribution(distributions.income.params.lambda!);
          builder = builder.withAttribute('income', Math.round(dist.sample()));
        } else if (distributions.income.type === 'normal') {
          const dist = new NormalDistribution(
            distributions.income.params.mean!,
            distributions.income.params.stdDev!
          );
          builder = builder.withAttribute('income', Math.round(dist.sample()));
        }
      }
      
      if (distributions?.satisfaction) {
        if (distributions.satisfaction.type === 'beta') {
          const dist = new BetaDistribution(
            distributions.satisfaction.params.alpha!,
            distributions.satisfaction.params.beta!
          );
          builder = builder.withAttribute('satisfaction', dist.sample());
        } else if (distributions.satisfaction.type === 'uniform') {
          const dist = new UniformDistribution(
            distributions.satisfaction.params.min!,
            distributions.satisfaction.params.max!
          );
          builder = builder.withAttribute('satisfaction', dist.sample());
        }
      }
      
      group.add(builder.build());
    }
    
    // Persist group to database
    const groupResult = await server.db.adapter.createPersonaGroup({
      name: group.name,
      description: `Generated group of ${size} personas`,
      metadata: {
        distributions,
        generatedAt: new Date().toISOString()
      }
    });
    
    // Persist all personas and add to group
    const personaResults = await Promise.all(
      group.personas.map(persona => 
        server.db.adapter.createPersona({
          name: persona.name,
          attributes: persona.attributes,
          metadata: {
            groupId: groupResult.id
          }
        })
      )
    );
    
    // Add personas to group
    await Promise.all(
      personaResults.map(persona =>
        server.db.adapter.addPersonaToGroup(persona.id, groupResult.id)
      )
    );
    
    return reply.send({
      id: groupResult.id,
      group: {
        id: groupResult.id,
        name: groupResult.name,
        size: personaResults.length,
        createdAt: groupResult.created_at
      },
      personas: personaResults.map(p => ({
        id: p.id,
        name: p.name,
        attributes: p.attributes
      }))
    });
  });

  // Query persisted personas
  server.post('/query', {
    schema: {
      tags: ['persisted'],
      summary: 'Query persisted personas',
      description: 'Search and filter personas stored in PostgreSQL with pagination',
      body: QueryPersonasSchema,
      response: {
        200: z.object({
          personas: z.array(z.object({
            id: z.string(),
            name: z.string(),
            attributes: z.record(z.unknown()),
            createdAt: z.string()
          })),
          pagination: z.object({
            total: z.number(),
            limit: z.number(),
            offset: z.number(),
            hasMore: z.boolean()
          })
        })
      }
    }
  }, async (request, reply) => {
    if (!server.db) {
      return reply.code(503).send({
        error: 'Database not available',
        message: 'PostgreSQL connection not configured'
      });
    }

    const { filters, limit, offset, orderBy, order } = request.body as z.infer<typeof QueryPersonasSchema>;
    
    // Build where clause
    const where: any = {};
    if (filters) {
      if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
        where["attributes->>'age'"] = {};
        if (filters.ageMin !== undefined) {
          where["attributes->>'age'"][">="] = filters.ageMin.toString();
        }
        if (filters.ageMax !== undefined) {
          where["attributes->>'age'"]["<="] = filters.ageMax.toString();
        }
      }
      
      if (filters.incomeMin !== undefined || filters.incomeMax !== undefined) {
        where["attributes->>'income'"] = {};
        if (filters.incomeMin !== undefined) {
          where["attributes->>'income'"][">="] = filters.incomeMin.toString();
        }
        if (filters.incomeMax !== undefined) {
          where["attributes->>'income'"]["<="] = filters.incomeMax.toString();
        }
      }
      
      if (filters.occupation) {
        where["attributes->>'occupation'"] = filters.occupation;
      }
      
      if (filters.sex) {
        where["attributes->>'sex'"] = filters.sex;
      }
    }
    
    const result = await server.db.adapter.queryPersonas({
      where,
      limit,
      offset,
      orderBy: orderBy === 'created_at' ? 'created_at' : `attributes->>'${orderBy}'`,
      order
    });
    
    return reply.send({
      personas: result.data.map(p => ({
        id: p.id,
        name: p.name,
        attributes: p.attributes,
        createdAt: p.created_at
      })),
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore
      }
    });
  });

  // Analyze CTR with persisted group
  server.post('/analyze/ctr', {
    schema: {
      tags: ['persisted'],
      summary: 'Analyze CTR for persisted group',
      description: 'Perform AI-powered CTR analysis on a persisted persona group across multiple platforms',
      body: AnalyzePersistedCTRSchema,
      response: {
        200: z.object({
          id: z.string(),
          groupId: z.string(),
          analysis: z.object({
            platformAnalysis: z.record(z.object({
              baseCTR: z.number(),
              adjustedCTR: z.number(),
              engagementFactors: z.array(z.string())
            })),
            recommendations: z.array(z.string()),
            summary: z.string()
          }),
          createdAt: z.string()
        })
      }
    }
  }, async (request, reply) => {
    if (!server.db) {
      return reply.code(503).send({
        error: 'Database not available',
        message: 'PostgreSQL connection not configured'
      });
    }

    const { groupId, platforms, contentType } = request.body;
    
    // Fetch group and personas
    const group = await server.db.adapter.getPersonaGroup(groupId);
    if (!group) {
      return reply.code(404).send({
        error: 'Group not found',
        message: `No group found with ID: ${groupId}`
      });
    }
    
    const personas = await server.db.adapter.getPersonasInGroup(groupId);
    if (personas.length === 0) {
      return reply.code(400).send({
        error: 'Empty group',
        message: 'Group has no personas'
      });
    }
    
    // Reconstruct PersonaGroup
    const personaGroup = new PersonaGroup(group.name);
    personas.forEach(p => {
      personaGroup.add({
        id: p.id,
        name: p.name,
        attributes: p.attributes
      } as any);
    });
    
    // Use AI generator or mock
    const generator = process.env.OPENAI_API_KEY && process.env.MOCK_OPENAI !== 'true'
      ? new StructuredOutputGenerator({ 
          apiKey: process.env.OPENAI_API_KEY,
          model: 'gpt-4o-mini'
        })
      : {
          analyzeCTR: async () => ({
            platformAnalysis: {
              instagram: { baseCTR: 0.02, adjustedCTR: 0.025, engagementFactors: ['visual content'] },
              twitter: { baseCTR: 0.015, adjustedCTR: 0.018, engagementFactors: ['trending topics'] }
            },
            recommendations: ['Focus on visual content'],
            summary: 'Mock CTR analysis'
          })
        };
    
    const analysis = await generator.analyzeCTR({
      personaGroup,
      platforms,
      contentType
    });
    
    // Store analysis result
    const resultId = uuidv4();
    const result = {
      id: resultId,
      groupId,
      analysis,
      createdAt: new Date().toISOString()
    };
    
    // Store in metadata of group for now
    await server.db.adapter.updatePersonaGroup(groupId, {
      metadata: {
        ...group.metadata,
        analyses: {
          ...(group.metadata?.analyses || {}),
          [resultId]: result
        }
      }
    });
    
    return reply.send(result);
  });

  // Simulate survey with persisted group
  server.post('/simulate/survey', {
    schema: {
      tags: ['persisted'],
      summary: 'Simulate survey responses',
      description: 'Generate AI-powered survey responses for a persisted persona group',
      body: SimulatePersistedSurveySchema,
      response: {
        200: z.object({
          id: z.string(),
          groupId: z.string(),
          responses: z.array(z.object({
            personaId: z.string(),
            personaName: z.string(),
            answers: z.record(z.unknown())
          })),
          summary: z.object({
            totalResponses: z.number(),
            completionRate: z.number(),
            insights: z.array(z.string())
          }),
          createdAt: z.string()
        })
      }
    }
  }, async (request, reply) => {
    if (!server.db) {
      return reply.code(503).send({
        error: 'Database not available',
        message: 'PostgreSQL connection not configured'
      });
    }

    const { groupId, questions } = request.body;
    
    // Fetch group and personas
    const group = await server.db.adapter.getPersonaGroup(groupId);
    if (!group) {
      return reply.code(404).send({
        error: 'Group not found',
        message: `No group found with ID: ${groupId}`
      });
    }
    
    const personas = await server.db.adapter.getPersonasInGroup(groupId);
    if (personas.length === 0) {
      return reply.code(400).send({
        error: 'Empty group',
        message: 'Group has no personas'
      });
    }
    
    // Reconstruct PersonaGroup
    const personaGroup = new PersonaGroup(group.name);
    personas.forEach(p => {
      personaGroup.add({
        id: p.id,
        name: p.name,
        attributes: p.attributes
      } as any);
    });
    
    // Use AI generator or mock
    const generator = process.env.OPENAI_API_KEY && process.env.MOCK_OPENAI !== 'true'
      ? new StructuredOutputGenerator({ 
          apiKey: process.env.OPENAI_API_KEY,
          model: 'gpt-4o-mini'
        })
      : {
          simulateSurvey: async () => ({
            responses: [{
              personaId: personas[0].id,
              personaName: personas[0].name,
              answers: { q1: 'yes', q2: 5 }
            }],
            summary: {
              totalResponses: 1,
              completionRate: 1.0,
              insights: ['Mock survey response']
            }
          })
        };
    
    const simulation = await generator.simulateSurvey({
      personaGroup,
      questions
    });
    
    // Store simulation result
    const resultId = uuidv4();
    const result = {
      id: resultId,
      groupId,
      responses: simulation.responses,
      summary: simulation.summary,
      createdAt: new Date().toISOString()
    };
    
    // Store in metadata of group for now
    await server.db.adapter.updatePersonaGroup(groupId, {
      metadata: {
        ...group.metadata,
        simulations: {
          ...(group.metadata?.simulations || {}),
          [resultId]: result
        }
      }
    });
    
    return reply.send(result);
  });

  // Get stored result by ID
  server.get('/results/:id', {
    schema: {
      tags: ['persisted'],
      summary: 'Get stored analysis or simulation result',
      description: 'Retrieve a previously generated analysis or simulation result by ID',
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: z.object({
          id: z.string(),
          type: z.enum(['analysis', 'simulation']),
          data: z.unknown(),
          createdAt: z.string()
        })
      }
    }
  }, async (request, reply) => {
    if (!server.db) {
      return reply.code(503).send({
        error: 'Database not available',
        message: 'PostgreSQL connection not configured'
      });
    }

    const { id } = request.params as { id: string };
    
    // Search through all groups for the result
    const groups = await server.db.adapter.queryPersonaGroups({ limit: 1000 });
    
    for (const group of groups.data) {
      if (group.metadata?.analyses?.[id]) {
        return reply.send({
          id,
          type: 'analysis',
          data: group.metadata.analyses[id],
          createdAt: group.metadata.analyses[id].createdAt
        });
      }
      
      if (group.metadata?.simulations?.[id]) {
        return reply.send({
          id,
          type: 'simulation',
          data: group.metadata.simulations[id],
          createdAt: group.metadata.simulations[id].createdAt
        });
      }
    }
    
    return reply.code(404).send({
      error: 'Result not found',
      message: `No result found with ID: ${id}`
    });
  });

  // Delete all data (admin endpoint)
  server.delete('/admin/clear', {
    schema: {
      tags: ['persisted'],
      summary: 'Clear all persisted data',
      description: 'Admin endpoint to delete all personas and groups from PostgreSQL (requires admin key)',
      headers: z.object({
        'x-admin-key': z.string()
      }),
      response: {
        200: z.object({
          message: z.string(),
          deleted: z.object({
            personas: z.number(),
            groups: z.number()
          })
        })
      }
    }
  }, async (request, reply) => {
    if (!server.db) {
      return reply.code(503).send({
        error: 'Database not available',
        message: 'PostgreSQL connection not configured'
      });
    }

    const adminKey = request.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
      return reply.code(403).send({
        error: 'Unauthorized',
        message: 'Invalid admin key'
      });
    }
    
    const stats = await server.db.adapter.getStats();
    await server.db.adapter.clearAllData();
    
    return reply.send({
      message: 'All data cleared successfully',
      deleted: {
        personas: stats.totalPersonas,
        groups: stats.totalGroups
      }
    });
  });
};