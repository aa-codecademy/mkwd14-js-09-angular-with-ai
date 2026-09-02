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
  private fb = inject(FormBuilder);
  adminProductService = inject(AdminProductService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  get imagesArray(): FormArray<FormControl<string>> {
    return this.form.get('images') as FormArray;
  }

  form = this.fb.group({
    name: ['', Validators.required, Validators.minLength(3)],
    description: ['', Validators.required, Validators.minLength(10)],
    price: [0, Validators.min(0)],
    discountPercent: [0, Validators.compose([Validators.min(0), Validators.max(100)])],
    stock: [0, Validators.min(0)],
    sku: ['', Validators.required, [this.validateSku.bind(this)]],
    images: this.fb.array(['https://picsum.photos/seed/product/600/400']),
  });

  removeImage(index: number) {
    this.imagesArray.removeAt(index);
  }

  addImage() {
    this.imagesArray.push(this.fb.control('') as FormControl<string>);
  }

  validateSku(control: AbstractControl): Observable<{ skuTaken: boolean } | null> {
    const reservedSkus = ['AUDIO-001', 'COMP-001', 'WEAR-001'];

    return of(reservedSkus.includes(control.value?.toUpperCase())).pipe(
      map((value: boolean) => (value ? { skuTaken: true } : null)),
      delay(500),
    );
  }

  submitForm() {
    const body: CreateProduct = {
      name: this.form.value.name ?? '',
      slug: (this.form.value.name ?? '').toLowerCase().replace(' ', '-'),
      description: this.form.value.description ?? '',
      price: this.form.value.price ?? 0,
      discountPercent: this.form.value.discountPercent ?? 0,
      image: this.form.value.images?.[0] ?? '',
      images: (this.form.value.images || []).filter((image) => typeof image === 'string'),
      stock: this.form.value.stock ?? 0,
      sku: this.form.value.sku ?? '',
      categoryId: '1',
    };

    this.adminProductService.create(body).subscribe({
      next: (createdProduct) => {
        this.notificationService.showSuccess(
          `Product ${createdProduct.name} has been successfully created!`,
        );
        this.router.navigate(['/admin']);
      },
      error: (error) => this.notificationService.showError('Error while creating the product'),
    });
  }
}
