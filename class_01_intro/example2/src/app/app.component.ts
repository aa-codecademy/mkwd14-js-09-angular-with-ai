import { Component } from '@angular/core';
import { Counter } from './counter.component';
import { Header } from './header.component';

@Component({
  selector: 'app-root',
  template: `
    <!-- Self-closing tag syntax <app-header /> — equivalent to <app-header></app-header> -->
    <app-header />
    <h2>Signal based Input and Output</h2>
    <!--
      [count]="scoreA"  → property binding: passes data DOWN into the child (this is the "input").
      (countChanged)="scoreA = $event" → event binding: listens for data coming UP from the
      child (this is the "output"). $event holds whatever value the child emitted.
      This is the parent-child communication pattern: data down, events up.
    -->
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
