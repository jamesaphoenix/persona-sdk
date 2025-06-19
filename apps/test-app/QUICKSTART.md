# Quick Start - Persona SDK Test App

## 1. Set up your environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-...
```

## 2. Start the test app

```bash
# From the root directory
pnpm test-app:dev

# Or from the test-app directory
cd apps/test-app
pnpm dev
```

## 3. Open in browser

Navigate to: http://localhost:3001

## 4. Testing workflow

### First time (Record mode):
1. Enter your OpenAI API key in the AI Features test section
2. Switch to "Record" mode in the top control panel
3. Run the AI feature tests - API responses will be saved as cassettes

### Subsequent runs (Replay mode):
1. Keep in "Replay" mode (default)
2. Run any tests - OpenAI calls will use saved cassettes
3. No API costs!

## 5. Test categories

- **Persona Tests**: PersonaBuilder, Persona class
- **PersonaGroup Tests**: Collection management, statistics
- **Distribution Tests**: All statistical distributions
- **AI Features Tests**: OpenAI-powered features with cassettes

## 6. Export results

- Click "Download Manifest" to save test coverage data
- Click "Download Cassettes" to save API recordings

## Tips

- Start with non-AI tests first (no API key needed)
- Use deterministic seeds for reproducible tests
- Check console for detailed error logs
- All cassettes are saved in `/cassettes` directory