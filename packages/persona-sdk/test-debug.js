const { PersonaBuilder, UniformDistribution, NormalDistribution, CommonCorrelations } = require('./dist');

const persona = PersonaBuilder.create()
  .withName('Alex Chen')
  .withAge(new UniformDistribution(25, 40))
  .withOccupation('Software Engineer')
  .withSex('other')
  .withAttribute('yearsExperience', new NormalDistribution(8, 4))
  .withAttribute('income', new NormalDistribution(120000, 30000))
  .buildWithCorrelations({
    conditionals: [
      {
        attribute: 'yearsExperience',
        dependsOn: 'age',
        transform: CommonCorrelations.ageExperience
      }
    ]
  });

console.log('Persona attributes:', persona.attributes);
console.log('Years Experience:', persona.attributes.yearsExperience);
console.log('Age:', persona.attributes.age);