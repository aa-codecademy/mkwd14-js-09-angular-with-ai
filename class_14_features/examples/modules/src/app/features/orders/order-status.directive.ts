import { Directive, Input, ElementRef, OnChanges } from '@angular/core';

// Declared in OrdersModule only — it is NOT shared, so it is not in SharedModule.
// A feature module can own private declarables that nothing else can use.
@Directive({ selector: '[appOrderStatus]', standalone: false })
export class OrderStatusDirective implements OnChanges {
  @Input('appOrderStatus') status = '';

  private colors: Record<string, string> = {
    pending: '#b26a00',
    shipped: '#0b6',
    delivered: '#444',
  };

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(): void {
    this.el.nativeElement.style.color = this.colors[this.status] ?? '#222';
  }
}
