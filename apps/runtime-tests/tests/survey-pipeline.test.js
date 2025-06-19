import test from 'tape';
import { SurveyToDistributionPipeline } from '@jamesaphoenix/persona-sdk';

// Sample CSV data for testing
const sampleCsvData = `age,income,satisfaction,education
25,50000,7,Bachelor
30,60000,8,Master
35,70000,6,Bachelor
40,80000,9,PhD
45,90000,7,Master
28,55000,8,Bachelor
32,65000,7,Master
38,75000,9,Bachelor
42,85000,6,PhD
50,95000,8,Master`;

const sampleSchema = {
  age: { type: 'numeric', description: 'Age in years', required: true },
  income: { type: 'numeric', description: 'Annual income in USD', required: true },
  satisfaction: { type: 'numeric', description: 'Job satisfaction 1-10', scale: [1, 10], required: true },
  education: { type: 'categorical', description: 'Education level', categories: ['Bachelor', 'Master', 'PhD'], required: false }
};

const sampleMetadata = {
  demographics: { age_range: '25-50', income_range: '$50k-$95k' },
  source: 'Employee Survey 2024',
  dateCollected: '2024-01-15',
  methodology: 'Online survey'
};

test('SurveyToDistributionPipeline - fromCSV', async (t) => {
  try {
    const surveyData = SurveyToDistributionPipeline.fromCSV(
      sampleCsvData,
      sampleSchema,
      sampleMetadata
    );
    
    t.ok(surveyData, 'Survey data created from CSV');
    t.ok(Array.isArray(surveyData.responses), 'Responses is an array');
    t.equal(surveyData.responses.length, 10, 'Correct number of responses');
    t.ok(surveyData.schema, 'Schema exists');
    t.ok(surveyData.metadata, 'Metadata exists');
    t.equal(surveyData.metadata.sampleSize, 10, 'Sample size updated');
    
    // Check first response
    const firstResponse = surveyData.responses[0];
    t.equal(firstResponse.age, 25, 'Age parsed as number');
    t.equal(firstResponse.income, 50000, 'Income parsed as number');
    t.equal(firstResponse.satisfaction, 7, 'Satisfaction parsed as number');
    t.equal(firstResponse.education, 'Bachelor', 'Education kept as string');
    
    console.log('✓ CSV to survey data conversion successful');
    console.log(`  Records: ${surveyData.responses.length}`);
    console.log(`  Fields: ${Object.keys(surveyData.responses[0]).join(', ')}`);
    
    t.end();
  } catch (error) {
    t.fail(`CSV conversion failed: ${error.message}`);
    t.end();
  }
});

test('SurveyToDistributionPipeline - fromJSON', async (t) => {
  try {
    const jsonData = [
      { age: 25, income: 50000, satisfaction: 7, education: 'Bachelor' },
      { age: 30, income: 60000, satisfaction: 8, education: 'Master' },
      { age: 35, income: 70000, satisfaction: 6, education: 'Bachelor' }
    ];
    
    const surveyData = SurveyToDistributionPipeline.fromJSON(
      jsonData,
      sampleSchema,
      sampleMetadata
    );
    
    t.ok(surveyData, 'Survey data created from JSON');
    t.equal(surveyData.responses.length, 3, 'Correct number of responses');
    t.deepEqual(surveyData.responses, jsonData, 'Responses match input data');
    t.equal(surveyData.metadata.sampleSize, 3, 'Sample size updated');
    
    console.log('✓ JSON to survey data conversion successful');
    console.log(`  Records: ${surveyData.responses.length}`);
    
    t.end();
  } catch (error) {
    t.fail(`JSON conversion failed: ${error.message}`);
    t.end();
  }
});

test('SurveyToDistributionPipeline - processSurveyData', async (t) => {
  try {
    const pipeline = new SurveyToDistributionPipeline();
    const surveyData = SurveyToDistributionPipeline.fromCSV(
      sampleCsvData,
      sampleSchema,
      sampleMetadata
    );
    
    const jointDistribution = await pipeline.processSurveyData(surveyData);
    
    t.ok(jointDistribution, 'Joint distribution created');
    t.ok(Array.isArray(jointDistribution.marginals), 'Marginals exist');
    t.ok(jointDistribution.copula, 'Copula exists');
    t.ok(typeof jointDistribution.sample === 'function', 'Sample method exists');
    
    // Test sampling
    const samples = jointDistribution.sample(3);
    t.equal(samples.length, 3, 'Correct number of samples');
    
    console.log('✓ Survey data processing successful');
    console.log(`  Marginal distributions: ${jointDistribution.marginals.length}`);
    console.log(`  Sample attributes: ${Object.keys(samples[0] || {}).join(', ')}`);
    
    t.end();
  } catch (error) {
    t.fail(`Survey data processing failed: ${error.message}`);
    t.end();
  }
});

