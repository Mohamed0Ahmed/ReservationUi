import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { SidenavComponent } from "../sidenav/sidenav.component";

@Component({
  selector: 'app-room-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './room-layout.component.html',
  styleUrl: './room-layout.component.css',
})
export class RoomLayoutComponent implements OnInit, OnDestroy {
  private statusSubscription: Subscription | null = null;
  private currentRoomId: string | null = null;
  private audio = new Audio('assets/mixkit-happy-bells-notification-937.wav');

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn() && this.authService.getRoomId()) {
      this.currentRoomId = this.authService.getRoomId();
      this.startConnection();
    }
  }

  private startConnection() {
    this.notificationService.startRoomConnection().subscribe({
      next: () => {
        this.subscribeToStatusUpdates();
      },
      error: (err) => {
        console.error(
          'Failed to start room connection:',
          err,
          'Connection State:',
          this.notificationService.getConnectionState()
        );
        this.toastr.error('فشل الاتصال بخدمة الإشعارات', 'خطأ');
        setTimeout(() => this.startConnection(), 5000);
      },
    });
  }

  private subscribeToStatusUpdates() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
    this.statusSubscription = this.notificationService.statusUpdate$.subscribe(
      (data) => {
        if (data && String(data.roomId) === String(this.currentRoomId)) {
          if (data.message.includes('تم الموافقة')) {
            this.toastr.success(data.message, 'نجاح');
            this.audio
              .play()
              .catch((err) => console.error('Audio play failed:', err));
          } else {
            this.toastr.error(data.message, 'خطأ');
            this.audio
              .play()
              .catch((err) => console.error('Audio play failed:', err));
          }
        }
      }
    );
  }

  ngOnDestroy() {
    this.notificationService.stopConnection();
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}
