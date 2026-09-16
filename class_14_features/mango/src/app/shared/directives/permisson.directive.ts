import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
  type OnInit,
} from '@angular/core';
import { UserRole } from '../../core/models/user.model';
import { AuthStore } from '../../store/auth/auth.store';

// A STRUCTURAL directive: it doesn't style an element, it decides whether the element exists
// in the DOM at all. The `*` syntax (`*appPermission="'ADMIN'"`) is sugar Angular desugars into
// <ng-template appPermission [appPermission]="'ADMIN'">...</ng-template>.
@Directive({
  selector: '[appPermission]',
})
export class PermissionDirective implements OnInit {
  // The input name must match the selector for the `*appPermission="..."` shorthand to bind.
  // Rename this to `appPermission` (or add `{ alias: 'appPermission' }`) if you want the star syntax.
  allowedRole = input.required<UserRole>();

  authStore = inject(AuthStore);
  // TemplateRef = the chunk of markup we were wrapped around, as a blueprint - not yet rendered.
  templateRef = inject(TemplateRef);
  // ViewContainerRef = the spot in the DOM where we're allowed to stamp that blueprint out.
  viewContainerRef = inject(ViewContainerRef);

  ngOnInit() {
    // GOTCHA: effect() must run in an injection context - i.e. in a field initialiser or the
    // constructor. Called from ngOnInit like this it throws NG0203 unless you pass
    // `{ injector: inject(Injector) }`. Move this block into the constructor and it just works.
    effect(() => {
      // Reading currentUser() inside the effect is what SUBSCRIBES us to it. Log out and this
      // whole function re-runs on its own - no manual subscription, no ngOnDestroy cleanup.
      const isAllowed = this.allowedRole() === this.authStore.currentUser()?.role;

      // Always clear first: the effect re-runs on every change, and without this you'd stamp
      // a second copy of the template next to the first one.
      this.viewContainerRef.clear();

      if (isAllowed) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }
}
