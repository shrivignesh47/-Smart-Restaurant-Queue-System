import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

interface Restaurant {
  id: number;
  name: string;
  type: 'public' | 'private';
  status: 'active' | 'inactive';
  tables: number;
  location: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'overview';

  stats = {
    totalRestaurants: 24,
    totalUsers: 1250,
    totalBookings: 3450,
    revenue: 125000
  };

  settings = {
    maintenanceMode: false,
    allowNewRegistrations: true
  };

  restaurants: Restaurant[] = [
    { id: 1, name: 'La Bella Italia', type: 'public', status: 'active', tables: 20, location: 'New York' },
    { id: 2, name: 'Dragon Wok', type: 'public', status: 'active', tables: 15, location: 'New York' },
    { id: 3, name: 'Spice Garden', type: 'private', status: 'active', tables: 12, location: 'New York' },
    { id: 4, name: 'Taco Fiesta', type: 'public', status: 'active', tables: 18, location: 'New York' },
    { id: 5, name: 'Sakura Sushi', type: 'private', status: 'inactive', tables: 10, location: 'New York' }
  ];

  subUsers: any[] = [];

  displayedColumns: string[] = ['name', 'type', 'status', 'tables', 'actions'];

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
  }

  getTabTitle(): string {
    const titles: { [key: string]: string } = {
      overview: 'Dashboard Overview',
      analytics: 'Analytics',
      restaurants: 'Restaurant Management',
      users: 'User Management',
      settings: 'System Settings'
    };
    return titles[this.activeTab] || 'Dashboard';
  }

  openAddRestaurantDialog(): void {
    const name = prompt('Enter restaurant name:');
    const type = confirm('Is this a public restaurant? (Cancel for private)') ? 'public' : 'private';

    if (name) {
      const newRestaurant: Restaurant = {
        id: this.restaurants.length + 1,
        name: name,
        type: type,
        status: 'active',
        tables: 10,
        location: 'New York'
      };

      this.restaurants.push(newRestaurant);
      this.stats.totalRestaurants++;

      this.snackBar.open(`Restaurant "${name}" added successfully!`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  editRestaurant(restaurant: Restaurant): void {
    this.snackBar.open(`Edit ${restaurant.name} - Feature coming soon!`, 'Close', { duration: 2000 });
  }

  createSubUser(restaurant: Restaurant | null): void {
    const username = prompt('Enter sub-user username:');
    const password = prompt('Enter sub-user password:');

    if (username && password) {
      const subUser = {
        id: this.subUsers.length + 1,
        username: username,
        password: password,
        restaurant: restaurant?.name || 'All Restaurants',
        role: 'restaurant_manager',
        createdAt: new Date()
      };

      this.subUsers.push(subUser);

      this.snackBar.open(`Sub-user "${username}" created successfully!`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
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
