import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <h3>{{ label() }}</h3>
      <p>
        Count: <strong>{{ count() }}</strong>
      </p>
      <button (click)="countChanged.emit(count() - 1)">-</button>
      <button (click)="countChanged.emit(count() + 1)">+</button>
    </div>
  `,
})
export class Counter {
  label = input('Counter');
  count = input(0);
  countChanged = output<number>();
}
