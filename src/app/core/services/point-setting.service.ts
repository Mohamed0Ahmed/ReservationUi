import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../env/enviroment';

@Injectable({
  providedIn: 'root',
})
export class PointSettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  createPointSetting(amount: number, points: number): Observable<any> {
    const storeId = this.authService.getStoreId();
    return this.http.post(`${this.apiUrl}`, { storeId, amount, points });
  }

  updatePointSetting(
    id: number,
    amount: number,
    points: number
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}`, { id, amount, points });
  }

  getPointSettings(): Observable<any> {
    const storeId = this.authService.getStoreId();
    return this.http.get(`${this.apiUrl}/store/setting/${storeId}`);
  }
}
