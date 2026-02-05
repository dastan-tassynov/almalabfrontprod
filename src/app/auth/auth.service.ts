import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import {isPlatformBrowser} from '@angular/common';

export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:9090/auth';

  constructor( private http: HttpClient,
  @Inject(PLATFORM_ID) private platformId: Object) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.api}/login`, { username, password })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
        })
      );
  }

  register(data: {
    username: string;
    password: string;
    fullName: string;
  }) {
    return this.http.post<any>(`${this.api}/register`, data)
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
        })
      );
  }


  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('token');
  }

  getRole(): Role {
    const token = this.getToken();
    if (!token) return 'USER';

    const decoded: any = jwtDecode(token);
    return decoded.role;
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
