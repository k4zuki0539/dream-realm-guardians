# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**夢境の守護者 (Dream Realm Guardians)** - A complete turn-based battle simulation RPG built with Electron, HTML5, CSS3, and JavaScript.

### Game Features
- **感情共鳴バトルシステム**: Unique emotion-based combat mechanics
- **記憶合成システム**: Combine memories to create powerful skills
- **4つのマルチエンディング**: Multiple story endings based on player choices
- **キャラクター成長**: Visual character progression through 5 levels
- **完全CSV外部管理**: All game data managed via BOM-UTF-8 CSV files

## Development Commands

### Running the Game
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production build
npm start

# Build for distribution
npm run build
npm run build-win    # Windows
npm run build-mac    # macOS  
npm run build-linux  # Linux
```

### Development Tools
```bash
# Lint code (placeholder)
npm run lint

# Run tests (placeholder)
npm run test
```

## Architecture

### Core Systems
1. **GameEngine** (`js/gameEngine.js`) - Central game state management
2. **CSVLoader** (`js/csvLoader.js`) - BOM-UTF-8 CSV data loading system
3. **DialogSystem** (`js/dialogSystem.js`) - Conversation and typewriter effects
4. **BattleSystem** (`js/battleSystem.js`) - Turn-based combat with emotion resonance
5. **EndingSystem** (`js/endingSystem.js`) - Multiple ending determination
6. **AudioManager** (`js/audioManager.js`) - BGM, SE, and voice management
7. **ParticleSystem** (`js/particleSystem.js`) - Visual effects system

### Data Management (CSV Files)
**Critical**: All CSV files MUST be saved as **BOM-UTF-8** to prevent Japanese text corruption:
- `scenes.csv` - Scene definitions and transitions
- `characters.csv` - Character data and properties
- `dialogues.csv` - All conversation text with emotions
- `character_levels.csv` - Level-based appearance changes
- `endings.csv` - Ending conditions and branching logic
- `memory_skills.csv` - Player skills and abilities
- `battle_enemies.csv` - Enemy stats and weaknesses
- `game_balance.csv` - Numerical balance parameters
- Plus 9 additional CSV files for complete external data management

### File Structure
```
/
├── index.html              # Main HTML file
├── main.js                 # Electron main process
├── preload.js              # Electron preload script
├── package.json            # Node.js dependencies
├── js/                     # JavaScript modules
├── styles/                 # CSS stylesheets
├── data/                   # BOM-UTF-8 CSV files
├── assets/                 # Game assets
│   ├── ui/                 # UI images
│   ├── characters/         # Character sprites
│   ├── backgrounds/        # Background images
│   ├── enemies/            # Enemy sprites
│   └── audio/              # Sound files
└── dist/                   # Build output
```

### Game Screens (4 Required)
1. **Title Screen** - Main menu with character display
2. **Dialog Screen** - Conversation system with typewriter effect
3. **Battle Screen** - Turn-based combat interface
4. **Ending Screen** - 4 different ending variations

## Important Implementation Notes

### CSV Encoding Requirements
- **MUST use BOM-UTF-8 encoding** for all CSV files
- Files should start with BOM character `\uFEFF`
- Use CRLF line endings (`\r\n`)
- Excel-compatible format for non-programmer editing

### Game Balance
- Player starts at level 1, max level 5
- 4 emotion values: Hope, Empathy, Despair, Loneliness
- Turn-based battles with 3 action points per turn
- Automatic saving every 5 seconds

### Electron Specific
- Window size: 1024x768 (resizable, min 800x600)
- Cross-platform support (Windows/Mac/Linux)
- Local file system access for save data
- Menu bar integration

## Development Workflow

1. **CSV Data First**: Always update CSV files before code changes
2. **Test in Browser**: Game runs in web browsers for development
3. **Electron Build**: Use npm scripts for final packaging
4. **Asset Management**: Place placeholder images for missing assets

## Debugging

### Available Debug Functions (Console)
- `showGameState()` - Display current game state
- `debugTransition(sceneId)` - Force scene transition
- `debugEmotion(emotion, value)` - Modify emotion values
- `debugBattle(enemyId)` - Start specific battle

### CSV Validation
The CSVLoader automatically validates:
- BOM presence/absence
- Line ending consistency  
- Column header matching
- Data type conversion

## Known Dependencies
- Electron framework for desktop deployment
- No external JavaScript libraries (vanilla JS)
- Google Fonts for typography
- Canvas API for particle effects

This project implements a complete, production-ready game with professional-level architecture and external data management.