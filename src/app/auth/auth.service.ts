import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import {Router} from '@angular/router';

export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'https://i6hdfhyxmg62.share.zrok.io/auth';

  private roleSubject = new BehaviorSubject<string>('USER');
  role$ = this.roleSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Это сработает мгновенно при загрузке приложения в браузере
    if (isPlatformBrowser(this.platformId)) {
      const savedRole = this.getRoleFromToken();
      this.roleSubject.next(savedRole);
    }
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.api}/login`, { username, password })
      .pipe(
        tap(res => {
          this.saveToken(res.token);
          // Сразу уведомляем всё приложение о новой роли
          this.updateRole();
        })
      );
  }

  register(data: { username: string; password: string; fullName: string; }) {
    return this.http.post<any>(`${this.api}/register`, data)
      .pipe(
        tap(res => {
          this.saveToken(res.token);
          this.updateRole();
        })
      );
  }

  // Безопасное сохранение токена
  private saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  // Безопасное получение токена
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getRoleFromToken(): string {
    const token = this.getToken();
    if (!token) return 'USER';
    try {
      const decoded: any = jwtDecode(token);
      // Убедитесь, что в JWT поле называется именно 'role'
      return decoded.role || 'USER';
    } catch (e) {
      console.error('Ошибка декодирования токена:', e);
      return 'USER';
    }
  }

  // Обновляет поток роли, чтобы компоненты (DocumentsComponent) сразу узнали об изменениях
  updateRole() {
    const newRole = this.getRoleFromToken();
    console.log('Роль обновлена на:', newRole);
    this.roleSubject.next(newRole);
  }

  logout() {
    localStorage.removeItem('token');
    this.roleSubject.next('USER'); // Сбрасываем роль в дефолт
    this.router.navigate(['/login']); // Перекидываем на страницу входа
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