test('SurveyToDistributionPipeline - generatePersonasFromSurvey', async (t) => {
  try {
    const pipeline = new SurveyToDistributionPipeline();
    const surveyData = SurveyToDistributionPipeline.fromCSV(
      sampleCsvData,
      sampleSchema,
      sampleMetadata
    );
    
    const personaGroup = await pipeline.generatePersonasFromSurvey(surveyData, 5);
    
    t.ok(personaGroup, 'Persona group created');
    t.equal(personaGroup.size, 5, 'Correct number of personas');
    
    const personas = personaGroup.personas;
    t.ok(Array.isArray(personas), 'Personas is an array');
    
    personas.forEach((persona, idx) => {
      t.ok(persona.name, `Persona ${idx} has a name`);
      t.ok(persona.attributes, `Persona ${idx} has attributes`);
      t.ok(typeof persona.name === 'string', `Persona ${idx} name is string`);
    });
    
    console.log('✓ Persona generation from survey successful');
    console.log(`  Generated personas: ${personaGroup.size}`);
    console.log(`  Sample persona: ${personas[0]?.name}`);
    console.log(`  Sample attributes: ${Object.keys(personas[0]?.attributes || {}).join(', ')}`);
    
    t.end();
  } catch (error) {
    t.fail(`Persona generation failed: ${error.message}`);
    t.end();
  }
});

test('SurveyToDistributionPipeline - generateAndValidate', async (t) => {
  try {
    const pipeline = new SurveyToDistributionPipeline();
    const surveyData = SurveyToDistributionPipeline.fromCSV(
      sampleCsvData,
      sampleSchema,
      sampleMetadata
    );
    
    const result = await pipeline.generateAndValidate(surveyData, 8);
    
    t.ok(result, 'Generation and validation result exists');
    t.ok(result.personas, 'Personas exist');
    t.ok(result.validation, 'Validation exists');
    
    // Check personas
    t.equal(result.personas.size, 8, 'Correct number of personas generated');
    
    // Check validation
    t.ok(result.validation.original, 'Original statistics exist');
    t.ok(result.validation.generated, 'Generated statistics exist');
    t.ok(result.validation.tests, 'Test results exist');
    t.ok(typeof result.validation.score === 'number', 'Validation score exists');
    t.ok(result.validation.score >= 0 && result.validation.score <= 1, 'Score in valid range');
    
    console.log('✓ Generation and validation successful');
    console.log(`  Generated personas: ${result.personas.size}`);
    console.log(`  Validation score: ${result.validation.score.toFixed(3)}`);
    
    t.end();
  } catch (error) {
    t.fail(`Generation and validation failed: ${error.message}`);
    t.end();
  }
});

test('SurveyToDistributionPipeline - validation and error handling', async (t) => {
  try {
    const pipeline = new SurveyToDistributionPipeline();
    
    // Test with empty responses
    const emptyData = {
      responses: [],
      schema: sampleSchema,
      metadata: sampleMetadata
    };
    
    try {
      await pipeline.processSurveyData(emptyData);
      t.fail('Should throw error for empty responses');
    } catch (error) {
      t.ok(error.message.includes('at least one response'), 'Appropriate error for empty responses');
    }
    
    // Test with missing schema
    const noSchemaData = {
      responses: [{ age: 25 }],
      schema: {},
      metadata: sampleMetadata
    };
    
    try {
      await pipeline.processSurveyData(noSchemaData);
      t.fail('Should throw error for missing schema');
    } catch (error) {
      t.ok(error.message.includes('schema must be provided'), 'Appropriate error for missing schema');
    }
    
    // Test with malformed CSV
    const malformedCsv = `age,income
25,50000
30,abc
invalid line`;
    
    const malformedData = SurveyToDistributionPipeline.fromCSV(
      malformedCsv,
      { age: { type: 'numeric' }, income: { type: 'numeric' } },
      sampleMetadata
    );
    
    t.ok(malformedData, 'Handles malformed CSV gracefully');
    t.equal(malformedData.responses[1].income, 0, 'Invalid numeric converted to 0');
    
    console.log('✓ Validation and error handling successful');
    
    t.end();
  } catch (error) {
    t.fail(`Validation test failed: ${error.message}`);
    t.end();
  }
});

