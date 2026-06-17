import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';

import { SessionService } from '../../services/session.service';

interface HeatCell {
  day: number | null;
  key: string | null;
  minutes: number;
  level: number;
  label: string;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

@Component({
  selector: 'app-meditation-heatmap',
  standalone: true,
  template: `
    <div class="heatmap">
      <p class="month">{{ monthLabel }}</p>

      <div class="grid">
        @for (weekday of weekdays; track $index) {
          <span class="weekday">{{ weekday }}</span>
        }

        @for (cell of cells; track $index) {
          @if (cell.day === null) {
            <span class="cell empty"></span>
          } @else {
            <button
              type="button"
              [class]="'cell level-' + cell.level + (cell.key === selectedDayKey ? ' selected' : '')"
              [title]="cell.label"
              [attr.aria-label]="cell.label"
              [attr.aria-pressed]="cell.key === selectedDayKey"
              (click)="selectDay(cell)"
            >
              {{ cell.day }}
            </button>
          }
        }
      </div>

      <div class="legend">
        <span>Moins</span>
        <span class="cell level-0"></span>
        <span class="cell level-1"></span>
        <span class="cell level-2"></span>
        <span class="cell level-3"></span>
        <span class="cell level-4"></span>
        <span>Plus</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .month {
        font-weight: 600;
        margin: 0 0 12px;
        text-transform: capitalize;
      }

      .grid {
        display: grid;
        gap: 6px;
        grid-template-columns: repeat(7, 1fr);
      }

      .weekday {
        color: var(--ion-color-medium);
        font-size: 12px;
        text-align: center;
      }

      .cell {
        align-items: center;
        aspect-ratio: 1 / 1;
        border-radius: 6px;
        border: 0;
        cursor: pointer;
        display: flex;
        font-size: 11px;
        justify-content: center;
        padding: 0;
        transition: box-shadow 120ms ease, transform 120ms ease;
      }

      .empty {
        background: transparent;
        cursor: default;
      }

      .level-0 {
        background: var(--ion-color-step-150, #dbcfbb);
        color: var(--ion-color-medium);
      }

      .level-1 {
        background: color-mix(in srgb, var(--serene-primary) 35%, transparent);
        color: var(--serene-text);
      }

      .level-2 {
        background: color-mix(in srgb, var(--serene-primary) 60%, transparent);
        color: var(--serene-text);
      }

      .level-3 {
        background: var(--serene-primary);
        color: var(--ion-color-primary-contrast);
      }

      .level-4 {
        background: var(--serene-primary-dark);
        color: var(--ion-color-primary-contrast);
      }

      button.cell:hover {
        transform: translateY(-1px);
      }

      .selected {
        box-shadow: 0 0 0 2px var(--serene-primary-dark);
      }

      .legend {
        align-items: center;
        color: var(--ion-color-medium);
        display: flex;
        font-size: 12px;
        gap: 6px;
        justify-content: flex-end;
        margin-top: 12px;
      }

      .legend .cell {
        block-size: 16px;
        inline-size: 16px;
      }
    `,
  ],
})
export class MeditationHeatmapComponent implements OnDestroy {
  @Input() selectedDayKey = '';
  @Output() daySelected = new EventEmitter<string>();

  cells: HeatCell[] = [];
  monthLabel = '';
  readonly weekdays = WEEKDAYS;
  private readonly sessionService = inject(SessionService);
  private readonly sub: Subscription;

  constructor() {
    this.sub = this.sessionService.sessions$.subscribe(() => this.buildGrid());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  selectDay(cell: HeatCell): void {
    if (!cell.key) {
      return;
    }

    this.daySelected.emit(cell.key);
  }

  private buildGrid(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    this.monthLabel = `${MONTHS[month]} ${year}`;

    const minutesByDay = this.sessionService.getDailyMinutes();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

    const cells: HeatCell[] = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ day: null, key: null, minutes: 0, level: 0, label: '' });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = this.sessionService.dayKey(new Date(year, month, day));
      const minutes = Math.round(minutesByDay.get(key) ?? 0);

      cells.push({
        day,
        key,
        minutes,
        level: this.levelFor(minutes),
        label:
          minutes > 0
            ? `${day} ${MONTHS[month]} : ${minutes} min`
            : `${day} ${MONTHS[month]} : aucune séance`,
      });
    }

    this.cells = cells;
  }

  private levelFor(minutes: number): number {
    if (minutes <= 0) {
      return 0;
    }

    if (minutes < 10) {
      return 1;
    }

    if (minutes < 20) {
      return 2;
    }

    if (minutes < 40) {
      return 3;
    }

    return 4;
  }
}
