import { Component } from '@angular/core';
import { Counter } from './counter.component';
import { Header } from './header.component';

@Component({
  selector: 'app-root',
  template: `
    <app-header />
    <h2>Signal based Input and Output</h2>
    <app-counter label="Counter A" [count]="scoreA" (countChanged)="scoreA = $event" />
    <app-counter label="Counter B" [count]="scoreB" (countChanged)="scoreB = $event" />
    <p>Total: {{ scoreA + scoreB }}</p>
  `,
  imports: [Counter, Header],
})
export class App {
  scoreA = 0;
  scoreB = 0;
}
