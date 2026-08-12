import { Component } from '@angular/core';
import { HighlightDirective } from './highlight.directive';

@Component({
  selector: 'app-root',
  imports: [HighlightDirective],
  template: `
    <h2>Highlight Directive</h2>
    <p appHighlight="yellow">Hover over me (default: yellow)</p>
    <p appHighlight="green">Hover over me for green bg</p>
    <p appHighlight="red">Hover over me for red bg</p>
    <p appHighlight="blue">Hover over me for blue bg</p>
    <button [disabled]="">click me</button>
  `,
  styles: [`p {padding: 10px, cursor: pointer; border-radius: 4px transition: background 0.2s}`],
})
export class App {}
