import { SurveyAnalyzer } from './survey-analyzer';
import { PersonaGroup } from '../persona-group';
import { Persona } from '../persona';
/**
 * Complete pipeline for transforming survey data to persona generation
 */
export class SurveyToDistributionPipeline {
    analyzer;
    constructor() {
        this.analyzer = new SurveyAnalyzer();
    }
    /**
     * Process survey data and create joint distribution
     */
    async processSurveyData(data, options = {}) {
        // Validate survey data
        this.validateSurveyData(data);
        // Build joint distribution
        const jointDistribution = await this.analyzer.buildJointDistribution(data, options);
        return jointDistribution;
    }
    /**
     * Generate personas from survey data
     */
    async generatePersonasFromSurvey(data, count, options = {}) {
        // Process survey data to get joint distribution
        const jointDistribution = await this.processSurveyData(data, options);
        // Sample from joint distribution
        const samples = jointDistribution.sample(count);
        // Convert samples to personas
        const personas = [];
        for (let i = 0; i < samples.length; i++) {
            const attributes = samples[i];
            const persona = new Persona(`Survey-Generated-${i + 1}`, attributes);
            personas.push(persona);
        }
        // Create persona group
        const group = new PersonaGroup('Survey Generated Personas');
        personas.forEach(persona => group.add(persona));
        return group;
    }
    /**
     * Generate and validate personas
     */
    async generateAndValidate(data, count, options = {}) {
        // Generate personas
        const personas = await this.generatePersonasFromSurvey(data, count, options);
        // Validate against original data
        const validation = await this.analyzer.validateGeneration(data, personas.personas.map(p => p.attributes), options);
        return { personas, validation };
    }
    /**
     * Create survey data from CSV or JSON
     */
    static fromCSV(csvData, schema, metadata) {
        // Parse CSV data
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const responses = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const response = {};
            headers.forEach((header, idx) => {
                const value = values[idx];
                const fieldSchema = schema[header];
                if (fieldSchema?.type === 'numeric') {
                    response[header] = parseFloat(value) || 0;
                }
                else if (fieldSchema?.type === 'boolean') {
                    response[header] = value.toLowerCase() === 'true';
                }
                else {
                    response[header] = value;
                }
            });
            return response;
        });
        return {
            responses,
            schema,
            metadata: {
                ...metadata,
                sampleSize: responses.length
            }
        };
    }
    /**
     * Create survey data from JSON
     */
    static fromJSON(jsonData, schema, metadata) {
        return {
            responses: jsonData,
            schema,
            metadata: {
                ...metadata,
                sampleSize: jsonData.length
            }
        };
    }
    /**
     * Validate survey data structure
     */
    validateSurveyData(data) {
        if (!data.responses || data.responses.length === 0) {
            throw new Error('Survey data must contain at least one response');
        }
        if (!data.schema || Object.keys(data.schema).length === 0) {
            throw new Error('Survey schema must be provided');
        }
        // Check if responses match schema
        const schemaFields = Object.keys(data.schema);
        const responseFields = Object.keys(data.responses[0] || {});
        const missingFields = schemaFields.filter(field => !responseFields.includes(field));
        if (missingFields.length > 0) {
            console.warn(`Schema fields not found in responses: ${missingFields.join(', ')}`);
        }
        // Validate field types
        for (const response of data.responses.slice(0, 5)) { // Check first 5 responses
            for (const [fieldName, fieldSchema] of Object.entries(data.schema)) {
                const value = response[fieldName];
                if (fieldSchema.required && (value === null || value === undefined)) {
                    throw new Error(`Required field ${fieldName} is missing in response`);
                }
                if (value !== null && value !== undefined) {
                    if (fieldSchema.type === 'numeric' && isNaN(Number(value))) {
                        console.warn(`Non-numeric value found for numeric field ${fieldName}: ${value}`);
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=survey-pipeline.js.map