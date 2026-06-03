import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-timer',
  templateUrl: 'timer.page.html',
  styleUrls: ['timer.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
})
export class TimerPage {
  constructor() {}
}