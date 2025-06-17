# Changelog

All notable changes to @jamesaphoenix/persona-sdk will be documented in this file.

## [0.2.0] - 2025-06-17

### Added
- 📸 **Media-to-Persona Generation**: Generate personas from text posts, images, and other media content
  - `MediaToPersonaGenerator` class for converting media to personas
  - Support for single and multiple persona generation with variations
  - Automatic attribute extraction from social media posts
  - Image analysis for persona creation

- 🎬 **Media Diet & Influence System**: Model how media consumption influences personas
  - `MediaDietManager` class for managing media influence on personas
  - Apply media diets to individual personas or entire groups
  - Media recommendation system based on persona attributes
  - Variation factors for diverse media consumption patterns

- 📊 **Comprehensive Token Usage Tracking**: Track AI operation costs
  - All AI operations now return `UsageMetadata` with token counts
  - Built-in cost estimation for different OpenAI models
  - Token counting using tiktoken for accurate measurements
  - Cost prediction before processing

- 🔄 **Full LangChain Integration**: Replaced direct OpenAI calls
  - `DistributionSelectorLangChain` replaces the original distribution selector
  - Structured outputs using LangChain's `withStructuredOutput`
  - Better error handling and type safety
  - Support for multiple LLM providers

- 📁 **Media Processing Utilities**: Handle various media types
  - `MediaProcessor` class for file/URL processing
  - Automatic base64 encoding for images
  - Support for text, images, documents, audio, and video files
  - URL content fetching and processing

### Changed
- Updated all AI operations to use LangChain instead of direct OpenAI API calls
- Improved type safety across the SDK
- Enhanced error handling for media processing operations

### Fixed
- Fixed non-deterministic test failures
- Resolved CI/CD pipeline issues across platforms
- Fixed PersonaGroup method naming consistency (`add` instead of `addPersona`)

## [0.1.0] - Initial Release

### Added
- Core persona generation from statistical distributions
- PersonaGroup management
- AI-powered distribution selection
- Correlation system for realistic personas
- Auto-correlation generation
- Statistical analysis tools