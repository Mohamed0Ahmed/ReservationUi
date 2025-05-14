import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../env/enviroment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private hubConnection: HubConnection | null = null;
  private notificationSubject = new BehaviorSubject<string | null>(null);
  private statusUpdateSubject = new BehaviorSubject<{
    roomId: string;
    message: string;
  } | null>(null);
  public notification$ = this.notificationSubject.asObservable();
  public statusUpdate$ = this.statusUpdateSubject.asObservable();

  constructor(private authService: AuthService) {}

  private setupConnectionListeners(): void {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveNotification', (message: string) => {
        this.notificationSubject.next(message);
      });

      this.hubConnection.on(
        'ReceiveStatusUpdate',
        (data: { roomId: string; message: string }) => {
          this.statusUpdateSubject.next(data);
        }
      );

      this.hubConnection.onclose((err) => {
        this.startConnectionBasedOnRole();
      });

      this.hubConnection.onreconnecting((err) => {});

      this.hubConnection.onreconnected((connectionId) => {
        const role = this.authService.getRole();
        if (role === 'Owner') {
          const storeId = this.authService.getStoreId();
          this.hubConnection!.invoke('JoinStoreGroup', storeId);
        } else if (role === 'Room') {
          const roomId = this.authService.getRoomId();
          this.hubConnection!.invoke('JoinRoomGroup', roomId);
        }
      });
    }
  }

  private startConnectionBasedOnRole(): void {
    const role = this.authService.getRole();
    if (role === 'Owner') {
      this.startOwnerConnection().subscribe({
        error: (err) => console.error('Owner connection failed:', err),
      });
    } else if (role === 'Room') {
      this.startRoomConnection().subscribe({
        error: (err) => console.error('Room connection failed:', err),
      });
    } else {
    }
  }

  startOwnerConnection(): Observable<void> {
    return new Observable<void>((observer) => {
      const storeId = this.authService.getStoreId();
      const role = this.authService.getRole();

      if (role !== 'Owner') {
        observer.error('User is not an Owner');
        return;
      }

      if (!storeId) {
        observer.error('Store ID not found');
        return;
      }

      this.hubConnection = new HubConnectionBuilder()
        .withUrl(environment.signalRHubUrl)
        .configureLogging('none')
        .withAutomaticReconnect()
        .build();

      this.hubConnection
        .start()
        .then(() => {
          this.hubConnection!.invoke('JoinStoreGroup', storeId)
            .then(() => {
              this.setupConnectionListeners();
              observer.next();
              observer.complete();
            })
            .catch((err) => observer.error(err));
        })
        .catch((err) => observer.error(err));
    });
  }

  startRoomConnection(): Observable<void> {
    return new Observable<void>((observer) => {
      const storeId = this.authService.getStoreId();
      const roomId = this.authService.getRoomId();
      if (!storeId || !roomId) {
        observer.error('Store ID or Room ID not found');
        return;
      }

      this.hubConnection = new HubConnectionBuilder()
        .withUrl(environment.signalRHubUrl)
        .configureLogging('none')
        .withAutomaticReconnect()
        .build();

      this.hubConnection
        .start()
        .then(() => {
          this.hubConnection!.invoke('JoinRoomGroup', roomId)
            .then(() => {
              this.setupConnectionListeners();
              observer.next();
              observer.complete();
            })
            .catch((err) => observer.error(err));
        })
        .catch((err) => observer.error(err));
    });
  }

  stopConnection() {
    const storeId = this.authService.getStoreId();
    const roomId = this.authService.getRoomId();
    if (this.hubConnection) {
      const promises = [];
      if (storeId) {
        promises.push(this.hubConnection.invoke('LeaveStoreGroup', storeId));
      }
      if (roomId) {
        promises.push(this.hubConnection.invoke('LeaveRoomGroup', roomId));
      }
      Promise.all(promises).then(() => {
        this.hubConnection!.stop();
        this.hubConnection = null;
      });
    }
  }

  getConnectionState(): string {
    return this.hubConnection?.state || 'Disconnected';
  }
}
