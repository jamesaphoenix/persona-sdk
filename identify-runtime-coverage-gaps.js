#!/usr/bin/env node

/**
 * Runtime Coverage Gap Analyzer
 * 
 * This script identifies source code that lacks runtime testing coverage.
 * It can be integrated into CI/CD pipelines to track testing progress.
 * 
 * Usage:
 *   node identify-runtime-coverage-gaps.js [options]
 * 
 * Options:
 *   --src <path>        Source directory (default: ./src)
 *   --tests <path>      Runtime tests directory (default: ./runtime-tests)
 *   --output <format>   Output format: json, markdown, html (default: markdown)
 *   --ci                CI mode - outputs to file and sets exit code
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import crypto from 'crypto';
import chalk from 'chalk';

class RuntimeCoverageAnalyzer {
  constructor(options = {}) {
    this.srcDir = options.srcDir || './src';
    this.testsDir = options.testsDir || './runtime-tests';
    this.outputFormat = options.outputFormat || 'markdown';
    this.ciMode = options.ci || false;
    
    this.sourceFiles = new Map();
    this.testedFunctions = new Set();
    this.coverageGaps = [];
    this.statistics = {
      totalFiles: 0,
      totalFunctions: 0,
      testedFunctions: 0,
      untestedFunctions: 0,
      coveragePercentage: 0,
      riskScore: 0
    };
  }

  async analyze() {
    console.log(chalk.blue('🔍 Analyzing runtime test coverage...\n'));
    
    try {
      await this.discoverSourceFiles();
      await this.analyzeFunctions();
      await this.discoverRuntimeTests();
      await this.calculateCoverage();
      await this.generateReport();
      
      return this.statistics;
    } catch (error) {
      console.error(chalk.red('Error during analysis:'), error);
      throw error;
    }
  }

  async discoverSourceFiles() {
    const patterns = [
      `${this.srcDir}/**/*.ts`,
      `${this.srcDir}/**/*.tsx`,
      `${this.srcDir}/**/*.js`,
      `${this.srcDir}/**/*.jsx`
    ];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, { 
        ignore: [
          '**/node_modules/**',
          '**/*.test.*',
          '**/*.spec.*',
          '**/dist/**',
          '**/build/**'
        ]
      });
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        this.sourceFiles.set(file, {
          path: file,
          content,
          functions: [],
          hash: this.hashContent(content)
        });
      }
    }
    
    this.statistics.totalFiles = this.sourceFiles.size;
    console.log(chalk.green(`✓ Found ${this.sourceFiles.size} source files`));
  }

  async analyzeFunctions() {
    for (const [filePath, fileData] of this.sourceFiles) {
      const functions = this.extractFunctions(fileData.content, filePath);
      fileData.functions = functions;
      this.statistics.totalFunctions += functions.length;
    }
    
    console.log(chalk.green(`✓ Found ${this.statistics.totalFunctions} functions`));
  }

  extractFunctions(content, filePath) {
    const functions = [];
    
    // Regular functions
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'function',
        line: content.substring(0, match.index).split('\n').length,
        signature: match[0],
        complexity: this.calculateComplexity(content, match.index)
      });
    }
    
    // Arrow functions
    const arrowRegex = /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
    while ((match = arrowRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'arrow',
        line: content.substring(0, match.index).split('\n').length,
        signature: match[0],
        complexity: this.calculateComplexity(content, match.index)
      });
    }
    
    // Class methods
    const classRegex = /class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const classStart = match.index;
      const classEnd = this.findClassEnd(content, classStart);
      const classContent = content.substring(classStart, classEnd);
      
      const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g;
      let methodMatch;
      while ((methodMatch = methodRegex.exec(classContent)) !== null) {
        if (methodMatch[1] !== 'constructor') {
          functions.push({
            name: `${className}.${methodMatch[1]}`,
            type: 'method',
            line: content.substring(0, classStart + methodMatch.index).split('\n').length,
            signature: methodMatch[0],
            complexity: this.calculateComplexity(classContent, methodMatch.index)
          });
        }
      }
    }
    
    // React components
    const componentRegex = /(?:export\s+)?(?:function|const)\s+(\w+)\s*[=:]\s*(?:\([^)]*\)|[^=]*)\s*=>\s*(?:\(|{)/g;
    while ((match = componentRegex.exec(content)) !== null) {
      const name = match[1];
      if (name[0] === name[0].toUpperCase() && !functions.some(f => f.name === name)) {
        functions.push({
          name,
          type: 'component',
          line: content.substring(0, match.index).split('\n').length,
          signature: match[0],
          complexity: this.calculateComplexity(content, match.index)
        });
      }
    }
    
    return functions;
  }

  calculateComplexity(content, startIndex) {
    // Simple cyclomatic complexity calculation
    const functionEnd = this.findFunctionEnd(content, startIndex);
    const functionBody = content.substring(startIndex, functionEnd);
    
    let complexity = 1;
    
    // Count decision points
    const decisionPatterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcatch\b/g,
      /\?/g, // ternary
      /&&/g,
      /\|\|/g
    ];
    
    for (const pattern of decisionPatterns) {
      const matches = functionBody.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  findFunctionEnd(content, startIndex) {
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';
      
      if (!inString) {
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          inString = true;
          stringChar = char;
        } else if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            return i + 1;
          }
        }
      } else {
        if (char === stringChar && prevChar !== '\\') {
          inString = false;
        }
      }
    }
    
    return content.length;
  }

  findClassEnd(content, startIndex) {
    return this.findFunctionEnd(content, startIndex);
  }

  async discoverRuntimeTests() {
    const testPatterns = [
      `${this.testsDir}/**/*.test.js`,
      `${this.testsDir}/**/*.test.ts`,
      `${this.testsDir}/**/*.spec.js`,
      `${this.testsDir}/**/*.spec.ts`
    ];
    
    for (const pattern of testPatterns) {
      const files = await glob(pattern);
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        this.extractTestedFunctions(content);
      }
    }
    
    console.log(chalk.green(`✓ Found ${this.testedFunctions.size} tested functions`));
  }

  extractTestedFunctions(testContent) {
    // Look for function names in test descriptions and calls
    const patterns = [
      /test\(['"`]([^'"`]+)['"`]/g,
      /it\(['"`]([^'"`]+)['"`]/g,
      /describe\(['"`]([^'"`]+)['"`]/g,
      /expect\((\w+)\(/g,
      /(\w+)\(/g // Generic function calls
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(testContent)) !== null) {
        const text = match[1];
        
        // Extract function names from test descriptions
        const functionNamePatterns = [
          /(\w+)\.(\w+)/g, // Class.method
          /(\w+) function/g,
          /(\w+) method/g,
          /^(\w+)$/g // Just the function name
        ];
        
        for (const namePattern of functionNamePatterns) {
          let nameMatch;
          while ((nameMatch = namePattern.exec(text)) !== null) {
            if (nameMatch[2]) {
              // Class method
              this.testedFunctions.add(`${nameMatch[1]}.${nameMatch[2]}`);
            } else if (nameMatch[1]) {
              this.testedFunctions.add(nameMatch[1]);
            }
          }
        }
      }
    }
  }

  async calculateCoverage() {
    for (const [filePath, fileData] of this.sourceFiles) {
      for (const func of fileData.functions) {
        const isTested = this.testedFunctions.has(func.name) ||
                        this.testedFunctions.has(func.name.split('.').pop());
        
        if (!isTested) {
          this.coverageGaps.push({
            file: filePath,
            function: func,
            risk: this.calculateRisk(func)
          });
          this.statistics.untestedFunctions++;
        } else {
          this.statistics.testedFunctions++;
        }
      }
    }
    
    this.statistics.coveragePercentage = this.statistics.totalFunctions > 0
      ? (this.statistics.testedFunctions / this.statistics.totalFunctions) * 100
      : 0;
    
    // Calculate overall risk score
    this.statistics.riskScore = this.coverageGaps.reduce((sum, gap) => sum + gap.risk, 0) / 
                               (this.coverageGaps.length || 1);
  }

  calculateRisk(func) {
    let risk = 0;
    
    // Complexity contributes to risk
    risk += func.complexity * 2;
    
    // Exported functions are higher risk
    if (func.signature.includes('export')) {
      risk += 5;
    }
    
    // Components are medium risk
    if (func.type === 'component') {
      risk += 3;
    }
    
    // Methods that likely handle state are higher risk
    const stateHandlers = ['handle', 'update', 'set', 'get', 'fetch', 'save'];
    if (stateHandlers.some(handler => func.name.toLowerCase().includes(handler))) {
      risk += 4;
    }
    
    return Math.min(risk, 10); // Cap at 10
  }

  async generateReport() {
    const report = this.formatReport();
    
    if (this.ciMode) {
      // Write to file in CI mode
      const outputFile = `runtime-coverage-report.${this.outputFormat}`;
      await fs.writeFile(outputFile, report);
      console.log(chalk.blue(`\n📄 Report written to ${outputFile}`));
      
      // Set exit code based on coverage
      if (this.statistics.coveragePercentage < 50) {
        process.exitCode = 1; // Fail CI if coverage is too low
      }
    } else {
      // Print to console
      console.log('\n' + report);
    }
  }

  formatReport() {
    switch (this.outputFormat) {
      case 'json':
        return this.formatJSON();
      case 'html':
        return this.formatHTML();
      case 'markdown':
      default:
        return this.formatMarkdown();
    }
  }

  formatMarkdown() {
    let report = '# Runtime Test Coverage Report\n\n';
    
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += '## Summary\n\n';
    report += `- **Total Files**: ${this.statistics.totalFiles}\n`;
    report += `- **Total Functions**: ${this.statistics.totalFunctions}\n`;
    report += `- **Tested Functions**: ${this.statistics.testedFunctions}\n`;
    report += `- **Untested Functions**: ${this.statistics.untestedFunctions}\n`;
    report += `- **Coverage**: ${this.statistics.coveragePercentage.toFixed(1)}%\n`;
    report += `- **Risk Score**: ${this.statistics.riskScore.toFixed(1)}/10\n\n`;
    
    report += '## Coverage Gaps (Top 20 by Risk)\n\n';
    
    const topGaps = this.coverageGaps
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 20);
    
    report += '| File | Function | Type | Complexity | Risk |\n';
    report += '|------|----------|------|------------|------|\n';
    
    for (const gap of topGaps) {
      const file = path.relative(process.cwd(), gap.file);
      report += `| ${file} | ${gap.function.name} | ${gap.function.type} | ${gap.function.complexity} | ${gap.risk.toFixed(1)} |\n`;
    }
    
    report += '\n## Recommendations\n\n';
    
    if (this.statistics.coveragePercentage < 30) {
      report += '⚠️ **Critical**: Runtime test coverage is very low. Consider:\n';
      report += '- Setting up basic runtime tests for critical paths\n';
      report += '- Using cassette recording for external dependencies\n';
      report += '- Implementing property-based testing for complex logic\n\n';
    } else if (this.statistics.coveragePercentage < 60) {
      report += '⚠️ **Warning**: Runtime test coverage could be improved. Focus on:\n';
      report += '- Testing high-complexity functions\n';
      report += '- Adding integration tests for key workflows\n';
      report += '- Testing error handling paths\n\n';
    } else {
      report += '✅ **Good**: Runtime test coverage is reasonable. Consider:\n';
      report += '- Adding chaos testing for resilience\n';
      report += '- Implementing performance regression tests\n';
      report += '- Testing edge cases with property-based testing\n\n';
    }
    
    return report;
  }

  formatJSON() {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      statistics: this.statistics,
      coverageGaps: this.coverageGaps,
      sourceFiles: Array.from(this.sourceFiles.entries()).map(([path, data]) => ({
        path,
        hash: data.hash,
        functionCount: data.functions.length
      }))
    }, null, 2);
  }

  formatHTML() {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Runtime Coverage Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #333; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .stat {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #4CAF50;
    }
    .stat-label {
      color: #666;
      margin-top: 5px;
    }
    .coverage-bar {
      width: 100%;
      height: 20px;
      background: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      margin: 20px 0;
    }
    .coverage-fill {
      height: 100%;
      background: #4CAF50;
      width: ${this.statistics.coveragePercentage}%;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
    }
    .risk-high { color: #f44336; }
    .risk-medium { color: #ff9800; }
    .risk-low { color: #4caf50; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Runtime Test Coverage Report</h1>
    
    <div class="coverage-bar">
      <div class="coverage-fill"></div>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${this.statistics.totalFunctions}</div>
        <div class="stat-label">Total Functions</div>
      </div>
      <div class="stat">
        <div class="stat-value">${this.statistics.testedFunctions}</div>
        <div class="stat-label">Tested Functions</div>
      </div>
      <div class="stat">
        <div class="stat-value">${this.statistics.coveragePercentage.toFixed(1)}%</div>
        <div class="stat-label">Coverage</div>
      </div>
      <div class="stat">
        <div class="stat-value">${this.statistics.riskScore.toFixed(1)}</div>
        <div class="stat-label">Risk Score</div>
      </div>
    </div>
    
    <h2>Coverage Gaps</h2>
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Function</th>
          <th>Type</th>
          <th>Complexity</th>
          <th>Risk</th>
        </tr>
      </thead>
      <tbody>
        ${this.coverageGaps
          .sort((a, b) => b.risk - a.risk)
          .slice(0, 50)
          .map(gap => `
            <tr>
              <td>${path.relative(process.cwd(), gap.file)}</td>
              <td>${gap.function.name}</td>
              <td>${gap.function.type}</td>
              <td>${gap.function.complexity}</td>
              <td class="${gap.risk > 7 ? 'risk-high' : gap.risk > 4 ? 'risk-medium' : 'risk-low'}">${gap.risk.toFixed(1)}</td>
            </tr>
          `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  }

  hashContent(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    srcDir: './src',
    testsDir: './runtime-tests',
    outputFormat: 'markdown',
    ci: false
  };
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--src':
        options.srcDir = args[++i];
        break;
      case '--tests':
        options.testsDir = args[++i];
        break;
      case '--output':
        options.outputFormat = args[++i];
        break;
      case '--ci':
        options.ci = true;
        break;
      case '--help':
        console.log(`
Runtime Coverage Gap Analyzer

Usage:
  node identify-runtime-coverage-gaps.js [options]

Options:
  --src <path>        Source directory (default: ./src)
  --tests <path>      Runtime tests directory (default: ./runtime-tests)
  --output <format>   Output format: json, markdown, html (default: markdown)
  --ci                CI mode - outputs to file and sets exit code

Examples:
  # Basic usage
  node identify-runtime-coverage-gaps.js

  # Custom directories
  node identify-runtime-coverage-gaps.js --src packages/sdk/src --tests apps/runtime-tests

  # CI mode with JSON output
  node identify-runtime-coverage-gaps.js --ci --output json
        `);
        process.exit(0);
    }
  }
  
  const analyzer = new RuntimeCoverageAnalyzer(options);
  
  try {
    const results = await analyzer.analyze();
    
    if (!options.ci) {
      console.log(chalk.bold('\n📊 Analysis Complete!'));
      console.log(chalk.green(`Coverage: ${results.coveragePercentage.toFixed(1)}%`));
      
      if (results.riskScore > 7) {
        console.log(chalk.red(`Risk Score: ${results.riskScore.toFixed(1)}/10 (High)`));
      } else if (results.riskScore > 4) {
        console.log(chalk.yellow(`Risk Score: ${results.riskScore.toFixed(1)}/10 (Medium)`));
      } else {
        console.log(chalk.green(`Risk Score: ${results.riskScore.toFixed(1)}/10 (Low)`));
      }
    }
  } catch (error) {
    console.error(chalk.red('Analysis failed:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RuntimeCoverageAnalyzer };