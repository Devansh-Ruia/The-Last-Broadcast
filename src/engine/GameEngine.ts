import { useGameStore } from '../stores/gameStore';
import { useWorldStore } from '../stores/worldStore';
import { mistralService } from '../services/mistral';
import { audioManager } from '../services/audioManager';
import { narrativeDirector } from './NarrativeDirector';
import type { Caller, PlayerChoice } from '../types';

class GameEngine {
  private maxRounds = 7;
  private currentCallerTimeout?: ReturnType<typeof setTimeout>;

  // Start the game loop
  async startGame() {
    const { setPhase } = useGameStore.getState();
    
    setPhase('broadcasting');
    
    // Play broadcast start sound
    audioManager.playBroadcastStart();
    
    // Start first caller after a short delay
    setTimeout(() => {
      this.nextRound();
    }, 2000);
  }

  // Move to next round/caller
  async nextRound() {
    const { currentRound, clearConversation } = useGameStore.getState();

    if (currentRound > this.maxRounds) {
      this.endGame();
      return;
    }

    // Clear previous conversation
    clearConversation();
    
    // Trigger narrative event for this round
    await narrativeDirector.triggerNarrativeEvent(currentRound);
    
    // Special handling for final round (The Watcher)
    if (currentRound === this.maxRounds) {
      await this.generateFinalCaller();
    } else {
      // Generate regular caller with narrative adjustments
      const worldState = useWorldStore.getState();
      const baseCaller = await mistralService.generateCaller(worldState, currentRound);
      const adjustedCaller = narrativeDirector.adjustCallerForTension(baseCaller, currentRound);
      
      // Ensure caller has all required fields
      const finalCaller: Caller = {
        id: adjustedCaller.id || `caller_${Date.now()}`,
        name: adjustedCaller.name || 'Unknown Caller',
        age: adjustedCaller.age || 30,
        archetype: adjustedCaller.archetype || 'desperate_parent',
        backstory: adjustedCaller.backstory || 'No backstory available',
        motivation: adjustedCaller.motivation || 'survival',
        secret: adjustedCaller.secret || 'no secret',
        trustworthiness: adjustedCaller.trustworthiness || 0.5,
        emotionalState: adjustedCaller.emotionalState || 'neutral',
        voiceId: adjustedCaller.voiceId || 'rachel',
        portrait: adjustedCaller.portrait || '',
        referencesToPast: adjustedCaller.referencesToPast || [],
        isLying: adjustedCaller.isLying || false,
        lieDetails: adjustedCaller.lieDetails || '',
      };
      
      // Set current caller and move to caller phase
      useGameStore.getState().setCurrentCaller(finalCaller);
      useGameStore.getState().setPhase('caller-connected');
    }
    
    // Simulate phone ringing
    setTimeout(() => {
      this.simulateIncomingCall();
    }, 1000);
  }

  // Generate the final caller (The Watcher)
  private async generateFinalCaller() {
    const worldState = useWorldStore.getState();
    const finalCaller = await narrativeDirector.generateFinalCaller(worldState);
    
    // Ensure final caller has all required fields
    const completeFinalCaller: Caller = {
      id: finalCaller.id || 'the_watcher',
      name: finalCaller.name || 'The Watcher',
      age: finalCaller.age || 999,
      archetype: finalCaller.archetype || 'the_watcher',
      backstory: finalCaller.backstory || 'I have been watching since the beginning.',
      motivation: finalCaller.motivation || 'to judge your choices',
      secret: finalCaller.secret || 'I am not what I appear to be',
      trustworthiness: 0, // The Watcher is mysterious
      emotionalState: finalCaller.emotionalState || 'omniscient',
      voiceId: finalCaller.voiceId || 'ErXwobaYiN019PkySvjV',
      portrait: finalCaller.portrait || '',
      referencesToPast: finalCaller.referencesToPast || [],
      isLying: finalCaller.isLying !== false,
      lieDetails: finalCaller.lieDetails || 'I am not human',
    };
    
    // Set final caller and move to caller phase
    useGameStore.getState().setCurrentCaller(completeFinalCaller);
    useGameStore.getState().setPhase('caller-connected');
  }

  // Simulate incoming call
  private simulateIncomingCall() {
    const { currentCaller, addMessage } = useGameStore.getState();
    
    if (!currentCaller) return;

    // Play caller connection sequence
    audioManager.playCallerConnection(currentCaller);

    // Add initial caller message
    setTimeout(() => {
      addMessage({
        id: `caller_${Date.now()}`,
        speaker: 'caller',
        text: `*${currentCaller.name} connecting...*`,
        timestamp: Date.now(),
      });

      setTimeout(() => {
        addMessage({
          id: `caller_${Date.now()}_2`,
          speaker: 'caller',
          text: this.getCallerIntro(currentCaller),
          timestamp: Date.now(),
        });

        // Speak the intro with TTS
        audioManager.speakText(this.getCallerIntro(currentCaller), currentCaller.voiceId);
      }, 1500);
    }, 500);
  }

