import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  form = {
    fullName: '',
    username: '',
    password: ''
  };

  error = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register() {
    // Добавляем правильный URL: http://localhost:9090/auth/register
    this.http.post<any>('http://bore.pub:8862/auth/register', this.form).subscribe({
      next: res => {
        // Сохраняем данные (проверьте, что бэкенд возвращает token и role)
        if (res.token) localStorage.setItem('token', res.token);
        if (res.role) localStorage.setItem('role', res.role);
        this.router.navigate(['/documents']);
      },
      error: err => {
        console.error(err);
        this.error = 'Ошибка регистрации: проверьте соединение с бэкендом';
      }
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
