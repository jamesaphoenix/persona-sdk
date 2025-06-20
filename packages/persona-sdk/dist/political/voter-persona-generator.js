import { PersonaGroup } from '../persona-group';
import { PersonaBuilder } from '../persona-builder';
import { NormalDistribution, CategoricalDistribution } from '../distributions';
/**
 * Generates realistic voter personas with correlated political and demographic attributes
 */
export class VoterPersonaGenerator {
    /**
     * Generate voter personas based on demographic and political distributions
     */
    async generateVoterPersonas(count, options = {}) {
        const group = new PersonaGroup(`Generated Voters (${count})`);
        const distributions = this.createVoterDistributions(options);
        // Generate personas with correlated attributes
        for (let i = 0; i < count; i++) {
            const voterData = this.generateCorrelatedVoter(distributions, i);
            const persona = this.convertVoterToPersona(voterData, i);
            group.add(persona);
        }
        console.log(`Generated ${count} voter personas with profile: ${JSON.stringify(options)}`);
        return group;
    }
    /**
     * Generate voter personas from real ANES patterns
     */
    async generateFromANESPatterns(anes_data, target_count, _scaling_factor = 1.0) {
        const group = new PersonaGroup(`ANES-Based Voters (${target_count})`);
        // Analyze patterns in the ANES data
        const patterns = this.analyzeANESPatterns(anes_data);
        // Generate personas that preserve these patterns
        for (let i = 0; i < target_count; i++) {
            const syntheticVoter = this.generateFromPatterns(patterns, i);
            const persona = this.convertANESToPersona(syntheticVoter, i);
            group.add(persona);
        }
        return group;
    }
    /**
     * Create specialized voter segments for analysis
     */
    async generateVoterSegments(segments) {
        const totalSize = segments.reduce((sum, seg) => sum + seg.size, 0);
        const group = new PersonaGroup(`Voter Segments (${totalSize})`);
        for (const segment of segments) {
            const segmentPersonas = await this.generateSegmentPersonas(segment);
            segmentPersonas.personas.forEach(persona => group.add(persona));
        }
        return group;
    }
    /**
     * Generate swing voter personas with specific characteristics
     */
    async generateSwingVoters(count, swingProfile) {
        const group = new PersonaGroup(`Swing Voters (${count})`);
        for (let i = 0; i < count; i++) {
            const swingVoter = this.generateSwingVoter(swingProfile, i);
            const persona = this.convertVoterToPersona(swingVoter, i);
            group.add(persona);
        }
        return group;
    }
    /**
     * Create realistic voter distributions based on demographic profile
     */
    createVoterDistributions(options) {
        const distributions = {
            age: this.createAgeDistribution(options.demographicProfile),
            education: this.createEducationDistribution(options.demographicProfile),
            income: this.createIncomeDistribution(options.demographicProfile),
            party: this.createPartyDistribution(options.politicalLean),
            ideology: this.createIdeologyDistribution(options.politicalLean),
            turnout: this.createTurnoutDistribution(options.demographicProfile),
            geography: this.createGeographyDistribution(options.state, options.demographicProfile)
        };
        return distributions;
    }
    createAgeDistribution(profile) {
        switch (profile) {
            case 'suburban':
                return new NormalDistribution(42, 12); // Older suburban population
            case 'urban':
                return new NormalDistribution(35, 15); // Younger urban population
            case 'rural':
                return new NormalDistribution(48, 16); // Older rural population
            default:
                return new NormalDistribution(45, 18); // National average
        }
    }
    createEducationDistribution(profile) {
        const educationLevels = ['Less than HS', 'High School', 'Some College', 'College Grad', 'Graduate'];
        let probabilities;
        switch (profile) {
            case 'suburban':
                probabilities = [0.05, 0.25, 0.25, 0.30, 0.15]; // Higher education
                break;
            case 'urban':
                probabilities = [0.10, 0.20, 0.25, 0.30, 0.15]; // Mixed education
                break;
            case 'rural':
                probabilities = [0.15, 0.35, 0.30, 0.15, 0.05]; // Lower education
                break;
            default:
                probabilities = [0.10, 0.28, 0.27, 0.25, 0.10]; // National distribution
        }
        return new CategoricalDistribution(educationLevels.map((level, i) => ({ value: level, probability: probabilities[i] })));
    }
    createIncomeDistribution(profile) {
        switch (profile) {
            case 'suburban':
                return new NormalDistribution(75000, 25000); // Higher suburban income
            case 'urban':
                return new NormalDistribution(55000, 30000); // Variable urban income
            case 'rural':
                return new NormalDistribution(45000, 18000); // Lower rural income
            default:
                return new NormalDistribution(58000, 28000); // National median
        }
    }
    createPartyDistribution(lean) {
        const parties = ['Democrat', 'Republican', 'Independent', 'Other'];
        let probabilities;
        switch (lean) {
            case 'left':
                probabilities = [0.55, 0.20, 0.20, 0.05];
                break;
            case 'right':
                probabilities = [0.20, 0.55, 0.20, 0.05];
                break;
            case 'center':
                probabilities = [0.30, 0.30, 0.35, 0.05];
                break;
            default:
                probabilities = [0.33, 0.33, 0.29, 0.05]; // Roughly even
        }
        return new CategoricalDistribution(parties.map((party, i) => ({ value: party, probability: probabilities[i] })));
    }
    createIdeologyDistribution(lean) {
        switch (lean) {
            case 'left':
                return new NormalDistribution(-1.2, 1.0); // Liberal-leaning
            case 'right':
                return new NormalDistribution(1.2, 1.0); // Conservative-leaning
            case 'center':
                return new NormalDistribution(0, 0.8); // Centrist
            default:
                return new NormalDistribution(0, 1.5); // Full spectrum
        }
    }
    createTurnoutDistribution(profile) {
        switch (profile) {
            case 'suburban':
                return new NormalDistribution(0.78, 0.15); // High suburban turnout
            case 'urban':
                return new NormalDistribution(0.65, 0.20); // Variable urban turnout
            case 'rural':
                return new NormalDistribution(0.70, 0.18); // Moderate rural turnout
            default:
                return new NormalDistribution(0.68, 0.18); // National average
        }
    }
    createGeographyDistribution(state, _profile) {
        if (state) {
            return new CategoricalDistribution([{ value: state, probability: 1.0 }]);
        }
        const states = ['California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'];
        let probabilities = [0.12, 0.09, 0.07, 0.06, 0.04, 0.04, 0.04, 0.03, 0.03, 0.03];
        // Normalize to sum to 1
        const sum = probabilities.reduce((total, p) => total + p, 0);
        probabilities = probabilities.map(p => p / sum);
        return new CategoricalDistribution(states.map((state, i) => ({ value: state, probability: probabilities[i] })));
    }
    /**
     * Generate a voter with correlated demographic and political attributes
     */
    generateCorrelatedVoter(distributions, seed) {
        // Use seed for reproducible generation
        const random = (offset) => Math.sin((seed + offset) * 9999) * 0.5 + 0.5;
        const age = Math.max(18, Math.min(100, distributions.age.sample()));
        const education = distributions.education.sample();
        const baseIncome = distributions.income.sample();
        const party = distributions.party.sample();
        const geography = distributions.geography.sample();
        // Create correlations
        let ideology = distributions.ideology.sample();
        // Correlate ideology with party
        if (party === 'Democrat')
            ideology -= 0.8 + random(1) * 0.6;
        if (party === 'Republican')
            ideology += 0.8 + random(2) * 0.6;
        // Correlate with demographics
        if (education === 'Graduate')
            ideology -= 0.3;
        if (education === 'Less than HS')
            ideology += 0.2;
        if (age > 65)
            ideology += 0.2;
        if (age < 30)
            ideology -= 0.3;
        // Clamp ideology to valid range
        ideology = Math.max(-3, Math.min(3, ideology));
        // Income correlations with age and education
        let income = baseIncome;
        if (age > 30)
            income += (age - 30) * 800;
        if (education === 'Graduate')
            income *= 1.6;
        if (education === 'College Grad')
            income *= 1.3;
        if (education === 'Less than HS')
            income *= 0.7;
        // Turnout likelihood
        let turnout = distributions.turnout.sample();
        if (age > 65)
            turnout += 0.15;
        if (age < 25)
            turnout -= 0.2;
        if (education === 'Graduate')
            turnout += 0.1;
        if (party !== 'Independent')
            turnout += 0.05;
        turnout = Math.max(0, Math.min(1, turnout));
        return {
            age: Math.round(age),
            education,
            income: Math.round(income),
            party,
            ideology,
            geography,
            turnout_likelihood: turnout,
            voting_history: this.generateVotingHistory(age, turnout, random(10)),
            issue_positions: this.generateIssuePositions(ideology, party, random(20))
        };
    }
    generateVotingHistory(age, turnoutLikelihood, rand) {
        const history = [];
        const elections = ['2008', '2012', '2016', '2020'];
        elections.forEach(year => {
            const voterAge = age - (2024 - parseInt(year));
            if (voterAge >= 18) {
                const voteProb = turnoutLikelihood * (0.7 + rand * 0.3); // Some randomness
                if (Math.random() < voteProb) {
                    history.push(year);
                }
            }
        });
        return history;
    }
    generateIssuePositions(ideology, party, rand) {
        const basePositions = {
            'healthcare': ideology + (rand - 0.5) * 0.4,
            'economy': ideology + (rand - 0.5) * 0.5,
            'immigration': ideology + (rand - 0.5) * 0.3,
            'environment': ideology + (rand - 0.5) * 0.4,
            'gun_control': ideology + (rand - 0.5) * 0.6,
            'abortion': ideology + (rand - 0.5) * 0.3,
            'foreign_policy': ideology + (rand - 0.5) * 0.5
        };
        // Add some party-specific adjustments
        if (party === 'Democrat') {
            basePositions['environment'] -= 0.5;
            basePositions['gun_control'] -= 0.7;
        }
        else if (party === 'Republican') {
            basePositions['environment'] += 0.5;
            basePositions['gun_control'] += 0.7;
        }
        Object.keys(basePositions).forEach(key => {
            basePositions[key] = Math.max(-3, Math.min(3, basePositions[key]));
        });
        return basePositions;
    }
    convertVoterToPersona(voterData, index) {
        const name = `Voter_${index + 1}`;
        const sex = Math.random() > 0.51 ? 'female' : 'male';
        return PersonaBuilder.create()
            .withName(name)
            .withAge(voterData.age)
            .withOccupation(this.inferOccupation(voterData))
            .withSex(sex)
            .withAttribute('education', voterData.education)
            .withAttribute('income', voterData.income)
            .withAttribute('party_identification', voterData.party)
            .withAttribute('ideology_scale', voterData.ideology || 0)
            .withAttribute('state', voterData.geography || 'Unknown')
            .withAttribute('turnout_likelihood', voterData.turnout_likelihood)
            .withAttribute('voting_history', voterData.voting_history)
            .withAttribute('issue_positions', voterData.issue_positions)
            .withAttribute('uncertainty', voterData.uncertainty)
            .withAttribute('cross_pressures', voterData.cross_pressures)
            .build();
    }
    convertANESToPersona(anesData, index) {
        const name = `ANES_Voter_${index + 1}`;
        return PersonaBuilder.create()
            .withName(name)
            .withAge(anesData.demographics.age)
            .withOccupation(this.inferOccupation(anesData))
            .withSex(anesData.demographics.gender.toLowerCase())
            .withAttribute('education', anesData.demographics.education)
            .withAttribute('income', anesData.demographics.income)
            .withAttribute('race', anesData.demographics.race)
            .withAttribute('party_identification', anesData.ideology.party_identification)
            .withAttribute('political_views', anesData.ideology.political_views)
            .withAttribute('ideology_scale', anesData.ideology.ideology_scale || 0)
            .withAttribute('state', anesData.demographics.state || 'Unknown')
            .withAttribute('turnout_likelihood', anesData.voting_history.turnout_likelihood)
            .withAttribute('voting_history', anesData.voting_history.past_elections)
            .withAttribute('issue_positions', anesData.ideology.issue_positions)
            .build();
    }
    analyzeANESPatterns(_data) {
        // This would perform comprehensive pattern analysis
        // For now, returning a simplified structure
        return {
            demographic_correlations: {},
            ideological_clusters: {},
            turnout_patterns: {},
            geographic_variations: {}
        };
    }
    generateFromPatterns(_patterns, _index) {
        // This would use the analyzed patterns to generate realistic data
        // For now, using simplified generation
        return {
            demographics: {
                age: 25 + Math.random() * 50,
                education: 'College Grad',
                income: 50000 + Math.random() * 40000,
                race: 'White',
                gender: Math.random() > 0.5 ? 'Female' : 'Male',
                geography: 'National'
            },
            ideology: {
                party_identification: 'Independent',
                political_views: 'Moderate',
                issue_positions: {}
            },
            voting_history: {
                past_elections: ['2020'],
                turnout_likelihood: 0.7
            }
        };
    }
    async generateSegmentPersonas(segment) {
        const group = new PersonaGroup(segment.name);
        for (let i = 0; i < segment.size; i++) {
            const voterData = this.generateSegmentVoter(segment.characteristics, i);
            const persona = this.convertVoterToPersona(voterData, i);
            group.add(persona);
        }
        return group;
    }
    generateSegmentVoter(characteristics, index) {
        const random = (offset) => Math.sin((index + offset) * 9999) * 0.5 + 0.5;
        // Generate age within range
        const [minAge, maxAge] = characteristics.age_range;
        const age = Math.round(minAge + random(1) * (maxAge - minAge));
        // Select education level
        const education = characteristics.education_levels[Math.floor(random(2) * characteristics.education_levels.length)];
        // Generate income within range
        const [minIncome, maxIncome] = characteristics.income_range;
        const baseIncome = minIncome + random(3) * (maxIncome - minIncome);
        // Select party based on preferences
        const parties = Object.keys(characteristics.party_preferences);
        const partyRand = random(4);
        let cumulativeProb = 0;
        let selectedParty = parties[0];
        for (const party of parties) {
            cumulativeProb += characteristics.party_preferences[party];
            if (partyRand <= cumulativeProb) {
                selectedParty = party;
                break;
            }
        }
        // Generate ideology within range
        const [minIdeology, maxIdeology] = characteristics.ideology_range;
        const ideology = minIdeology + random(5) * (maxIdeology - minIdeology);
        // Select geography
        const geography = characteristics.geography[Math.floor(random(6) * characteristics.geography.length)];
        return {
            age,
            education,
            income: Math.round(baseIncome),
            party: selectedParty,
            ideology,
            geography,
            turnout_likelihood: 0.6 + random(7) * 0.3,
            voting_history: this.generateVotingHistory(age, 2024, random(8)),
            issue_positions: this.generateIssuePositions(ideology, selectedParty, random(9))
        };
    }
    generateSwingVoter(profile, _index) {
        // Generate a voter with high uncertainty and cross-pressures
        return {
            age: 35 + Math.random() * 20,
            education: 'Some College',
            income: 60000,
            party: 'Independent',
            ideology: (Math.random() - 0.5) * 0.5, // Very moderate
            uncertainty: profile.uncertainty_level,
            cross_pressures: profile.cross_pressures
        };
    }
    inferOccupation(voter) {
        const age = voter.age || voter.demographics?.age;
        const education = voter.education || voter.demographics?.education;
        const income = voter.income || voter.demographics?.income;
        if (age >= 65)
            return 'Retired';
        if (age < 25)
            return 'Student';
        if (education === 'Graduate' || education === 'PhD') {
            return income > 80000 ? 'Professional' : 'Specialist';
        }
        if (education === 'College Grad') {
            return income > 60000 ? 'Manager' : 'Professional';
        }
        return 'Service Worker';
    }
}
//# sourceMappingURL=voter-persona-generator.js.map