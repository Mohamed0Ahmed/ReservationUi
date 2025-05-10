import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  Assistance,
} from '../../interface/interfaces';
import { environment } from '../../env/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AssistanceService {
  private apiUrl = `${environment.apiUrl}/assistance/default`;

  constructor(private http: HttpClient) {}

  getDefaultAssistanceTypes(): Observable<ApiResponse<Assistance[]>> {
    return this.http.get<ApiResponse<Assistance[]>>(`${this.apiUrl}`);
  }

  getDefaultDeletedAssistanceTypes(): Observable<ApiResponse<Assistance[]>> {
    return this.http.get<ApiResponse<Assistance[]>>(`${this.apiUrl}/deleted`);
  }

  createDefaultAssistanceType(assistance: {
    Name: string;
  }): Observable<ApiResponse<Assistance>> {
    return this.http.post<ApiResponse<Assistance>>(
      `${this.apiUrl}`,
      assistance
    );
  }

  updateDefaultAssistanceType(
    id: number,
    assistance: {
      Name: string;
    }
  ): Observable<ApiResponse<Assistance>> {
    return this.http.put<ApiResponse<Assistance>>(
      `${this.apiUrl}/${id}`,
      assistance
    );
  }

  deleteDefaultAssistanceType(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  restoreDefaultAssistanceType(id: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/restore/${id}`,
      {}
    );
  }
}
