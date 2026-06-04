import { Component, Input } from '@angular/core';

import { TimerStatus } from '../../services/timer.service';

@Component({
  selector: 'app-timer-circle',
  standalone: true,
  template: `
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Temps restant"
      [class.preparing]="preparing"
    >
      <circle cx="100" cy="100" r="90" class="track" />
      <circle
        cx="100"
        cy="100"
        r="90"
        class="progress"
        [style.stroke-dasharray]="circumference"
        [style.stroke-dashoffset]="progressOffset"
      />
      <text x="100" y="94" class="value" text-anchor="middle">
        {{ pad(status.minutes) }}:{{ pad(status.seconds) }}
      </text>
      <text x="100" y="120" class="hint" text-anchor="middle">
        {{ hint }}
      </text>
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
        margin: 0 auto;
        max-width: 280px;
      }

      svg {
        display: block;
        inline-size: 100%;
      }

      circle {
        fill: none;
        stroke-width: 8;
      }

      .track {
        stroke: var(--ion-color-step-200, #e1e1e1);
      }

      .progress {
        stroke: var(--ion-text-color);
        stroke-linecap: round;
        transform: rotate(-90deg);
        transform-origin: 100px 100px;
        transition: stroke-dashoffset 200ms ease;
      }

      .preparing .progress {
        stroke: var(--serene-preparation);
      }

      text {
        fill: var(--ion-text-color);
      }

      .value {
        font-size: 30px;
        font-weight: 700;
      }

      .preparing .value {
        fill: var(--serene-preparation);
      }

      .hint {
        fill: var(--ion-color-medium);
        font-size: 11px;
      }
    `,
  ],
})
export class TimerCircleComponent {
  @Input({ required: true }) status!: TimerStatus;
  @Input() hint = 'Prêt à méditer';
  @Input() preparing = false;

  readonly circumference = 565.48;

  get progressOffset(): number {
    return this.circumference * (1 - (this.status.progress || 0));
  }

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
