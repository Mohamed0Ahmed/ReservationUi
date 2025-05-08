import { Store } from '../../interface/interfaces';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/enviroment';
import { ApiResponse } from '../../interface/interfaces';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStores(): Observable<ApiResponse<Store[]>> {
    return this.http.get<ApiResponse<Store[]>>(`${this.apiUrl}/stores`);
  }

  getDeletedStores(): Observable<ApiResponse<Store[]>> {
    return this.http.get<ApiResponse<Store[]>>(`${this.apiUrl}/stores/deleted`);
  }

  restoreStore(id: number): Observable<ApiResponse<Store>> {
    return this.http.put<ApiResponse<Store>>(
      `${this.apiUrl}/stores/restore/${id}`,
      {}
    );
  }

  deleteStore(id: number): Observable<ApiResponse<Store>> {
    return this.http.delete<ApiResponse<Store>>(`${this.apiUrl}/stores/${id}`);
  }

  createStore(store: {
    name: string;
    ownerEmail: string;
  }): Observable<ApiResponse<Store>> {
    return this.http.post<ApiResponse<Store>>(`${this.apiUrl}/stores`, store);
  }

  updateStore(
    id: number,
    store: { name: string; ownerEmail: string }
  ): Observable<ApiResponse<Store>> {
    return this.http.put<ApiResponse<Store>>(
      `${this.apiUrl}/stores/${id}`,
      store
    );
  }
}
