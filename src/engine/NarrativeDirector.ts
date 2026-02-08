import { useGameStore } from '../stores/gameStore';
import { useWorldStore } from '../stores/worldStore';
import { mistralService } from '../services/mistral';
import { audioManager } from '../services/audioManager';
import type { Caller, WorldState } from '../types';

interface NarrativeEvent {
  type: 'tension' | 'relief' | 'revelation' | 'danger';
  intensity: number; // 0-1
  description: string;
  triggerRound: number;
}

interface TensionCurve {
  round: number;
  tension: number;
  pacing: 'slow' | 'medium' | 'fast' | 'climactic';
}

class NarrativeDirector {
  private narrativeEvents: NarrativeEvent[] = [];
  private tensionCurve: TensionCurve[] = [];

  constructor() {
    this.initializeTensionCurve();
    this.generateNarrativeEvents();
  }

  private initializeTensionCurve() {
    // 7-round tension arc: introduction -> rising tension -> climax -> resolution
    this.tensionCurve = [
      { round: 1, tension: 0.3, pacing: 'slow' },    // Introduction
      { round: 2, tension: 0.4, pacing: 'medium' },  // World building
      { round: 3, tension: 0.5, pacing: 'medium' },  // Rising stakes
      { round: 4, tension: 0.6, pacing: 'fast' },    // Complications
      { round: 5, tension: 0.8, pacing: 'fast' },    // High tension
      { round: 6, tension: 0.9, pacing: 'climactic' }, // Climax
      { round: 7, tension: 0.7, pacing: 'medium' },  // Resolution
    ];
  }

  private generateNarrativeEvents() {
    this.narrativeEvents = [
      {
        type: 'revelation',
        intensity: 0.4,
        description: 'First signs of the true nature of the apocalypse',
        triggerRound: 2,
      },
      {
        type: 'danger',
        intensity: 0.6,
        description: 'Military presence detected in the city',
        triggerRound: 3,
      },
      {
        type: 'tension',
        intensity: 0.7,
        description: 'Survivors becoming more desperate',
        triggerRound: 4,
      },
      {
        type: 'revelation',
        intensity: 0.8,
        description: 'Truth about the broadcast signal revealed',
        triggerRound: 5,
      },
      {
        type: 'danger',
        intensity: 0.9,
        description: 'Something is hunting the survivors',
        triggerRound: 6,
      },
    ];
  }

  // Get current tension level for the round
  getCurrentTension(round: number): number {
    const curvePoint = this.tensionCurve.find(cp => cp.round === round);
    return curvePoint ? curvePoint.tension : 0.5;
  }

  // Get current pacing for the round
  getCurrentPacing(round: number): 'slow' | 'medium' | 'fast' | 'climactic' {
    const curvePoint = this.tensionCurve.find(cp => cp.round === round);
    return curvePoint ? curvePoint.pacing : 'medium';
  }

  // Adjust caller generation based on tension
  adjustCallerForTension(baseCaller: Partial<Caller>, round: number): Partial<Caller> {
    const tension = this.getCurrentTension(round);

    // Higher tension = more desperate/cryptic callers
    if (tension > 0.7) {
      return {
        ...baseCaller,
        emotionalState: this.getHighTensionEmotion(),
        backstory: this.makeMoreCryptic(baseCaller.backstory || ''),
        isLying: Math.random() < 0.4 + (tension * 0.3), // More likely to lie when tense
      };
    }

    // Medium tension = mixed emotions
    if (tension > 0.5) {
      return {
        ...baseCaller,
        emotionalState: this.getMediumTensionEmotion(),
        isLying: Math.random() < 0.3 + (tension * 0.2),
      };
    }

    // Low tension = more straightforward callers
    return {
      ...baseCaller,
      emotionalState: this.getLowTensionEmotion(),
      isLying: Math.random() < 0.2,
    };
  }

