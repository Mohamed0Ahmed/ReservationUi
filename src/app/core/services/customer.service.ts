import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/enviroment';
import { ApiResponse } from '../../interface/interfaces';
import { Customer } from '../../interface/interfaces';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customer`;

  constructor(private http: HttpClient) {}

  loginCustomer(
    phoneNumber: string,
    storeId: number
  ): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.apiUrl}/login`, {
      PhoneNumber: phoneNumber,
      StoreId: storeId,
    });
  }

  getCustomerByPhone(
    phoneNumber: string,
    storeId: number
  ): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.apiUrl}/phone`, {
      PhoneNumber: phoneNumber,
      StoreId: storeId,
    });
  }
}
