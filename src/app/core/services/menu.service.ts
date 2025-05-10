import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/enviroment';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../interface/interfaces';
import { Category, Item } from '../../interface/interfaces';
import { UpdateMenuItemRequest } from '../../interface/DTOs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menus`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getStoreId(): string | null {
    return this.authService.getStoreId();
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    const storeId = this.getStoreId();
    if (!storeId) {
      throw new Error('Store ID not found');
    }
    return this.http.get<ApiResponse<Category[]>>(
      `${this.apiUrl}/categories/${storeId}`
    );
  }

  getDeletedCategories(): Observable<ApiResponse<Category[]>> {
    const storeId = this.getStoreId();
    if (!storeId) {
      throw new Error('Store ID not found');
    }
    return this.http.get<ApiResponse<Category[]>>(
      `${this.apiUrl}/categories/deleted/${storeId}`
    );
  }

  createCategory(name: string): Observable<ApiResponse<Category>> {
    const storeId = this.getStoreId();
    if (!storeId) {
      throw new Error('Store ID not found');
    }
    return this.http.post<ApiResponse<Category>>(`${this.apiUrl}/categories`, {
      name,
      storeId: parseInt(storeId),
    });
  }

  updateCategory(id: number, name: string): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(
      `${this.apiUrl}/categories/${id}`,
      {
        name,
      }
    );
  }

  deleteCategory(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.apiUrl}/categories/${id}`
    );
  }

  restoreCategory(id: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/categories/restore/${id}`,
      {}
    );
  }

  getItems(categoryId: number): Observable<ApiResponse<Item[]>> {
    return this.http.get<ApiResponse<Item[]>>(
      `${this.apiUrl}/items/${categoryId}`
    );
  }
  getDeletedItems(categoryId: number): Observable<ApiResponse<Item[]>> {
    return this.http.get<ApiResponse<Item[]>>(
      `${this.apiUrl}/items/deleted/${categoryId}`
    );
  }

  createItem(item: Item): Observable<ApiResponse<Item>> {
    return this.http.post<ApiResponse<Item>>(`${this.apiUrl}/items`, item);
  }

  updateItem(
    id: number,
    item: UpdateMenuItemRequest
  ): Observable<ApiResponse<Item>> {
    return this.http.put<ApiResponse<Item>>(`${this.apiUrl}/items/${id}`, item);
  }

  deleteItem(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/items/${id}`);
  }
  HardDeleteItem(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.apiUrl}/items/hard/${id}`
    );
  }

  restoreItem(id: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/items/restore/${id}`,
      {}
    );
  }
}