  // Get caller's opening line
  private getCallerIntro(caller: Caller): string {
    const intros = [
      `Hello? Is anyone there? This is ${caller.name}.`,
      `*static* Can you hear me? My name is ${caller.name}.`,
      `${caller.name} here... I've been trying to reach someone for days.`,
      `*crackle* Thank god! Someone's still broadcasting. This is ${caller.name}.`,
    ];
    
    return intros[Math.floor(Math.random() * intros.length)];
  }

  // Handle player response
  async handlePlayerResponse(playerMessage: string) {
    const { currentCaller, addMessage, setIsProcessing } = useGameStore.getState();
    const worldState = useWorldStore.getState();

    if (!currentCaller) return;

    setIsProcessing(true);

    // Play button click sound
    audioManager.playButtonClick();

    // Get AI response
    const response = await mistralService.generateCallerResponse(
      currentCaller,
      playerMessage,
      worldState
    );

    // Add AI response to conversation
    setTimeout(() => {
      addMessage({
        id: `caller_${Date.now()}_response`,
        speaker: 'caller',
        text: response.speech,
        timestamp: Date.now(),
      });

      // Speak the response with TTS
      audioManager.speakText(response.speech, currentCaller.voiceId);

      setIsProcessing(false);
    }, 1000);
  }

  // Process player's final choice
  async processPlayerChoice(choice: PlayerChoice) {
    const { currentCaller, setIsProcessing, addMessage } = useGameStore.getState();
    const { 
      addCallerOutcome, 
      addBroadcastedClaim,
    } = useWorldStore.getState();

    if (!currentCaller) return;

    setIsProcessing(true);

    // Play button click sound
    audioManager.playButtonClick();

    // Determine outcome based on choice
    const survived = choice !== 'ignore' && choice !== 'expose';
    
    // Add outcome message
    const outcomeMessage = this.getChoiceResultMessage(choice, currentCaller, survived);
    addMessage({
      id: `outcome_${Date.now()}`,
      speaker: 'player',
      text: outcomeMessage,
      timestamp: Date.now(),
    });

    // Speak outcome with TTS
    audioManager.speakText(outcomeMessage, currentCaller.voiceId);

    // Add to caller history
    addCallerOutcome({
      callerId: currentCaller.id,
      choice,
      survived,
      impact: outcomeMessage,
    });

    // If broadcast, add to claims
    if (choice === 'broadcast' && currentCaller.backstory) {
      addBroadcastedClaim(`${currentCaller.name}: ${currentCaller.backstory}`);
    }

    // Play caller disconnection sound
    setTimeout(() => {
      audioManager.playCallerDisconnect();
    }, 2000);

    // Move to static break between callers
    setTimeout(() => {
      const { setPhase, setCurrentRound } = useGameStore.getState();
      setPhase('static-break');
      
      setTimeout(() => {
        setCurrentRound(useGameStore.getState().currentRound + 1);
        this.nextRound();
      }, 3000);
    }, 5000);
  }

  // Get message for player's choice
  private getChoiceResultMessage(choice: PlayerChoice, _caller: Caller, survived: boolean): string {
    switch (choice) {
      case 'broadcast':
        return `*Going live on air* ${survived ? 'Your broadcast may help others.' : 'The truth spreads through the darkness.'}`;
      case 'help':
        return `*Private channel* ${survived ? 'You gave them hope.' : 'You did what you could.'}`;
      case 'ignore':
        return '*Call terminated* The line goes dead.';
      case 'expose':
        return `*Live broadcast* ${survived ? 'The truth comes out.' : 'Your words echo in the silence.'}`;
      default:
        return '*Transmission ended*';
    }
  }

  // End the game
  async endGame() {
    const { setPhase } = useGameStore.getState();
    const worldState = useWorldStore.getState();

    // Generate final summary using NarrativeDirector
    const summary = await narrativeDirector.generateEndGameSummary(worldState);

    // Add final message to conversation
    const { addMessage } = useGameStore.getState();
    addMessage({
      id: `final_${Date.now()}`,
      speaker: 'player',
      text: summary,
      timestamp: Date.now(),
    });

    // Play broadcast end sound
    audioManager.playBroadcastEnd();

    // Move to sign-off screen
    setPhase('sign-off');
  }

  // Clear any pending timeouts
  clearTimeouts() {
    if (this.currentCallerTimeout) {
      clearTimeout(this.currentCallerTimeout);
    }
  }
}

export const gameEngine = new GameEngine();
