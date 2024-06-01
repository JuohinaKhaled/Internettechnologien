import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  isLoggedIn = false;
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {

  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  isLogged(){
    return this.isLoggedIn = this.authService.isLoggedIn;
  }

}
