#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';
import { performance } from 'perf_hooks';

const surveyTests = [
  'tests/survey-correlation-analyzer.test.js',
  'tests/survey-distribution-fitter.test.js', 
  'tests/survey-analyzer.test.js',
  'tests/survey-pipeline.test.js'
];

console.log(chalk.blue('🧪 Running Survey Pipeline Runtime Tests with Cassettes\n'));

const results = {
  passed: 0,
  failed: 0,
  total: 0,
  startTime: performance.now()
};

for (const testFile of surveyTests) {
  console.log(chalk.yellow(`\n🔬 Running ${testFile}...\n`));
  
  try {
    const output = execSync(`node --loader ./loader.js ${testFile}`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        CASSETTE_MODE: process.env.CASSETTE_MODE || 'replay'
      }
    });
    
    console.log(output);
    results.passed++;
  } catch (error) {
    console.error(chalk.red(`❌ Test failed: ${testFile}`));
    console.error(error.stdout || error.message);
    results.failed++;
  }
  
  results.total++;
}

const endTime = performance.now();
const duration = ((endTime - results.startTime) / 1000).toFixed(2);

console.log(chalk.blue('\n📊 Survey Test Results Summary:'));
console.log(chalk.green(`✅ Passed: ${results.passed}/${results.total}`));
console.log(chalk.red(`❌ Failed: ${results.failed}/${results.total}`));
console.log(chalk.gray(`⏱️  Duration: ${duration}s`));

if (results.failed === 0) {
  console.log(chalk.green.bold('\n🎉 All survey tests passed! SDK is secure with cassettes.\n'));
  process.exit(0);
} else {
  console.log(chalk.red.bold('\n💥 Some survey tests failed. Check logs above.\n'));
  process.exit(1);
}