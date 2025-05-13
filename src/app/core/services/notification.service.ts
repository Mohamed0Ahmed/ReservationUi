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
  public notification$ = this.notificationSubject.asObservable();

  constructor(private authService: AuthService) {}

  startConnection(): Observable<void> {
    return new Observable<void>((observer) => {
      const storeId = this.authService.getStoreId();
      if (!storeId) {
        observer.error('Store ID not found');
        return;
      }

      this.hubConnection = new HubConnectionBuilder()
        .withUrl(environment.signalRHubUrl)
        .configureLogging('none')
        .build();

      this.hubConnection
        .start()
        .then(() => {
          this.hubConnection!.invoke('JoinStoreGroup', storeId)
            .then(() => {
              observer.next();
              observer.complete();
            })
            .catch((err) => {
              observer.error(err);
            });
        })
        .catch((err) => {
          observer.error(err);
        });

      this.hubConnection.on('ReceiveNotification', (message: string) => {
        this.notificationSubject.next(message);
      });

      this.hubConnection.onclose(() => {
        this.startConnection();
      });
    });
  }

  stopConnection() {
    const storeId = this.authService.getStoreId();
    if (this.hubConnection && storeId) {
      this.hubConnection.invoke('LeaveStoreGroup', storeId).then(() => {
        this.hubConnection!.stop();
        this.hubConnection = null;
      });
    }
  }
}
