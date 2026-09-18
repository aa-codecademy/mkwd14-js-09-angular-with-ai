import { inject, Injectable, type OnDestroy } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import type { Subscription } from 'rxjs';

// MatPaginatorIntl is Material's own "all the paginator's strings" service. Providing our own
// subclass is the supported way to localise it - the paginator has no inputs for these labels.
@Injectable()
export class TranslatedPaginatorIntl extends MatPaginatorIntl implements OnDestroy {
  private translate = inject(TranslateService);
  private langSub: Subscription;

  constructor() {
    super();
    this.updateLabels();
    // onLangChange fires every time LanguageService calls translate.use(). Without this the
    // paginator would keep the labels it got on first render.
    this.langSub = this.translate.onLangChange.subscribe(() => this.updateLabels());
  }

  ngOnDestroy(): void {
    this.langSub.unsubscribe();
  }

  private updateLabels() {
    this.itemsPerPageLabel = this.translate.instant('paginator.itemsPerPage');
    this.nextPageLabel = this.translate.instant('paginator.nextPage');
    this.previousPageLabel = this.translate.instant('paginator.previousPage');
    this.firstPageLabel = this.translate.instant('paginator.firstPage');
    this.lastPageLabel = this.translate.instant('paginator.lastPage');
    // changes is a Subject the paginator subscribes to - emitting on it is what makes an
    // already-rendered paginator pick up the new labels.
    this.changes.next();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.translate.instant('paginator.rangeZero', { length });
    }

    const start = page * pageSize;
    const end = Math.min(start + pageSize, length);

    return this.translate.instant('paginator.range', { start: start + 1, end, length });
  };
}
