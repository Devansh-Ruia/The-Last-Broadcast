import { soundGenerator } from '../utils/soundGenerator';

interface AudioConfig {
  volume: number;
  staticVolume: number;
  voiceVolume: number;
  effectsVolume: number;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private staticSource: AudioBufferSourceNode | null = null;
  private staticGainNode: GainNode | null = null;
  private staticFilterNode: BiquadFilterNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private masterGainNode: GainNode | null = null;
  
  private config: AudioConfig = {
    volume: 0.7,
    staticVolume: 0.3,
    voiceVolume: 0.8,
    effectsVolume: 0.6,
  };

  private soundBuffers: Map<string, AudioBuffer> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeAudio();
    this.loadSounds();
  }

  private async initializeAudio() {
    try {
      this.audioContext = soundGenerator.getAudioContext();
      if (!this.audioContext) {
        console.warn('Audio context not available');
        return;
      }

      // Create audio nodes
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.config.volume;

      // Connect nodes
      this.masterGainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  private loadSounds() {
    if (!this.isInitialized) return;

    try {
      // Generate all sound buffers
      this.soundBuffers.set('static', soundGenerator.generateStatic());
      this.soundBuffers.set('phone_ring', soundGenerator.generatePhoneRing());
      this.soundBuffers.set('dial_tone', soundGenerator.generateDialTone());
      this.soundBuffers.set('connect', soundGenerator.generateConnect());
      this.soundBuffers.set('disconnect', soundGenerator.generateDisconnect());
      this.soundBuffers.set('broadcast_start', soundGenerator.generateBroadcastStart());
      this.soundBuffers.set('broadcast_end', soundGenerator.generateBroadcastEnd());
      this.soundBuffers.set('button_click', soundGenerator.generateButtonClick());
    } catch (error) {
      console.error('Failed to load sounds:', error);
    }
  }

  // Play a one-shot sound
  playSound(soundName: string, volume: number = 1.0): void {
    if (!this.isInitialized || !this.audioContext) return;

    const buffer = this.soundBuffers.get(soundName);
    if (!buffer) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = volume * this.config.effectsVolume;
      
      source.connect(gainNode);
      gainNode.connect(this.masterGainNode!);
      
      source.start(0);
    } catch (error) {
      console.error(`Failed to play sound ${soundName}:`, error);
    }
  }

  // Play static with radio filter
  playStatic(): void {
    if (!this.isInitialized || !this.audioContext) return;

    // Stop existing static
    this.stopStatic();

    try {
      const staticBuffer = this.soundBuffers.get('static');
      if (!staticBuffer) return;

      this.staticSource = this.audioContext.createBufferSource();
      this.staticGainNode = this.audioContext.createGain();
      this.staticFilterNode = this.audioContext.createBiquadFilter();

      // Configure bandpass filter for radio static (300-3400Hz)
      this.staticFilterNode.type = 'bandpass';
      this.staticFilterNode.frequency.value = 1850; // Center frequency
      this.staticFilterNode.Q.value = 1; // Bandwidth

      this.staticSource.buffer = staticBuffer;
      this.staticSource.loop = true;
      
      this.staticGainNode.gain.value = this.config.staticVolume;

      // Connect nodes
      this.staticSource.connect(this.staticFilterNode!);
      this.staticFilterNode.connect(this.staticGainNode!);
      this.staticGainNode.connect(this.masterGainNode!);

      this.staticSource.start(0);
    } catch (error) {
      console.error('Failed to play static:', error);
    }
  }

  // Stop static
  stopStatic(): void {
    if (this.staticSource) {
      try {
        this.staticSource.stop();
        this.staticSource.disconnect();
      } catch (error) {
        // Source might already be stopped
      }
      this.staticSource = null;
    }

    if (this.staticGainNode) {
      this.staticGainNode.disconnect();
      this.staticGainNode = null;
    }

    if (this.staticFilterNode) {
      this.staticFilterNode.disconnect();
      this.staticFilterNode = null;
    }
  }

  // Get volume level for VU meters
  getVolumeLevel(): number {
    if (!this.analyserNode) return 0;
    
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    
    // Calculate average volume level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    
    return sum / dataArray.length / 255; // Normalize to 0-1
  }

  // Play TTS audio from ElevenLabs
  playTTS(audioBuffer: ArrayBuffer): void {
    if (!this.isInitialized || !this.audioContext) return;

    try {
      this.audioContext.decodeAudioData(audioBuffer.slice(0))
        .then(buffer => {
          const source = this.audioContext!.createBufferSource();
          const gainNode = this.audioContext!.createGain();
          
          source.buffer = buffer;
          gainNode.gain.value = this.config.voiceVolume;
          
          source.connect(gainNode);
          gainNode.connect(this.masterGainNode!);
          
          source.start(0);
        })
        .catch(error => {
          console.error('Failed to decode TTS audio:', error);
        });
    } catch (error) {
      console.error('Failed to play TTS:', error);
    }
  }

  // Speak text using TTS (placeholder for ElevenLabs integration)
  async speakText(text: string, _voiceId: string): Promise<void> {
    // This would integrate with ElevenLabs API
    // For now, we'll use browser speech synthesis as fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = this.config.voiceVolume;
      
      speechSynthesis.speak(utterance);
    }
  }

  // Get analyser node for VU meters
  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  // Get frequency data for visualization
  getFrequencyData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(128);
    }

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // Get time domain data for waveform
  getWaveformData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(128);
    }

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  // Volume controls
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.config.volume;
    }
  }

  setStaticVolume(volume: number): void {
    this.config.staticVolume = Math.max(0, Math.min(1, volume));
    if (this.staticGainNode) {
      this.staticGainNode.gain.value = this.config.staticVolume;
    }
  }

  setVoiceVolume(volume: number): void {
    this.config.voiceVolume = Math.max(0, Math.min(1, volume));
  }

  setEffectsVolume(volume: number): void {
    this.config.effectsVolume = Math.max(0, Math.min(1, volume));
  }

  // Get current config
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  // Game-specific sound methods
  playPhoneRing(): void {
    this.playSound('phone_ring', 0.5);
  }

  playDialTone(): void {
    this.playSound('dial_tone', 0.3);
  }

  playCallerConnection(_caller: any): void {
    this.playSound('connect', 0.4);
    setTimeout(() => this.playStatic(), 100);
  }

  playCallerDisconnect(): void {
    this.stopStatic();
    this.playSound('disconnect', 0.5);
  }

  playBroadcastStart(): void {
    this.playSound('broadcast_start', 0.6);
  }

  playBroadcastEnd(): void {
    this.playSound('broadcast_end', 0.6);
  }

  playButtonClick(): void {
    this.playSound('button_click', 0.3);
  }

  // Apply radio effects to audio
  applyRadioEffect(intensity: number = 0.5): void {
    if (!this.staticFilterNode) return;

    // Adjust filter parameters based on intensity
    this.staticFilterNode.frequency.value = 1850 + (intensity * 500);
    this.staticFilterNode.Q.value = 1 + (intensity * 2);
  }

  // Cleanup
  cleanup(): void {
    this.stopStatic();
    
    if (this.analyserNode) {
      this.analyserNode.disconnect();
    }
    
    if (this.masterGainNode) {
      this.masterGainNode.disconnect();
    }

    this.isInitialized = false;
  }

  // Resume audio context if suspended (for browser autoplay policies)
  resumeAudioContext(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Check if audio is available
  isAudioAvailable(): boolean {
    return this.isInitialized && this.audioContext !== null;
  }
}

export const audioManager = new AudioManager();
