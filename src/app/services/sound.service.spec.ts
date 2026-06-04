import { TestBed } from '@angular/core/testing';

import { SoundService } from './sound.service';

describe('SoundService', () => {
  let service: SoundService;
  let originalAudio: typeof Audio;
  let createdAudios: AudioFake[];

  class AudioFake {
    currentTime = 0;
    ended = false;
    loop = false;
    paused = true;
    preload = '';
    volume = 1;
    play = jasmine.createSpy('play').and.callFake(() => {
      this.paused = false;
      return Promise.resolve();
    });
    pause = jasmine.createSpy('pause').and.callFake(() => {
      this.paused = true;
    });

    constructor(readonly src = '') {
      createdAudios.push(this);
    }
  }

  beforeEach(() => {
    createdAudios = [];
    originalAudio = globalThis.Audio;
    globalThis.Audio = AudioFake as unknown as typeof Audio;

    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundService);
  });

  afterEach(() => {
    service.stopAll();
    globalThis.Audio = originalAudio;
  });

  it('should play a selected ambiance in loop', () => {
    service.playAmbiance('rain');

    const ambiance = createdAudios[createdAudios.length - 1];
    expect(ambiance?.src).toContain('rain.ogg');
    expect(ambiance?.loop).toBeTrue();
    expect(ambiance?.play).toHaveBeenCalled();
  });

  it('should stop the current ambiance', () => {
    service.playAmbiance('forest');

    const ambiance = createdAudios[createdAudios.length - 1];
    service.stopAmbiance();

    expect(ambiance?.pause).toHaveBeenCalled();
    expect(ambiance?.currentTime).toBe(0);
  });

  it('should play start and end sounds', () => {
    service.playStart();
    service.playEnd();

    expect(createdAudios[0].src).toContain('start.mp3');
    expect(createdAudios[1].src).toContain('end.mp3');
    expect(createdAudios[0].play).toHaveBeenCalled();
    expect(createdAudios[1].play).toHaveBeenCalled();
  });
});
