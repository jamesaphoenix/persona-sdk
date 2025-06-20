import { DistributionSelector } from '@jamesaphoenix/persona-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function debugDistribution() {
  const selector = new DistributionSelector(process.env.OPENAI_API_KEY);
  
  // Override createDistribution to log what we're getting
  const originalCreate = selector.createDistribution;
  selector.createDistribution = function(type, params) {
    console.log('Creating distribution:', type, JSON.stringify(params, null, 2));
    return originalCreate.call(this, type, params);
  };
  
  try {
    const dist = await selector.selectDistribution({
      attribute: 'occupation',
      context: 'Tech company employees',
      constraints: {
        categories: ['engineer', 'designer', 'product_manager', 'data_scientist', 'marketing']
      }
    });
    
    console.log('Result:', dist);
  } catch (error) {
    console.error('Error:', error);
  }
}

debugDistribution();