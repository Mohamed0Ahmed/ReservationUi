import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  role: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.role = this.authService.getRole();
  }

  logout() {
    this.authService.logout();
  }
}
