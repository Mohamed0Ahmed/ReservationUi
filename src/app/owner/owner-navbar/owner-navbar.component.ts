import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-owner-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './owner-navbar.component.html',
  styleUrl: './owner-navbar.component.css',
})
export class OwnerNavbarComponent {
  role: string | null = null;

  constructor(private authService: AuthService) {
    this.role = this.authService.getRole();
  }

  logout() {
    this.authService.logout();
  }
}
