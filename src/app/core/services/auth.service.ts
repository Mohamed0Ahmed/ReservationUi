import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginResponse } from '../../interface/loginInterface';
import { environment } from '../../env/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private userRole: string | null = null;
  private storeId: string | null = null;
  private roomId: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    if (token) {
      const { role, storeId, roomId } = this.getRoleAndStoreIdFromToken(token);
      this.userRole = role;
      this.storeId = storeId;
      this.roomId = roomId;
      this.isLoggedInSubject.next(true);
    }
  }

  roomLogin(
    storeName: string,
    username: string,
    password: string
  ): Observable<any> {
    const body = { storeName, userName: username, password };
    return this.http.post<any>(`${this.apiUrl}/auth/room/login`, body).pipe(
      tap((response) => {
        if (response.isSuccess && response.data) {
          const token = response.data.token;
          localStorage.setItem('token', token);
          const { role, storeId, roomId } =
            this.getRoleAndStoreIdFromToken(token);
          this.userRole = role;
          this.storeId = storeId;
          this.roomId = roomId;
          this.isLoggedInSubject.next(true);
          this.router.navigate(['/room']);
        }
      })
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.isSuccess && response.message) {
            const token = response.message;
            localStorage.setItem('token', token);
            const { role, storeId, roomId } =
              this.getRoleAndStoreIdFromToken(token);
            this.userRole = role;
            this.storeId = storeId;
            this.roomId = roomId;
            this.isLoggedInSubject.next(true);

            if (this.userRole === 'Admin') {
              this.router.navigate(['/admin']);
            } else if (this.userRole === 'Owner') {
              this.router.navigate(['/owner']);
            } else {
              this.router.navigate(['/login']);
            }
          }
        })
      );
  }

  register(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/register`, { email, password })
      .pipe(
        tap((response) => {
          if (response.isSuccess) {
            console.log('تم التسجيل بنجاح');
            this.router.navigate(['/login']);
          } else {
            console.warn('فشل التسجيل:', response.message);
          }
        })
      );
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getRole(): string | null {
    return this.userRole;
  }

  getStoreId(): string | null {
    return this.storeId;
  }

  getRoomId(): string | null {
    return this.roomId;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.userRole = null;
    this.storeId = null;
    this.roomId = null;
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getRoleAndStoreIdFromToken(token: string): {
    role: string | null;
    storeId: string | null;
    roomId: string | null;
  } {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role =
        payload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] || null;
      const storeId = payload['storeId'] || null;
      const roomId = payload['roomId'] || null;
      return { role, storeId, roomId };
    } catch (e) {
      return { role: null, storeId: null, roomId: null };
    }
  }
}
