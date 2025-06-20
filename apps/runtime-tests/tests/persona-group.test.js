import { PersonaGroup, PersonaBuilder } from '@jamesaphoenix/persona-sdk';

export const personaGroupTests = [
  {
    name: 'PersonaGroup.add() and getAll()',
    category: 'PersonaGroup',
    fn: async () => {
      const group = new PersonaGroup();
      const persona1 = PersonaBuilder.create()
        .withName('User 1')
        .withAge(25)
        .withOccupation('Developer')
        .withSex('male')
        .build();
      const persona2 = PersonaBuilder.create()
        .withName('User 2')
        .withAge(30)
        .withOccupation('Designer')
        .withSex('female')
        .build();
      
      group.add(persona1);
      group.add(persona2);
      
      const all = group.personas;
      if (all.length !== 2) throw new Error('Should have 2 personas');
      if (all[0].name !== 'User 1') throw new Error('First persona name mismatch');
      if (all[1].name !== 'User 2') throw new Error('Second persona name mismatch');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaGroup.remove()',
    category: 'PersonaGroup',
    fn: async () => {
      const group = new PersonaGroup();
      const persona = PersonaBuilder.create()
        .withName('Removable User')
        .withAge(25)
        .withOccupation('Manager')
        .withSex('other')
        .build();
      
      group.add(persona);
      if (group.size !== 1) throw new Error('Should have 1 persona');
      
      group.remove(persona.id);
      if (group.size !== 0) throw new Error('Should have 0 personas after removal');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaGroup.findById()',
    category: 'PersonaGroup',
    fn: async () => {
      const group = new PersonaGroup();
      const persona = PersonaBuilder.create()
        .withName('Findable User')
        .withAge(28)
        .withOccupation('Analyst')
        .withSex('female')
        .build();
      
      group.add(persona);
      const found = group.find(persona.id);
      
      if (!found) throw new Error('Should find persona by ID');
      if (found.name !== 'Findable User') throw new Error('Found persona name mismatch');
      
      const notFound = group.find('non-existent-id');
      if (notFound) throw new Error('Should not find non-existent persona');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaGroup.filter()',
    category: 'PersonaGroup',
    fn: async () => {
      const group = new PersonaGroup();
      
      // Add diverse personas
      for (let i = 20; i <= 40; i += 5) {
        group.add(
          PersonaBuilder.create()
            .withName(`User ${i}`)
            .withAge(i)
            .withOccupation('Employee')
            .withSex('other')
            .withAttribute('location', i < 30 ? 'NYC' : 'LA')
            .build()
        );
      }
      
      // Filter by age
      const young = group.filter(p => p.age < 30);
      if (young.length !== 2) throw new Error('Should have 2 young personas');
      
      // Filter by location
      const nyc = group.filter(p => p.attributes.location === 'NYC');
      if (nyc.length !== 2) throw new Error('Should have 2 NYC personas');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaGroup.generateStatistics()',
    category: 'PersonaGroup',
    fn: async () => {
      const group = new PersonaGroup();
      
      // Add personas with known ages
      const ages = [20, 25, 30, 35, 40];
      ages.forEach(age => {
        group.add(
          PersonaBuilder.create()
            .withName(`User ${age}`)
            .withAge(age)
            .withOccupation('Worker')
            .withSex('other')
            .build()
        );
      });
      
      const stats = group.getStatistics('age');
      
      if (stats.count !== 5) throw new Error('Should have 5 personas in stats');
      if (stats.mean !== 30) throw new Error('Mean age should be 30');
      if (stats.min !== 20) throw new Error('Min age should be 20');
      if (stats.max !== 40) throw new Error('Max age should be 40');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaGroup.clear()',
    category: 'PersonaGroup',
    fn: async () => {
      const group = new PersonaGroup();
      
      // Add multiple personas
      for (let i = 1; i <= 5; i++) {
        group.add(
          PersonaBuilder.create()
            .withName(`User ${i}`)
            .withAge(20 + i)
            .withOccupation('Employee')
            .withSex('other')
            .build()
        );
      }
      
      if (group.size !== 5) throw new Error('Should have 5 personas');
      
      group.clear();
      if (group.size !== 0) throw new Error('Should have 0 personas after clear');
      if (group.personas.length !== 0) throw new Error('personas should return empty array');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaGroup.fromArray()',
    category: 'PersonaGroup',
    fn: async () => {
      const personas = [
        PersonaBuilder.create().withName('User 1').withAge(25).withOccupation('Dev').withSex('male').build(),
        PersonaBuilder.create().withName('User 2').withAge(30).withOccupation('PM').withSex('female').build(),
        PersonaBuilder.create().withName('User 3').withAge(35).withOccupation('Designer').withSex('other').build()
      ];
      
      const group = new PersonaGroup('Test Group', personas);
      
      if (group.size !== 3) throw new Error('Should have 3 personas');
      if (group.personas[0].name !== 'User 1') throw new Error('First persona mismatch');
      if (group.personas[2].age !== 35) throw new Error('Third persona age mismatch');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaGroup.map()',
    category: 'PersonaGroup',
    fn: async () => {
      const group = new PersonaGroup();
      
      for (let i = 1; i <= 3; i++) {
        group.add(
          PersonaBuilder.create()
            .withName(`User ${i}`)
            .withAge(20 + i)
            .withOccupation('Employee')
            .withSex('other')
            .build()
        );
      }
      
      const names = group.personas.map(p => p.name);
      if (names.length !== 3) throw new Error('Should map 3 names');
      if (names[0] !== 'User 1') throw new Error('First name mismatch');
      if (names[2] !== 'User 3') throw new Error('Third name mismatch');
      
      const ages = group.personas.map(p => p.age);
      if (ages[0] !== 21) throw new Error('First age mismatch');
      if (ages[2] !== 23) throw new Error('Third age mismatch');
      
      return { success: true };
    }
  },

  {
    name: 'PersonaGroup chaining operations',
    category: 'PersonaGroup',
    fn: async () => {
      const group = new PersonaGroup();
      
      // Add 10 diverse personas
      for (let i = 1; i <= 10; i++) {
        group.add(
          PersonaBuilder.create()
            .withName(`User ${i}`)
            .withAge(20 + i * 2)
            .withOccupation('Worker')
            .withSex('other')
            .withAttribute('location', i % 2 === 0 ? 'NYC' : 'LA')
            .build()
        );
      }
      
      // Chain filter and map
      const nycPersonas = group.filter(p => p.attributes.location === 'NYC');
      const nycNames = nycPersonas.map(p => p.name);
      
      if (nycNames.length !== 5) throw new Error('Should have 5 NYC personas');
      if (!nycNames.includes('User 2')) throw new Error('Should include User 2');
      
      return { success: true };
    }
  }
];