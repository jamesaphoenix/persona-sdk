import test from 'tape';
import { SurveyAnalyzer } from '@jamesaphoenix/persona-sdk';

// Sample survey data for testing
const sampleSurveyData = {
  responses: [
    { age: 25, income: 50000, satisfaction: 7, education: 'Bachelor' },
    { age: 30, income: 60000, satisfaction: 8, education: 'Master' },
    { age: 35, income: 70000, satisfaction: 6, education: 'Bachelor' },
    { age: 40, income: 80000, satisfaction: 9, education: 'PhD' },
    { age: 45, income: 90000, satisfaction: 7, education: 'Master' },
    { age: 28, income: 55000, satisfaction: 8, education: 'Bachelor' },
    { age: 32, income: 65000, satisfaction: 7, education: 'Master' },
    { age: 38, income: 75000, satisfaction: 9, education: 'Bachelor' },
    { age: 42, income: 85000, satisfaction: 6, education: 'PhD' },
    { age: 50, income: 95000, satisfaction: 8, education: 'Master' },
    { age: 27, income: 52000, satisfaction: 7, education: 'Bachelor' },
    { age: 33, income: 67000, satisfaction: 8, education: 'Master' },
    { age: 39, income: 77000, satisfaction: 6, education: 'Bachelor' },
    { age: 44, income: 87000, satisfaction: 9, education: 'PhD' },
    { age: 48, income: 92000, satisfaction: 7, education: 'Master' }
  ],
  schema: {
    age: { type: 'numeric', description: 'Age in years', required: true },
    income: { type: 'numeric', description: 'Annual income in USD', required: true },
    satisfaction: { type: 'numeric', description: 'Job satisfaction 1-10', scale: [1, 10], required: true },
    education: { type: 'categorical', description: 'Education level', categories: ['Bachelor', 'Master', 'PhD'], required: false }
  },
  metadata: {
    sampleSize: 15,
    demographics: { age_range: '25-50', income_range: '$50k-$95k' },
    source: 'Employee Survey 2024',
    dateCollected: '2024-01-15',
    methodology: 'Online survey'
  }
};

test('SurveyAnalyzer - analyzeCorrelations', async (t) => {
  try {
    const analyzer = new SurveyAnalyzer();
    
    const correlations = await analyzer.analyzeCorrelations(sampleSurveyData);
    
    t.ok(correlations, 'Correlations result exists');
    t.ok(Array.isArray(correlations.variables), 'Variables is an array');
    t.ok(Array.isArray(correlations.matrix), 'Matrix is an array');
    t.equal(correlations.method, 'pearson', 'Uses Pearson correlation');
    
    // Should include numeric fields only
    const expectedVariables = ['age', 'income', 'satisfaction'];
    t.equal(correlations.variables.length, expectedVariables.length, 'Correct number of variables');
    
    expectedVariables.forEach(variable => {
      t.ok(correlations.variables.includes(variable), `Includes ${variable}`);
    });
    
    console.log('✓ Survey correlation analysis successful');
    console.log(`  Variables analyzed: ${correlations.variables.join(', ')}`);
    console.log(`  Age-Income correlation: ${correlations.matrix[0][1]?.toFixed(3) || 'N/A'}`);
    
    t.end();
  } catch (error) {
    t.fail(`Survey correlation analysis failed: ${error.message}`);
    t.end();
  }
});

test('SurveyAnalyzer - detectDistributions', async (t) => {
  try {
    const analyzer = new SurveyAnalyzer();
    
    const distributions = await analyzer.detectDistributions(sampleSurveyData);
    
    t.ok(distributions, 'Distributions result exists');
    t.ok(Array.isArray(distributions), 'Distributions is an array');
    t.ok(distributions.length > 0, 'At least one distribution detected');
    
    // Check each distribution fitting
    distributions.forEach(fitting => {
      t.ok(fitting.variable, 'Variable name exists');
      t.ok(fitting.bestFit, 'Best fit exists');
      t.ok(fitting.bestFit.distribution, 'Distribution object exists');
      t.ok(fitting.bestFit.parameters, 'Parameters exist');
      t.ok(typeof fitting.bestFit.goodnessOfFit === 'number', 'Goodness of fit is a number');
      t.ok(Array.isArray(fitting.alternatives), 'Alternatives is an array');
    });
    
    console.log('✓ Distribution detection successful');
    console.log(`  Distributions fitted: ${distributions.length}`);
    distributions.forEach(dist => {
      console.log(`    ${dist.variable}: ${dist.bestFit.name} (fit: ${dist.bestFit.goodnessOfFit.toFixed(3)})`);
    });
    
    t.end();
  } catch (error) {
    t.fail(`Distribution detection failed: ${error.message}`);
    t.end();
  }
});

