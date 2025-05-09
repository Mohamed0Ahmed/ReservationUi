import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  AssistanceDto,
  DefaultAssistanceRequestType,
} from '../../interface/interfaces';
import { environment } from '../../env/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AssistanceService {
  private apiUrl = `${environment.apiUrl}/assistance/default`;

  constructor(private http: HttpClient) {}

  getDefaultAssistanceTypes(): Observable<ApiResponse<AssistanceDto[]>> {
    return this.http.get<ApiResponse<AssistanceDto[]>>(`${this.apiUrl}`);
  }

  getDefaultDeletedAssistanceTypes(): Observable<ApiResponse<AssistanceDto[]>> {
    return this.http.get<ApiResponse<AssistanceDto[]>>(
      `${this.apiUrl}/deleted`
    );
  }

  createDefaultAssistanceType(assistance: {
    Name: string;
  }): Observable<ApiResponse<DefaultAssistanceRequestType>> {
    return this.http.post<ApiResponse<DefaultAssistanceRequestType>>(
      `${this.apiUrl}`,
      assistance
    );
  }

  updateDefaultAssistanceType(
    id: number,
    assistance: {
      Name: string;
    }
  ): Observable<ApiResponse<DefaultAssistanceRequestType>> {
    return this.http.put<ApiResponse<DefaultAssistanceRequestType>>(
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
