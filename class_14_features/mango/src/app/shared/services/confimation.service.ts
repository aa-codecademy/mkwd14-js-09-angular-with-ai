import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  type ComponentRef,
} from '@angular/core';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  confirm(title: string, message: string, confirmationLabel: string): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmationDialogComponentRef = createComponent(ConfirmationDialogComponent, {
        environmentInjector: this.injector,
      });

      confirmationDialogComponentRef.setInput('title', title);
      confirmationDialogComponentRef.setInput('message', message);
      confirmationDialogComponentRef.setInput('confirmationLabel', confirmationLabel);

      confirmationDialogComponentRef.instance.confirm.subscribe(() => {
        this.destroy(confirmationDialogComponentRef);
        resolve(true);
      });

      confirmationDialogComponentRef.instance.cancel.subscribe(() => {
        this.destroy(confirmationDialogComponentRef);
        resolve(false);
      });

      this.appRef.attachView(confirmationDialogComponentRef.hostView);
      document.body.appendChild(confirmationDialogComponentRef.location.nativeElement);
    });
  }

  private destroy(ref: ComponentRef<any>) {
    this.appRef.detachView(ref.hostView);
    ref.destroy();
  }
}
