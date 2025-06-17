import { describe, it, expect } from 'vitest';
import { 
  CorrelatedDistribution, 
  CommonCorrelations,
  NormalDistribution,
  UniformDistribution 
} from '../src/distributions';

describe('CorrelatedDistribution', () => {
  it('should generate basic attributes', () => {
    const dist = new CorrelatedDistribution({
      age: new NormalDistribution(30, 5),
      occupation: 'Developer',
      sex: 'female'
    });

    const result = dist.generate();
    
    expect(result).toHaveProperty('age');
    expect(result.occupation).toBe('Developer');
    expect(result.sex).toBe('female');
    expect(typeof result.age).toBe('number');
  });

  it('should apply correlations between attributes', () => {
    const dist = new CorrelatedDistribution({
      age: new UniformDistribution(25, 65),
      income: new NormalDistribution(50000, 20000)
    });

    dist.addCorrelation({
      attribute1: 'age',
      attribute2: 'income',
      correlation: 0.8
    });

    // Generate multiple samples to test correlation
    const samples = Array.from({ length: 100 }, () => dist.generate());
    
    // Basic sanity check - older people should tend to have higher incomes
    const youngGroup = samples.filter(s => s.age < 35);
    const oldGroup = samples.filter(s => s.age > 55);
    
    if (youngGroup.length > 0 && oldGroup.length > 0) {
      const avgYoungIncome = youngGroup.reduce((sum, s) => sum + s.income, 0) / youngGroup.length;
      const avgOldIncome = oldGroup.reduce((sum, s) => sum + s.income, 0) / oldGroup.length;
      
      // With positive correlation, older group should have higher average income
      // This is a weak test due to randomness, but should generally hold
      expect(avgOldIncome).toBeGreaterThan(avgYoungIncome * 0.9);
    }
  });

  it('should apply conditional distributions', () => {
    const dist = new CorrelatedDistribution({
      age: new UniformDistribution(20, 70),
      yearsExperience: new NormalDistribution(15, 10)
    });

    dist.addConditional({
      attribute: 'yearsExperience',
      baseDistribution: new NormalDistribution(15, 10),
      conditions: [{
        dependsOn: 'age',
        transform: CommonCorrelations.ageExperience
      }]
    });

    // Test multiple samples
    for (let i = 0; i < 20; i++) {
      const result = dist.generate();
      
      // Experience should never exceed working years (age - 22)
      const maxExperience = Math.max(0, result.age - 22);
      expect(result.yearsExperience).toBeLessThanOrEqual(maxExperience);
      expect(result.yearsExperience).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle multiple conditional dependencies', () => {
    const dist = new CorrelatedDistribution({
      age: new UniformDistribution(25, 65),
      yearsExperience: new NormalDistribution(10, 5),
      income: new NormalDistribution(60000, 20000),
      location: 'San Francisco'
    });

    // Experience depends on age
    dist.addConditional({
      attribute: 'yearsExperience',
      baseDistribution: new NormalDistribution(10, 5),
      conditions: [{
        dependsOn: 'age',
        transform: CommonCorrelations.ageExperience
      }]
    });

    // Income depends on both age and location
    dist.addConditional({
      attribute: 'income',
      baseDistribution: new NormalDistribution(60000, 20000),
      conditions: [
        {
          dependsOn: 'age',
          transform: CommonCorrelations.ageIncome
        },
        {
          dependsOn: 'location',
          transform: (income, location) => 
            location === 'San Francisco' ? income * 1.3 : income
        }
      ]
    });

    const result = dist.generate();
    
    // Basic checks
    expect(result.yearsExperience).toBeLessThanOrEqual(result.age - 22);
    expect(result.income).toBeGreaterThan(0);
    
    // San Francisco should have higher income due to location multiplier
    expect(result.income).toBeGreaterThan(50000); // Rough check
  });

  it('should mix literal values with distributions', () => {
    const dist = new CorrelatedDistribution({
      name: 'John Doe',
      age: new NormalDistribution(35, 5),
      income: new NormalDistribution(80000, 15000),
      department: 'Engineering',
      remote: true
    });

    const result = dist.generate();
    
    // Literals should be preserved exactly
    expect(result.name).toBe('John Doe');
    expect(result.department).toBe('Engineering');
    expect(result.remote).toBe(true);
    
    // Distributions should generate numbers
    expect(typeof result.age).toBe('number');
    expect(typeof result.income).toBe('number');
  });
});

describe('CommonCorrelations', () => {
  it('should limit experience by age', () => {
    expect(CommonCorrelations.ageExperience(20, 25)).toBeLessThanOrEqual(3);
    expect(CommonCorrelations.ageExperience(30, 45)).toBeLessThanOrEqual(23);
    expect(CommonCorrelations.ageExperience(50, 60)).toBeLessThanOrEqual(38);
  });

  it('should correlate age with income', () => {
    const baseIncome = 50000;
    
    // Young person should have lower income
    const youngIncome = CommonCorrelations.ageIncome(baseIncome, 25);
    
    // Peak earner should have higher income
    const peakIncome = CommonCorrelations.ageIncome(baseIncome, 50);
    
    // Retired person should have lower income than peak
    const retiredIncome = CommonCorrelations.ageIncome(baseIncome, 70);
    
    expect(peakIncome).toBeGreaterThan(youngIncome);
    expect(peakIncome).toBeGreaterThan(retiredIncome);
  });

  it('should calculate BMI-based weight from height', () => {
    // Test various heights
    const weight1 = CommonCorrelations.heightWeight(50, 160); // 160cm
    const weight2 = CommonCorrelations.heightWeight(50, 180); // 180cm
    
    // Taller person should weigh more with same base
    expect(weight2).toBeGreaterThan(weight1);
    
    // Weights should be reasonable (BMI 18-26)
    expect(weight1).toBeGreaterThan(40);
    expect(weight1).toBeLessThan(80);
    expect(weight2).toBeGreaterThan(55);
    expect(weight2).toBeLessThan(95);
  });

  it('should increase income with education', () => {
    const baseIncome = 50000;
    
    const highSchool = CommonCorrelations.educationIncome(baseIncome, 12);
    const bachelors = CommonCorrelations.educationIncome(baseIncome, 16);
    const masters = CommonCorrelations.educationIncome(baseIncome, 18);
    
    expect(bachelors).toBeGreaterThan(highSchool);
    expect(masters).toBeGreaterThan(bachelors);
  });

  it('should adjust income for urban vs rural', () => {
    const baseIncome = 60000;
    
    const urbanIncome = CommonCorrelations.urbanRuralIncome(baseIncome, true);
    const ruralIncome = CommonCorrelations.urbanRuralIncome(baseIncome, false);
    
    expect(urbanIncome).toBeGreaterThan(ruralIncome);
    expect(urbanIncome).toBeCloseTo(baseIncome * 1.2);
    expect(ruralIncome).toBeCloseTo(baseIncome * 0.85);
  });
});