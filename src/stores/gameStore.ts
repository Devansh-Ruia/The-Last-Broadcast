import { create } from 'zustand';
import { GameState, Caller, ConversationMessage } from '../types';

interface GameStore extends GameState {
  // Actions
  setPhase: (phase: GameState['phase']) => void;
  setCurrentRound: (round: number) => void;
  setCurrentCaller: (caller: Caller | null) => void;
  setPlayerCallsign: (callsign: string) => void;
  addMessage: (message: ConversationMessage) => void;
  clearConversation: () => void;
  setIsProcessing: (processing: boolean) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  phase: 'sign-on',
  currentRound: 1,
  currentCaller: null,
  playerCallsign: '',
  conversation: [],
  isProcessing: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),
  
  setCurrentRound: (round) => set({ currentRound: round }),
  
  setCurrentCaller: (caller) => set({ currentCaller: caller }),
  
  setPlayerCallsign: (callsign) => set({ playerCallsign: callsign }),
  
  addMessage: (message) => set((state) => ({
    conversation: [...state.conversation, message]
  })),
  
  clearConversation: () => set({ conversation: [] }),
  
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  
  resetGame: () => set(initialState),
}));
