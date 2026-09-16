import { Component, computed, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  imports: [MatPaginatorModule],
  selector: 'app-pagination',
  styleUrl: './pagination.component.css',
  // An inline `template` (backticks) instead of a separate .html file. Fine for a component
  // this small - fewer files to jump between. Use templateUrl once it grows past ~20 lines.
  template: `
    <mat-paginator
      class="pagination"
      [length]="total()"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      [pageSizeOptions]="sizeOptions()"
      [hidePageSize]="sizeOptions().length === 0"
      showFirstLastButtons
      (page)="onPageChange($event)"
    />
  `,
})
export class PaginationComponent {
  // input.required<T>() = the parent MUST pass it, and TypeScript enforces that at build time.
  // Inputs are signals now, so you read them with (): `this.total()`.
  page = input.required<number>();
  pageSize = input.required<number>();
  total = input.required<number>();
  // Optional input with a default - no `.required`, so the parent can leave it out.
  pageSizeOptions = input<readonly number[]>([]);

  // output() replaces the old @Output/EventEmitter. The parent listens with (pageChange)="...".
  pageSizeChange = output<number>();
  pageChange = output<number>();

  // Off-by-one translation lives here: our app and the API are 1-based, Material is 0-based.
  // Converting at the boundary means nothing else in the app has to remember the difference.
  protected readonly pageIndex = computed(() => this.page() - 1);
  /** Material wants a mutable array. */
  // Spreading also copies, so Material can't mutate the parent's array behind our back.
  protected readonly sizeOptions = computed(() => [...this.pageSizeOptions()]);

  protected onPageChange(event: PageEvent): void {
    // Material fires the SAME (page) event for both "next page" and "change page size".
    // Detect the size change first and return early - otherwise a size change would also emit
    // a bogus page number and you'd fire two conflicting updates at the store.
    if (event.pageSize !== this.pageSize()) {
      this.pageSizeChange.emit(event.pageSize);
      return;
    }
    this.pageChange.emit(event.pageIndex + 1);
  }
}
