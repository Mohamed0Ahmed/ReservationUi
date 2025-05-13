import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Order } from '../../interface/interfaces';
import { environment } from '../../env/enviroment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(storeId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      `${this.apiUrl}/store/${storeId}`
    );
  }

  getPendingOrders(storeId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      `${this.apiUrl}/pending/${storeId}`
    );
  }

  approveOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(
      `${this.apiUrl}/approve/${id}`,
      {}
    );
  }

  rejectOrder(
    id: number,
    rejectionReason: { reason: string }
  ): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(
      `${this.apiUrl}/reject/${id}`,
      rejectionReason
    );
  }

  getTotalOrdersCount(storeId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/count/${storeId}`
    );
  }
}