  private getHighTensionEmotion(): string {
    const emotions = ['desperate', 'paranoid', 'hysterical', 'traumatized', 'urgent'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  private getMediumTensionEmotion(): string {
    const emotions = ['worried', 'cautious', 'hopeful', 'determined', 'conflicted'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  private getLowTensionEmotion(): string {
    const emotions = ['calm', 'curious', 'friendly', 'optimistic', 'neutral'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  private makeMoreCryptic(backstory: string): string {
    // Add cryptic elements to high-tension backstories
    const crypticElements = [
      "but there's something they're not telling you...",
      "though their story doesn't quite add up",
      "but you can hear fear in their voice",
      "as if they're being watched",
      "but their words feel rehearsed"
    ];
    
    return backstory + " " + crypticElements[Math.floor(Math.random() * crypticElements.length)];
  }

  // Trigger narrative events based on round
  async triggerNarrativeEvent(round: number): Promise<void> {
    const event = this.narrativeEvents.find(e => e.triggerRound === round);
    
    if (event) {
      // Add event to world state
      const { addEvent } = useWorldStore.getState();
      addEvent({
        id: `narrative_${Date.now()}`,
        description: event.description,
        impact: event.intensity > 0.7 ? 'negative' : event.intensity > 0.3 ? 'neutral' : 'positive',
        timestamp: Date.now(),
        affectedFactions: ['survivors'],
      });

      // Adjust atmospheric effects based on event type
      this.adjustAtmosphereForEvent(event);
    }
  }

  private adjustAtmosphereForEvent(event: NarrativeEvent): void {
    switch (event.type) {
      case 'tension':
        // Increase static, make lighting more oppressive
        audioManager.setVolume(0.8);
        break;
      case 'danger':
        // Add urgency to sounds, red lighting
        audioManager.setVolume(0.9);
        break;
      case 'revelation':
        // Moment of clarity, then tension
        audioManager.setVolume(0.6);
        break;
      case 'relief':
        // Calmer atmosphere
        audioManager.setVolume(0.5);
        break;
    }
  }

  // Generate the final caller (The Watcher)
  async generateFinalCaller(worldState: WorldState): Promise<Partial<Caller>> {
    const finalCaller = {
      id: 'the_watcher',
      name: 'The Watcher',
      archetype: 'the_watcher' as const,
      voiceId: 'ErXwobaYiN019PkySvjV', // Antoni - deep, knowing voice
      emotionalState: 'omniscient',
      backstory: this.generateWatcherBackstory(worldState),
      motivation: 'to judge the player\'s choices',
      secret: 'has been listening to every broadcast',
      lieDetails: 'claims to be a survivor but is something else entirely',
      isLying: true,
      trustLevel: 0,
      dangerLevel: 1,
    };

    return finalCaller;
  }

  private generateWatcherBackstory(worldState: WorldState): string {
    const { broadcastedClaims, callerHistory, playerReputation } = worldState;
    
    // The Watcher references player's previous choices
    const references = [];
    
    if (broadcastedClaims.length > 0) {
      references.push(`I heard what you broadcast about "${broadcastedClaims[0]}"`);
    }
    
    if (playerReputation.honesty > 70) {
      references.push('You\'ve been honest, mostly');
    } else if (playerReputation.honesty < 30) {
      references.push('You\'ve told so many lies, I\'ve lost count');
    }
    
    if (callerHistory.filter(c => c.survived).length > 3) {
      references.push('You\'ve saved so many people');
    } else if (callerHistory.filter(c => !c.survived).length > 3) {
      references.push('So many have died because of your choices');
    }

    const backstory = `I've been listening since the beginning. ${references.join('. ')}. I know what you've done, what you've said, and what you've hidden. I am the last voice that will judge your broadcast.`;

    return backstory;
  }

  // Generate end game summary
  async generateEndGameSummary(worldState: WorldState): Promise<string> {
    try {
      const response = await mistralService.generateEndBroadcast(worldState);
      return response.summary || this.generateFallbackSummary(worldState);
    } catch (error) {
      console.error('Error generating summary:', error);
      return this.generateFallbackSummary(worldState);
    }
  }

  private generateFallbackSummary(worldState: WorldState): string {
    const { callerHistory } = worldState;
    const { playerCallsign } = useGameStore.getState();
    const survivors = callerHistory.filter(c => c.survived).length;
    const lost = callerHistory.filter(c => !c.survived).length;

    return `This is ${playerCallsign}, signing off for the last time. The static grows louder now, swallowing the city. ${survivors} voices you saved echo in the darkness, while ${lost} others fade into silence. Your broadcast continues, a single frequency in the endless night. The world remembers your voice, even as the signal weakens. In the end, you were the last one speaking, the last one listening, the last broadcast from a world that no longer answers. The air goes quiet. The transmission ends. But somewhere, in the static, your voice remains.`;
  }

  // Calculate final score/statistics
  calculateFinalStats(worldState: WorldState) {
    const { playerReputation, callerHistory, broadcastedClaims } = worldState;
    
    const totalCallers = callerHistory.length;
    const survivalRate = totalCallers > 0 ? (callerHistory.filter(c => c.survived).length / totalCallers) * 100 : 0;
    const honestyScore = playerReputation.honesty;
    const compassionScore = playerReputation.compassion;
    const boldnessScore = playerReputation.boldness;
    
    // Calculate overall performance score
    const performanceScore = Math.round(
      (survivalRate * 0.4) + 
      (honestyScore * 0.2) + 
      (compassionScore * 0.2) + 
      (boldnessScore * 0.2)
    );

    // Determine ending type
    let endingType: 'hero' | 'survivor' | 'martyr' | 'tragic' | 'mysterious';
    
    if (performanceScore > 80 && honestyScore > 70) {
      endingType = 'hero';
    } else if (performanceScore > 60 && survivalRate > 50) {
      endingType = 'survivor';
    } else if (compassionScore > 80 && survivalRate < 30) {
      endingType = 'martyr';
    } else if (performanceScore < 30) {
      endingType = 'tragic';
    } else {
      endingType = 'mysterious';
    }

    return {
      performanceScore,
      survivalRate,
      honestyScore,
      compassionScore,
      boldnessScore,
      endingType,
      totalCallers,
      broadcastsMade: broadcastedClaims.length,
    };
  }

  // Get atmospheric intensity for current game state
  getAtmosphericIntensity(): number {
    const { currentRound } = useGameStore.getState();
    const tension = this.getCurrentTension(currentRound);
    
    // Map tension to atmospheric intensity (0.1 to 0.8)
    return 0.1 + (tension * 0.7);
  }

  // Reset director for new game
  reset(): void {
    // Director is stateless, no need to reset
  }
}

export const narrativeDirector = new NarrativeDirector();
