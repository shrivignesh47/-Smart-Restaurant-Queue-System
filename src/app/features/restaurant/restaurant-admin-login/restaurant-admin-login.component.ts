import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-restaurant-admin-login',
  templateUrl: './restaurant-admin-login.component.html',
  styleUrls: ['./restaurant-admin-login.component.scss']
})
export class RestaurantAdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  restaurantName = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.restaurantName = this.route.snapshot.paramMap.get('restaurantName') || '';

    // Check if already logged in
    const managerToken = localStorage.getItem(`manager_${this.restaurantName}`);
    if (managerToken) {
      this.router.navigate([this.restaurantName, 'admin', 'dashboard']);
    }
  }

  login(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    setTimeout(() => {
      // Demo credentials: manager/manager
      if (username === 'manager' && password === 'manager') {
        const managerData = {
          username: 'manager',
          restaurantName: this.restaurantName,
          role: 'restaurant_manager',
          token: 'manager_' + Date.now(),
          loginTime: new Date().toISOString()
        };

        localStorage.setItem(`manager_${this.restaurantName}`, managerData.token);
        localStorage.setItem(`managerData_${this.restaurantName}`, JSON.stringify(managerData));

        this.snackBar.open('Login successful! Welcome Manager', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.router.navigate([this.restaurantName, 'admin', 'dashboard']);
      } else {
        this.snackBar.open('Invalid credentials. Use manager/manager', 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }

      this.isLoading = false;
    }, 1500);
  }
}
