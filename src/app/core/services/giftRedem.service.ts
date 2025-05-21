import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import {
  ApiResponse,
  GiftDto,
  GiftRedemptionDto,
} from '../../interface/interfaces';
import { environment } from '../../env/enviroment';
import { CreateGiftRedemptionDto, UpdateGiftRedemptionStatusDto } from '../../interface/DTOs';



@Injectable({
  providedIn: 'root',
})
export class GiftRedemptionService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.apiUrl = environment.apiUrl + '/redemption';
  }

  private getStoreId(): string | null {
    return this.authService.getStoreId();
  }

  // Customer: Request a gift redemption
  requestGiftRedemption(
    dto: CreateGiftRedemptionDto
  ): Observable<ApiResponse<GiftRedemptionDto>> {
    return this.http.post<ApiResponse<GiftRedemptionDto>>(
      `${this.apiUrl}/request`,
      dto
    );
  }

  // Owner: Update redemption status (approve/reject)
  updateRedemptionStatus(
    redemptionId: number,
    dto: UpdateGiftRedemptionStatusDto
  ): Observable<ApiResponse<GiftRedemptionDto>> {
    return this.http.put<ApiResponse<GiftRedemptionDto>>(
      `${this.apiUrl}/${redemptionId}/status`,
      dto
    );
  }

  // Owner: Get pending redemptions for a store
  getPendingRedemptions(): Observable<ApiResponse<GiftRedemptionDto[]>> {
    const storeId = this.getStoreId();
    if (!storeId) {
      return throwError(() => new Error('Store ID not found'));
    }
    return this.http.get<ApiResponse<GiftRedemptionDto[]>>(
      `${this.apiUrl}/store/${storeId}/pending`
    );
  }

  // Owner: Get all redemptions for a store
  getAllRedemptions(): Observable<ApiResponse<GiftRedemptionDto[]>> {
    const storeId = this.getStoreId();
    if (!storeId) {
      return throwError(() => new Error('Store ID not found'));
    }
    return this.http.get<ApiResponse<GiftRedemptionDto[]>>(
      `${this.apiUrl}/store/${storeId}/all`
    );
  }

  // Customer: Get redemption history for a customer
  getCustomerRedemptions(
    customerId: number
  ): Observable<ApiResponse<GiftRedemptionDto[]>> {
    return this.http.get<ApiResponse<GiftRedemptionDto[]>>(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

  // Get details of a specific redemption
  getRedemptionDetails(
    redemptionId: number
  ): Observable<ApiResponse<GiftRedemptionDto>> {
    return this.http.get<ApiResponse<GiftRedemptionDto>>(
      `${this.apiUrl}/${redemptionId}`
    );
  }

  // Get available gifts for a store
  getAvailableGifts(storeId: number): Observable<ApiResponse<GiftDto[]>> {
    return this.http.get<ApiResponse<GiftDto[]>>(
      `${this.apiUrl}/store/${storeId}/available-gifts`
    );
  }
}
