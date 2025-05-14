import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PointSettingsModalComponent } from '../point-settings-modal/point-settings-modal.component';

@Component({
  selector: 'app-owner-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PointSettingsModalComponent],
  templateUrl: './owner-navbar.component.html',
  styleUrl: './owner-navbar.component.css',
})
export class OwnerNavbarComponent {
  role: string | null = null;
  showPointSettingsModal: boolean = false;

  constructor(private authService: AuthService) {
    this.role = this.authService.getRole();
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
