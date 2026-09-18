import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  template: `
    <header>
      <strong>Beanstalk</strong>
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/products" routerLinkActive="active">Products</a>
        <a routerLink="/orders" routerLinkActive="active">Orders</a>
      </nav>
    </header>
  `,
  styles: [`
    header { display: flex; gap: 24px; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 16px; }
    nav { display: flex; gap: 12px; }
    a { text-decoration: none; }
    a.active { font-weight: bold; text-decoration: underline; }
  `],
})
export class HeaderComponent {}