test('SurveyAnalyzer - buildJointDistribution', async (t) => {
  try {
    const analyzer = new SurveyAnalyzer();
    
    const jointDistribution = await analyzer.buildJointDistribution(sampleSurveyData);
    
    t.ok(jointDistribution, 'Joint distribution exists');
    t.ok(Array.isArray(jointDistribution.marginals), 'Marginals is an array');
    t.ok(jointDistribution.copula, 'Copula exists');
    t.ok(typeof jointDistribution.sample === 'function', 'Sample method exists');
    t.ok(typeof jointDistribution.getCorrelationMatrix === 'function', 'getCorrelationMatrix method exists');
    
    // Test sampling
    const samples = jointDistribution.sample(5);
    t.ok(Array.isArray(samples), 'Samples is an array');
    t.equal(samples.length, 5, 'Correct number of samples');
    
    samples.forEach((sample, idx) => {
      t.ok(typeof sample === 'object', `Sample ${idx} is an object`);
      t.ok(Object.keys(sample).length > 0, `Sample ${idx} has attributes`);
    });
    
    // Test correlation matrix retrieval
    const correlationMatrix = jointDistribution.getCorrelationMatrix();
    t.ok(correlationMatrix, 'Correlation matrix retrieved');
    t.ok(Array.isArray(correlationMatrix.variables), 'Variables exist');
    t.ok(Array.isArray(correlationMatrix.matrix), 'Matrix exists');
    
    console.log('✓ Joint distribution building successful');
    console.log(`  Marginals: ${jointDistribution.marginals.length}`);
    console.log(`  Sample attributes: ${Object.keys(samples[0] || {}).join(', ')}`);
    
    t.end();
  } catch (error) {
    t.fail(`Joint distribution building failed: ${error.message}`);
    t.end();
  }
});

test('SurveyAnalyzer - validateGeneration', async (t) => {
  try {
    const analyzer = new SurveyAnalyzer();
    
    // Generate some personas first
    const jointDistribution = await analyzer.buildJointDistribution(sampleSurveyData);
    const generatedPersonas = jointDistribution.sample(10);
    
    const validation = await analyzer.validateGeneration(
      sampleSurveyData,
      generatedPersonas
    );
    
    t.ok(validation, 'Validation result exists');
    t.ok(validation.original, 'Original statistics exist');
    t.ok(validation.generated, 'Generated statistics exist');
    t.ok(validation.tests, 'Test results exist');
    t.ok(typeof validation.score === 'number', 'Validation score is a number');
    t.ok(validation.score >= 0 && validation.score <= 1, 'Score is in valid range');
    
    console.log('✓ Generation validation successful');
    console.log(`  Validation score: ${validation.score.toFixed(3)}`);
    console.log(`  Original sample size: ${validation.original.sampleSize}`);
    console.log(`  Generated sample size: ${validation.generated.sampleSize}`);
    
    t.end();
  } catch (error) {
    t.fail(`Generation validation failed: ${error.message}`);
    t.end();
  }
});

test('SurveyAnalyzer - error handling', async (t) => {
  try {
    const analyzer = new SurveyAnalyzer();
    
    // Test with insufficient numeric fields
    const badData = {
      responses: [{ name: 'John' }, { name: 'Jane' }],
      schema: {
        name: { type: 'categorical', description: 'Name' }
      },
      metadata: { sampleSize: 2, demographics: {}, source: 'test' }
    };
    
    try {
      await analyzer.analyzeCorrelations(badData);
      t.fail('Should throw error for insufficient numeric fields');
    } catch (error) {
      t.ok(error.message.includes('at least 2 numeric fields'), 'Appropriate error for insufficient fields');
    }
    
    // Test with custom options
    const options = {
      minCorrelation: 0.5,
      maxVariables: 2,
      distributionCandidates: ['normal', 'uniform']
    };
    
    const correlations = await analyzer.analyzeCorrelations(sampleSurveyData, options);
    t.ok(correlations, 'Works with custom options');
    
    const distributions = await analyzer.detectDistributions(sampleSurveyData, options);
    t.ok(distributions, 'Distribution detection works with custom options');
    
    console.log('✓ Error handling and options successful');
    
    t.end();
  } catch (error) {
    t.fail(`Error handling test failed: ${error.message}`);
    t.end();
  }
});

test('SurveyAnalyzer - performance with larger dataset', async (t) => {
  try {
    const analyzer = new SurveyAnalyzer();
    
    // Generate larger synthetic dataset
    const largeResponses = Array.from({ length: 500 }, (_, i) => ({
      age: 20 + Math.random() * 45,
      income: 30000 + Math.random() * 70000,
      satisfaction: Math.floor(Math.random() * 10) + 1,
      experience: Math.random() * 20,
      bonus: Math.random() * 10000
    }));
    
    const largeData = {
      responses: largeResponses,
      schema: {
        age: { type: 'numeric', description: 'Age' },
        income: { type: 'numeric', description: 'Income' },
        satisfaction: { type: 'numeric', description: 'Satisfaction' },
        experience: { type: 'numeric', description: 'Years of experience' },
        bonus: { type: 'numeric', description: 'Annual bonus' }
      },
      metadata: {
        sampleSize: largeResponses.length,
        demographics: {},
        source: 'Performance test'
      }
    };
    
    const startTime = Date.now();
    
    const correlations = await analyzer.analyzeCorrelations(largeData);
    const distributions = await analyzer.detectDistributions(largeData);
    const jointDistribution = await analyzer.buildJointDistribution(largeData);
    const samples = jointDistribution.sample(100);
    
    const endTime = Date.now();
    
    t.ok(correlations, 'Large dataset correlation analysis successful');
    t.ok(distributions, 'Large dataset distribution detection successful');
    t.ok(jointDistribution, 'Large dataset joint distribution successful');
    t.equal(samples.length, 100, 'Large dataset sampling successful');
    t.ok(endTime - startTime < 10000, 'Completes within reasonable time');
    
    console.log('✓ Performance test with large dataset successful');
    console.log(`  Processed ${largeData.responses.length} records in ${endTime - startTime}ms`);
    console.log(`  Variables: ${correlations.variables.length}`);
    console.log(`  Distributions fitted: ${distributions.length}`);
    
    t.end();
  } catch (error) {
    t.fail(`Performance test failed: ${error.message}`);
    t.end();
  }
});