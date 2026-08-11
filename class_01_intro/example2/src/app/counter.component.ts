import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <!-- Signal inputs are functions — call them with () to read the current value in the template -->
      <h3>{{ label() }}</h3>
      <p>
        Count: <strong>{{ count() }}</strong>
      </p>
      <!--
        This component has NO internal state for the count — it's fully "controlled"
        by the parent. Clicking just emits the next value; the parent decides
        whether/how to update count. This keeps Counter reusable and predictable.
      -->
      <button (click)="countChanged.emit(count() - 1)">-</button>
      <button (click)="countChanged.emit(count() + 1)">+</button>
    </div>
  `,
})
export class Counter {
  // Signal-based `input()` — the modern replacement for the `@Input()` decorator.
  // Optional inputs get a default value passed as the argument.
  label = input('Counter');
  count = input(0);
  // Signal-based `output()` — replacement for `@Output() + EventEmitter`.
  // The generic <number> types what value listeners will receive as $event.
  countChanged = output<number>();
}
