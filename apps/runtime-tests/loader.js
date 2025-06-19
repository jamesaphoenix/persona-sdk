import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

export async function resolve(specifier, context, defaultResolve) {
  // Handle relative imports in persona-sdk dist
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && 
      context.parentURL?.includes('/persona-sdk/dist/')) {
    // Add .js extension if missing
    if (!specifier.endsWith('.js') && !specifier.endsWith('.json')) {
      // Try to resolve as a directory with index.js
      const parentPath = dirname(fileURLToPath(context.parentURL));
      const possibleDirPath = join(parentPath, specifier);
      const indexPath = join(possibleDirPath, 'index.js');
      
      if (existsSync(indexPath)) {
        specifier += '/index.js';
      } else {
        specifier += '.js';
      }
    }
  }
  
  return defaultResolve(specifier, context, defaultResolve);
}