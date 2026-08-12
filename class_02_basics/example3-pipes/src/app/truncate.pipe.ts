import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
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
