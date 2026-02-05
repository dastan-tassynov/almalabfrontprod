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
    this.http.post<any>('/register', this.form).subscribe({
      next: res => {
        // автологин
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        this.router.navigate(['/documents']);
      },
      error: err => {
        this.error = 'Ошибка регистрации';
      }
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
