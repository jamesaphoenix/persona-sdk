import { describe, expect, test, beforeAll } from 'bun:test';
import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';
import { BunCassetteManager } from '../src/cassette-manager';

const cassette = new BunCassetteManager();

beforeAll(async () => {
  await cassette.init();
});

describe('PersonaBuilder', () => {
  test('creates basic persona', () => {
    const persona = PersonaBuilder.create()
      .withName('Test User')
      .withAge(25)
      .withLocation('NYC')
      .build();
    
    expect(persona.name).toBe('Test User');
    expect(persona.age).toBe(25);
    expect(persona.location).toBe('NYC');
    expect(persona.id).toBeDefined();
  });

  test('fromPrompt with cassette', async () => {
    const result = await cassette.intercept(
      'PersonaBuilder.fromPrompt',
      ['Create a 28-year-old tech professional in SF who loves gaming'],
      async () => {
        const builder = PersonaBuilder.create();
        return await builder.fromPrompt(
          'Create a 28-year-old tech professional in SF who loves gaming',
          { apiKey: process.env.OPENAI_API_KEY }
        );
      }
    );
    
    expect(result).toBeDefined();
    expect(result.name).toBeTruthy();
    expect(typeof result.age).toBe('number');
    expect(result.attributes).toBeDefined();
  });

  test('generateMultiple with cassette', async () => {
    const result = await cassette.intercept(
      'PersonaBuilder.generateMultiple',
      ['Create 3 diverse startup team members', 3],
      async () => {
        return await PersonaBuilder.generateMultiple(
          'Create 3 diverse startup team members',
          3,
          { apiKey: process.env.OPENAI_API_KEY }
        );
      }
    );
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
    expect(new Set(result.map(p => p.name)).size).toBe(3); // All unique
  });

  test('optimizePrompt with cassette', async () => {
    const result = await cassette.intercept(
      'PersonaBuilder.optimizePrompt',
      ['young developer'],
      async () => {
        return await PersonaBuilder.optimizePrompt(
          'young developer',
          { apiKey: process.env.OPENAI_API_KEY }
        );
      }
    );
    
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan('young developer'.length);
    expect(result.toLowerCase()).toContain('age');
  });

  test('suggestAttributes with cassette', async () => {
    const context = { industry: 'gaming', targetAudience: 'competitive' };
    
    const result = await cassette.intercept(
      'PersonaBuilder.suggestAttributes',
      [context],
      async () => {
        return await PersonaBuilder.suggestAttributes(
          context,
          { apiKey: process.env.OPENAI_API_KEY }
        );
      }
    );
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    const joined = result.join(' ').toLowerCase();
    expect(
      joined.includes('game') || 
      joined.includes('skill') || 
      joined.includes('competitive')
    ).toBe(true);
  });

  test('method chaining', () => {
    const persona = PersonaBuilder.create()
      .withName('Chained User')
      .withAge(30)
      .withLocation('London')
      .withAttributes({ role: 'developer' })
      .withAttribute('level', 'senior')
      .build();
    
    expect(persona.name).toBe('Chained User');
    expect(persona.attributes.role).toBe('developer');
    expect(persona.attributes.level).toBe('senior');
  });

  test('validation', () => {
    expect(() => {
      PersonaBuilder.create()
        .withAge(-5)
        .build();
    }).toThrow();
  });
});