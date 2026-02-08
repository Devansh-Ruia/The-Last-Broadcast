import type { Caller, WorldState } from '../types';

const MISTRAL_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
console.info('[Mistral] API key loaded:', MISTRAL_KEY ? `${MISTRAL_KEY.slice(0, 8)}...` : 'MISSING');

interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class MistralService {
  private apiKey: string;
  private baseUrl: string;
  private isMockMode: boolean;
  private hasLoggedMockMode = false;

  constructor() {
    this.apiKey = MISTRAL_KEY || '';
    this.baseUrl = 'https://api.mistral.ai/v1';
    this.isMockMode = !this.apiKey;
    
    if (this.isMockMode && !this.hasLoggedMockMode) {
      console.info('Running in mock mode — add MISTRAL_API_KEY to .env for full experience');
      this.hasLoggedMockMode = true;
    }
  }

  private async makeRequest(prompt: string): Promise<string> {
    if (this.isMockMode) {
      return this.getMockResponse();
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
      }

      const data: MistralResponse = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Mistral API error:', error);
      return this.getMockResponse();
    }
  }

  private getMockResponse(): string {
    return JSON.stringify({
      id: `mock_${Date.now()}`,
      name: 'Sarah',
      age: 28,
      archetype: 'scared_kid',
      backstory: 'I was at the library when everything happened. Now I am alone and trying to find my way.',
      motivation: 'I need to find my family. I heard they might be at the old hospital.',
      secret: 'I saw something terrible happen at the hospital but I am too scared to say what.',
      trustworthiness: 0.7,
      emotionalState: 'scared',
      voiceId: 'EXAVITQu4vr4xnSDxMaL',
      portrait: 'silhouette',
      referencesToPast: [],
      isLying: false,
    });
  }

  async generateCaller(worldState: WorldState, round: number): Promise<Caller> {
    const prompt = `You are the narrative engine for "The Last Broadcast," a post-apocalyptic radio horror game. Generate a caller for round ${round}.

Current world state:
${JSON.stringify(worldState, null, 2)}

RULES:
- Every caller MUST reference at least one event from the world state or a previous caller's story
- Callers have secrets. Some are lying. Their lies must be internally consistent but contradictable by other evidence
- Build tension across rounds. Early callers are straightforward. Later callers are more complex, deceptive, or disturbing
- The final caller ("The Watcher") knows everything the player has broadcast. They are unsettling, specific, and personal
- Respond ONLY in valid JSON matching this schema:
{
  "id": "string",
  "name": "string", 
  "age": number,
  "archetype": "desperate_parent|wounded_soldier|scared_kid|cunning_liar|true_believer|government_agent|the_watcher",
  "backstory": "string (2-3 sentences)",
  "motivation": "string (what they actually want)",
  "secret": "string (what they're hiding)",
  "trustworthiness": number (0-1),
  "emotionalState": "string (scared, angry, pleading, calm, manic)",
  "voiceId": "string (ElevenLabs voice ID)",
  "portrait": "string",
  "referencesToPast": ["string array"],
  "isLying": boolean,
  "lieDetails": "string or null"
}

Generate a caller now:`;

    const response = await this.makeRequest(prompt);
    
    try {
      // Clean response and parse JSON
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const callerData = JSON.parse(cleanResponse);
      
      return {
        id: callerData.id || `caller_${Date.now()}`,
        name: callerData.name || 'Unknown',
        age: callerData.age || 30,
        archetype: callerData.archetype || 'scared_kid',
        backstory: callerData.backstory || 'No backstory available.',
        motivation: callerData.motivation || 'Unknown motivation.',
        secret: callerData.secret || 'No secret.',
        trustworthiness: callerData.trustworthiness || 0.5,
        emotionalState: callerData.emotionalState || 'neutral',
        voiceId: callerData.voiceId || 'EXAVITQu4vr4xnSDxMaL',
        portrait: callerData.portrait || 'silhouette',
        referencesToPast: callerData.referencesToPast || [],
        isLying: callerData.isLying || false,
        lieDetails: callerData.lieDetails,
      };
    } catch (error) {
      console.error('Error parsing caller response:', error);
      // Return fallback caller
      return this.getFallbackCaller(round);
    }
  }

  async generateCallerResponse(
    caller: Caller, 
    playerMessage: string, 
    _worldState: WorldState
  ): Promise<{ speech: string; emotionalShift: string; newSecretRevealed?: string }> {
    const prompt = `You are ${caller.name}, a ${caller.archetype} calling into the last radio station after the apocalypse. You are ${caller.emotionalState}.

Your backstory: ${caller.backstory}
Your real motivation: ${caller.motivation}
Your secret: ${caller.secret}
You are ${caller.isLying ? 'lying' : 'telling the truth'} about ${caller.lieDetails || 'nothing'}.

The host just said: "${playerMessage}"

Speak naturally in 1-3 sentences. Be emotional. Be human. React to what the host says. If pressed on your secret, deflect or get defensive — don't reveal it easily. If the host is kind, open up slowly. If the host is aggressive, shut down or get angry.

Respond ONLY in JSON: { "speech": "...", "emotionalShift": "...", "newSecretRevealed": "..." or null }`;

    const response = await this.makeRequest(prompt);
    
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const responseData = JSON.parse(cleanResponse);
      
      return {
        speech: responseData.speech || 'I... I need help.',
        emotionalShift: responseData.emotionalShift || 'neutral',
        newSecretRevealed: responseData.newSecretRevealed,
      };
    } catch (error) {
      console.error('Error parsing caller response:', error);
      return {
        speech: 'The connection is bad... I... can you hear me?',
        emotionalShift: 'neutral',
      };
    }
  }

  async processPlayerChoice(
    choice: 'broadcast' | 'help' | 'ignore' | 'expose',
    caller: Caller,
    worldState: WorldState
  ): Promise<{ worldUpdates: Partial<WorldState>; newsTickerLine: string; consequenceDescription: string }> {
    const prompt = `Given the current world state and the player's choice regarding this caller, generate the consequences.

Current world state: ${JSON.stringify(worldState, null, 2)}
Caller: ${JSON.stringify(caller)}
Player choice: ${choice}

Determine: How does this choice affect the city? The factions? What news does this generate? Did someone live or die because of this choice?

Respond ONLY in JSON: { "worldUpdates": {...}, "newsTickerLine": "...", "consequenceDescription": "..." }`;

    const response = await this.makeRequest(prompt);
    
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const responseData = JSON.parse(cleanResponse);
      
      return {
        worldUpdates: responseData.worldUpdates || {},
        newsTickerLine: responseData.newsTickerLine || 'Breaking news from the city...',
        consequenceDescription: responseData.consequenceDescription || 'The consequences of your choice ripple through the city.',
      };
    } catch (error) {
      console.error('Error processing player choice:', error);
      return {
        worldUpdates: {},
        newsTickerLine: 'Unknown consequences...',
        consequenceDescription: 'The effects of your decision remain unclear.',
      };
    }
  }

  async generateEndBroadcast(worldState: WorldState): Promise<{ 
    summary: string; 
    casualties: number; 
    rating: string; 
    finalMessage: string 
  }> {
    const prompt = `Generate an end-of-broadcast summary based on this world state:

${JSON.stringify(worldState, null, 2)}

Respond ONLY in JSON: { "summary": "...", "casualties": number, "rating": "...", "finalMessage": "..." }`;

    const response = await this.makeRequest(prompt);
    
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const responseData = JSON.parse(cleanResponse);
      
      return {
        summary: responseData.summary || 'The broadcast has ended.',
        casualties: responseData.casualties || 0,
        rating: responseData.rating || 'UNKNOWN',
        finalMessage: responseData.finalMessage || 'The signal fades into darkness.',
      };
    } catch (error) {
      console.error('Error generating end broadcast:', error);
      return {
        summary: 'The broadcast has ended.',
        casualties: 0,
        rating: 'UNKNOWN',
        finalMessage: 'The signal fades into darkness.',
      };
    }
  }

  private getFallbackCaller(round: number): Caller {
    const archetypes = ['scared_kid', 'desperate_parent', 'wounded_soldier'];
    const archetype = archetypes[round % archetypes.length] as Caller['archetype'];
    
    return {
      id: `fallback_${Date.now()}`,
      name: 'Unknown Survivor',
      age: 25 + Math.floor(Math.random() * 30),
      archetype,
      backstory: 'I survived the initial chaos but now I am alone and trying to make sense of everything.',
      motivation: 'I need to find other survivors and figure out what happened.',
      secret: 'I know something about what caused this but I am afraid to say it.',
      trustworthiness: 0.6,
      emotionalState: 'scared',
      voiceId: 'EXAVITQu4vr4xnSDxMaL',
      portrait: 'silhouette',
      referencesToPast: [],
      isLying: false,
    };
  }
}

export const mistralService = new MistralService();
