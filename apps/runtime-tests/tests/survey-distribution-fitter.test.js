import test from 'tape';
import { DistributionFitter } from '@jamesaphoenix/persona-sdk';

// Sample data for different distribution types
const normalData = [2.1, 2.5, 2.3, 2.7, 2.2, 2.4, 2.6, 2.8, 2.0, 2.9, 2.1, 2.3, 2.5, 2.4, 2.6];
const uniformData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1.5, 2.5, 3.5, 4.5, 5.5];
const exponentialData = [0.1, 0.2, 0.05, 0.3, 0.15, 0.4, 0.1, 0.25, 0.08, 0.35, 0.12, 0.2, 0.18, 0.22, 0.28];

test('DistributionFitter - fitDistribution with normal data', async (t) => {
  try {
    const fitter = new DistributionFitter();
    
    const result = await fitter.fitDistribution('test_normal', normalData);
    
    t.ok(result, 'Fitting result exists');
    t.ok(result.bestFit, 'Best fit exists');
    t.ok(result.bestFit.distribution, 'Distribution object exists');
    t.ok(result.bestFit.parameters, 'Parameters exist');
    t.ok(typeof result.bestFit.goodnessOfFit === 'number', 'Goodness of fit is a number');
    t.ok(Array.isArray(result.alternatives), 'Alternatives is an array');
    t.equal(result.variable, 'test_normal', 'Variable name matches');
    
    console.log('✓ Normal distribution fitting successful');
    console.log(`  Best fit: ${result.bestFit.name}`);
    console.log(`  Goodness of fit: ${result.bestFit.goodnessOfFit.toFixed(3)}`);
    console.log(`  Parameters:`, result.bestFit.parameters);
    
    t.end();
  } catch (error) {
    t.fail(`Normal distribution fitting failed: ${error.message}`);
    t.end();
  }
});

test('DistributionFitter - fitDistribution with uniform data', async (t) => {
  try {
    const fitter = new DistributionFitter();
    
    const result = await fitter.fitDistribution('test_uniform', uniformData);
    
    t.ok(result, 'Fitting result exists');
    t.ok(result.bestFit.distribution, 'Distribution exists');
    
    console.log('✓ Uniform distribution fitting successful');
    console.log(`  Best fit: ${result.bestFit.name}`);
    console.log(`  Parameters:`, result.bestFit.parameters);
    
    t.end();
  } catch (error) {
    t.fail(`Uniform distribution fitting failed: ${error.message}`);
    t.end();
  }
});

test('DistributionFitter - fitDistribution with exponential data', async (t) => {
  try {
    const fitter = new DistributionFitter();
    
    const result = await fitter.fitDistribution('test_exponential', exponentialData);
    
    t.ok(result, 'Fitting result exists');
    t.ok(result.bestFit.distribution, 'Distribution exists');
    
    console.log('✓ Exponential distribution fitting successful');
    console.log(`  Best fit: ${result.bestFit.name}`);
    console.log(`  Parameters:`, result.bestFit.parameters);
    
    t.end();
  } catch (error) {
    t.fail(`Exponential distribution fitting failed: ${error.message}`);
    t.end();
  }
});

test('DistributionFitter - custom distribution candidates', async (t) => {
  try {
    const fitter = new DistributionFitter();
    
    const result = await fitter.fitDistribution(
      'test_custom',
      normalData,
      ['normal', 'uniform'] // Only test these two
    );
    
    t.ok(result, 'Fitting result exists');
    t.ok(result.alternatives.length <= 1, 'Limited alternatives based on candidates');
    
    console.log('✓ Custom distribution candidates work');
    console.log(`  Tested candidates: normal, uniform`);
    console.log(`  Best fit: ${result.bestFit.name}`);
    
    t.end();
  } catch (error) {
    t.fail(`Custom candidates test failed: ${error.message}`);
    t.end();
  }
});

