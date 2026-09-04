import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
  type FormArray,
  type FormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { delay, map, of, type Observable } from 'rxjs';
import { AdminProductService } from '../../../shared/services/admin/admin.product.service';
import type { CreateProduct } from '../../../core/models/product.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-product-form',
  imports: [
    // ReactiveFormsModule is what unlocks [formGroup], formControlName, formArrayName in the template.
    // Forget it and Angular throws "Can't bind to 'formGroup'" - it is NOT imported globally.
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    RouterLink,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent {
  // inject() is the modern alternative to constructor injection - shorter, and it works
  // in field initializers (which is exactly why `form` below can already use `this.fb`).
  private fb = inject(FormBuilder);
  adminProductService = inject(AdminProductService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  // A getter, not a field: the FormArray instance can be replaced (reset/patch), so we always
  // read it fresh from the form. Templates can call this safely on every change detection pass.
  get imagesArray(): FormArray<FormControl<string>> {
    // form.get() returns AbstractControl | null, so we narrow it to FormArray ourselves.
    return this.form.get('images') as FormArray;
  }

  form = this.fb.group({
    // Shape of the FormBuilder shorthand array: [initialValue, syncValidators, asyncValidators].
    // GOTCHA: pass several sync validators as ONE array. Writing
    // ['', Validators.required, Validators.minLength(3)] silently registers minLength as an
    // *async* validator (3rd slot) and it never runs.
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [0, Validators.min(0)],
    // Validators.compose() is just "run these together" - the plain array form does the same thing.
    discountPercent: [0, Validators.compose([Validators.min(0), Validators.max(100)])],
    stock: [0, Validators.min(0)],
    // Here the 3rd slot is used on purpose: validateSku returns an Observable, so it is an
    // async validator. .bind(this) keeps `this` pointing at the component when Angular calls it.
    sku: ['', Validators.required, [this.validateSku.bind(this)]],
    // fb.array() builds a FormArray - use it when the NUMBER of controls is dynamic
    // (a list the user can grow/shrink). Use a nested fb.group() when the shape is fixed.
    images: this.fb.array(['https://picsum.photos/seed/product/600/400']),
  });

  removeImage(index: number) {
    // removeAt() mutates the FormArray, and the template's @for re-renders automatically.
    this.imagesArray.removeAt(index);
  }

  addImage() {
    // push() takes a control, not a value - fb.control('') creates a brand new FormControl.
    this.imagesArray.push(this.fb.control('') as FormControl<string>);
  }

  // An async validator: same signature as a sync one, but returns an Observable/Promise of the
  // error object (or null when valid). While it is pending, control.status === 'PENDING'.
  validateSku(control: AbstractControl): Observable<{ skuTaken: boolean } | null> {
    const reservedSkus = ['AUDIO-001', 'COMP-001', 'WEAR-001'];

    // of() + delay() fakes a server round-trip. In a real app this would be an HttpClient call -
    // and you'd add debounceTime so you don't hit the API on every keystroke.
    return of(reservedSkus.includes(control.value?.toUpperCase())).pipe(
      // Returning null means "valid"; returning an object means "invalid with this error key",
      // which is the key you then look up in the template (errors?.['skuTaken']).
      map((value: boolean) => (value ? { skuTaken: true } : null)),
      delay(500),
    );
  }

  submitForm() {
    // form.value only includes ENABLED controls and its type is partial, hence all the ?? fallbacks.
    // Use form.getRawValue() when you also need disabled controls.
    const body: CreateProduct = {
      name: this.form.value.name ?? '',
      slug: (this.form.value.name ?? '').toLowerCase().replace(' ', '-'),
      description: this.form.value.description ?? '',
      price: this.form.value.price ?? 0,
      discountPercent: this.form.value.discountPercent ?? 0,
      // The API wants a single main image plus the full list, so we reuse the first array entry.
      image: this.form.value.images?.[0] ?? '',
      images: (this.form.value.images || []).filter((image) => typeof image === 'string'),
      stock: this.form.value.stock ?? 0,
      sku: this.form.value.sku ?? '',
      categoryId: '1',
    };

    // HttpClient observables are cold: nothing is sent until subscribe() runs.
    this.adminProductService.create(body).subscribe({
      next: (createdProduct) => {
        this.notificationService.showSuccess(
          `Product ${createdProduct.name} has been successfully created!`,
        );
        // Navigate away only on success - never before the request resolves.
        this.router.navigate(['/admin']);
      },
      // Always handle error, otherwise a failed request becomes an unhandled exception.
      error: () => this.notificationService.showError('Error while creating the product'),
    });
  }
}
