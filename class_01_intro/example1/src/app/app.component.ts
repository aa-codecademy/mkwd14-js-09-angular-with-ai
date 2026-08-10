import { Component, signal } from '@angular/core';
import { Child } from './child/child.component';
import { ControlFlow } from "./control-flow/control-flow.component";

@Component({
  selector: 'app-root',
  template: `
    <app-control-flow></app-control-flow>
    <h1>{{ title }}</h1>
    <p>Welcome to Angular {{ version }} course</p>
    <button (click)="greet()">Greet</button>
    @if (showGreeting) {
      <p class="greeting">Hello, Angular learner...</p>
    }
    <app-child></app-child>
  `,
  styles: [
    `
      h1 {
        color: blue;
      }
      .greeting {
        font-size: 24px;
        color: green;
      }
    `,
  ],
  imports: [Child, ControlFlow],
})
export class App {
  title = 'Hello World!';
  version = 22;
  showGreeting = false;

  greet() {
    // console.log('Hello Ivo');
    this.showGreeting = !this.showGreeting;
  }
}
