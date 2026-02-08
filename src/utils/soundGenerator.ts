class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.isInitialized = false;
    }
  }

  private createAudioBuffer(samples: Float32Array, sampleRate: number): AudioBuffer {
    if (!this.audioContext) {
      // Return silent buffer if audio context not available
      const silentContext = new AudioContext();
      const buffer = silentContext.createBuffer(1, samples.length, sampleRate);
      silentContext.close();
      return buffer;
    }
    
    const buffer = this.audioContext.createBuffer(1, samples.length, sampleRate);
    const channelData = new Float32Array(samples.length);
    channelData.set(samples);
    buffer.copyToChannel(channelData, 0);
    return buffer;
  }

  // Generate white noise with bandpass filter
  generateStatic(): AudioBuffer {
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const duration = 2; // 2 seconds of static
    const samples = sampleRate * duration;
    const audioData = new Float32Array(samples);

    // Generate white noise
    for (let i = 0; i < samples; i++) {
      audioData[i] = (Math.random() * 2 - 1) * 0.3; // Lower amplitude for static
    }

    return this.createAudioBuffer(audioData, sampleRate);
  }

  // Generate phone ring sound (440Hz and 480Hz alternating)
  generatePhoneRing(): AudioBuffer {
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const duration = 4; // 4 seconds total (2 rings)
    const samples = sampleRate * duration;
    const audioData = new Float32Array(samples);

    const ringDuration = 1; // 1 second ring
    const ringSamples = sampleRate * ringDuration;
    
    for (let i = 0; i < samples; i++) {
      const cyclePosition = i % (ringSamples * 2); // 2 cycles of ring + silence
      
      if (cyclePosition < ringSamples) {
        // Ring phase - alternating 440Hz and 480Hz
        const frequency = cyclePosition % 1000 < 500 ? 440 : 480;
        audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      } else {
        // Silence phase
        audioData[i] = 0;
      }
    }

    return this.createAudioBuffer(audioData, sampleRate);
  }

  // Generate dial tone (350Hz + 440Hz)
  generateDialTone(): AudioBuffer {
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const duration = 3; // 3 seconds continuous
    const samples = sampleRate * duration;
    const audioData = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      // Mix 350Hz and 440Hz sine waves
      audioData[i] = (
        Math.sin(2 * Math.PI * 350 * i / sampleRate) * 0.2 +
        Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.2
      );
    }

    return this.createAudioBuffer(audioData, sampleRate);
  }

  // Generate connection sound (static burst + click)
  generateConnect(): AudioBuffer {
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const staticDuration = 0.1; // 100ms static
    const clickDuration = 0.01; // 10ms click
    const clickFrequency = 800; // 800Hz click
    const totalDuration = staticDuration + clickDuration;
    const samples = sampleRate * totalDuration;
    const audioData = new Float32Array(samples);

    // Static burst
    const staticSamples = sampleRate * staticDuration;
    for (let i = 0; i < staticSamples; i++) {
      audioData[i] = (Math.random() * 2 - 1) * 0.2;
    }

    // Click pulse
    for (let i = staticSamples; i < samples; i++) {
      const clickPosition = i - staticSamples;
      audioData[i] = Math.sin(2 * Math.PI * clickFrequency * clickPosition / sampleRate) * 0.4;
    }

    return this.createAudioBuffer(audioData, sampleRate);
  }

  // Generate disconnect sound (descending tone + static)
  generateDisconnect(): AudioBuffer {
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const toneDuration = 0.3; // 300ms descending tone
    const staticDuration = 0.2; // 200ms static
    const totalDuration = toneDuration + staticDuration;
    const samples = sampleRate * totalDuration;
    const audioData = new Float32Array(samples);

    // Descending tone (600Hz to 200Hz)
    const toneSamples = sampleRate * toneDuration;
    for (let i = 0; i < toneSamples; i++) {
      const progress = i / toneSamples;
      const frequency = 600 - (400 * progress); // 600Hz to 200Hz
      audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
    }

    // Static burst
    for (let i = toneSamples; i < samples; i++) {
      audioData[i] = (Math.random() * 2 - 1) * 0.15;
    }

    return this.createAudioBuffer(audioData, sampleRate);
  }

  // Generate broadcast start jingle (ascending tones)
  generateBroadcastStart(): AudioBuffer {
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const toneDuration = 0.15; // 150ms per tone
    const totalDuration = toneDuration * 3; // 3 tones
    const samples = sampleRate * totalDuration;
    const audioData = new Float32Array(samples);

    const frequencies = [400, 500, 600]; // Ascending tones
    
    for (let toneIndex = 0; toneIndex < 3; toneIndex++) {
      const frequency = frequencies[toneIndex];
      const toneSamples = sampleRate * toneDuration;
      const startIndex = toneIndex * toneSamples;
      
      for (let i = 0; i < toneSamples; i++) {
        const position = i / toneSamples;
        const envelope = Math.sin(position * Math.PI); // Smooth envelope
        audioData[startIndex + i] = Math.sin(2 * Math.PI * frequency * (startIndex + i) / sampleRate) * envelope * 0.3;
      }
    }

    return this.createAudioBuffer(audioData, sampleRate);
  }

  // Generate broadcast end jingle (descending tones)
  generateBroadcastEnd(): AudioBuffer {
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const toneDuration = 0.15; // 150ms per tone
    const totalDuration = toneDuration * 3; // 3 tones
    const samples = sampleRate * totalDuration;
    const audioData = new Float32Array(samples);

    const frequencies = [600, 500, 400]; // Descending tones
    
    for (let toneIndex = 0; toneIndex < 3; toneIndex++) {
      const frequency = frequencies[toneIndex];
      const toneSamples = sampleRate * toneDuration;
      const startIndex = toneIndex * toneSamples;
      
      for (let i = 0; i < toneSamples; i++) {
        const position = i / toneSamples;
        const envelope = Math.sin(position * Math.PI); // Smooth envelope
        audioData[startIndex + i] = Math.sin(2 * Math.PI * frequency * (startIndex + i) / sampleRate) * envelope * 0.3;
      }
    }

    return this.createAudioBuffer(audioData, sampleRate);
  }

  // Generate button click sound
  generateButtonClick(): AudioBuffer {
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const duration = 0.015; // 15ms click
    const samples = sampleRate * duration;
    const audioData = new Float32Array(samples);
    const frequency = 1000; // 1000Hz click

    for (let i = 0; i < samples; i++) {
      audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.4;
      // Square wave approximation
      audioData[i] = audioData[i] > 0 ? 1 : -1;
    }

    return this.createAudioBuffer(audioData, sampleRate);
  }

  // Get audio context for external use
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  // Check if audio is available
  isAudioAvailable(): boolean {
    return this.isInitialized;
  }
}

export const soundGenerator = new SoundGenerator();
