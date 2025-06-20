import { 
  NormalDistribution,
  UniformDistribution,
  ExponentialDistribution,
  BetaDistribution,
  CategoricalDistribution,
  PersonaBuilder
} from '@internal/persona-sdk-minimal';

export const distributionTests = [
  {
    name: 'NormalDistribution sampling',
    category: 'Distributions',
    fn: async () => {
      const dist = new NormalDistribution(100, 15);
      const samples = Array.from({ length: 100 }, () => dist.sample());
      
      // Check all samples are numbers
      if (!samples.every(s => typeof s === 'number')) {
        throw new Error('All samples should be numbers');
      }
      
      // Check mean is approximately correct
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      if (Math.abs(mean - 100) > 5) {
        throw new Error(`Mean ${mean} is too far from expected 100`);
      }
      
      // Check most samples are within 3 standard deviations
      const inRange = samples.filter(s => s >= 55 && s <= 145).length;
      if (inRange < 95) {
        throw new Error('Less than 95% of samples within 3 standard deviations');
      }
      
      return { success: true };
    }
  },

  {
    name: 'NormalDistribution properties',
    category: 'Distributions',
    fn: async () => {
      const dist = new NormalDistribution(50, 10);
      
      if (dist.mean() !== 50) throw new Error('Mean should be 50');
      if (dist.variance() !== 100) throw new Error('Variance should be 100');
      if (Math.sqrt(dist.variance()) !== 10) throw new Error('StdDev should be 10');
      
      return { success: true };
    }
  },

  {
    name: 'UniformDistribution sampling',
    category: 'Distributions',
    fn: async () => {
      const dist = new UniformDistribution(10, 50);
      const samples = Array.from({ length: 100 }, () => dist.sample());
      
      // Check bounds
      const min = Math.min(...samples);
      const max = Math.max(...samples);
      
      if (min < 10) throw new Error(`Min ${min} is below lower bound`);
      if (max > 50) throw new Error(`Max ${max} is above upper bound`);
      
      // Check uniform distribution
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      if (Math.abs(mean - 30) > 3) {
        throw new Error(`Mean ${mean} is not close to expected 30`);
      }
      
      return { success: true };
    }
  },

  {
    name: 'UniformDistribution properties',
    category: 'Distributions',
    fn: async () => {
      const dist = new UniformDistribution(0, 100);
      
      if (dist.mean() !== 50) throw new Error('Mean should be 50');
      if (Math.abs(dist.variance() - 833.33) > 0.1) {
        throw new Error('Variance should be approximately 833.33');
      }
      
      return { success: true };
    }
  },

  {
    name: 'ExponentialDistribution sampling',
    category: 'Distributions',
    fn: async () => {
      const lambda = 2;
      const dist = new ExponentialDistribution(lambda);
      const samples = Array.from({ length: 100 }, () => dist.sample());
      
      // All samples should be non-negative
      if (!samples.every(s => s >= 0)) {
        throw new Error('Exponential samples should be non-negative');
      }
      
      // Check mean is approximately 1/lambda
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const expectedMean = 1 / lambda;
      if (Math.abs(mean - expectedMean) > 0.1) {
        throw new Error(`Mean ${mean} is not close to expected ${expectedMean}`);
      }
      
      return { success: true };
    }
  },

  {
    name: 'BetaDistribution sampling',
    category: 'Distributions',
    fn: async () => {
      const alpha = 2;
      const beta = 5;
      const dist = new BetaDistribution(alpha, beta);
      const samples = Array.from({ length: 100 }, () => dist.sample());
      
      // All samples should be between 0 and 1
      if (!samples.every(s => s >= 0 && s <= 1)) {
        throw new Error('Beta samples should be between 0 and 1');
      }
      
      // Check mean is approximately alpha/(alpha+beta)
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const expectedMean = alpha / (alpha + beta);
      if (Math.abs(mean - expectedMean) > 0.1) {
        throw new Error(`Mean ${mean} is not close to expected ${expectedMean}`);
      }
      
      return { success: true };
    }
  },

  {
    name: 'CategoricalDistribution sampling',
    category: 'Distributions',
    fn: async () => {
      const categories = [
        { value: 'A', probability: 0.5 },
        { value: 'B', probability: 0.3 },
        { value: 'C', probability: 0.2 }
      ];
      const dist = new CategoricalDistribution(categories);
      const samples = Array.from({ length: 1000 }, () => dist.sample());
      
      // All samples should be valid categories
      if (!samples.every(s => ['A', 'B', 'C'].includes(s))) {
        throw new Error('Categorical samples should be valid categories');
      }
      
      // Check proportions are approximately correct
      const counts = { A: 0, B: 0, C: 0 };
      samples.forEach(s => counts[s]++);
      
      const propA = counts.A / samples.length;
      const propB = counts.B / samples.length;
      const propC = counts.C / samples.length;
      
      if (Math.abs(propA - 0.5) > 0.1 || Math.abs(propB - 0.3) > 0.1 || Math.abs(propC - 0.2) > 0.1) {
        throw new Error(`Proportions ${propA}, ${propB}, ${propC} not close to expected`);
      }
      
      return { success: true };
    }
  },

  {
    name: 'PersonaBuilder with NormalDistribution for age',
    category: 'Distributions',
    fn: async () => {
      const ageDist = new NormalDistribution(30, 5);
      const personas = Array.from({ length: 20 }, (_, i) => 
        PersonaBuilder.create()
          .withName(`Person ${i}`)
          .withAge(ageDist)
          .withOccupation('Worker')
          .withSex('other')
          .build()
      );
      
      // Check ages follow distribution
      const ages = personas.map(p => p.age);
      const meanAge = ages.reduce((a, b) => a + b, 0) / ages.length;
      
      if (Math.abs(meanAge - 30) > 2) {
        throw new Error(`Mean age ${meanAge} is not close to expected 30`);
      }
      
      // Most ages should be between 20 and 40 (2 std devs)
      const inRange = ages.filter(a => a >= 20 && a <= 40).length;
      if (inRange < 18) {
        throw new Error('Less than 90% of ages within expected range');
      }
      
      return { success: true };
    }
  },

  {
    name: 'Multiple distributions in PersonaBuilder',
    category: 'Distributions',
    fn: async () => {
      const ageDist = new UniformDistribution(25, 35);
      const incomeDist = new NormalDistribution(75000, 15000);
      
      const persona = PersonaBuilder.create()
        .withName('Multi-Distribution User')
        .withAge(ageDist)
        .withOccupation('Professional')
        .withSex('female')
        .withAttribute('income', incomeDist)
        .build();
      
      if (persona.age < 25 || persona.age > 35) {
        throw new Error('Age should be within uniform distribution bounds');
      }
      
      if (typeof persona.attributes.income !== 'number') {
        throw new Error('Income should be a number');
      }
      
      return { success: true };
    }
  },

  {
    name: 'Distribution edge cases',
    category: 'Distributions',
    fn: async () => {
      // Test that zero variance throws error
      try {
        new NormalDistribution(50, 0);
        throw new Error('Should throw error for zero standard deviation');
      } catch (error) {
        if (!error.message.includes('Standard deviation must be positive')) {
          throw new Error('Expected standard deviation error');
        }
      }
      
      // Single point uniform distribution
      const pointDist = new UniformDistribution(42, 42);
      if (pointDist.sample() !== 42) {
        throw new Error('Single point uniform should return that point');
      }
      
      // Test negative standard deviation
      try {
        new NormalDistribution(50, -5);
        throw new Error('Should throw error for negative standard deviation');
      } catch (error) {
        if (!error.message.includes('Standard deviation must be positive')) {
          throw new Error('Expected standard deviation error');
        }
      }
      
      return { success: true };
    }
  }
];