test('SurveyToDistributionPipeline - custom options', async (t) => {
  try {
    const pipeline = new SurveyToDistributionPipeline();
    const surveyData = SurveyToDistributionPipeline.fromCSV(
      sampleCsvData,
      sampleSchema,
      sampleMetadata
    );
    
    const options = {
      minCorrelation: 0.5,
      maxVariables: 2,
      distributionCandidates: ['normal', 'uniform'],
      validationSplit: 0.8
    };
    
    const jointDistribution = await pipeline.processSurveyData(surveyData, options);
    t.ok(jointDistribution, 'Processing with custom options successful');
    
    const personaGroup = await pipeline.generatePersonasFromSurvey(surveyData, 5, options);
    t.ok(personaGroup, 'Generation with custom options successful');
    
    const result = await pipeline.generateAndValidate(surveyData, 5, options);
    t.ok(result, 'Generation and validation with custom options successful');
    
    console.log('✓ Custom options handling successful');
    console.log(`  Options applied: ${Object.keys(options).join(', ')}`);
    
    t.end();
  } catch (error) {
    t.fail(`Custom options test failed: ${error.message}`);
    t.end();
  }
});

test('SurveyToDistributionPipeline - real-world data simulation', async (t) => {
  try {
    const pipeline = new SurveyToDistributionPipeline();
    
    // Simulate more realistic survey data
    const realisticResponses = Array.from({ length: 200 }, (_, i) => {
      const age = 22 + Math.random() * 43; // 22-65
      const baseIncome = 30000 + age * 800 + Math.random() * 20000;
      const education = ['High School', 'Bachelor', 'Master', 'PhD'][Math.floor(Math.random() * 4)];
      const satisfactionBase = education === 'PhD' ? 7 : education === 'Master' ? 6 : 5;
      const satisfaction = Math.max(1, Math.min(10, satisfactionBase + Math.random() * 4 - 2));
      
      return {
        age: Math.round(age),
        income: Math.round(baseIncome),
        satisfaction: Math.round(satisfaction * 10) / 10,
        education,
        yearsExperience: Math.max(0, age - 22 + Math.random() * 5 - 2.5)
      };
    });
    
    const realisticSchema = {
      age: { type: 'numeric', description: 'Age in years', required: true },
      income: { type: 'numeric', description: 'Annual income', required: true },
      satisfaction: { type: 'numeric', description: 'Job satisfaction', scale: [1, 10], required: true },
      education: { type: 'categorical', description: 'Education level', required: false },
      yearsExperience: { type: 'numeric', description: 'Years of work experience', required: false }
    };
    
    const realisticData = SurveyToDistributionPipeline.fromJSON(
      realisticResponses,
      realisticSchema,
      { source: 'Realistic simulation', demographics: {}, sampleSize: realisticResponses.length }
    );
    
    const startTime = Date.now();
    const result = await pipeline.generateAndValidate(realisticData, 50);
    const endTime = Date.now();
    
    t.ok(result, 'Real-world simulation successful');
    t.equal(result.personas.size, 50, 'Generated correct number of personas');
    t.ok(result.validation.score > 0, 'Validation score is positive');
    t.ok(endTime - startTime < 15000, 'Completes in reasonable time');
    
    // Check that generated personas have realistic attributes
    const personas = result.personas.personas;
    const ages = personas.map(p => p.attributes.age).filter(a => a !== undefined);
    const incomes = personas.map(p => p.attributes.income).filter(i => i !== undefined);
    
    if (ages.length > 0) {
      const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
      t.ok(avgAge > 20 && avgAge < 70, 'Average age in reasonable range');
    }
    
    if (incomes.length > 0) {
      const avgIncome = incomes.reduce((sum, inc) => sum + inc, 0) / incomes.length;
      t.ok(avgIncome > 10000 && avgIncome < 500000, 'Average income in reasonable range');
    }
    
    console.log('✓ Real-world data simulation successful');
    console.log(`  Original dataset: ${realisticData.responses.length} records`);
    console.log(`  Generated personas: ${result.personas.size}`);
    console.log(`  Processing time: ${endTime - startTime}ms`);
    console.log(`  Validation score: ${result.validation.score.toFixed(3)}`);
    if (ages.length > 0) {
      console.log(`  Average age: ${(ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1)}`);
    }
    
    t.end();
  } catch (error) {
    t.fail(`Real-world simulation failed: ${error.message}`);
    t.end();
  }
});