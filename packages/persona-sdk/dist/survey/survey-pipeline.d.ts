import { SurveyData, SurveyProcessingOptions, JointDistribution, ValidationResults } from './types';
import { PersonaGroup } from '../persona-group';
/**
 * Complete pipeline for transforming survey data to persona generation
 */
export declare class SurveyToDistributionPipeline {
    private analyzer;
    constructor();
    /**
     * Process survey data and create joint distribution
     */
    processSurveyData(data: SurveyData, options?: SurveyProcessingOptions): Promise<JointDistribution>;
    /**
     * Generate personas from survey data
     */
    generatePersonasFromSurvey(data: SurveyData, count: number, options?: SurveyProcessingOptions): Promise<PersonaGroup>;
    /**
     * Generate and validate personas
     */
    generateAndValidate(data: SurveyData, count: number, options?: SurveyProcessingOptions): Promise<{
        personas: PersonaGroup;
        validation: ValidationResults;
    }>;
    /**
     * Create survey data from CSV or JSON
     */
    static fromCSV(csvData: string, schema: any, metadata: any): SurveyData;
    /**
     * Create survey data from JSON
     */
    static fromJSON(jsonData: any[], schema: any, metadata: any): SurveyData;
    /**
     * Validate survey data structure
     */
    private validateSurveyData;
}
//# sourceMappingURL=survey-pipeline.d.ts.map