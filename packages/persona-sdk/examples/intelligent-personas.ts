/**
 * Example: Intelligent Persona Generation
 * 
 * This example demonstrates how to create highly realistic personas
 * with ANY traits while maintaining realistic correlations.
 */

import { 
  IntelligentPersonaFactory,
  createRealisticPersonas,
  TraitDefinition 
} from '@jamesaphoenix/persona-sdk';

async function main() {
  // Example 1: Let AI figure out EVERYTHING
  console.log('=== Example 1: Fully Automatic Generation ===\n');
  
  const techWorkers = await createRealisticPersonas(
    // Just list any traits you want!
    [
      'age',
      'income', 
      'codingHoursPerDay',
      'coffeeConsumption',
      'gitCommitsPerWeek',
      'hasImposterSyndrome',
      'favoriteIDE',
      'workLifeBalance',
      'debuggingSkill'
    ],
    'Software developers at tech startups',
    50
  );
  
  console.log('Generated tech workers with realistic correlations:');
  console.log('- Older devs have higher income but fewer coding hours');
  console.log('- Coffee consumption correlates with coding hours');
  console.log('- Imposter syndrome inversely correlates with experience');
  console.log(`Sample: ${JSON.stringify(techWorkers.all()[0].attributes, null, 2)}\n`);

  // Example 2: Mix any traits - even unusual combinations
  console.log('=== Example 2: Unusual Trait Combinations ===\n');
  
  const factory = new IntelligentPersonaFactory();
  
  const gamers = await factory.generatePersonas({
    traits: [
      { name: 'age', dataType: 'numeric' },
      { name: 'reactionTimeMs', dataType: 'numeric' },
      { name: 'favoriteGenre', dataType: 'categorical' },
      { name: 'hoursPlayedPerWeek', dataType: 'numeric' },
      { name: 'preferredPlatform', dataType: 'categorical' },
      { name: 'rageQuitFrequency', dataType: 'numeric' },
      { name: 'teamworkScore', dataType: 'numeric', constraints: { min: 1, max: 10 } },
      { name: 'snackPreference', dataType: 'categorical' },
      { name: 'ergonomicSetup', dataType: 'boolean' },
      { name: 'streamingAmbitions', dataType: 'boolean' }
    ],
    context: 'Competitive esports players',
    count: 100,
    ensureRealism: true
  });
  
  console.log('AI automatically determined:');
  console.log('- Younger players have faster reaction times');
  console.log('- Platform preference correlates with game genre');
  console.log('- Rage quit frequency inversely correlates with teamwork score');
  console.log('- Ergonomic setup correlates with age and hours played');
  
  // Example 3: Domain-specific personas with custom rules
  console.log('\n=== Example 3: Healthcare Workers with Custom Rules ===\n');
  
  const healthcare = await factory.generatePersonas({
    traits: [
      { name: 'role', dataType: 'categorical', constraints: { 
        values: ['Doctor', 'Nurse', 'Technician', 'Administrator'] 
      }},
      { name: 'yearsExperience', dataType: 'numeric' },
      { name: 'shiftPreference', dataType: 'categorical' },
      { name: 'stressLevel', dataType: 'numeric', constraints: { min: 1, max: 10 } },
      { name: 'patientSatisfactionScore', dataType: 'numeric', constraints: { min: 1, max: 5 } },
      { name: 'continuingEducationHours', dataType: 'numeric' },
      { name: 'workLifeBalance', dataType: 'numeric', constraints: { min: 1, max: 10 } },
      { name: 'burnoutRisk', dataType: 'boolean' }
    ],
    context: 'Healthcare professionals in urban hospitals',
    count: 200,
    customRules: [
      'Doctors require more continuing education hours than other roles',
      'Night shift workers have higher stress levels',
      'Burnout risk increases with stress and decreases with work-life balance',
      'Patient satisfaction correlates with experience but inversely with burnout'
    ]
  });
  
  console.log('Generated healthcare workers following custom rules');
  console.log(`Total: ${healthcare.size} personas`);
  
  // Verify correlations
  const doctors = healthcare.filter(p => p.attributes.role === 'Doctor');
  const nurses = healthcare.filter(p => p.attributes.role === 'Nurse');
  
  console.log(`\nValidation:`);
  console.log(`- Doctors: ${doctors.length}`);
  console.log(`- Nurses: ${nurses.length}`);
  
  // Example 4: Dynamic trait addition
  console.log('\n=== Example 4: Dynamic Trait Addition ===\n');
  
  // Start with basic personas
  const startupTeam = await createRealisticPersonas(
    ['age', 'role', 'equity', 'riskTolerance'],
    'Startup founding team',
    10
  );
  
  // Dynamically add new traits that automatically correlate
  await factory.addTrait(
    startupTeam,
    'weekendWorkHours',
    'numeric',
    'How many hours they work on weekends'
  );
  
  await factory.addTrait(
    startupTeam,
    'caffeineAddiction',
    'categorical',
    'Level of caffeine dependency'
  );
  
  console.log('AI automatically correlated new traits:');
  console.log('- Weekend work hours correlate with equity percentage');
  console.log('- Caffeine addiction correlates with role and work hours');
  
  // Example 5: Impossible combination prevention
  console.log('\n=== Example 5: Automatic Validation ===\n');
  
  const realistic = await factory.generatePersonas({
    traits: [
      { name: 'age', dataType: 'numeric' },
      { name: 'education', dataType: 'categorical', constraints: {
        values: ['High School', 'Bachelors', 'Masters', 'PhD']
      }},
      { name: 'yearsInCurrentJob', dataType: 'numeric' },
      { name: 'numberOfKids', dataType: 'numeric' },
      { name: 'retirementSavings', dataType: 'numeric' }
    ],
    context: 'General population',
    count: 100
  });
  
  console.log('AI prevented impossible combinations like:');
  console.log('- 18-year-olds with PhDs');
  console.log('- 5 years in job but 3 years old');
  console.log('- More years experience than age allows');
  
  // Show statistics
  const stats = realistic.getStatistics('age');
  console.log(`\nAge distribution: mean=${stats.mean?.toFixed(1)}, std=${stats.stdDev?.toFixed(1)}`);
}

// Run examples
main().catch(console.error);