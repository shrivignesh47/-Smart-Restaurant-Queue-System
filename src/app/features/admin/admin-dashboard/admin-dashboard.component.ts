import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddRestaurantDialogComponent } from './add-restaurant-dialog.component';
import { AddAdminDialogComponent } from './add-admin-dialog.component';
import { AddManagerDialogComponent } from './add-manager-dialog.component';
import { AdminProfileDialogComponent } from './admin-profile-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantService, Restaurant } from '../../../core/services/restaurant.service';
import { UserService, User } from '../../../core/services/user.service';
import { forkJoin } from 'rxjs';

interface AdminUser extends User {
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'overview';
  today = new Date();
  hidePassword = true;
  isUpdatingProfile = false;
  adminProfileForm: FormGroup;

  stats = {
    totalRestaurants: 0,
    totalUsers: 0,
    totalBookings: 3450, // Mocked for now
    revenue: 0
  };

  settings = {
    maintenanceMode: false,
    allowNewRegistrations: true,
    systemName: 'SysQueue',
    defaultCurrency: 'INR'
  };

  monthlyRevenue = [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 52000 },
    { month: 'Mar', value: 48000 },
    { month: 'Apr', value: 61000 },
    { month: 'May', value: 58000 },
    { month: 'Jun', value: 75000 },
    { month: 'Jul', value: 82000 },
    { month: 'Aug', value: 79000 }
  ];

  userGrowth = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 150 },
    { month: 'Mar', users: 180 },
    { month: 'Apr', users: 220 },
    { month: 'May', users: 290 },
    { month: 'Jun', users: 350 },
    { month: 'Jul', users: 410 },
    { month: 'Aug', users: 480 }
  ];

  restaurants: Restaurant[] = [];

  subUsers: any[] = [];

  adminUsers: any[] = [];
  customers: any[] = [];
  restaurantManagers: any[] = [];

  displayedColumns: string[] = ['name', 'type', 'status', 'actions'];
  adminColumns: string[] = ['name', 'username', 'role', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private restaurantService: RestaurantService,
    private userService: UserService
  ) {
    // Initialize admin profile form
    this.adminProfileForm = this.fb.group({
      name: ['', Validators.required],
      contact_info: ['', Validators.required],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    // Check if admin is logged in
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/sysqueue/admin']);
      return;
    }

    const user = this.authService.currentUserValue;
    if (!user || user.role !== 'Admin') {
      this.snackBar.open('Access denied', 'Close');
      this.router.navigate(['/']);
      return;
    }

    // Load all data from API
    this.loadAllData();
  }

  loadAllData(): void {
    console.log('[AdminDashboard] Loading all data from API');

    // Fetch everything in parallel
    forkJoin({
      restaurants: this.restaurantService.getAll(),
      users: this.userService.getAll()
    }).subscribe({
      next: (results) => {
        console.log('[AdminDashboard] All data loaded:', results);
        this.restaurants = results.restaurants;

        // Categorize users locally
        const allUsers = results.users;
        this.adminUsers = allUsers.filter(u =>
          u.role === 'Admin' ||
          u.role.includes('Admin') && u.role !== 'RestaurantAdmin'
        );
        this.restaurantManagers = allUsers.filter(u => u.role === 'RestaurantAdmin');
        this.customers = allUsers.filter(u => u.role === 'Customer' || u.role === 'customer');

        // Map restaurant names to managers
        this.restaurantManagers = this.restaurantManagers.map(mgr => ({
          ...mgr,
          restaurantName: this.restaurants.find(r => r.id === mgr.restaurant_id)?.name || 'N/A'
        }));

        this.updateStats();
      },
      error: (error) => {
        console.error('[AdminDashboard] Error loading data:', error);
        this.snackBar.open('Error loading dashboard data', 'Close', { duration: 3000 });
      }
    });
  }

  loadRestaurants(): void {
    console.log('[AdminDashboard] Loading restaurants from API');
    this.restaurantService.getAll().subscribe({
      next: (restaurants) => {
        console.log('[AdminDashboard] Restaurants loaded:', restaurants);
        this.restaurants = restaurants;
        this.updateStats();
      },
      error: (error) => {
        console.error('[AdminDashboard] Error loading restaurants:', error);
        this.snackBar.open('Error loading restaurants', 'Close', {
          duration: 3000
        });
      }
    });
  }

  updateStats(): void {
    this.stats.totalRestaurants = this.restaurants.length;
    this.stats.totalUsers = this.adminUsers.length + this.restaurantManagers.length + this.customers.length;
    this.stats.revenue = this.monthlyRevenue.reduce((acc, curr) => acc + curr.value, 0);
  }

  loadAdminProfile(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.adminProfileForm.patchValue({
        name: user.name || '',
        contact_info: user.contact_info || ''
      });
    }
  }

  getAdminInitials(): string {
    const name = this.adminProfileForm.get('name')?.value || 'Admin';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  resetProfileForm(): void {
    this.loadAdminProfile();
    this.adminProfileForm.patchValue({
      password: '',
      confirmPassword: ''
    });
  }

  updateAdminProfile(): void {
    if (this.adminProfileForm.invalid) {
      this.snackBar.open('Please fix form errors', 'Close', {
        duration: 3000
      });
      return;
    }

    const user = this.authService.currentUserValue;
    if (!user) {
      this.snackBar.open('User not found', 'Close');
      return;
    }

    this.isUpdatingProfile = true;
    const formValue = this.adminProfileForm.value;

    const updates: any = {
      name: formValue.name,
      contact_info: formValue.contact_info
    };

    // Only include password if it was changed
    if (formValue.password && formValue.password.trim() !== '') {
      updates.password = formValue.password;
    }

    console.log('[AdminDashboard] Updating profile with:', updates);

    this.authService.updateAdminProfile(user.id, updates).subscribe({
      next: (response) => {
        console.log('[AdminDashboard] Update successful:', response);
        this.isUpdatingProfile = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Reset password fields
        this.adminProfileForm.patchValue({
          password: '',
          confirmPassword: ''
        });

        // If password was changed, show logout message
        if (updates.password) {
          setTimeout(() => {
            this.snackBar.open('Password changed! Please login again with new password.', 'Logout', {
              duration: 5000
            }).onAction().subscribe(() => {
              this.logout();
            });
          }, 1000);
        }
      },
      error: (error) => {
        this.isUpdatingProfile = false;
        console.error('[AdminDashboard] Error updating profile:', error);
        const errorMessage = error.error?.message || 'Error updating profile';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getMaxRevenue(): number {
    return Math.max(...this.monthlyRevenue.map(d => d.value));
  }

  getTabTitle(): string {
    const titles: { [key: string]: string } = {
      overview: 'Dashboard Overview',
      analytics: 'Analytics',
      restaurants: 'Restaurant Management',
      users: 'User Management',
      settings: 'System Settings',
      profile: 'My Profile'
    };
    return titles[this.activeTab] || 'Dashboard';
  }

  openAddRestaurantDialog(): void {
    const dialogRef = this.dialog.open(AddRestaurantDialogComponent, {
      width: '100%',
      maxWidth: '700px',
      data: { edit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('[AdminDashboard] Creating restaurant:', result);

        // Create restaurant via API
        this.restaurantService.create(result).subscribe({
          next: (restaurant) => {
            console.log('[AdminDashboard] Restaurant created:', restaurant);

            // Add to local array
            this.restaurants.push(restaurant);
            this.updateStats();

            this.snackBar.open(`Restaurant "${restaurant.name}" created successfully!`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });

            // TODO: Auto-create Manager User if credentials provided
            if (result.managerUsername && result.managerPassword) {
              console.log('[AdminDashboard] Manager credentials provided, creating user...');
              // This would call a user creation API
            }
          },
          error: (error) => {
            console.error('[AdminDashboard] Error creating restaurant:', error);
            this.snackBar.open(error.error?.message || 'Error creating restaurant', 'Close', {
              duration: 4000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  openAddAdminDialog(): void {
    const dialogRef = this.dialog.open(AddAdminDialogComponent, {
      width: '100%',
      maxWidth: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newUser: User = {
          name: result.fullName,
          contact_info: result.username,
          role: result.role,
          password: result.password,
          created_at: new Date().toISOString()
        };

        this.userService.create(newUser).subscribe({
          next: (user) => {
            this.adminUsers.push(user);
            this.updateStats();
            this.snackBar.open(`Admin user "${user.name}" created successfully!`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('[AdminDashboard] Error creating admin:', error);
            this.snackBar.open(error.error?.message || 'Error creating admin', 'Close', {
              duration: 4000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  editRestaurant(restaurant: Restaurant): void {
    const dialogRef = this.dialog.open(AddRestaurantDialogComponent, {
      width: '100%',
      maxWidth: '700px',
      data: { edit: true, restaurant: restaurant }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && restaurant.id) {
        console.log('[AdminDashboard] Updating restaurant:', result);

        this.restaurantService.update(restaurant.id, result).subscribe({
          next: (updatedRestaurant) => {
            console.log('[AdminDashboard] Restaurant updated:', updatedRestaurant);

            // Update local array
            const index = this.restaurants.findIndex(r => r.id === restaurant.id);
            if (index !== -1) {
              this.restaurants[index] = updatedRestaurant;
            }

            this.snackBar.open(`Restaurant updated successfully`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('[AdminDashboard] Error updating restaurant:', error);
            this.snackBar.open(error.error?.message || 'Error updating restaurant', 'Close', {
              duration: 4000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  createSubUser(restaurant: Restaurant | null): void {
    const dialogRef = this.dialog.open(AddManagerDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      data: {
        fixedRestaurant: restaurant,
        restaurants: this.restaurants
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newManager: User = {
          name: result.username + " Manager", // Default name if not provided
          contact_info: result.username,
          password: result.password,
          role: 'RestaurantAdmin',
          restaurant_id: result.restaurantId || (restaurant ? restaurant.id : null),
          created_at: new Date().toISOString()
        };

        this.userService.create(newManager).subscribe({
          next: (user) => {
            // Fetch restaurant name for UI
            const rName = restaurant ? restaurant.name :
              this.restaurants.find(r => r.id === user.restaurant_id)?.name || 'Unknown';

            this.restaurantManagers.push({
              ...user,
              restaurantName: rName
            });

            this.updateStats();

            this.snackBar.open(`Manager "${user.contact_info}" created successfully!`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('[AdminDashboard] Error creating manager:', error);
            this.snackBar.open(error.error?.message || 'Error creating manager', 'Close', {
              duration: 4000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  viewAnalytics(restaurant: Restaurant): void {
    this.snackBar.open(`Viewing analytics for ${restaurant.name}`, 'Close', { duration: 2000 });
    this.activeTab = 'analytics';
  }

  deleteRestaurant(restaurant: Restaurant): void {
    if (confirm(`Are you sure you want to delete "${restaurant.name}"?`)) {
      if (!restaurant.id) {
        this.snackBar.open('Invalid restaurant ID', 'Close');
        return;
      }

      console.log('[AdminDashboard] Deleting restaurant:', restaurant.id);

      this.restaurantService.delete(restaurant.id).subscribe({
        next: () => {
          console.log('[AdminDashboard] Restaurant deleted');

          // Remove from local array
          const index = this.restaurants.indexOf(restaurant);
          if (index !== -1) {
            this.restaurants.splice(index, 1);
          }
          this.updateStats();

          this.snackBar.open(`Restaurant "${restaurant.name}" deleted`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('[AdminDashboard] Error deleting restaurant:', error);
          this.snackBar.open(error.error?.message || 'Error deleting restaurant', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  saveSettings(): void {
    localStorage.setItem('adminSettings', JSON.stringify(this.settings));
    this.snackBar.open('Settings saved successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  openProfileDialog(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.snackBar.open('User not found', 'Close');
      return;
    }

    const dialogRef = this.dialog.open(AdminProfileDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      data: { user: currentUser }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Profile updated! Please login again with new credentials if you changed username or password.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.snackBar.open('Logged out successfully', 'Close', { duration: 2000 });
    this.router.navigate(['/sysqueue/admin']);
  }
}
