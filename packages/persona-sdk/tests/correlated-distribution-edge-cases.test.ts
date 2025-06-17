import { describe, it, expect } from 'vitest';
import { 
  CorrelatedDistribution, 
  CommonCorrelations,
  NormalDistribution,
  UniformDistribution,
  CategoricalDistribution,
  ExponentialDistribution,
  BetaDistribution
} from '../src/distributions';

describe('CorrelatedDistribution - Edge Cases', () => {
  describe('Empty and minimal configurations', () => {
    it('should handle empty attributes', () => {
      const dist = new CorrelatedDistribution({});
      const result = dist.generate();
      
      expect(result).toEqual({});
    });

    it('should handle only literal values', () => {
      const dist = new CorrelatedDistribution({
        name: 'John',
        age: 30,
        active: true,
        tags: ['developer', 'remote']
      });
      
      const result = dist.generate();
      
      expect(result).toEqual({
        name: 'John',
        age: 30,
        active: true,
        tags: ['developer', 'remote']
      });
    });

    it('should handle single distribution', () => {
      const dist = new CorrelatedDistribution({
        age: new UniformDistribution(20, 30)
      });
      
      const result = dist.generate();
      
      expect(result).toHaveProperty('age');
      expect(result.age).toBeGreaterThanOrEqual(20);
      expect(result.age).toBeLessThanOrEqual(30);
    });
  });

  describe('Correlation edge cases', () => {
    it('should handle correlation with missing attribute', () => {
      const dist = new CorrelatedDistribution({
        age: new NormalDistribution(30, 5)
      });
      
      // Add correlation to non-existent attribute
      dist.addCorrelation({
        attribute1: 'age',
        attribute2: 'income',
        correlation: 0.6
      });
      
      const result = dist.generate();
      expect(result).toHaveProperty('age');
      expect(result).not.toHaveProperty('income');
    });

    it('should handle self-correlation gracefully', () => {
      const dist = new CorrelatedDistribution({
        age: new UniformDistribution(20, 40)
      });
      
      dist.addCorrelation({
        attribute1: 'age',
        attribute2: 'age',
        correlation: 1.0
      });
      
      const result = dist.generate();
      expect(result.age).toBeGreaterThanOrEqual(20);
      expect(result.age).toBeLessThanOrEqual(40);
    });

    it('should handle extreme correlation values', () => {
      const dist = new CorrelatedDistribution({
        x: new NormalDistribution(0, 1),
        y: new NormalDistribution(0, 1)
      });
      
      // Test extreme positive correlation
      dist.addCorrelation({
        attribute1: 'x',
        attribute2: 'y',
        correlation: 1.0
      });
      
      const samples = Array.from({ length: 500 }, () => dist.generate());
      
      // With perfect correlation, when x is high, y should tend to be high
      const highX = samples.filter(s => s.x > 0);
      const highXHighY = highX.filter(s => s.y > 0);
      
      // Most samples with high x should have high y (with tolerance)
      expect(highXHighY.length / highX.length).toBeGreaterThan(0.5);
    });

    it('should handle negative correlations', () => {
      const dist = new CorrelatedDistribution({
        stress: new UniformDistribution(0, 10),
        happiness: new UniformDistribution(0, 10)
      });
      
      dist.addCorrelation({
        attribute1: 'stress',
        attribute2: 'happiness',
        correlation: -0.8
      });
      
      const samples = Array.from({ length: 500 }, () => dist.generate());
      
      // High stress should correlate with low happiness
      const highStress = samples.filter(s => s.stress > 7);
      const highStressLowHappiness = highStress.filter(s => s.happiness < 5);
      
      // Expect correlation but with tolerance for randomness
      if (highStress.length > 0) {
        expect(highStressLowHappiness.length / highStress.length).toBeGreaterThan(0.4);
      }
    });
  });

  describe('Conditional distribution edge cases', () => {
    it('should handle circular dependencies', () => {
      const dist = new CorrelatedDistribution({
        a: new NormalDistribution(5, 1),
        b: new NormalDistribution(10, 2)
      });
      
      // Create circular dependency: a depends on b, b depends on a
      dist.addConditional({
        attribute: 'a',
        baseDistribution: new NormalDistribution(5, 1),
        conditions: [{
          dependsOn: 'b',
          transform: (a, b) => a + b * 0.1
        }]
      });
      
      dist.addConditional({
        attribute: 'b',
        baseDistribution: new NormalDistribution(10, 2),
        conditions: [{
          dependsOn: 'a',
          transform: (b, a) => b + a * 0.1
        }]
      });
      
      // Should not hang - circular dependencies should be detected
      const result = dist.generate();
      expect(result).toBeDefined();
    });

    it('should handle missing dependencies', () => {
      const dist = new CorrelatedDistribution({
        salary: new NormalDistribution(50000, 10000)
      });
      
      dist.addConditional({
        attribute: 'salary',
        baseDistribution: new NormalDistribution(50000, 10000),
        conditions: [{
          dependsOn: 'yearsExperience', // This doesn't exist
          transform: (salary, exp) => salary + exp * 5000
        }]
      });
      
      const result = dist.generate();
      // Should still generate salary without the conditional
      expect(result).toHaveProperty('salary');
      expect(typeof result.salary).toBe('number');
    });

    it.todo('should handle multiple conditions on same attribute', () => {
      const dist = new CorrelatedDistribution({
        age: new UniformDistribution(25, 65),
        location: 'San Francisco',
        education: 16 // years
      });
      
      dist.addConditional({
        attribute: 'income',
        baseDistribution: new NormalDistribution(60000, 20000),
        conditions: [
          {
            dependsOn: 'age',
            transform: CommonCorrelations.ageIncome
          },
          {
            dependsOn: 'education',
            transform: CommonCorrelations.educationIncome
          },
          {
            dependsOn: 'location',
            transform: (income, location) => 
              location === 'San Francisco' ? income * 1.5 : income
          }
        ]
      });
      
      const result = dist.generate();
      
      // Income should be significantly higher due to SF multiplier
      expect(result.income).toBeGreaterThan(70000);
    });

    it('should handle transform functions that return invalid values', () => {
      const dist = new CorrelatedDistribution({
        base: new UniformDistribution(1, 10),
        derived: new NormalDistribution(5, 2)
      });
      
      dist.addConditional({
        attribute: 'derived',
        baseDistribution: new NormalDistribution(5, 2),
        conditions: [{
          dependsOn: 'base',
          transform: (derived, base) => {
            // Intentionally problematic transforms
            if (base < 3) return NaN;
            if (base < 5) return Infinity;
            if (base < 7) return -Infinity;
            return derived;
          }
        }]
      });
      
      // Should still generate without crashing
      const result = dist.generate();
      expect(result).toHaveProperty('base');
      expect(result).toHaveProperty('derived');
    });
  });

  describe('Mixed distribution types', () => {
    it('should handle all distribution types together', () => {
      const dist = new CorrelatedDistribution({
        // Continuous distributions
        age: new NormalDistribution(35, 10),
        salary: new UniformDistribution(40000, 120000),
        responseTime: new ExponentialDistribution(2),
        successRate: new BetaDistribution(2, 5),
        
        // Categorical distribution
        department: new CategoricalDistribution([
          { value: 'Engineering', probability: 0.4 },
          { value: 'Sales', probability: 0.3 },
          { value: 'Marketing', probability: 0.3 }
        ]),
        
        // Literals
        company: 'TechCorp',
        remote: true
      });
      
      const result = dist.generate();
      
      // Check all values are generated correctly
      expect(typeof result.age).toBe('number');
      expect(typeof result.salary).toBe('number');
      expect(typeof result.responseTime).toBe('number');
      expect(typeof result.successRate).toBe('number');
      expect(result.successRate).toBeGreaterThanOrEqual(0);
      expect(result.successRate).toBeLessThanOrEqual(1);
      expect(['Engineering', 'Sales', 'Marketing']).toContain(result.department);
      expect(result.company).toBe('TechCorp');
      expect(result.remote).toBe(true);
    });

    it('should handle correlations between different distribution types', () => {
      const dist = new CorrelatedDistribution({
        performance: new BetaDistribution(2, 2), // 0-1 range
        bonus: new NormalDistribution(5000, 2000)
      });
      
      dist.addConditional({
        attribute: 'bonus',
        baseDistribution: new NormalDistribution(5000, 2000),
        conditions: [{
          dependsOn: 'performance',
          transform: (bonus, performance) => bonus * (1 + performance)
        }]
      });
      
      const samples = Array.from({ length: 200 }, () => dist.generate());
      
      // High performers should have higher bonuses
      const highPerformers = samples.filter(s => s.performance > 0.7);
      const lowPerformers = samples.filter(s => s.performance < 0.3);
      
      if (highPerformers.length > 5 && lowPerformers.length > 5) {
        const avgHighBonus = highPerformers.reduce((sum, s) => sum + s.bonus, 0) / highPerformers.length;
        const avgLowBonus = lowPerformers.reduce((sum, s) => sum + s.bonus, 0) / lowPerformers.length;
        
        // High performers should have noticeably higher bonuses (with tolerance)
        expect(avgHighBonus).toBeGreaterThan(avgLowBonus * 1.2);
      }
    });
  });

  describe('Null and undefined handling', () => {
    it('should handle null values in attributes', () => {
      const dist = new CorrelatedDistribution({
        name: 'Test',
        middleName: null,
        age: new NormalDistribution(30, 5),
        nickname: undefined
      });
      
      const result = dist.generate();
      
      expect(result.name).toBe('Test');
      expect(result.middleName).toBeNull();
      expect(typeof result.age).toBe('number');
      expect(result.nickname).toBeUndefined();
    });

    it('should handle null in transform functions', () => {
      const dist = new CorrelatedDistribution({
        hasBonus: new CategoricalDistribution([
          { value: true, probability: 0.3 },
          { value: false, probability: 0.7 }
        ]),
        bonusAmount: new NormalDistribution(5000, 1000)
      });
      
      dist.addConditional({
        attribute: 'bonusAmount',
        baseDistribution: new NormalDistribution(5000, 1000),
        conditions: [{
          dependsOn: 'hasBonus',
          transform: (amount, hasBonus) => hasBonus ? amount : null
        }]
      });
      
      const result = dist.generate();
      
      if (result.hasBonus) {
        expect(typeof result.bonusAmount).toBe('number');
      } else {
        expect(result.bonusAmount).toBeNull();
      }
    });
  });

  describe('Large-scale generation stability', () => {
    it('should handle many attributes without performance degradation', () => {
      const attributes: Record<string, any> = {
        company: 'BigCorp'
      };
      
      // Add 100 numeric attributes
      for (let i = 0; i < 100; i++) {
        attributes[`metric${i}`] = new NormalDistribution(50, 10);
      }
      
      const dist = new CorrelatedDistribution(attributes);
      
      // Add correlations between consecutive metrics
      for (let i = 0; i < 99; i++) {
        dist.addCorrelation({
          attribute1: `metric${i}`,
          attribute2: `metric${i + 1}`,
          correlation: 0.5
        });
      }
      
      const start = Date.now();
      const result = dist.generate();
      const duration = Date.now() - start;
      
      // Should complete reasonably quickly (less than 100ms)
      expect(duration).toBeLessThan(100);
      
      // All metrics should be generated
      for (let i = 0; i < 100; i++) {
        expect(result).toHaveProperty(`metric${i}`);
        expect(typeof result[`metric${i}`]).toBe('number');
      }
    });

    it.todo('should maintain statistical properties over many samples', () => {
      const dist = new CorrelatedDistribution({
        age: new NormalDistribution(35, 10),
        income: new NormalDistribution(75000, 25000)
      });
      
      dist.addCorrelation({
        attribute1: 'age',
        attribute2: 'income',
        correlation: 0.7
      });
      
      const samples = Array.from({ length: 1000 }, () => dist.generate());
      
      // Calculate means
      const avgAge = samples.reduce((sum, s) => sum + s.age, 0) / samples.length;
      const avgIncome = samples.reduce((sum, s) => sum + s.income, 0) / samples.length;
      
      // Should be close to the specified means
      expect(avgAge).toBeCloseTo(35, -1); // Within 10
      expect(avgIncome).toBeCloseTo(75000, -3); // Within 1000
      
      // Calculate correlation
      const ageDevs = samples.map(s => s.age - avgAge);
      const incomeDevs = samples.map(s => s.income - avgIncome);
      
      const covariance = ageDevs.reduce((sum, ageDev, i) => 
        sum + ageDev * incomeDevs[i], 0) / samples.length;
      
      const ageStd = Math.sqrt(ageDevs.reduce((sum, dev) => 
        sum + dev * dev, 0) / samples.length);
      
      const incomeStd = Math.sqrt(incomeDevs.reduce((sum, dev) => 
        sum + dev * dev, 0) / samples.length);
      
      const correlation = covariance / (ageStd * incomeStd);
      
      // Correlation should be positive and meaningful
      expect(correlation).toBeGreaterThan(0.3);
      expect(correlation).toBeLessThan(1.0);
    });
  });

  describe('Transform function edge cases', () => {
    it('should handle transforms that dramatically change scale', () => {
      const dist = new CorrelatedDistribution({
        input: new UniformDistribution(0, 1),
        output: new NormalDistribution(0, 1)
      });
      
      dist.addConditional({
        attribute: 'output',
        baseDistribution: new NormalDistribution(0, 1),
        conditions: [{
          dependsOn: 'input',
          transform: (output, input) => output * 1000000 // Massive scaling
        }]
      });
      
      const result = dist.generate();
      expect(result.output).toBeDefined();
      expect(Math.abs(result.output)).toBeLessThan(10000000); // Still reasonable
    });

    it('should handle transforms with complex logic', () => {
      const dist = new CorrelatedDistribution({
        age: new UniformDistribution(18, 80),
        employmentStatus: new CategoricalDistribution([
          { value: 'employed', probability: 0.6 },
          { value: 'unemployed', probability: 0.2 },
          { value: 'retired', probability: 0.2 }
        ]),
        income: new NormalDistribution(50000, 20000)
      });
      
      dist.addConditional({
        attribute: 'income',
        baseDistribution: new NormalDistribution(50000, 20000),
        conditions: [{
          dependsOn: 'employmentStatus',
          transform: (income, status) => {
            switch (status) {
              case 'employed': return income;
              case 'unemployed': return income * 0.2; // Unemployment benefits
              case 'retired': return income * 0.6; // Pension
              default: return income;
            }
          }
        }]
      });
      
      const samples = Array.from({ length: 100 }, () => dist.generate());
      
      const employed = samples.filter(s => s.employmentStatus === 'employed');
      const unemployed = samples.filter(s => s.employmentStatus === 'unemployed');
      const retired = samples.filter(s => s.employmentStatus === 'retired');
      
      if (employed.length > 0 && unemployed.length > 0) {
        const avgEmployedIncome = employed.reduce((sum, s) => sum + s.income, 0) / employed.length;
        const avgUnemployedIncome = unemployed.reduce((sum, s) => sum + s.income, 0) / unemployed.length;
        
        expect(avgEmployedIncome).toBeGreaterThan(avgUnemployedIncome);
      }
    });
  });
});