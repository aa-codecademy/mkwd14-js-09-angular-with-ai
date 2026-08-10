import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [CommonModule],
})
export class Header {
  navLinks = ['Home', 'About', 'Contact'];
  isLoggedIn = false;
}
