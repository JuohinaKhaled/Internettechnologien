import {Component} from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isLoggedIn = false;
  constructor(private router: Router, private authService: AuthService) {}

  isLogged() {
    return this.isLoggedIn = this.authService.isLoggedIn;
  }

  logout() {
    this.authService.logout();
  }

  onNavigate() {
    this.router.navigate(['/login']);
  }
}
