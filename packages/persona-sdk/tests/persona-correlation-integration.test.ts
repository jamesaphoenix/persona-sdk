import { describe, it, expect } from 'vitest';
import { 
  PersonaBuilder,
  PersonaGroup,
  NormalDistribution,
  UniformDistribution,
  CategoricalDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CommonCorrelations
} from '../src';

describe('PersonaBuilder with Correlations - Integration Tests', () => {
  describe('Real-world scenarios', () => {
    it('should create realistic tech professionals', () => {
      const persona = PersonaBuilder.create()
        .withName('Alex Chen')
        .withAge(new NormalDistribution(32, 8))
        .withOccupation('Software Engineer')
        .withSex('other')
        .withAttribute('yearsExperience', new NormalDistribution(8, 4))
        .withAttribute('income', new NormalDistribution(120000, 30000))
        .withAttribute('githubContributions', new ExponentialDistribution(0.01))
        .buildWithCorrelations({
          correlations: [
            { attribute1: 'age', attribute2: 'income', correlation: 0.7 },
            { attribute1: 'yearsExperience', attribute2: 'income', correlation: 0.8 },
            { attribute1: 'yearsExperience', attribute2: 'githubContributions', correlation: 0.5 }
          ],
          conditionals: [
            {
              attribute: 'yearsExperience',
              dependsOn: 'age',
              transform: CommonCorrelations.ageExperience
            }
          ]
        });

      expect(persona.name).toBe('Alex Chen');
      expect(persona.attributes.occupation).toBe('Software Engineer');
      expect(persona.attributes.yearsExperience).toBeLessThanOrEqual(persona.attributes.age - 22);
      expect(persona.attributes.yearsExperience).toBeGreaterThanOrEqual(0);
    });

    it('should create realistic healthcare workers', () => {
      const persona = PersonaBuilder.create()
        .withName('Dr. Sarah Johnson')
        .withAge(new UniformDistribution(28, 65))
        .withOccupation('Physician')
        .withSex('female')
        .withAttribute('yearsExperience', new NormalDistribution(15, 8))
        .withAttribute('income', new NormalDistribution(200000, 50000))
        .withAttribute('patientsPerDay', new NormalDistribution(20, 5))
        .withAttribute('hoursPerWeek', new NormalDistribution(50, 10))
        .buildWithCorrelations({
          correlations: [
            { attribute1: 'yearsExperience', attribute2: 'income', correlation: 0.8 },
            { attribute1: 'hoursPerWeek', attribute2: 'patientsPerDay', correlation: 0.6 }
          ],
          conditionals: [
            {
              attribute: 'yearsExperience',
              dependsOn: 'age',
              transform: (exp, age) => Math.min(exp, Math.max(0, age - 28)) // Med school at 28
            },
            {
              attribute: 'income',
              dependsOn: 'yearsExperience',
              transform: (income, exp) => income * (1 + exp * 0.03) // 3% increase per year
            }
          ]
        });

      expect(persona.attributes.yearsExperience).toBeLessThanOrEqual(persona.attributes.age - 28);
    });

    it('should create realistic students', () => {
      const persona = PersonaBuilder.create()
        .withName('Student')
        .withAge(new NormalDistribution(20, 2))
        .withOccupation('Student')
        .withSex('other')
        .withAttribute('yearInSchool', new UniformDistribution(1, 4))
        .withAttribute('gpa', new BetaDistribution(8, 2).scale(0, 4)) // Skewed toward higher GPAs
        .withAttribute('studentDebt', new ExponentialDistribution(0.00003))
        .withAttribute('hoursStudyPerWeek', new NormalDistribution(20, 10))
        .buildWithCorrelations({
          correlations: [
            { attribute1: 'hoursStudyPerWeek', attribute2: 'gpa', correlation: 0.6 },
            { attribute1: 'yearInSchool', attribute2: 'studentDebt', correlation: 0.9 }
          ],
          conditionals: [
            {
              attribute: 'studentDebt',
              dependsOn: 'yearInSchool',
              transform: (debt, year) => debt * year // Debt accumulates
            },
            {
              attribute: 'hoursStudyPerWeek',
              dependsOn: 'gpa',
              transform: (hours, gpa) => {
                // High achievers study more consistently
                return gpa > 3.5 ? Math.max(15, hours) : hours;
              }
            }
          ]
        });

      expect(persona.attributes.gpa).toBeGreaterThanOrEqual(0);
      expect(persona.attributes.gpa).toBeLessThanOrEqual(4);
      expect(persona.attributes.yearInSchool).toBeGreaterThanOrEqual(1);
      expect(persona.attributes.yearInSchool).toBeLessThanOrEqual(4);
    });
  });

  describe('Complex conditional relationships', () => {
    it('should handle multi-factor income determination', () => {
      const persona = PersonaBuilder.create()
        .withName('Professional')
        .withAge(new UniformDistribution(25, 65))
        .withOccupation('Manager')
        .withSex('other')
        .withAttribute('educationYears', new NormalDistribution(16, 2))
        .withAttribute('yearsExperience', new NormalDistribution(10, 5))
        .withAttribute('location', new CategoricalDistribution([
          { value: 'San Francisco', probability: 0.2 },
          { value: 'New York', probability: 0.3 },
          { value: 'Austin', probability: 0.3 },
          { value: 'Remote', probability: 0.2 }
        ]))
        .withAttribute('income', new NormalDistribution(80000, 20000))
        .buildWithCorrelations({
          conditionals: [
            {
              attribute: 'yearsExperience',
              dependsOn: 'age',
              transform: CommonCorrelations.ageExperience
            },
            {
              attribute: 'income',
              dependsOn: 'educationYears',
              transform: CommonCorrelations.educationIncome
            },
            {
              attribute: 'income',
              dependsOn: 'location',
              transform: (income, location) => {
                const multipliers: Record<string, number> = {
                  'San Francisco': 1.4,
                  'New York': 1.3,
                  'Austin': 1.1,
                  'Remote': 0.95
                };
                return income * (multipliers[location as string] || 1);
              }
            }
          ]
        });

      // Income should be affected by location
      if (persona.attributes.location === 'San Francisco') {
        expect(persona.attributes.income).toBeGreaterThan(100000);
      }
    });

    it('should create personas with lifestyle correlations', () => {
      const persona = PersonaBuilder.create()
        .withName('City Dweller')
        .withAge(new NormalDistribution(30, 10))
        .withOccupation('Professional')
        .withSex('other')
        .withAttribute('income', new NormalDistribution(60000, 20000))
        .withAttribute('rentPerMonth', new NormalDistribution(1500, 500))
        .withAttribute('savingsRate', new BetaDistribution(2, 5)) // Most people save little
        .withAttribute('gymMembership', new CategoricalDistribution([
          { value: true, probability: 0.4 },
          { value: false, probability: 0.6 }
        ]))
        .withAttribute('monthlyGymCost', new UniformDistribution(30, 150))
        .buildWithCorrelations({
          correlations: [
            { attribute1: 'income', attribute2: 'rentPerMonth', correlation: 0.7 },
            { attribute1: 'income', attribute2: 'savingsRate', correlation: 0.4 }
          ],
          conditionals: [
            {
              attribute: 'rentPerMonth',
              dependsOn: 'income',
              transform: (rent, income) => {
                // Rent should be 20-35% of monthly income
                const monthlyIncome = income / 12;
                const targetRent = monthlyIncome * 0.28;
                const calculatedRent = rent * 0.3 + targetRent * 0.7;
                // Ensure minimum 20% of monthly income
                return Math.max(monthlyIncome * 0.2, calculatedRent);
              }
            },
            {
              attribute: 'monthlyGymCost',
              dependsOn: 'gymMembership',
              transform: (cost, hasMembership) => hasMembership ? cost : 0
            }
          ]
        });

      // Rent should be reasonable percentage of income
      expect(persona.attributes.rentPerMonth).toBeDefined();
      expect(persona.attributes.income).toBeDefined();
      
      const monthlyIncome = persona.attributes.income / 12;
      const rentRatio = persona.attributes.rentPerMonth / monthlyIncome;
      
      expect(rentRatio).toBeGreaterThan(0.15);
      expect(rentRatio).toBeLessThan(0.5);
      
      // Gym cost should be 0 if no membership
      if (!persona.attributes.gymMembership) {
        expect(persona.attributes.monthlyGymCost).toBe(0);
      }
    });
  });

  describe('Error handling and validation', () => {
    it('should validate required attributes even with correlations', () => {
      const builder = PersonaBuilder.create()
        .withName('Test')
        .withAge(new NormalDistribution(30, 5))
        // Missing occupation and sex
        .withAttribute('income', new NormalDistribution(50000, 10000));

      expect(() => {
        builder.buildWithCorrelations({
          correlations: [
            { attribute1: 'age', attribute2: 'income', correlation: 0.6 }
          ]
        });
      }).toThrow('Required attributes');
    });

    it('should handle invalid correlation specifications gracefully', () => {
      const persona = PersonaBuilder.create()
        .withName('Test')
        .withAge(30)
        .withOccupation('Tester')
        .withSex('other')
        .buildWithCorrelations({
          correlations: [
            // Invalid correlation to non-numeric attribute
            { attribute1: 'age', attribute2: 'occupation', correlation: 0.5 }
          ]
        });

      // Should still create persona successfully
      expect(persona.attributes.age).toBe(30);
      expect(persona.attributes.occupation).toBe('Tester');
    });
  });
});

