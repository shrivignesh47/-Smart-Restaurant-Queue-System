import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      const user = this.authService.currentUserValue;
      if (user?.role === 'Admin') {
        this.router.navigate(['/sysqueue/admin/dashboard']);
      }
    }
  }

  login(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    console.log('[AdminLogin] Attempting login for:', username);

    this.authService.login(username, password).subscribe({
      next: (response) => {
        console.log('[AdminLogin] Login successful:', response);

        if (response.role === 'Admin') {
          this.snackBar.open('Login successful! Welcome Admin', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/sysqueue/admin/dashboard']);
        } else if (response.role === 'RestaurantAdmin') {
          this.snackBar.open('Login successful! Welcome Restaurant Admin', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // TODO: Get restaurant slug and navigate to /{slug}/admin
          this.router.navigate(['/']);
        } else {
          this.snackBar.open('Invalid role for admin login', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          this.authService.logout();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[AdminLogin] Login error:', error);
        this.isLoading = false;

        let errorMessage = 'Login failed. Please try again.';
        if (error.status === 404) {
          errorMessage = 'User not found!';
        } else if (error.status === 401) {
          errorMessage = 'Invalid password!';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
