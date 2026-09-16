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

@Directive({
  selector: '[appPermission]',
})
export class PermissionDirective implements OnInit {
  allowedRole = input.required<UserRole>();

  authStore = inject(AuthStore);
  templateRef = inject(TemplateRef);
  viewContainerRef = inject(ViewContainerRef);

  ngOnInit() {
    effect(() => {
      const isAllowed = this.allowedRole() === this.authStore.currentUser()?.role;

      this.viewContainerRef.clear();

      if (isAllowed) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }
}
