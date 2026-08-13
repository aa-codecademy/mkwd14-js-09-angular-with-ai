import { Directive, HostBinding, HostListener, input } from '@angular/core';

// An attribute directive - it adds BEHAVIOR to an existing element instead of rendering its own template.
// The selector "[appHighlight]" means: attach to any element that has an "appHighlight" attribute.
@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {
  // Naming the input the same as the selector lets callers write appHighlight="green" directly on the host element,
  // instead of needing a separate [appHighlight]="'green'" property binding.
  appHighlight = input('yellow');

  // @HostBinding writes to a property/style of the HOST element (the <p>), not this directive's own template -
  // directives have no template of their own, so this is how they can still affect the DOM.
  @HostBinding('style.backgroundColor') bg = '';

  // @HostListener subscribes to a DOM event on the host element - here, mouse enter/leave/click.
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
