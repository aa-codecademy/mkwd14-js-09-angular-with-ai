import { Pipe, type PipeTransform } from '@angular/core';

// A custom pipe - same idea as the built-in ones (currency, date, uppercase), but you write the transform() logic.
// pure: true (the default) means Angular only re-runs this when the INPUT reference changes, not on every
// change-detection cycle - keeps it cheap, but means mutating an object in place won't re-trigger it.
@Pipe({ name: 'truncate', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
  // Extra pipe arguments (after the first colon) become additional transform() parameters, in order.
  transform(value: string, limit?: number, ellipsis?: string) {
    if (!value) {
      return '';
    }

    if (!limit) {
      limit = 80;
    }
    if (!ellipsis) {
      ellipsis = '...';
    }

    if (value.length <= limit) {
      return value;
    }

    return value.slice(0, limit) + ellipsis;
  }
}
