import { Injectable } from '@angular/core';

export type AmbianceKey = 'none' | 'rain' | 'forest' | 'river' | 'wind' | 'storm';

export interface AmbianceOption {
  label: string;
  value: AmbianceKey;
}

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  readonly ambiances: AmbianceOption[] = [
    { label: 'Silence', value: 'none' },
    { label: 'Pluie douce', value: 'rain' },
    { label: 'Forêt calme', value: 'forest' },
    { label: 'Rivière', value: 'river' },
    { label: 'Vent doux', value: 'wind' },
    { label: 'Orage léger', value: 'storm' },
  ];

  private readonly startAudio = this.createAudio('assets/sounds/start.mp3');
  private readonly endAudio = this.createAudio('assets/sounds/end.mp3');
  private ambianceAudio?: HTMLAudioElement;

  playStart(): void {
    this.playOnce(this.startAudio);
  }

  playEnd(): void {
    this.stopAmbiance();
    this.playOnce(this.endAudio);
  }

  playAmbiance(ambiance: AmbianceKey): void {
    this.stopAmbiance();

    const src = this.getAmbianceSrc(ambiance);
    if (!src) {
      return;
    }

    const audio = this.createAudio(src);
    audio.loop = true;
    audio.volume = 0.45;
    this.ambianceAudio = audio;
    this.play(audio);
  }

  pauseAmbiance(): void {
    this.ambianceAudio?.pause();
  }

  resumeAmbiance(): void {
    if (!this.ambianceAudio) {
      return;
    }

    this.play(this.ambianceAudio);
  }

  stopAmbiance(): void {
    if (!this.ambianceAudio) {
      return;
    }

    this.ambianceAudio.pause();
    this.ambianceAudio.currentTime = 0;
    this.ambianceAudio = undefined;
  }

  stopAll(): void {
    this.stopAmbiance();
    this.startAudio.pause();
    this.startAudio.currentTime = 0;
    this.endAudio.pause();
    this.endAudio.currentTime = 0;
  }

  private createAudio(src: string): HTMLAudioElement {
    const audio = new Audio(src);
    audio.preload = 'auto';
    return audio;
  }

  private getAmbianceSrc(ambiance: AmbianceKey): string | undefined {
    if (ambiance === 'rain') {
      return 'assets/sounds/rain.mp3';
    }

    if (ambiance === 'forest') {
      return 'assets/sounds/forest.mp3';
    }

    if (ambiance === 'river') {
      return 'assets/sounds/river.mp3';
    }

    if (ambiance === 'wind') {
      return 'assets/sounds/wind.wav';
    }

    if (ambiance === 'storm') {
      return 'assets/sounds/storm.wav';
    }

    return undefined;
  }

  private playOnce(audio: HTMLAudioElement): void {
    audio.currentTime = 0;
    this.play(audio);
  }

  private play(audio: HTMLAudioElement): void {
    void audio.play().catch(() => {
      // Sur mobile, le navigateur peut bloquer le son si l'action utilisateur n'est pas directe.
    });
  }
}
