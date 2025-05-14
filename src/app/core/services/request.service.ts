import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiResponse, RequestDto } from '../../interface/interfaces';
import { environment } from '../../env/enviroment';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/assistance/request`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getStoreId(): number | null {
    const storeId = this.authService.getStoreId();
    return storeId ? parseInt(storeId) : null;
  }

  createAssistanceRequest(request: {
    roomId: number;
    requestTypeId: number;
  }): Observable<ApiResponse<RequestDto>> {
    return this.http.post<ApiResponse<RequestDto>>(
      `${this.apiUrl}/create`,
      request
    );
  }

  getPendingAssistanceRequests(
    storeId: number
  ): Observable<ApiResponse<RequestDto[]>> {
    return this.http.get<ApiResponse<RequestDto[]>>(
      `${this.apiUrl}/pending/${storeId}`
    );
  }

  getAllAssistanceRequests(
    storeId: number
  ): Observable<ApiResponse<RequestDto[]>> {
    return this.http.get<ApiResponse<RequestDto[]>>(
      `${this.apiUrl}/store/${storeId}`
    );
  }

  approveAssistanceRequest(id: number): Observable<ApiResponse<RequestDto>> {
    return this.http.put<ApiResponse<RequestDto>>(
      `${this.apiUrl}/approve/${id}`,
      {}
    );
  }

  rejectAssistanceRequest(
    id: number,
    rejectionReason: { reason: string }
  ): Observable<ApiResponse<RequestDto>> {
    return this.http.put<ApiResponse<RequestDto>>(
      `${this.apiUrl}/reject/${id}`,
      rejectionReason
    );
  }
}
