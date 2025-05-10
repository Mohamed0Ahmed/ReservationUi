import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Assistance } from '../../interface/interfaces';
import { environment } from '../../env/enviroment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AssistanceService {
  private apiUrl = `${environment.apiUrl}/assistance`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getDefaultAssistanceTypes(): Observable<ApiResponse<Assistance[]>> {
    return this.http.get<ApiResponse<Assistance[]>>(`${this.apiUrl}/default`);
  }

  getDefaultDeletedAssistanceTypes(): Observable<ApiResponse<Assistance[]>> {
    return this.http.get<ApiResponse<Assistance[]>>(
      `${this.apiUrl}/default/deleted`
    );
  }

  createDefaultAssistanceType(assistance: {
    Name: string;
  }): Observable<ApiResponse<Assistance>> {
    return this.http.post<ApiResponse<Assistance>>(
      `${this.apiUrl}/default`,
      assistance
    );
  }

  updateDefaultAssistanceType(
    id: number,
    assistance: { Name: string }
  ): Observable<ApiResponse<Assistance>> {
    return this.http.put<ApiResponse<Assistance>>(
      `${this.apiUrl}/default/${id}`,
      assistance
    );
  }

  deleteDefaultAssistanceType(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.apiUrl}/default/${id}`
    );
  }

  restoreDefaultAssistanceType(id: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/default/restore/${id}`,
      {}
    );
  }

  //* Owner Functions
  //#region Owner Functions

  getAllAssistanceTypes(
    storeId: number
  ): Observable<ApiResponse<Assistance[]>> {
    return this.http.get<ApiResponse<Assistance[]>>(
      `${this.apiUrl}/store/${storeId}`
    );
  }
  getAllDeletedAssistanceTypes(
    storeId: number
  ): Observable<ApiResponse<Assistance[]>> {
    return this.http.get<ApiResponse<Assistance[]>>(
      `${this.apiUrl}/store/deleted/${storeId}`
    );
  }

  createAssistanceType(
    storeId: number,
    name: string
  ): Observable<ApiResponse<Assistance>> {
    return this.http.post<ApiResponse<Assistance>>(
      `${this.apiUrl}/store/${storeId}`,
      { Name: name }
    );
  }

  updateAssistanceType(
    id: number,
    name: string
  ): Observable<ApiResponse<Assistance>> {
    return this.http.put<ApiResponse<Assistance>>(`${this.apiUrl}/${id}`, {
      Name: name,
    });
  }

  deleteAssistanceType(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  restoreAssistanceType(id: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/restore/${id}`,
      {}
    );
  }

  //#endregion
}
