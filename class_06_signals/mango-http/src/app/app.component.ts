import { Component } from '@angular/core';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import type { Product } from './core/models/product.model';
import { FooterComponent } from './shared/components/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from "./shared/components/loading-overlay/loading-overlay.component";

// AppComponent is standalone (no NgModule needed) - it must list every directive/component/pipe
// it uses directly in its own `imports` array, unlike the old NgModule-based approach.
@Component({
  selector: 'app-root',
  // templateUrl/styleUrl point to separate .html/.css files instead of inlining them in the decorator -
  // preferred once a template grows beyond a few lines, so the class file stays readable.
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  // RouterOutlet must be imported here so <router-outlet> works in the template - forgetting this
  // is the most common reason a router directive silently does nothing.
  imports: [NavbarComponent, FooterComponent, RouterOutlet, LoadingOverlayComponent],
})
export class AppComponent {
  // Typed against the Product interface - TypeScript will flag any object here missing a required field.

}
