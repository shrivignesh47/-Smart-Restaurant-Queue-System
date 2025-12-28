import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      this.router.navigate(['/sysqueue/admin/dashboard']);
    }
  }

  login(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    // Simulate API call
    setTimeout(() => {
      // Demo credentials: admin/admin
      if (username === 'admin' && password === 'admin') {
        const adminData = {
          username: 'admin',
          role: 'super_admin',
          token: 'admin_' + Date.now(),
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('adminData', JSON.stringify(adminData));

        this.snackBar.open('Login successful! Welcome Admin', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.router.navigate(['/sysqueue/admin/dashboard']);
      } else {
        this.snackBar.open('Invalid credentials. Use admin/admin', 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }

      this.isLoading = false;
    }, 1500);
  }
}
