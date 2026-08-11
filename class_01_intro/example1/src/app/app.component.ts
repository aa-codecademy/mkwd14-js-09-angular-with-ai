import { Component, signal } from '@angular/core';
import { Child } from './child/child.component';
import { ControlFlow } from "./control-flow/control-flow.component";

// This is a standalone Component — Angular's modern default. There's no
// NgModule involved; the component declares its own dependencies via `imports`.
@Component({
  selector: 'app-root', // How you'd use this component as an HTML tag, e.g. <app-root></app-root>
  // Inline template using backticks. `{{ }}` is interpolation — it renders a
  // plain string, so you can't put JS statements inside, only expressions.
  template: `
    <app-control-flow></app-control-flow>
    <h1>{{ title }}</h1>
    <p>Welcome to Angular {{ version }} course</p>
    <button (click)="greet()">Greet</button>
    <!-- @if is the new Angular control-flow syntax (replaces *ngIf). No import needed. -->
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
  // Standalone components must explicitly import any child components/pipes/directives
  // they use in their template — this is Angular's replacement for NgModule declarations.
  imports: [Child, ControlFlow],
})
export class App {
  title = 'Hello World!';
  version = 22;
  // Plain class property, not a signal — reassigning it and re-rendering works
  // because Angular's change detection picks up the mutation after the click event.
  showGreeting = false;

  greet() {
    // console.log('Hello Ivo');
    this.showGreeting = !this.showGreeting;
  }
}
