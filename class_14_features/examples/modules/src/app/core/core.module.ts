import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ProductService } from './services/product.service';
import { OrderService } from './services/order.service';

// CoreModule: app-wide singletons (services) and single-use layout components.
// It is imported ONLY by AppModule — never by a feature module.
@NgModule({
	declarations: [HeaderComponent],
	imports: [CommonModule, RouterModule],
	exports: [HeaderComponent],
	providers: [ProductService, OrderService],
})
export class CoreModule {
	// Classic guard: throws if someone imports CoreModule a second time,
	// which would create duplicate service instances.
	constructor(@Optional() @SkipSelf() parent?: CoreModule) {
		if (parent) {
			throw new Error(
				'CoreModule is already loaded. Import it in AppModule only.',
			);
		}
	}
}
