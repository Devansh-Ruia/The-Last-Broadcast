import { useGameStore } from '../stores/gameStore';
import { useWorldStore } from '../stores/worldStore';
import { mistralService } from '../services/mistral';
import type { Caller, PlayerChoice } from '../types';

class GameEngine {
  private maxRounds = 7;
  private currentCallerTimeout?: ReturnType<typeof setTimeout>;

  // Start the game loop
  async startGame() {
    const { setPhase } = useGameStore.getState();
    
    setPhase('broadcasting');
    
    // Start first caller after a short delay
    setTimeout(() => {
      this.nextRound();
    }, 2000);
  }

  // Move to next round/caller
  async nextRound() {
    const { currentRound, setPhase, clearConversation } = useGameStore.getState();

    if (currentRound > this.maxRounds) {
      this.endGame();
      return;
    }

    // Clear previous conversation
    clearConversation();
    
    // Generate new caller
    const worldState = useWorldStore.getState();
    const caller = await mistralService.generateCaller(worldState, currentRound);
    
    // Set current caller and move to caller phase
    useGameStore.getState().setCurrentCaller(caller);
    setPhase('caller-connected');
    
    // Simulate phone ringing
    setTimeout(() => {
      this.simulateIncomingCall();
    }, 1000);
  }

  // Simulate incoming call
  private simulateIncomingCall() {
    const { currentCaller, addMessage } = useGameStore.getState();
    
    if (!currentCaller) return;

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

    // Get AI response
    const response = await mistralService.generateCallerResponse(
      currentCaller,
      playerMessage,
      worldState
    );

    // Add AI response to conversation
    setTimeout(() => {
      addMessage({
        id: `caller_${Date.now()}`,
        speaker: 'caller',
        text: response.speech,
        timestamp: Date.now(),
        emotionalState: response.emotionalShift,
      });

      setIsProcessing(false);
    }, 1000 + Math.random() * 2000); // Simulate thinking time
  }

  // Process player's final choice
  async processPlayerChoice(choice: PlayerChoice) {
    const { currentCaller, setIsProcessing, addMessage } = useGameStore.getState();
    const { 
      updateReputation, 
      addCallerOutcome, 
      addEvent, 
      setCityCondition,
      addBroadcastedClaim 
    } = useWorldStore.getState();

    if (!currentCaller) return;

    setIsProcessing(true);

    // Process choice through AI
    const worldState = useWorldStore.getState();
    const result = await mistralService.processPlayerChoice(choice, currentCaller, worldState);

    // Update world state
    if (result.worldUpdates) {
      // Apply world updates
      if (result.worldUpdates.cityCondition) {
        setCityCondition(result.worldUpdates.cityCondition);
      }
      
      if (result.worldUpdates.playerReputation) {
        updateReputation(result.worldUpdates.playerReputation);
      }
    }

    // Add news ticker event
    addEvent({
      id: `event_${Date.now()}`,
      description: result.newsTickerLine,
      impact: choice === 'broadcast' ? 'positive' : choice === 'ignore' ? 'negative' : 'neutral',
      timestamp: Date.now(),
      affectedFactions: ['survivors'],
    });

    // Add to caller history
    const survived = choice !== 'ignore' && choice !== 'expose';
    addCallerOutcome({
      callerId: currentCaller.id,
      choice,
      survived,
      impact: result.consequenceDescription,
    });

    // If broadcast, add to claims
    if (choice === 'broadcast' && currentCaller.backstory) {
      addBroadcastedClaim(`${currentCaller.name}: ${currentCaller.backstory}`);
    }

    // Add final message
    addMessage({
      id: `system_${Date.now()}`,
      speaker: 'player',
      text: this.getChoiceResultMessage(choice, currentCaller, survived),
      timestamp: Date.now(),
    });

    // Move to static break, then next round
    setTimeout(() => {
      const { setPhase, setCurrentRound } = useGameStore.getState();
      setPhase('static-break');
      
      setTimeout(() => {
        setCurrentRound(useGameStore.getState().currentRound + 1);
        this.nextRound();
      }, 3000);
    }, 2000);
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

    // Generate final summary
    await mistralService.generateEndBroadcast(worldState);

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
