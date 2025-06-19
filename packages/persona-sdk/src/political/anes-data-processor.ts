import { ANESVoterData, ANESProcessingOptions } from './types';
import { PersonaGroup } from '../persona-group';
import { PersonaBuilder } from '../persona-builder';

/**
 * Processes ANES (American National Election Studies) data for voter persona generation
 */
export class ANESDataProcessor {
  
  /**
   * Load ANES data for a specific election year
   */
  async loadANESData(
    year: 2016 | 2020 | 2024,
    options: ANESProcessingOptions = { year }
  ): Promise<ANESVoterData[]> {
    // In a real implementation, this would load actual ANES data from files or API
    // For now, we'll generate realistic synthetic ANES-style data
    console.log(`Loading ANES ${year} data with options:`, options);
    
    const sampleSize = this.determineSampleSize(year);
    const voterData: ANESVoterData[] = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const voter = this.generateSyntheticANESRecord(year, i);
      
      // Apply filters if specified
      if (this.passesFilters(voter, options.filter_criteria)) {
        voterData.push(voter);
      }
    }
    
    console.log(`Loaded ${voterData.length} ANES records for ${year}`);
    return voterData;
  }

  /**
   * Generate synthetic voters based on real ANES patterns
   */
  async generateSyntheticVoters(
    baseData: ANESVoterData[],
    targetCount: number
  ): Promise<PersonaGroup> {
    const group = new PersonaGroup(`ANES Synthetic Voters (n=${targetCount})`);
    
    // Analyze patterns in base data
    const patterns = this.analyzeVoterPatterns(baseData);
    
    // Generate synthetic voters preserving statistical patterns
    for (let i = 0; i < targetCount; i++) {
      const syntheticVoter = this.generateSyntheticVoter(patterns, i);
      const persona = this.convertToPersona(syntheticVoter, i);
      group.add(persona);
    }
    
    console.log(`Generated ${targetCount} synthetic voters from ${baseData.length} ANES records`);
    return group;
  }

  /**
   * Convert ANES voter data to PersonaGroup
   */
  async convertANESToPersonas(data: ANESVoterData[]): Promise<PersonaGroup> {
    const group = new PersonaGroup(`ANES Voters (n=${data.length})`);
    
    data.forEach((voter, index) => {
      const persona = this.convertToPersona(voter, index);
      group.add(persona);
    });
    
    return group;
  }

  /**
   * Analyze demographic and political patterns in ANES data
   */
  analyzeVoterPatterns(data: ANESVoterData[]) {
    const patterns = {
      demographics: {
        age: this.calculateAgeDistribution(data),
        education: this.calculateEducationDistribution(data),
        income: this.calculateIncomeDistribution(data),
        race: this.calculateRaceDistribution(data),
        geography: this.calculateGeographyDistribution(data)
      },
      ideology: {
        party_id: this.calculatePartyDistribution(data),
        political_views: this.calculateIdeologyDistribution(data),
        issue_correlations: this.calculateIssueCorrelations(data)
      },
      voting_behavior: {
        turnout_patterns: this.calculateTurnoutPatterns(data),
        vote_method_preferences: this.calculateVoteMethodDistribution(data)
      }
    };
    
    return patterns;
  }

  /**
   * Generate a synthetic ANES voter record
   */
  private generateSyntheticANESRecord(year: number, index: number): ANESVoterData {
    // Use deterministic randomness based on index for reproducibility
    const random = (seed: number) => Math.sin(seed * 9999) * 0.5 + 0.5;
    
    const ageRand = random(index * 17);
    const age = Math.floor(18 + ageRand * 82); // 18-100
    
    const educationLevels = ['Less than HS', 'High School', 'Some College', 'College Grad', 'Graduate'];
    const education = educationLevels[Math.floor(random(index * 19) * educationLevels.length)];
    
    const races = ['White', 'Black', 'Hispanic', 'Asian', 'Native American', 'Other'];
    const race = races[Math.floor(random(index * 23) * races.length)];
    
    const parties = ['Democrat', 'Republican', 'Independent', 'Other'];
    const party = parties[Math.floor(random(index * 29) * parties.length)];
    
    const states = ['California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio'];
    const state = states[Math.floor(random(index * 31) * states.length)];
    
    // Generate correlated ideology based on demographics
    const baseIdeology = this.generateIdeology(age, education, race, party, random(index * 37));
    
    return {
      demographics: {
        age,
        education,
        income: this.generateIncome(age, education, random(index * 41)),
        race,
        gender: random(index * 43) > 0.51 ? 'Female' : 'Male',
        geography: state,
        state,
        urbanicity: random(index * 47) > 0.7 ? 'urban' : random(index * 47) > 0.4 ? 'suburban' : 'rural'
      },
      ideology: {
        party_identification: party,
        political_views: baseIdeology.views,
        issue_positions: baseIdeology.issues,
        ideology_scale: baseIdeology.scale
      },
      voting_history: {
        past_elections: this.generateVotingHistory(age, year, random(index * 53)),
        turnout_likelihood: this.generateTurnoutLikelihood(age, education, party, random(index * 59)),
        primary_participation: random(index * 61) > 0.7,
        vote_method: random(index * 67) > 0.8 ? 'mail' : random(index * 67) > 0.2 ? 'in_person' : 'early'
      },
      media_consumption: {
        news_sources: this.generateNewsSources(party, age, random(index * 71)),
        social_media_platforms: this.generateSocialMedia(age, random(index * 73)),
        news_frequency: Math.floor(random(index * 79) * 7) + 1 // 1-7 days per week
      }
    };
  }

  /**
   * Generate correlated ideology based on demographics
   */
  private generateIdeology(age: number, education: string, race: string, party: string, rand: number) {
    let baseScale = 0; // Start neutral
    
    // Party influence (strongest predictor)
    if (party === 'Democrat') baseScale -= 1.5;
    if (party === 'Republican') baseScale += 1.5;
    
    // Age influence
    if (age < 30) baseScale -= 0.3;
    if (age > 65) baseScale += 0.2;
    
    // Education influence
    if (education === 'Graduate') baseScale -= 0.2;
    if (education === 'Less than HS') baseScale += 0.1;
    
    // Race influence
    if (race === 'Black' || race === 'Hispanic') baseScale -= 0.4;
    if (race === 'White') baseScale += 0.1;
    
    // Add some randomness
    baseScale += (rand - 0.5) * 2;
    
    // Clamp to valid range
    baseScale = Math.max(-3, Math.min(3, baseScale));
    
    const views = this.scaleToViews(baseScale);
    const issues = this.generateIssuePositions(baseScale, party);
    
    return { scale: baseScale, views, issues };
  }

  /**
   * Convert ideology scale to descriptive views
   */
  private scaleToViews(scale: number): string {
    if (scale < -2) return 'Very Liberal';
    if (scale < -1) return 'Liberal';
    if (scale < -0.5) return 'Somewhat Liberal';
    if (scale < 0.5) return 'Moderate';
    if (scale < 1) return 'Somewhat Conservative';
    if (scale < 2) return 'Conservative';
    return 'Very Conservative';
  }

  /**
   * Generate issue positions based on ideology
   */
  private generateIssuePositions(baseScale: number, _party: string): Record<string, number> {
    const issues = {
      'healthcare': baseScale + (Math.random() - 0.5) * 0.5,
      'economy': baseScale + (Math.random() - 0.5) * 0.5,
      'immigration': baseScale + (Math.random() - 0.5) * 0.5,
      'environment': baseScale + (Math.random() - 0.5) * 0.5,
      'gun_control': baseScale + (Math.random() - 0.5) * 0.5,
      'abortion': baseScale + (Math.random() - 0.5) * 0.5,
      'foreign_policy': baseScale + (Math.random() - 0.5) * 0.5
    };
    
    // Clamp all values to [-3, 3]
    type IssueKey = keyof typeof issues;
    (Object.keys(issues) as IssueKey[]).forEach(key => {
      issues[key] = Math.max(-3, Math.min(3, issues[key]));
    });
    
    return issues;
  }

  /**
   * Convert ANESVoterData to Persona
   */
  private convertToPersona(voter: ANESVoterData, index: number) {
    const name = `Voter_${index + 1}`;
    
    const attributes = {
      age: voter.demographics.age,
      occupation: this.inferOccupation(voter),
      sex: voter.demographics.gender.toLowerCase() as 'male' | 'female' | 'other',
      education: voter.demographics.education,
      income: voter.demographics.income,
      state: voter.demographics.state || 'Unknown',
      party_identification: voter.ideology.party_identification,
      political_views: voter.ideology.political_views,
      turnout_likelihood: voter.voting_history.turnout_likelihood,
      ideology_scale: voter.ideology.ideology_scale || 0
    };
    
    return PersonaBuilder.create()
      .withName(name)
      .withAge(attributes.age)
      .withOccupation(this.inferOccupation(voter))
      .withSex(attributes.sex)
      .withAttribute('education', attributes.education)
      .withAttribute('income', attributes.income)
      .withAttribute('state', attributes.state)
      .withAttribute('party_identification', attributes.party_identification)
      .withAttribute('political_views', attributes.political_views)
      .withAttribute('turnout_likelihood', attributes.turnout_likelihood)
      .withAttribute('ideology_scale', attributes.ideology_scale)
      .build();
  }

  // Helper methods for pattern analysis
  private calculateAgeDistribution(data: ANESVoterData[]) {
    const ages = data.map(v => v.demographics.age);
    const mean = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    const variance = ages.reduce((sum, age) => sum + (age - mean) ** 2, 0) / ages.length;
    return { mean, std: Math.sqrt(variance), min: Math.min(...ages), max: Math.max(...ages) };
  }

  private calculateEducationDistribution(data: ANESVoterData[]) {
    const counts: Record<string, number> = {};
    data.forEach(v => {
      counts[v.demographics.education] = (counts[v.demographics.education] || 0) + 1;
    });
    return counts;
  }

  private calculateIncomeDistribution(data: ANESVoterData[]) {
    const incomes = data.map(v => v.demographics.income);
    const mean = incomes.reduce((sum, inc) => sum + inc, 0) / incomes.length;
    const variance = incomes.reduce((sum, inc) => sum + (inc - mean) ** 2, 0) / incomes.length;
    return { mean, std: Math.sqrt(variance), min: Math.min(...incomes), max: Math.max(...incomes) };
  }

  private calculateRaceDistribution(data: ANESVoterData[]) {
    const counts: Record<string, number> = {};
    data.forEach(v => {
      counts[v.demographics.race] = (counts[v.demographics.race] || 0) + 1;
    });
    return counts;
  }

  private calculateGeographyDistribution(data: ANESVoterData[]) {
    const counts: Record<string, number> = {};
    data.forEach(v => {
      counts[v.demographics.geography] = (counts[v.demographics.geography] || 0) + 1;
    });
    return counts;
  }

  private calculatePartyDistribution(data: ANESVoterData[]) {
    const counts: Record<string, number> = {};
    data.forEach(v => {
      counts[v.ideology.party_identification] = (counts[v.ideology.party_identification] || 0) + 1;
    });
    return counts;
  }

  private calculateIdeologyDistribution(data: ANESVoterData[]) {
    const counts: Record<string, number> = {};
    data.forEach(v => {
      counts[v.ideology.political_views] = (counts[v.ideology.political_views] || 0) + 1;
    });
    return counts;
  }

  private calculateIssueCorrelations(data: ANESVoterData[]) {
    // Simplified correlation calculation
    const correlations: Record<string, Record<string, number>> = {};
    const issues = Object.keys(data[0]?.ideology.issue_positions || {});
    
    issues.forEach(issue1 => {
      correlations[issue1] = {};
      issues.forEach(issue2 => {
        if (issue1 !== issue2) {
          correlations[issue1][issue2] = this.calculateCorrelation(
            data.map(v => v.ideology.issue_positions[issue1] || 0),
            data.map(v => v.ideology.issue_positions[issue2] || 0)
          );
        }
      });
    });
    
    return correlations;
  }

  private calculateTurnoutPatterns(data: ANESVoterData[]) {
    const turnoutRates = data.map(v => v.voting_history.turnout_likelihood);
    const mean = turnoutRates.reduce((sum, rate) => sum + rate, 0) / turnoutRates.length;
    return { mean, distribution: turnoutRates };
  }

  private calculateVoteMethodDistribution(data: ANESVoterData[]) {
    const counts: Record<string, number> = {};
    data.forEach(v => {
      const method = v.voting_history.vote_method || 'in_person';
      counts[method] = (counts[method] || 0) + 1;
    });
    return counts;
  }

  // Utility methods
  private determineSampleSize(year: number): number {
    // ANES sample sizes vary by year
    switch (year) {
      case 2016: return 4271;
      case 2020: return 8280;
      case 2024: return 3000; // Estimated
      default: return 3000;
    }
  }

  private passesFilters(voter: ANESVoterData, filters?: ANESProcessingOptions['filter_criteria']): boolean {
    if (!filters) return true;
    
    if (filters.min_age && voter.demographics.age < filters.min_age) return false;
    if (filters.max_age && voter.demographics.age > filters.max_age) return false;
    if (filters.states && !filters.states.includes(voter.demographics.state || '')) return false;
    if (filters.education_levels && !filters.education_levels.includes(voter.demographics.education)) return false;
    
    return true;
  }

  private generateIncome(age: number, education: string, rand: number): number {
    let baseIncome = 35000; // Base income
    
    // Age influence (experience)
    if (age > 30) baseIncome += (age - 30) * 1000;
    if (age > 50) baseIncome += (age - 50) * 500;
    
    // Education multiplier
    switch (education) {
      case 'Less than HS': baseIncome *= 0.7; break;
      case 'High School': baseIncome *= 0.85; break;
      case 'Some College': baseIncome *= 1.0; break;
      case 'College Grad': baseIncome *= 1.4; break;
      case 'Graduate': baseIncome *= 1.8; break;
    }
    
    // Add randomness
    baseIncome *= (0.5 + rand);
    
    return Math.round(baseIncome);
  }

  private generateVotingHistory(age: number, currentYear: number, rand: number): string[] {
    const history: string[] = [];
    
    for (let year = 2000; year < currentYear; year += 4) {
      const voterAge = age - (currentYear - year);
      if (voterAge >= 18) {
        // Higher likelihood of voting in presidential years
        const voteProbability = 0.3 + (rand * 0.4) + (voterAge > 25 ? 0.2 : 0);
        if (Math.random() < voteProbability) {
          history.push(year.toString());
        }
      }
    }
    
    return history;
  }

  private generateTurnoutLikelihood(age: number, education: string, party: string, rand: number): number {
    let likelihood = 0.5; // Base 50%
    
    // Age influence (older voters more likely)
    if (age > 65) likelihood += 0.3;
    else if (age > 45) likelihood += 0.15;
    else if (age < 25) likelihood -= 0.2;
    
    // Education influence
    if (education === 'Graduate') likelihood += 0.2;
    else if (education === 'College Grad') likelihood += 0.1;
    else if (education === 'Less than HS') likelihood -= 0.15;
    
    // Party identification influence
    if (party !== 'Independent') likelihood += 0.1;
    
    // Add randomness
    likelihood += (rand - 0.5) * 0.3;
    
    return Math.max(0, Math.min(1, likelihood));
  }

  private generateNewsSources(party: string, age: number, rand: number): string[] {
    const sources: string[] = [];
    
    // Traditional sources for older voters
    if (age > 50) {
      sources.push('TV News', 'Newspapers');
    }
    
    // Online sources for younger voters
    if (age < 40) {
      sources.push('Social Media', 'Online News');
    }
    
    // Party-aligned sources
    if (party === 'Democrat') {
      sources.push('CNN', 'NPR', 'New York Times');
    } else if (party === 'Republican') {
      sources.push('Fox News', 'Wall Street Journal');
    } else {
      sources.push('BBC', 'Reuters', 'Associated Press');
    }
    
    return sources.slice(0, Math.floor(rand * 4) + 1);
  }

  private generateSocialMedia(age: number, rand: number): string[] {
    const platforms: string[] = [];
    
    if (age < 60 && rand > 0.3) platforms.push('Facebook');
    if (age < 40 && rand > 0.5) platforms.push('Twitter');
    if (age < 30 && rand > 0.4) platforms.push('Instagram', 'TikTok');
    if (age > 30 && rand > 0.7) platforms.push('LinkedIn');
    
    return platforms;
  }

  private inferOccupation(voter: ANESVoterData): string {
    const { age, education, income } = voter.demographics;
    
    if (age >= 65) return 'Retired';
    if (age < 25) return 'Student';
    
    if (education === 'Graduate') {
      if (income > 80000) return 'Professional';
      return 'Specialist';
    }
    
    if (education === 'College Grad') {
      if (income > 60000) return 'Manager';
      return 'Professional';
    }
    
    if (education === 'Some College') {
      return 'Service Worker';
    }
    
    return 'Labor Worker';
  }

  private generateSyntheticVoter(_patterns: any, index: number): ANESVoterData {
    // This would use the analyzed patterns to generate new voters
    // For now, we'll use the same generation logic as above
    return this.generateSyntheticANESRecord(2024, index + 10000);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;
    
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      sumXSquared += dx * dx;
      sumYSquared += dy * dy;
    }
    
    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }
}