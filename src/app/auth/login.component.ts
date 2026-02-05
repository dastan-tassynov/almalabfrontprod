import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  form = {
    username: '',
    password: ''
  };

  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {
    this.error = '';

    this.auth.login(this.form.username, this.form.password)
      .subscribe({
        next: () => {
          // ✅ после логина сразу на документы
          this.router.navigate(['/documents']);
        },
        error: err => {
          this.error =
            err?.error?.message ||
            'Неверный логин или пароль';
        }
      });
  }
}
