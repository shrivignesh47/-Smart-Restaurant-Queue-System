import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { RestaurantService, Restaurant } from '../../../core/services/restaurant.service';
import { environment } from '../../../../environments/environment';

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
  targetRestaurant: Restaurant | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private restaurantService: RestaurantService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.restaurantName = this.route.snapshot.paramMap.get('restaurantName') || '';

    // Fetch restaurant details to get ID
    if (this.restaurantName) {
      this.restaurantService.getBySlug(this.restaurantName).subscribe({
        next: (res) => {
          this.targetRestaurant = res;
        },
        error: (err) => {
          console.error('[ManagerLogin] Error fetching restaurant:', err);
          this.snackBar.open('Invalid restaurant portal.', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        }
      });
    }

    // Check if already logged in as manager for this restaurant
    const managerToken = localStorage.getItem(`manager_${this.restaurantName}`);
    if (managerToken) {
      this.router.navigate([this.restaurantName, 'admin', 'dashboard']);
    }
  }

  login(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    // Use direct HTTP call to avoid overwriting customer session
    // Manager session is stored separately with restaurant-specific key
    this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password }).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.role === 'RestaurantAdmin' || response.role === 'RestaurantStaff') {
          // Check if this manager belongs to THIS restaurant
          if (response.restaurant_id == this.targetRestaurant?.id) {
            this.proceedToDashboard(response);
          } else {
            this.snackBar.open(`Access denied. You are not a manager for ${this.targetRestaurant?.name || this.restaurantName}`, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        } else if (response.role === 'Admin') {
          this.snackBar.open('Super Admins must login via the System Admin portal, not individual restaurant portals.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        } else {
          this.snackBar.open('Invalid account role for this portal. Only Restaurant Managers can login here.', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('[ManagerLogin] Login Error:', err);
        const errorMsg = err.error?.message || 'Login failed. Please check credentials.';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private proceedToDashboard(response: any): void {
    // Store manager session with restaurant-specific key (separate from customer session)
    localStorage.setItem(`manager_${this.restaurantName}`, response.accessToken);
    localStorage.setItem(`managerData_${this.restaurantName}`, JSON.stringify(response));

    this.snackBar.open(`Login successful! Welcome ${response.name}`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });

    this.router.navigate([this.restaurantName, 'admin', 'dashboard']);
  }
}