describe('PersonaGroup with Correlations - Integration Tests', () => {
  describe('Demographic simulations', () => {
    it('should create realistic city population', () => {
      const cityPopulation = new PersonaGroup('San Francisco Residents');
      
      cityPopulation.generateWithCorrelations(50, {
        attributes: {
          age: new NormalDistribution(34, 12), // Younger city
          income: new NormalDistribution(120000, 40000),
          rentPerMonth: new NormalDistribution(3000, 1000),
          commuteMinutes: new ExponentialDistribution(0.03),
          techWorker: new CategoricalDistribution([
            { value: true, probability: 0.4 },
            { value: false, probability: 0.6 }
          ]),
          hasRoommates: new CategoricalDistribution([
            { value: true, probability: 0.3 },
            { value: false, probability: 0.7 }
          ]),
          occupation: 'Professional',
          sex: 'other'
        },
        correlations: [
          { attribute1: 'age', attribute2: 'income', correlation: 0.6 },
          { attribute1: 'income', attribute2: 'rentPerMonth', correlation: 0.8 },
          { attribute1: 'age', attribute2: 'hasRoommates', correlation: -0.4 } // Younger more likely to have roommates
        ],
        conditionals: [
          {
            attribute: 'income',
            dependsOn: 'techWorker',
            transform: (income, isTech) => isTech ? income * 1.3 : income
          },
          {
            attribute: 'rentPerMonth',
            dependsOn: 'hasRoommates',
            transform: (rent, hasRoommates) => hasRoommates ? rent * 0.6 : rent
          },
          {
            attribute: 'commuteMinutes',
            dependsOn: 'income',
            transform: (commute, income) => {
              // Higher income -> can afford to live closer
              return income > 150000 ? commute * 0.7 : commute;
            }
          }
        ]
      });

      const stats = cityPopulation.getStatistics('income');
      expect(stats.mean).toBeGreaterThan(80000); // High income city
      
      // Tech workers should earn more on average
      const techWorkers = cityPopulation.filter(p => p.attributes.techWorker === true);
      const nonTechWorkers = cityPopulation.filter(p => p.attributes.techWorker === false);
      
      if (techWorkers.length > 0 && nonTechWorkers.length > 0) {
        const techIncome = techWorkers.reduce((sum, p) => sum + p.attributes.income, 0) / techWorkers.length;
        const nonTechIncome = nonTechWorkers.reduce((sum, p) => sum + p.attributes.income, 0) / nonTechWorkers.length;
        
        expect(techIncome).toBeGreaterThan(nonTechIncome);
      }
    });

    it('should create realistic company workforce', () => {
      const company = new PersonaGroup('TechCorp Employees');
      
      company.generateWithCorrelations(100, {
        attributes: {
          age: new NormalDistribution(32, 8),
          yearsAtCompany: new ExponentialDistribution(0.3),
          level: new CategoricalDistribution([
            { value: 'Junior', probability: 0.3 },
            { value: 'Mid', probability: 0.4 },
            { value: 'Senior', probability: 0.2 },
            { value: 'Lead', probability: 0.1 }
          ]),
          salary: new NormalDistribution(100000, 30000),
          stockOptions: new ExponentialDistribution(0.00001),
          satisfaction: new BetaDistribution(7, 3), // Skewed positive
          occupation: 'Software Engineer',
          sex: 'other'
        },
        correlations: [
          { attribute1: 'yearsAtCompany', attribute2: 'salary', correlation: 0.7 },
          { attribute1: 'age', attribute2: 'yearsAtCompany', correlation: 0.5 }
        ],
        conditionals: [
          {
            attribute: 'salary',
            dependsOn: 'level',
            transform: (salary, level) => {
              const multipliers: Record<string, number> = {
                'Junior': 0.7,
                'Mid': 1.0,
                'Senior': 1.5,
                'Lead': 2.0
              };
              return salary * (multipliers[level as string] || 1);
            }
          },
          {
            attribute: 'stockOptions',
            dependsOn: 'yearsAtCompany',
            transform: (options, years) => options * Math.pow(1.5, years)
          },
          {
            attribute: 'yearsAtCompany',
            dependsOn: 'age',
            transform: (years, age) => Math.min(years, age - 22)
          }
        ]
      });

      // Verify hierarchy makes sense
      const juniors = company.filter(p => p.attributes.level === 'Junior');
      const seniors = company.filter(p => p.attributes.level === 'Senior');
      
      if (juniors.length > 0 && seniors.length > 0) {
        const juniorAvgSalary = juniors.reduce((sum, p) => sum + p.attributes.salary, 0) / juniors.length;
        const seniorAvgSalary = seniors.reduce((sum, p) => sum + p.attributes.salary, 0) / seniors.length;
        
        expect(seniorAvgSalary).toBeGreaterThan(juniorAvgSalary * 1.3);
      }
    });
  });

  describe('Statistical consistency', () => {
    it('should maintain correlations across large groups', () => {
      const group = new PersonaGroup('Test Population');
      
      group.generateWithCorrelations(500, {
        attributes: {
          age: new UniformDistribution(25, 65),
          x: new NormalDistribution(100, 20),
          y: new NormalDistribution(50, 10),
          z: new NormalDistribution(0, 5),
          occupation: 'Analyst',
          sex: 'other'
        },
        correlations: [
          { attribute1: 'x', attribute2: 'y', correlation: 0.8 },
          { attribute1: 'y', attribute2: 'z', correlation: -0.6 }
        ]
      });

      // Extract values for correlation calculation
      const xValues = group.personas.map(p => p.attributes.x);
      const yValues = group.personas.map(p => p.attributes.y);
      const zValues = group.personas.map(p => p.attributes.z);

      // Helper to calculate correlation
      const calculateCorrelation = (a: number[], b: number[]) => {
        const n = a.length;
        const meanA = a.reduce((sum, val) => sum + val, 0) / n;
        const meanB = b.reduce((sum, val) => sum + val, 0) / n;
        
        const covAB = a.reduce((sum, valA, i) => 
          sum + (valA - meanA) * (b[i] - meanB), 0) / n;
        
        const stdA = Math.sqrt(a.reduce((sum, val) => 
          sum + Math.pow(val - meanA, 2), 0) / n);
        
        const stdB = Math.sqrt(b.reduce((sum, val) => 
          sum + Math.pow(val - meanB, 2), 0) / n);
        
        return covAB / (stdA * stdB);
      };

      const xyCorr = calculateCorrelation(xValues, yValues);
      const yzCorr = calculateCorrelation(yValues, zValues);

      // Correlations should be in the right direction and meaningful
      expect(xyCorr).toBeGreaterThan(0.4); // Positive correlation
      expect(yzCorr).toBeLessThan(-0.2); // Negative correlation
    });

    it('should handle mixed attribute types in large groups', () => {
      const group = new PersonaGroup('Mixed Population');
      
      group.generateWithCorrelations(200, {
        attributes: {
          // Demographics
          age: new NormalDistribution(40, 15),
          sex: new CategoricalDistribution([
            { value: 'male', probability: 0.48 },
            { value: 'female', probability: 0.48 },
            { value: 'other', probability: 0.04 }
          ]),
          
          // Health metrics
          height: new NormalDistribution(170, 10), // cm
          weight: new NormalDistribution(75, 15), // kg
          exerciseHoursPerWeek: new ExponentialDistribution(0.3),
          
          // Lifestyle
          coffeePerDay: new ExponentialDistribution(0.5),
          screenTimeHours: new NormalDistribution(6, 2),
          
          occupation: 'Various'
        },
        correlations: [
          { attribute1: 'height', attribute2: 'weight', correlation: 0.7 },
          { attribute1: 'exerciseHoursPerWeek', attribute2: 'weight', correlation: -0.3 },
          { attribute1: 'age', attribute2: 'screenTimeHours', correlation: -0.4 }
        ],
        conditionals: [
          {
            attribute: 'height',
            dependsOn: 'sex',
            transform: (height, sex) => {
              // Biological height differences
              if (sex === 'male') return height + 7;
              if (sex === 'female') return height - 7;
              return height;
            }
          },
          {
            attribute: 'weight',
            dependsOn: 'height',
            transform: CommonCorrelations.heightWeight
          }
        ]
      });

      // Verify sex-based height differences
      const males = group.filter(p => p.attributes.sex === 'male');
      const females = group.filter(p => p.attributes.sex === 'female');
      
      if (males.length > 5 && females.length > 5) {
        const maleAvgHeight = males.reduce((sum, p) => sum + p.attributes.height, 0) / males.length;
        const femaleAvgHeight = females.reduce((sum, p) => sum + p.attributes.height, 0) / females.length;
        
        expect(maleAvgHeight).toBeGreaterThan(femaleAvgHeight);
        expect(maleAvgHeight - femaleAvgHeight).toBeGreaterThan(10); // ~14cm expected
      }

      // Verify BMI is reasonable across population
      const bmis = group.personas.map(p => {
        const heightM = p.attributes.height / 100;
        return p.attributes.weight / (heightM * heightM);
      });

      const avgBMI = bmis.reduce((sum, bmi) => sum + bmi, 0) / bmis.length;
      expect(avgBMI).toBeGreaterThan(18);
      expect(avgBMI).toBeLessThan(30);
    });
  });

  describe('Performance and scale', () => {
    it('should efficiently generate large correlated populations', () => {
      const group = new PersonaGroup('Large Population');
      
      const start = Date.now();
      
      group.generateWithCorrelations(1000, {
        attributes: {
          age: new NormalDistribution(35, 12),
          income: new NormalDistribution(65000, 25000),
          creditScore: new NormalDistribution(700, 100),
          monthlySpending: new NormalDistribution(3000, 1000),
          savingsBalance: new ExponentialDistribution(0.00002),
          occupation: 'Various',
          sex: 'other'
        },
        correlations: [
          { attribute1: 'age', attribute2: 'income', correlation: 0.5 },
          { attribute1: 'income', attribute2: 'creditScore', correlation: 0.6 },
          { attribute1: 'income', attribute2: 'monthlySpending', correlation: 0.7 },
          { attribute1: 'creditScore', attribute2: 'savingsBalance', correlation: 0.4 }
        ],
        conditionals: [
          {
            attribute: 'creditScore',
            dependsOn: 'age',
            transform: (score, age) => {
              // Credit history improves with age
              return score + (age - 35) * 2;
            }
          },
          {
            attribute: 'monthlySpending',
            dependsOn: 'income',
            transform: (spending, income) => {
              // Spending is 40-60% of monthly income
              const monthlyIncome = income / 12;
              const targetSpending = monthlyIncome * 0.5;
              return spending * 0.3 + targetSpending * 0.7;
            }
          }
        ]
      });
      
      const duration = Date.now() - start;
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(1000); // Less than 1 second for 1000 personas
      
      // Verify all personas were generated
      expect(group.size).toBe(1000);
      
      // Verify correlations still hold at scale
      const incomes = group.personas.map(p => p.attributes.income);
      const spending = group.personas.map(p => p.attributes.monthlySpending);
      
      // High earners should spend more
      const highEarners = group.filter(p => p.attributes.income > 90000);
      const lowEarners = group.filter(p => p.attributes.income < 40000);
      
      if (highEarners.length > 0 && lowEarners.length > 0) {
        const highSpending = highEarners.reduce((sum, p) => 
          sum + p.attributes.monthlySpending, 0) / highEarners.length;
        const lowSpending = lowEarners.reduce((sum, p) => 
          sum + p.attributes.monthlySpending, 0) / lowEarners.length;
        
        expect(highSpending).toBeGreaterThan(lowSpending * 1.5);
      }
    });
  });
});