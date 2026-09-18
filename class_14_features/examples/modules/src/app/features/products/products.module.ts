import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

// Feature module: owns its components and its routes, exports nothing.
// Loaded lazily from AppRoutingModule.
@NgModule({
  declarations: [ProductListComponent, ProductDetailComponent],
  imports: [SharedModule, ProductsRoutingModule],
})
export class ProductsModule {}
