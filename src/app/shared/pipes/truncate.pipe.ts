import { Pipe, PipeTransform } from '@angular/core';
/*
 * Truncates the value to the specified length.
 * Returns original string if its length is <= length.
 * Usage:
 *   value | truncate:length
 * Example:
 *   {{ 'some string that is super long' | truncate:4 }}
 *   formats to: some
 */
@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string, length = 25, errorMessage = 'Value not found'): string {
    if (!Boolean(value) || !Boolean(value.length)) {
      return errorMessage;
    }

    if (value.length <= length) {
      return value;
    }

    return value.substr(0, length);
  }
}
