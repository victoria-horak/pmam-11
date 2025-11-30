import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { LoginRequest } from '../interfaces/login-request';
import { RegistrationRequest } from '../interfaces/registration-request';
import { AuthResponse } from '../interfaces/auth-response';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl: string = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Геттер для access токена
  get accessToken(): string | null {
    return this.tokenSubject.value;
  }

  private setToken(token: string): void {
    this.tokenSubject.next(token);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}Auth/login`, data, {
      withCredentials: true
    }).pipe(
      tap((response) => {
        if (response.isSuccess) {
          this.setToken(response.token);
        }
      })
    );
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}Auth/google-login`, { idToken }, {
      withCredentials: true
    }).pipe(
      tap((response) => {
        if (response.isSuccess) {
          this.setToken(response.token);
        }
      })
    );
  }

  register(data: RegistrationRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}Auth/register`, data, {
      withCredentials: true
    }).pipe(
      tap((response) => {
        if (response.isSuccess) {
          this.setToken(response.token);
        }
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}Auth/refresh`, {}, {
      withCredentials: true
    }).pipe(
      tap((response) => {
        if (response.isSuccess) {
          this.setToken(response.token);
        }
      })
    );
  }

  decodeToken(token: string): {
    id: string;
    fullName: string;
    email: string;
    roles: string[] | string;
  } {
    const decodedToken: any = jwtDecode(token);
    return {
      id: decodedToken.sub,
      fullName: decodedToken.name,
      email: decodedToken.email,
      roles: decodedToken.role || [],
    };
  }

  getUserDetail(): any | null {
    const token = this.accessToken;
    if (!token) return null;
    return this.decodeToken(token);
  }

  isLoggedIn(): boolean {
    const token = this.accessToken;
    if (!token) return false;
    return !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    const token = this.accessToken;
    if (!token) return true;
    const decoded: any = jwtDecode(token);
    const isTokenExpired = Date.now() >= decoded['exp'] * 1000;
    if (isTokenExpired) this.logout();
    return isTokenExpired;
  }

  logout(): void {
    this.tokenSubject.next(null);
    this.http.post(`${this.apiUrl}Auth/logout`, {}, { withCredentials: true }).subscribe();
  }
}
