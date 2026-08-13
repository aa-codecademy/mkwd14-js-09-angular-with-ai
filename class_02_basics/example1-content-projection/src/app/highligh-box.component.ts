import { Component } from '@angular/core';

@Component({
  selector: 'app-highlight-component',
  template: `
    <div class="box">
      <!-- ng-content is Angular's version of a "slot" - it renders whatever the parent -->
      <!-- placed between <app-highlight-component> ... </app-highlight-component> tags. -->
      <ng-content />
    </div>
  `,
  styles: [
    `
      .box {
        border: 2px dashed orange;
        padding: 12px;
        margin: 8px 0;
      }
    `,
  ],
})
export class HighlightBox {}
