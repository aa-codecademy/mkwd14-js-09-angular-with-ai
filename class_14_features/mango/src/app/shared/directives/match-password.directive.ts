import { Directive, Input } from '@angular/core';
import {
  NG_VALIDATORS,
  type AbstractControl,
  type ValidationErrors,
  type Validator,
} from '@angular/forms';

// How you write a CUSTOM VALIDATOR for a template-driven form: a directive that
// registers itself into Angular's validator collection.
@Directive({
  selector: '[appMatchPassword]',
  standalone: true,
  providers: [
    // NG_VALIDATORS is a multi-provider - a list Angular collects every validator
    // into. `multi: true` APPENDS to that list; drop it and you wipe out the
    // built-in validators (required, email, ...) on this control.
    // useExisting (not useClass) reuses this same directive instance, so it can
    // read its own @Input values.
    { provide: NG_VALIDATORS, useExisting: MatchPasswordDirective, multi: true },
  ],
})
export class MatchPasswordDirective implements Validator {
  // The value to compare against, passed in from the template as
  // [matchTarget]="model.password".
  @Input() matchTarget = '';

  // The validator contract: return null when VALID, or an errors object when
  // invalid. That object's key ('passwordMissMatch') is what the template looks
  // up via control.errors?.['passwordMissMatch'].
  validate(control: AbstractControl): ValidationErrors | null {
    return control.value === this.matchTarget
      ? null
      : {
          passwordMissMatch: true,
        };
  }
}
