import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddRestaurantDialogComponent } from './add-restaurant-dialog.component';
import { AddAdminDialogComponent } from './add-admin-dialog.component';
import { AddManagerDialogComponent } from './add-manager-dialog.component';

interface Restaurant {
  id: number;
  name: string;
  type: 'public' | 'private';
  status: 'active' | 'inactive';
  tables: number;
  location: string;
  managerUsername?: string;
}

interface AdminUser {
  id: number;
  fullName: string;
  username: string;
  role: string;
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

  restaurants: Restaurant[] = [
    { id: 1, name: 'La Bella Italia', type: 'public', status: 'active', tables: 20, location: 'New York' },
    { id: 2, name: 'Dragon Wok', type: 'public', status: 'active', tables: 15, location: 'New York' },
    { id: 3, name: 'Spice Garden', type: 'private', status: 'active', tables: 12, location: 'New York' },
    { id: 4, name: 'Taco Fiesta', type: 'public', status: 'active', tables: 18, location: 'New York' },
    { id: 5, name: 'Sakura Sushi', type: 'private', status: 'inactive', tables: 10, location: 'New York' }
  ];

  subUsers: any[] = [];

  adminUsers: AdminUser[] = [
    { id: 1, fullName: 'System Admin', username: 'admin', role: 'Super Admin', status: 'active' },
    { id: 2, fullName: 'Support Team', username: 'support', role: 'Support Admin', status: 'active' }
  ];

  displayedColumns: string[] = ['name', 'type', 'status', 'actions'];
  adminColumns: string[] = ['name', 'username', 'role', 'status', 'actions'];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      this.router.navigate(['/sysqueue/admin']);
    }

    // Load Settings
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    }

    // Calculate Stats
    this.stats.totalRestaurants = this.restaurants.length;
    this.stats.totalUsers = this.adminUsers.length + this.subUsers.length + 1200; // 1200 base users
    this.stats.revenue = this.monthlyRevenue.reduce((acc, curr) => acc + curr.value, 0);
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
      maxWidth: '600px',
      data: { edit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Create Restaurant
        const newRestaurant: Restaurant = {
          id: this.restaurants.length + 1,
          name: result.name,
          type: result.type || 'private',
          status: 'active',
          tables: result.tables || 0,
          location: 'New York', // Default for now
          managerUsername: result.managerUsername
        };

        this.restaurants.push(newRestaurant);
        this.stats.totalRestaurants++;

        // Auto-create Manager User if credentials provided
        if (result.managerUsername && result.managerPassword) {
          this.subUsers.push({
            id: this.subUsers.length + 1,
            username: result.managerUsername,
            password: result.managerPassword,
            restaurant: result.name,
            role: 'restaurant_manager',
            createdAt: new Date()
          });

          this.stats.totalUsers++; // Increment user count
        }

        this.snackBar.open(`Restaurant "${result.name}" and manager created successfully!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
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
        this.adminUsers.push({
          id: this.adminUsers.length + 1,
          fullName: result.fullName,
          username: result.username,
          role: result.role,
          status: 'active'
        });

        this.snackBar.open(`Admin user "${result.username}" created successfully!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  editRestaurant(restaurant: Restaurant): void {
    const dialogRef = this.dialog.open(AddRestaurantDialogComponent, {
      width: '100%',
      maxWidth: '600px',
      data: { edit: true, restaurant: restaurant }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        restaurant.name = result.name;
        restaurant.type = result.type;
        restaurant.tables = result.tables;
        this.snackBar.open(`Restaurant updated successfully`, 'Close', { duration: 3000 });
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
        // Find restaurant name if selected from dropdown
        const restaurantName = restaurant ? restaurant.name :
          this.restaurants.find(r => r.id === result.restaurantId)?.name || 'Unknown';

        this.subUsers.push({
          id: this.subUsers.length + 1,
          username: result.username,
          password: result.password,
          restaurant: restaurantName,
          role: 'restaurant_manager',
          createdAt: new Date()
        });

        this.stats.totalUsers++;

        this.snackBar.open(`Manager "${result.username}" created successfully!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
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
      const index = this.restaurants.indexOf(restaurant);
      this.restaurants.splice(index, 1);
      this.stats.totalRestaurants--;

      this.snackBar.open(`Restaurant "${restaurant.name}" deleted`, 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
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

  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    this.snackBar.open('Logged out successfully', 'Close', { duration: 2000 });
    this.router.navigate(['/sysqueue/admin']);
  }
}
