import { create } from 'zustand';
import type { WorldState, WorldEvent, CallerOutcome } from '../types';

interface WorldStore extends WorldState {
  // Actions
  setCityCondition: (condition: WorldState['cityCondition']) => void;
  updateFaction: (faction: keyof WorldState['factions'], updates: Partial<WorldState['factions'][typeof faction]>) => void;
  addEvent: (event: WorldEvent) => void;
  updateReputation: (updates: Partial<WorldState['playerReputation']>) => void;
  addCallerOutcome: (outcome: CallerOutcome) => void;
  addBroadcastedClaim: (claim: string) => void;
  incrementBroadcastNumber: () => void;
  resetWorld: () => void;
}

const initialWorldState: WorldState = {
  broadcastNumber: 0,
  cityCondition: 'foggy',
  factions: {
    survivors: { trust: 50, population: 1000, morale: 50 },
    military: { trust: 30, control: 70, hostility: 40 },
    unknown: { presence: 10, awareness: 5 },
  },
  events: [],
  playerReputation: {
    honesty: 50,
    compassion: 50,
    boldness: 50,
  },
  callerHistory: [],
  broadcastedClaims: [],
};

export const useWorldStore = create<WorldStore>((set) => ({
  ...initialWorldState,

  setCityCondition: (condition) => set({ cityCondition: condition }),
  
  updateFaction: (faction, updates) => set((state) => ({
    factions: {
      ...state.factions,
      [faction]: {
        ...state.factions[faction],
        ...updates,
      },
    },
  })),
  
  addEvent: (event) => set((state) => ({
    events: [...state.events, event],
  })),
  
  updateReputation: (updates) => set((state) => ({
    playerReputation: {
      ...state.playerReputation,
      ...updates,
    },
  })),
  
  addCallerOutcome: (outcome) => set((state) => ({
    callerHistory: [...state.callerHistory, outcome],
  })),
  
  addBroadcastedClaim: (claim) => set((state) => ({
    broadcastedClaims: [...state.broadcastedClaims, claim],
  })),
  
  incrementBroadcastNumber: () => set((state) => ({
    broadcastNumber: state.broadcastNumber + 1,
  })),
  
  resetWorld: () => set(initialWorldState),
}));
