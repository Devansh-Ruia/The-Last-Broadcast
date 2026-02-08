# 🎙️ The Last Broadcast

A post-apocalyptic radio broadcast game where you play as the last radio operator in a dying city, making life-or-death decisions about who to help, who to expose, and whose truth to broadcast.

## 🎮 Game Overview

In a world consumed by static and silence, you are the final voice on the airwaves. As a radio operator in a city on the brink of collapse, you receive desperate calls from survivors, liars, and something else entirely. Each decision you make echoes through the darkness, shaping the fate of those who still listen.

**Features:**
- **7-round narrative experience** with tension pacing and atmospheric storytelling
- **AI-driven caller generation** using Mistral Large 3
- **Full voice acting** with ElevenLabs TTS integration
- **Dynamic audio system** with Web Audio API effects and real-time VU meters
- **Atmospheric visuals** with crossfading backgrounds and lighting effects
- **Multiple endings** based on your choices and moral compass

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with Web Audio API support

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/the-last-broadcast.git
cd the-last-broadcast
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
VITE_MISTRAL_API_KEY=your_mistral_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
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
