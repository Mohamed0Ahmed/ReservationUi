import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PointSettingsModalComponent } from '../point-settings-modal/point-settings-modal.component';

@Component({
  selector: 'app-owner-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    PointSettingsModalComponent,
  ],
  templateUrl: './owner-navbar.component.html',
})
export class OwnerNavbarComponent {
  role: string | null = null;
  showPointSettingsModal: boolean = false;
  isMenuOpen: boolean = false;

  constructor(private authService: AuthService) {
    this.role = this.authService.getRole();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
  }

  openPointSettingsModal() {
    this.showPointSettingsModal = true;
  }

  closePointSettingsModal() {
    this.showPointSettingsModal = false;
  }
}
