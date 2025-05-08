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

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    if (token) {
      this.userRole = this.getRoleFromToken(token);
      this.isLoggedInSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.isSuccess && response.message) {
            const token = response.message;
            localStorage.setItem('token', token);
            this.userRole = this.getRoleFromToken(token);
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

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getRole(): string | null {
    return this.userRole;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.userRole = null;
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getRoleFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (
        payload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] || null
      );
    } catch (e) {
      return null;
    }
  }
}
