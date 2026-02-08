export interface Caller {
  id: string;
  name: string;
  age: number;
  archetype: 'desperate_parent' | 'wounded_soldier' | 'scared_kid' | 'cunning_liar' | 'true_believer' | 'government_agent' | 'the_watcher';
  backstory: string;
  motivation: string;
  secret: string;
  trustworthiness: number;
  emotionalState: string;
  voiceId: string;
  portrait: string;
  referencesToPast: string[];
  isLying: boolean;
  lieDetails?: string;
}

export interface WorldEvent {
  id: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  timestamp: number;
  affectedFactions: string[];
}

export interface CallerOutcome {
  callerId: string;
  choice: 'broadcast' | 'help' | 'ignore' | 'expose';
  survived: boolean;
  impact: string;
}

export interface WorldState {
  broadcastNumber: number;
  cityCondition: 'burning' | 'foggy' | 'overrun' | 'calm' | 'dark';
  factions: {
    survivors: { trust: number; population: number; morale: number };
    military: { trust: number; control: number; hostility: number };
    unknown: { presence: number; awareness: number };
  };
  events: WorldEvent[];
  playerReputation: {
    honesty: number;
    compassion: number;
    boldness: number;
  };
  callerHistory: CallerOutcome[];
  broadcastedClaims: string[];
}

export interface GameState {
  phase: 'sign-on' | 'broadcasting' | 'caller-connected' | 'player-turn' | 'static-break' | 'sign-off';
  currentRound: number;
  currentCaller: Caller | null;
  playerCallsign: string;
  conversation: ConversationMessage[];
  isProcessing: boolean;
}

export interface ConversationMessage {
  id: string;
  speaker: 'caller' | 'player';
  text: string;
  timestamp: number;
  emotionalState?: string;
}

export interface AudioConfig {
  volume: number;
  staticVolume: number;
  voiceVolume: number;
  effectsVolume: number;
}

export type PlayerChoice = 'broadcast' | 'help' | 'ignore' | 'expose';

export interface EndGameSummary {
  totalCallers: number;
  livesSaved: number;
  livesLost: number;
  truthBroadcast: number;
  liesBroadcast: number;
  finalCityCondition: string;
  reputationScore: number;
  finalMessage: string;
}
