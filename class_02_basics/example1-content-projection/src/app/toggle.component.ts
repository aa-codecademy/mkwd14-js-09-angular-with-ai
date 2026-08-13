import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-toggle',
  imports: [CommonModule],
  template: `
    <button (click)="showFirst = !showFirst">Toggle</button>

    <!-- ng-template blocks below are NOT rendered by default - they're just definitions -->
    <!-- *ngTemplateOutlet picks which one to actually stamp into the DOM, based on the condition -->
    <ng-container *ngTemplateOutlet="showFirst ? first : second" />

    <!-- #first is a template reference variable - it lets us "point" at this block from elsewhere -->
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
  // Plain boolean property - toggling it re-evaluates the *ngTemplateOutlet expression above
  showFirst = true;
}
