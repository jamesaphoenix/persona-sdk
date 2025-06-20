import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function debugJSON() {
  try {
    console.log('Testing PersonaBuilder.generateMultiple...');
    const personas = await PersonaBuilder.generateMultiple(
      'Create 3 diverse team members for a startup',
      3,
      { apiKey: process.env.OPENAI_API_KEY }
    );
    console.log('Success! Personas:', personas);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('parse')) {
      console.error('This is a JSON parsing error');
    }
  }
  
  console.log('\n\nTesting PersonaBuilder.optimizePrompt...');
  try {
    const optimized = await PersonaBuilder.optimizePrompt(
      'young developer',
      { apiKey: process.env.OPENAI_API_KEY }
    );
    console.log('Optimized:', optimized);
    console.log('Length:', optimized.length);
    console.log('Has age?', optimized.toLowerCase().includes('age'));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugJSON();