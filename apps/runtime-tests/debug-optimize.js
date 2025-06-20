import { PersonaAI } from '@jamesaphoenix/persona-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function debugOptimizePrompt() {
  try {
    console.log('Testing PersonaAI.optimizePrompt with basic prompt...');
    
    const basicPrompt = 'make a customer';
    const optimized = await PersonaAI.optimizePrompt(
      basicPrompt,
      { apiKey: process.env.OPENAI_API_KEY }
    );
    
    console.log('\nOriginal prompt:', basicPrompt);
    console.log('Optimized prompt:', optimized);
    console.log('Length:', optimized.length);
    
    // Check what's included
    console.log('\nChecking content:');
    console.log('Has age?', optimized.toLowerCase().includes('age'));
    console.log('Has location?', optimized.toLowerCase().includes('location') || 
                              optimized.toLowerCase().includes('city') ||
                              optimized.toLowerCase().includes('region'));
    console.log('Has occupation?', optimized.toLowerCase().includes('occupation') ||
                                  optimized.toLowerCase().includes('job') ||
                                  optimized.toLowerCase().includes('profession'));
    
    // Test suggestAttributes too
    console.log('\n\nTesting PersonaAI.suggestAttributes...');
    const suggestions = await PersonaAI.suggestAttributes(
      { 
        industry: 'gaming',
        targetAudience: 'hardcore gamers',
        platform: 'PC'
      },
      { apiKey: process.env.OPENAI_API_KEY }
    );
    
    console.log('Suggestions:', suggestions);
    console.log('Count:', suggestions.length);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugOptimizePrompt();