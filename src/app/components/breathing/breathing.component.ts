import { Component, OnDestroy } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { play, stop } from 'ionicons/icons';
import { interval, Subscription } from 'rxjs';

interface BreathPhase {
  label: string;
  seconds: number;
  scale: number;
}

interface BreathingTechnique {
  key: 'box' | '478';
  label: string;
  phases: BreathPhase[];
}

const LARGE = 1;
const SMALL = 0.62;

const TECHNIQUES: BreathingTechnique[] = [
  {
    key: 'box',
    label: 'Box 4-4-4-4',
    phases: [
      { label: 'Inspire', seconds: 4, scale: LARGE },
      { label: 'Retiens', seconds: 4, scale: LARGE },
      { label: 'Expire', seconds: 4, scale: SMALL },
      { label: 'Retiens', seconds: 4, scale: SMALL },
    ],
  },
  {
    key: '478',
    label: '4-7-8',
    phases: [
      { label: 'Inspire', seconds: 4, scale: LARGE },
      { label: 'Retiens', seconds: 7, scale: LARGE },
      { label: 'Expire', seconds: 8, scale: SMALL },
    ],
  },
];

@Component({
  selector: 'app-breathing',
  standalone: true,
  imports: [IonButton, IonIcon],
  template: `
    <div class="breathing">
      <div class="orb-wrap">
        <div
          class="orb"
          [class.active]="running"
          [style.transform]="'scale(' + scale + ')'"
          [style.transitionDuration]="transitionMs + 'ms'"
        ></div>
        <div class="orb-text">
          <span class="phase">{{ phaseLabel }}</span>
          @if (running) {
            <span class="count">{{ remaining }}</span>
          }
        </div>
      </div>

      @if (running) {
        <p class="cycle">{{ selected.label }} · cycle {{ cycle }}</p>
      } @else {
        <div class="techniques" role="group" aria-label="Choisir une technique">
          @for (technique of techniques; track technique.key) {
            <button
              type="button"
              class="tech"
              [class.selected]="technique.key === selected.key"
              (click)="selectTechnique(technique)"
            >
              {{ technique.label }}
            </button>
          }
        </div>
      }

      <div class="actions">
        @if (!running) {
          <ion-button (click)="start()" shape="round" size="large">
            <ion-icon slot="start" name="play" />
            Commencer
          </ion-button>
        } @else {
          <ion-button (click)="stop()" fill="outline" shape="round" size="large">
            <ion-icon slot="start" name="stop" />
            Arrêter
          </ion-button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .breathing {
        text-align: center;
      }

      .orb-wrap {
        align-items: center;
        block-size: 260px;
        display: flex;
        justify-content: center;
        margin: 8px auto 4px;
        position: relative;
      }

      .orb {
        background: radial-gradient(circle at 50% 38%, var(--serene-primary), var(--serene-primary-dark));
        block-size: 210px;
        border-radius: 50%;
        box-shadow: 0 18px 40px var(--serene-shadow);
        inline-size: 210px;
        transition-property: transform;
        transition-timing-function: ease-in-out;
        will-change: transform;
      }

      .orb-text {
        align-items: center;
        display: flex;
        flex-direction: column;
        gap: 2px;
        inset: 0;
        justify-content: center;
        pointer-events: none;
        position: absolute;
      }

      .phase {
        color: var(--ion-color-primary-contrast);
        font-size: 20px;
        font-weight: 700;
      }

      .count {
        color: var(--ion-color-primary-contrast);
        font-size: 34px;
        font-variant-numeric: tabular-nums;
        font-weight: 700;
      }

      .cycle {
        color: var(--ion-color-medium);
        margin: 6px 0 0;
      }

      .techniques {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        margin: 6px 0 0;
      }

      .tech {
        background: var(--serene-surface-soft);
        border: 1px solid var(--serene-border);
        border-radius: 999px;
        color: var(--serene-text);
        cursor: pointer;
        font-size: 0.95rem;
        padding: 8px 16px;
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }

      .tech.selected {
        border-color: var(--serene-primary);
        box-shadow: 0 0 0 2px var(--serene-primary);
      }

      .actions {
        margin-top: 18px;
      }
    `,
  ],
})
export class BreathingComponent implements OnDestroy {
  readonly techniques = TECHNIQUES;
  selected: BreathingTechnique = TECHNIQUES[0];
  running = false;
  phaseLabel = 'Prêt';
  remaining = 0;
  cycle = 0;
  scale = SMALL;
  transitionMs = 0;
  private phaseIndex = 0;
  private sub?: Subscription;

  constructor() {
    addIcons({ play, stop });
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.cycle = 1;
    this.enterPhase(0);

    this.sub = interval(1000).subscribe(() => {
      this.remaining -= 1;

      if (this.remaining <= 0) {
        let next = this.phaseIndex + 1;

        if (next >= this.selected.phases.length) {
          next = 0;
          this.cycle += 1;
        }

        this.enterPhase(next);
      }
    });
  }

  stop(): void {
    this.sub?.unsubscribe();
    this.sub = undefined;
    this.running = false;
    this.phaseLabel = 'Prêt';
    this.remaining = 0;
    this.cycle = 0;
    this.transitionMs = 400;
    this.scale = SMALL;
  }

  selectTechnique(technique: BreathingTechnique): void {
    if (this.running) {
      return;
    }

    this.selected = technique;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private enterPhase(index: number): void {
    const phase = this.selected.phases[index];
    this.phaseIndex = index;
    this.phaseLabel = phase.label;
    this.remaining = phase.seconds;
    this.transitionMs = phase.seconds * 1000;
    this.scale = phase.scale;
  }
}
