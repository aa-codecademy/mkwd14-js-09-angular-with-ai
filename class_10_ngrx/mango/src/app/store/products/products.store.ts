import { signalStore } from '@ngrx/signals';
import { withProductQuery } from '../features/product.feature';

export const ProductsStore = signalStore({ providedIn: 'root' }, withProductQuery());