test('DistributionFitter - edge cases', async (t) => {
  try {
    const fitter = new DistributionFitter();
    
    // Test with single value repeated
    const singleValueData = [5, 5, 5, 5, 5];
    const singleValueResult = await fitter.fitDistribution('single_value', singleValueData);
    
    t.ok(singleValueResult, 'Handles single value data');
    
    // Test with minimal data (should fail gracefully)
    const minimalData = [1, 2];
    try {
      const minimalResult = await fitter.fitDistribution('minimal', minimalData);
      t.fail('Should throw error for insufficient data');
    } catch (error) {
      t.ok(error.message.includes('Could not fit'), 'Throws appropriate error for minimal data');
    }
    
    // Test with invalid data
    const invalidData = [NaN, Infinity, -Infinity, 1, 2, 3];
    const invalidResult = await fitter.fitDistribution('invalid', invalidData);
    
    t.ok(invalidResult, 'Handles invalid data by filtering');
    
    console.log('✓ Edge cases handled successfully');
    
    t.end();
  } catch (error) {
    t.fail(`Edge cases test failed: ${error.message}`);
    t.end();
  }
});

test('DistributionFitter - beta distribution fitting', async (t) => {
  try {
    const fitter = new DistributionFitter();
    
    // Generate data that should fit beta distribution (values between 0 and 1)
    const betaData = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75];
    
    const result = await fitter.fitDistribution('test_beta', betaData, ['beta']);
    
    t.ok(result, 'Beta fitting result exists');
    t.equal(result.bestFit.name, 'beta', 'Beta distribution was fitted');
    t.ok(result.bestFit.parameters.alpha, 'Alpha parameter exists');
    t.ok(result.bestFit.parameters.beta, 'Beta parameter exists');
    
    console.log('✓ Beta distribution fitting successful');
    console.log(`  Alpha: ${result.bestFit.parameters.alpha.toFixed(3)}`);
    console.log(`  Beta: ${result.bestFit.parameters.beta.toFixed(3)}`);
    
    t.end();
  } catch (error) {
    t.fail(`Beta distribution fitting failed: ${error.message}`);
    t.end();
  }
});

test('DistributionFitter - log-normal distribution fitting', async (t) => {
  try {
    const fitter = new DistributionFitter();
    
    // Generate data that might fit log-normal (positive values)
    const logNormalData = [1.2, 2.5, 1.8, 3.1, 2.2, 1.5, 2.8, 3.5, 1.9, 2.1, 2.7, 3.2, 1.7, 2.4, 2.9];
    
    const result = await fitter.fitDistribution('test_lognormal', logNormalData, ['lognormal']);
    
    t.ok(result, 'Log-normal fitting result exists');
    t.equal(result.bestFit.name, 'lognormal', 'Log-normal distribution was fitted');
    t.ok(result.bestFit.parameters.muLog !== undefined, 'MuLog parameter exists');
    t.ok(result.bestFit.parameters.sigmaLog !== undefined, 'SigmaLog parameter exists');
    
    console.log('✓ Log-normal distribution fitting successful');
    console.log(`  MuLog: ${result.bestFit.parameters.muLog.toFixed(3)}`);
    console.log(`  SigmaLog: ${result.bestFit.parameters.sigmaLog.toFixed(3)}`);
    
    t.end();
  } catch (error) {
    t.fail(`Log-normal distribution fitting failed: ${error.message}`);
    t.end();
  }
});

test('DistributionFitter - goodness of fit comparison', async (t) => {
  try {
    const fitter = new DistributionFitter();
    
    // Use clearly normal data to test goodness of fit
    const clearlyNormalData = Array.from({ length: 100 }, () => {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 2 + 10;
    });
    
    const result = await fitter.fitDistribution('goodness_test', clearlyNormalData);
    
    t.ok(result, 'Goodness of fit test result exists');
    t.ok(result.bestFit.goodnessOfFit >= 0 && result.bestFit.goodnessOfFit <= 1, 'Goodness of fit in valid range');
    
    // Check that alternatives are sorted by goodness of fit
    if (result.alternatives.length > 1) {
      for (let i = 0; i < result.alternatives.length - 1; i++) {
        t.ok(
          result.alternatives[i].goodnessOfFit >= result.alternatives[i + 1].goodnessOfFit,
          'Alternatives sorted by goodness of fit'
        );
      }
    }
    
    console.log('✓ Goodness of fit comparison successful');
    console.log(`  Best fit goodness: ${result.bestFit.goodnessOfFit.toFixed(3)}`);
    console.log(`  Number of alternatives: ${result.alternatives.length}`);
    
    t.end();
  } catch (error) {
    t.fail(`Goodness of fit test failed: ${error.message}`);
    t.end();
  }
});