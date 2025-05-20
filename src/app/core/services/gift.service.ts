import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../env/enviroment';
import { ApiResponse, GiftDto } from '../../interface/interfaces';

@Injectable({
  providedIn: 'root',
})
export class GiftService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.apiUrl = environment.apiUrl + '/gifts';
  }

  private getStoreId(): string | null {
    return this.authService.getStoreId();
  }

  getAllGifts(): Observable<ApiResponse<GiftDto[]>> {
    const storeId = this.getStoreId();
    if (!storeId) {
      return throwError(() => new Error('Store ID not found'));
    }
    return this.http.get<ApiResponse<GiftDto[]>>(
      `${this.apiUrl}/store/${storeId}`
    );
  }

  getAllDeletedGifts(): Observable<ApiResponse<GiftDto[]>> {
    const storeId = this.getStoreId();
    return this.http.get<ApiResponse<GiftDto[]>>(
      `${this.apiUrl}/store/deleted/${storeId}`
    );
  }

  createGift(
    name: string,
    pointsRequired: number
  ): Observable<ApiResponse<GiftDto>> {
    const storeId = this.getStoreId();

    return this.http.post<ApiResponse<GiftDto>>(this.apiUrl, {
      Name: name,
      PointsRequired: pointsRequired,
      StoreId: parseInt(storeId!),
    });
  }

  updateGift(
    id: number,
    name: string,
    pointsRequired: number
  ): Observable<ApiResponse<GiftDto>> {
    return this.http.put<ApiResponse<GiftDto>>(this.apiUrl, {
      Id: id,
      Name: name,
      PointsRequired: pointsRequired,
      StoreId: parseInt(this.getStoreId()!),
    });
  }

  deleteGift(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  restoreGift(id: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/restore/${id}`,
      null
    );
  }

  getTotalGiftsCount(): Observable<ApiResponse<number>> {
    const storeId = this.getStoreId();

    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/count/${storeId}`
    );
  }
}
