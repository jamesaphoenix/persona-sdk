import test from 'tape';
import { CorrelationAnalyzer } from '@jamesaphoenix/persona-sdk';

// Sample survey data for testing
const sampleResponses = [
  { age: 25, income: 50000, satisfaction: 7 },
  { age: 30, income: 60000, satisfaction: 8 },
  { age: 35, income: 70000, satisfaction: 6 },
  { age: 40, income: 80000, satisfaction: 9 },
  { age: 45, income: 90000, satisfaction: 7 },
  { age: 28, income: 55000, satisfaction: 8 },
  { age: 32, income: 65000, satisfaction: 7 },
  { age: 38, income: 75000, satisfaction: 9 },
  { age: 42, income: 85000, satisfaction: 6 },
  { age: 50, income: 95000, satisfaction: 8 }
];

const variables = ['age', 'income', 'satisfaction'];

test('CorrelationAnalyzer - calculateCorrelations basic functionality', async (t) => {
  try {
    const analyzer = new CorrelationAnalyzer();
    
    const result = await analyzer.calculateCorrelations(
      sampleResponses,
      variables
    );
    
    t.ok(result, 'Correlation result exists');
    t.ok(Array.isArray(result.variables), 'Variables is an array');
    t.ok(Array.isArray(result.matrix), 'Matrix is an array');
    t.equal(result.variables.length, 3, 'Three variables returned');
    t.equal(result.matrix.length, 3, 'Matrix has 3 rows');
    t.equal(result.matrix[0].length, 3, 'Matrix has 3 columns');
    t.equal(result.method, 'pearson', 'Uses Pearson correlation');
    
    // Check diagonal is 1.0
    t.equal(result.matrix[0][0], 1.0, 'Diagonal element is 1.0');
    t.equal(result.matrix[1][1], 1.0, 'Diagonal element is 1.0');
    t.equal(result.matrix[2][2], 1.0, 'Diagonal element is 1.0');
    
    // Check symmetry
    t.equal(result.matrix[0][1], result.matrix[1][0], 'Matrix is symmetric');
    t.equal(result.matrix[0][2], result.matrix[2][0], 'Matrix is symmetric');
    t.equal(result.matrix[1][2], result.matrix[2][1], 'Matrix is symmetric');
    
    console.log('✓ Correlation matrix calculated successfully');
    console.log('  Variables:', result.variables);
    console.log('  Age-Income correlation:', result.matrix[0][1].toFixed(3));
    
    t.end();
  } catch (error) {
    t.fail(`CorrelationAnalyzer test failed: ${error.message}`);
    t.end();
  }
});

test('CorrelationAnalyzer - calculateSpearmanCorrelations', async (t) => {
  try {
    const analyzer = new CorrelationAnalyzer();
    
    const result = await analyzer.calculateSpearmanCorrelations(
      sampleResponses,
      variables
    );
    
    t.ok(result, 'Spearman correlation result exists');
    t.equal(result.method, 'spearman', 'Uses Spearman correlation');
    t.ok(Array.isArray(result.matrix), 'Matrix is an array');
    
    console.log('✓ Spearman correlation calculated successfully');
    console.log('  Method:', result.method);
    
    t.end();
  } catch (error) {
    t.fail(`Spearman correlation test failed: ${error.message}`);
    t.end();
  }
});

test('CorrelationAnalyzer - detectNonLinearCorrelations', async (t) => {
  try {
    const analyzer = new CorrelationAnalyzer();
    
    const result = await analyzer.detectNonLinearCorrelations(
      sampleResponses,
      variables
    );
    
    t.ok(result, 'Non-linear correlation result exists');
    t.equal(result.method, 'mutual_information', 'Uses mutual information');
    t.ok(Array.isArray(result.matrix), 'Matrix is an array');
    
    console.log('✓ Non-linear correlation detection successful');
    console.log('  Method:', result.method);
    
    t.end();
  } catch (error) {
    t.fail(`Non-linear correlation test failed: ${error.message}`);
    t.end();
  }
});

test('CorrelationAnalyzer - edge cases', async (t) => {
  try {
    const analyzer = new CorrelationAnalyzer();
    
    // Test with minimal data
    const minimalData = [
      { x: 1, y: 2 },
      { x: 2, y: 4 }
    ];
    
    const result = await analyzer.calculateCorrelations(
      minimalData,
      ['x', 'y']
    );
    
    t.ok(result, 'Handles minimal data');
    t.equal(result.variables.length, 2, 'Two variables');
    
    // Test with missing values
    const dataWithMissing = [
      { a: 1, b: 2 },
      { a: null, b: 3 },
      { a: 2, b: null },
      { a: 3, b: 4 }
    ];
    
    const resultMissing = await analyzer.calculateCorrelations(
      dataWithMissing,
      ['a', 'b']
    );
    
    t.ok(resultMissing, 'Handles missing values');
    
    console.log('✓ Edge cases handled successfully');
    
    t.end();
  } catch (error) {
    t.fail(`Edge cases test failed: ${error.message}`);
    t.end();
  }
});

test('CorrelationAnalyzer - performance with larger dataset', async (t) => {
  try {
    const analyzer = new CorrelationAnalyzer();
    
    // Generate larger dataset
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      var1: Math.random() * 100,
      var2: Math.random() * 100 + i * 0.1, // slight correlation
      var3: Math.random() * 100,
      var4: Math.random() * 100
    }));
    
    const startTime = Date.now();
    const result = await analyzer.calculateCorrelations(
      largeData,
      ['var1', 'var2', 'var3', 'var4']
    );
    const endTime = Date.now();
    
    t.ok(result, 'Handles large dataset');
    t.equal(result.variables.length, 4, 'Four variables');
    t.ok(endTime - startTime < 5000, 'Completes within reasonable time');
    
    console.log('✓ Performance test passed');
    console.log(`  Processed ${largeData.length} records in ${endTime - startTime}ms`);
    
    t.end();
  } catch (error) {
    t.fail(`Performance test failed: ${error.message}`);
    t.end();
  }
});