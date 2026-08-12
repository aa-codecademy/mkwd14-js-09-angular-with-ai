import { Component } from '@angular/core';

@Component({
  selector: 'app-highlight-component',
  template: `
    <div class="box">
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
