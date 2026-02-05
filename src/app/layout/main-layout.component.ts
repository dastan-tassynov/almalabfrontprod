import { Component } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [RouterOutlet],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
