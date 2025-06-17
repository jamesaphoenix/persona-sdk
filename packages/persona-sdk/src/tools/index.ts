export { DistributionSelector } from './distribution-selector';
export { StructuredOutputGenerator } from './structured-output-generator';
export { CorrelationAwareSelector, generateRealisticPersonas } from './correlation-aware-selector';
export { IntelligentPersonaFactory, createRealisticPersonas } from './intelligent-persona-factory';
export { AutoCorrelationGenerator, generateWithAutoCorrelations, AutoCorrelationSchema } from './auto-correlation-generator';
export type { DistributionTool, OutputSchema } from './types';
export type { 
  CorrelationAwareSelectionParams, 
  CorrelationAwareResult 
} from './correlation-aware-selector';
export type { 
  TraitDefinition, 
  IntelligentPersonaConfig 
} from './intelligent-persona-factory';
export type { 
  AutoCorrelationOptions, 
  AutoCorrelationConfig 
} from './auto-correlation-generator';