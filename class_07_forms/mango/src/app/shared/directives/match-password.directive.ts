import { Directive, Input } from '@angular/core';
import {
  NG_VALIDATORS,
  type AbstractControl,
  type ValidationErrors,
  type Validator,
} from '@angular/forms';

@Directive({
  selector: '[appMatchPassword]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchPasswordDirective, multi: true }],
})
export class MatchPasswordDirective implements Validator {
  @Input() matchTarget = '';

  validate(control: AbstractControl): ValidationErrors | null {
    return control.value === this.matchTarget
      ? null
      : {
          passwordMissMatch: true,
        };
  }
}
