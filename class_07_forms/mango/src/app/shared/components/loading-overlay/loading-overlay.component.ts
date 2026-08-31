import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.service';

// Reads the shared LoadingService signal to decide whether to show a full-page spinner. Because
// isLoading is a signal, this component doesn't need any input/output wiring or manual
// change-detection calls - it just re-renders automatically whenever the interceptor toggles it.
@Component({
  selector: 'app-loading-overlay',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css',
})
export class LoadingOverlayComponent {
  // Public so the template can call loadingService.isLoading() directly.
  loadingService = inject(LoadingService)
}
