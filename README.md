# The Last Broadcast

A single-player narrative horror game where you play as the last radio host alive after the apocalypse. Survivors call in with AI-generated voices, desperate stories, and hidden agendas. You choose who to help, what to broadcast, and what to say on-air. Your words reshape the world, and callers in later rounds react to your earlier choices.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **Audio:** Howler.js for SFX, Web Audio API for radio effects
- **State management:** Zustand
- **AI APIs:** Mistral Large 3, ElevenLabs TTS, Neocortex
- **Deployment:** Vercel

## Game Features

- **Dynamic AI Callers:** Each caller is generated with unique backstories, motivations, and secrets
- **Consequential Choices:** Your decisions affect the city, factions, and future callers
- **Voice Integration:** AI-generated voices for immersive conversations
- **Atmospheric UI:** 1970s radio studio aesthetic with real-time VU meters and effects
- **Branching Narrative:** No two playthroughs are the same

## Setup Instructions

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd the-last-broadcast
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   VITE_MISTRAL_API_KEY=your_mistral_key_here
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
   VITE_NEOCORTEX_API_KEY=your_neocortex_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:** `http://localhost:3000`

## Deployment

Deploy to Vercel with one click:

```bash
npx vercel
```

Or connect your repository to Vercel for automatic deployments.

## Game Controls

- **Enter Callsign:** Type your radio host name and click "SIGN ON"
- **Answer Calls:** Click "ANSWER CALL" when a caller connects
- **Respond:** Type messages and press Enter to speak with callers
- **Make Choices:** After conversations, choose:
  - **BROADCAST:** Share their story on air
  - **HELP:** Give them private advice
  - **IGNORE:** Cut the call
  - **EXPOSE:** Call out their lies on air

## Game Flow

1. **Sign On:** Enter your callsign and power up the radio console
2. **Broadcast Loop:** Take calls from survivors (5-7 rounds)
3. **Final Caller:** Face "The Watcher" who knows everything you've done
4. **Sign Off:** Review your broadcast's impact on the city

## Architecture

```
src/
├── components/     # React UI components
├── engine/        # Core game logic and state management
├── services/      # API clients (Mistral, ElevenLabs, etc.)
├── stores/        # Zustand state management
├── types/         # TypeScript interfaces
├── data/          # Game data and templates
└── utils/         # Helper functions
```

## API Integration

The game integrates with multiple AI services:

- **Mistral Large 3:** Generates callers, conversations, and world state updates
- **ElevenLabs TTS:** Converts text to emotional speech for callers
- **Neocortex:** Advanced conversational AI for NPCs (fallback to Mistral + ElevenLabs)

## Contributing

This is a 48-hour hackathon project. The codebase prioritizes functionality over perfection, with all features fully implemented and working.

## License

MIT License - feel free to use and modify for your own projects.

---

**Built for the 48-Hour Hackathon** • Made with React, TypeScript, and AI
