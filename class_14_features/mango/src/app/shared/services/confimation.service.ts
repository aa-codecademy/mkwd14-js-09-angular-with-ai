import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  type ComponentRef,
} from '@angular/core';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

// This service builds a dialog IMPERATIVELY - no <app-confirmation-dialog> tag anywhere in a
// template. That's the point: any component can ask a question without first making room for
// the dialog in its own markup.
@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  // ApplicationRef is the running app itself. We need it to plug our hand-made component into
  // Angular's change detection - a component Angular doesn't know about never re-renders.
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  // Returning a Promise (not an Observable) lets callers write `await confirm(...)`, so the
  // "ask, then act" flow reads top to bottom instead of nesting inside a subscribe callback.
  confirm(title: string, message: string, confirmationLabel: string): Promise<boolean> {
    return new Promise((resolve) => {
      // createComponent builds the component in memory. At this point it exists but is NOT
      // on screen and is NOT being change-detected yet.
      const confirmationDialogComponentRef = createComponent(ConfirmationDialogComponent, {
        environmentInjector: this.injector,
      });

      // With no template to bind to, inputs are set through setInput(). Don't poke
      // `instance.title` directly - that skips change detection and the UI won't update.
      confirmationDialogComponentRef.setInput('title', title);
      confirmationDialogComponentRef.setInput('message', message);
      confirmationDialogComponentRef.setInput('confirmationLabel', confirmationLabel);

      // output() is subscribable like an Observable. Each branch does the same two things:
      // tear the dialog down, then settle the promise. A promise resolves only once, so even
      // a double-click can't produce two answers.
      confirmationDialogComponentRef.instance.confirm.subscribe(() => {
        this.destroy(confirmationDialogComponentRef);
        resolve(true);
      });

      confirmationDialogComponentRef.instance.cancel.subscribe(() => {
        this.destroy(confirmationDialogComponentRef);
        resolve(false);
      });

      // Two separate steps, and you need BOTH:
      // attachView   -> Angular starts change-detecting it (bindings become live)
      // appendChild  -> the element actually appears in the page
      this.appRef.attachView(confirmationDialogComponentRef.hostView);
      document.body.appendChild(confirmationDialogComponentRef.location.nativeElement);
    });
  }

  // Skip this and you leak: the DOM node stays, the view keeps being change-detected, and
  // every confirm() call stacks another invisible dialog on top of the last.
  private destroy(ref: ComponentRef<any>) {
    this.appRef.detachView(ref.hostView);
    // destroy() runs ngOnDestroy and removes the host element from the page for us.
    ref.destroy();
  }
}
