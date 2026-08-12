import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-toggle',
  imports: [CommonModule],
  template: `
    <button (click)="showFirst = !showFirst">Toggle</button>

    <ng-container *ngTemplateOutlet="showFirst ? first : second" />

    <ng-template #first>
      <p>First template</p>
    </ng-template>

    <ng-template #second>
      <p>Second template</p>
    </ng-template>
  `,
  styles: [``],
})
export class Toggle {
  showFirst = true;
}
