import { PersonaBuilder } from '@jamesaphoenix/persona-sdk';

console.log('Testing PersonaBuilder.create().build()...\n');

try {
  const persona = PersonaBuilder.create()
    .withName('Test User')
    .withAge(25)
    .withOccupation('Software Engineer')
    .withSex('other')
    .withAttribute('location', 'New York')
    .build();
  
  console.log('Persona created successfully!');
  console.log('ID:', persona.id);
  console.log('Name:', persona.name);
  console.log('Age:', persona.age, '(type:', typeof persona.age, ')');
  console.log('Occupation:', persona.occupation);
  console.log('Sex:', persona.sex);
  console.log('Attributes:', persona.attributes);
  console.log('\nFull persona object:', JSON.stringify(persona, null, 2));
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}