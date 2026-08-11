import { Component } from '@angular/core';

// Same component, different template source: `templateUrl`/`styleUrl` point to
// separate files instead of inlining them — handy once markup grows past a few lines.
@Component({
  selector: 'app-child',
  templateUrl: './child.template.html',
  styleUrl: './child.component.css',
})
export class Child {} // No inputs or logic yet — this is the simplest possible component.
