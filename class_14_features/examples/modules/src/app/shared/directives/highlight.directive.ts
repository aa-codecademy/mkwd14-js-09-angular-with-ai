import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({ selector: '[appHighlight]', standalone: false })
export class HighlightDirective {
  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mouseenter') onEnter() {
    this.el.nativeElement.style.background = '#eefbf3';
  }

  @HostListener('mouseleave') onLeave() {
    this.el.nativeElement.style.background = '';
  }
}
