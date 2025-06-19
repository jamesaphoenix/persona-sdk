# Changelog

All notable changes to this project will be documented in this file.

## [0.5.0] - 2025-06-19

### 🎉 Major Features

#### Political Analysis Framework
- **ANES Data Processor**: Load and analyze American National Election Studies data
- **Voter Persona Generator**: Create realistic voter personas with political attributes
- **Election Prediction Engine**: Simulate election scenarios with temporal dynamics
- **Political Reasoning Framework**: Model cross-pressures and voter decision-making
- **Gaussian Copula Integration**: Advanced correlation modeling for realistic political behavior

#### Survey Data Pipeline
- **Survey Response Generator**: Create realistic survey responses from personas
- **Correlation Analyzer**: Identify patterns and relationships in survey data
- **Distribution Fitter**: Fit statistical distributions to survey responses
- **Joint Distribution Synthesis**: Generate correlated multi-dimensional data
- **Survey Report Generator**: Automated insights and visualization

### 🐛 Bug Fixes

#### CI/CD Infrastructure
- Fixed all browser compatibility issues in web applications
- Resolved Node.js module imports in browser environments
- Fixed Next.js 15 API route parameter typing
- Added cross-platform CI environment detection
- Implemented graceful fallbacks for missing Bun runtime
- Fixed CSS compilation issues with Tailwind

#### Core SDK Improvements
- Fixed missing attributes in voter persona generation
- Resolved Date serialization issues in election scenarios
- Fixed CategoricalDistribution probability normalization
- Corrected ExponentialDistribution error messages
- Fixed getAttribute() usage in political tests

### 📚 Documentation
- Reorganized navigation for better learning progression
- Improved SDK onboarding experience
- Added comprehensive political analysis examples
- Updated API reference documentation

### 🧪 Testing
- Achieved 100% CI/CD pipeline success across all platforms
- 715+ unit tests passing
- Added comprehensive political analysis tests
- Improved runtime test coverage to 96.3%
- Fixed test compatibility on Windows

### 🔧 Developer Experience
- Simplified web app components for better maintainability
- Improved error messages and debugging
- Better TypeScript type safety throughout
- Enhanced build performance

## [0.4.0] - 2025-06-18

### Added
- Comprehensive runtime testing system with VCR cassettes
- React test application with live demos
- Function signature tracking for API changes
- Coverage analysis and reporting
- Cross-platform test compatibility

### Fixed
- Multiple runtime bugs discovered through testing
- API mismatches between tests and implementation
- Edge case validation issues
- Memory leaks and performance issues

## [0.3.0] - 2025-06-17

### Added
- Prompt optimization framework
- Database adapter system
- PostgreSQL integration
- Migration system
- Comprehensive API documentation

## [0.2.0] - 2025-06-16

### Added
- AI-powered persona generation
- Statistical distribution framework
- PersonaGroup management
- REST API server
- React hooks integration

## [0.1.0] - 2025-06-15

### Added
- Initial release
- Core Persona and PersonaBuilder classes
- Basic distribution support
- TypeScript type definitions