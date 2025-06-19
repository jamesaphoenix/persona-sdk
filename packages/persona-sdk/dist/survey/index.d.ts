/**
 * Survey Data to Joint Distribution Pipeline
 *
 * This module implements the SynC framework for transforming real survey data
 * into joint distributions that preserve correlations and relationships.
 *
 * @see ROADMAP.md Section 10 for detailed requirements
 */
export { SurveyAnalyzer } from './survey-analyzer';
export { GaussianCopula } from './gaussian-copula';
export { SurveyToDistributionPipeline } from './survey-pipeline';
export { CorrelationAnalyzer } from './correlation-analyzer';
export { DistributionFitter } from './distribution-fitter';
export type { SurveyData, SurveySchema, CorrelationMatrix, DistributionFitting, JointDistribution, MarginalDistribution, CopulaParameters } from './types';
//# sourceMappingURL=index.d.ts.map