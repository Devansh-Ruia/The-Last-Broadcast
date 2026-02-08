import { Howl } from 'howler';
import type { Caller } from '../types';

interface AudioConfig {
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private currentHowl: Howl | null = null;

  // Sound effects
  private sounds: Map<string, Howl> = new Map();

  constructor() {
    this.initializeAudioContext();
    this.loadSoundEffects();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.setupAudioNodes();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private setupAudioNodes() {
    if (!this.audioContext) return;

    // Create analyser for VU meters
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.7;

    // Create bandpass filter for radio effect
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = 'bandpass';
    this.filterNode.frequency.value = 1000; // Center frequency
    this.filterNode.Q.value = 2; // Resonance/bandwidth

    // Connect nodes: source -> filter -> gain -> analyser -> destination
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  private loadSoundEffects() {
    const soundEffects = {
      static: '/audio/static.mp3',
      dial_tone: '/audio/dial_tone.mp3',
      phone_ring: '/audio/phone_ring.mp3',
      connect: '/audio/connect.mp3',
      disconnect: '/audio/disconnect.mp3',
      button_click: '/audio/button_click.mp3',
      broadcast_start: '/audio/broadcast_start.mp3',
      broadcast_end: '/audio/broadcast_end.mp3',
    };

    Object.entries(soundEffects).forEach(([name, path]) => {
      const sound = new Howl({
        src: [path],
        volume: 0.5,
        preload: true,
        onload: () => console.log(`Loaded sound: ${name}`),
        onloaderror: (_id, error) => console.warn(`Failed to load sound ${name}:`, error),
      });
      this.sounds.set(name, sound);
    });
  }

  // Play sound effects
  playSound(soundName: string, config: Partial<AudioConfig> = {}) {
    const sound = this.sounds.get(soundName);
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    const { volume = 0.5, fadeIn = 0 } = config;
    
    sound.volume(volume);
    sound.play();

    if (fadeIn > 0) {
      sound.fade(0, volume, fadeIn * 1000);
    }
  }

  // Text-to-Speech using ElevenLabs API
  async speakText(text: string, voiceId: string, config: Partial<AudioConfig> = {}): Promise<void> {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.warn('ElevenLabs API key not found, using fallback');
      this.fallbackTTS(text);
      return;
    }

    try {
      // Stop any current playback
      this.stopCurrentSpeech();

      // Generate audio from ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create Howl instance for the generated audio
      const { volume = 0.7, fadeIn = 0.5 } = config;
      
      this.currentHowl = new Howl({
        src: [audioUrl],
        volume: 0,
        html5: true,
        onload: () => {
          if (fadeIn > 0) {
            this.currentHowl?.fade(0, volume, fadeIn * 1000);
          } else {
            this.currentHowl?.volume(volume);
          }
        },
        onend: () => {
          URL.revokeObjectURL(audioUrl);
          this.currentHowl = null;
        },
        onloaderror: (_id, error) => {
          console.error('Error loading TTS audio:', error);
          URL.revokeObjectURL(audioUrl);
          this.currentHowl = null;
        },
      });

      this.currentHowl.play();

      // Connect to Web Audio API for effects
      // Note: Full Web Audio integration would require accessing Howl's audio source
      // For now, we use the analyser for VU meter visualization

    } catch (error) {
      console.error('TTS error:', error);
      this.fallbackTTS(text);
    }
  }

  // Fallback TTS using browser's speech synthesis
  private fallbackTTS(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
    }
  }

  // Stop current speech
  stopCurrentSpeech() {
    if (this.currentHowl) {
      this.currentHowl.stop();
      this.currentHowl.unload();
      this.currentHowl = null;
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  // Get audio data for VU meter visualization
  getAudioData(): Uint8Array | null {
    if (!this.analyser) return null;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // Get average volume level for VU meter
  getVolumeLevel(): number {
    const audioData = this.getAudioData();
    if (!audioData) return 0;

    const sum = audioData.reduce((acc, value) => acc + value, 0);
    return sum / audioData.length / 255; // Normalize to 0-1
  }

  // Apply radio filter effects
  setRadioFilter(enabled: boolean) {
    if (!this.filterNode) return;

    if (enabled) {
      this.filterNode.frequency.value = 1000;
      this.filterNode.Q.value = 2;
    } else {
      this.filterNode.frequency.value = 20000; // Pass through
      this.filterNode.Q.value = 0.1;
    }
  }

  // Set master volume
  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Play caller connection sequence
  async playCallerConnection(_caller: Caller) {
    // Phone ringing
    this.playSound('phone_ring');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Connection sound
    this.playSound('connect');
    
    // Static effect
    this.playSound('static', { volume: 0.3, fadeIn: 0.5 });
  }

  // Play caller disconnection
  playCallerDisconnection() {
    this.stopCurrentSpeech();
    this.playSound('disconnect');
    this.playSound('static', { volume: 0.2, fadeOut: 1.0 });
  }

  // Play broadcast start
  playBroadcastStart() {
    this.playSound('broadcast_start', { volume: 0.8 });
  }

  // Play broadcast end
  playBroadcastEnd() {
    this.playSound('broadcast_end', { volume: 0.8 });
  }

  // Play UI interaction sounds
  playButtonClick() {
    this.playSound('button_click', { volume: 0.3 });
  }

  // Cleanup
  destroy() {
    this.stopCurrentSpeech();
    
    // Unload all sounds
    this.sounds.forEach(sound => {
      sound.unload();
    });
    this.sounds.clear();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

export const audioManager = new AudioManager();
