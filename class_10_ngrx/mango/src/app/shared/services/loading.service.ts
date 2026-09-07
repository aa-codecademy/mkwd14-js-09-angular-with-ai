import { Injectable, signal } from '@angular/core';

// Signal-based shared state: isLoading is a signal instead of a plain boolean field so that any
// component/template reading isLoading() automatically re-renders when it changes - no manual
// subscribe/unsubscribe or async pipe needed like with a BehaviorSubject.
@Injectable({ providedIn: 'root' })
export class LoadingService {
  // Plain counter (not a signal) because it's just internal bookkeeping - nothing reads it
  // directly, so it doesn't need to be reactive. Only the derived isLoading state needs to be.
  private count = 0;
  isLoading = signal(false);

  // Counting requests (rather than a single boolean) handles concurrent HTTP calls correctly:
  // the spinner should stay visible until the LAST outstanding request finishes, not the first.
  start() {
    this.count++;
    this.isLoading.set(true);
  }

  stop() {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) {
      this.isLoading.set(false);
    }
  }
}
