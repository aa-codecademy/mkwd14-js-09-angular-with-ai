import { Directive, HostBinding, HostListener, input } from '@angular/core';

@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {
  appHighlight = input('yellow');

  @HostBinding('style.backgroundColor') bg = '';

  @HostListener('mouseenter') onEnter() {
    this.bg = this.appHighlight();
  }

  @HostListener('mouseleave') onLeave() {
    this.bg = '';
  }

  @HostListener('click') onClick() {
    console.log('i was clicked');
  }
}
