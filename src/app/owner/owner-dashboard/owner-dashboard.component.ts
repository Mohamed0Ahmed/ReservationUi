import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OwnerNavbarComponent } from '../owner-navbar/owner-navbar.component';
import { NotificationService } from '../../core/services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [RouterOutlet, OwnerNavbarComponent],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.css',
})
export class OwnerDashboardComponent implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;
  private audio = new Audio('assets/mixkit-happy-bells-notification-937.wav');

  constructor(
    private notificationService: NotificationService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.notificationService.startOwnerConnection().subscribe({
      next: () => {
        this.subscription = this.notificationService.notification$.subscribe(
          (message) => {
            if (message) {
              this.toastr.info(message, 'إشعار جديد', {
                disableTimeOut: true,
                tapToDismiss: true,
              });
              this.audio.play();
            }
          }
        );
      },
      error: () => this.toastr.error('تحقق من الانترنت الخاص بك'),
    });
  }

  ngOnDestroy() {
    this.notificationService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}
