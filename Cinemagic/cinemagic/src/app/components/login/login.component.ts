import { Component } from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {CustomSnackbarService} from "../../services/custom-snackbar/custom-snackbar.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user = {
    email: '',
    password: ''
  };

  loginFailed = false;

  constructor(
    private authService: AuthService,
    private snackBar: CustomSnackbarService
  ) {}

  onSubmit() {
    this.authService.login(this.user.email, this.user.password).subscribe(
      response => {
        if (response.status === 'success') {
          console.log('Login successful');
          this.snackBar.openSnackBar('Login successful!');
        } else {
          console.log('Login failed');
          this.snackBar.openSnackBar('Login failed. Please check your credentials.');
          this.loginFailed = true;
        }
      },
      error => {
        console.log('Error during login:', error);
        this.snackBar.openSnackBar('An error occurred during login. Please try again.');
        this.loginFailed = true;
      }
    );
  }

}
