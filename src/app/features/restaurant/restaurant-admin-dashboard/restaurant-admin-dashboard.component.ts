import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

interface QueueCustomer {
  id: number;
  name: string;
  phone: string;
  partySize: number;
  waitTime: number;
  joinedAt: Date;
}

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentGuest?: string;
  occupiedSince?: Date;
  reservationId?: number;
}

interface Reservation {
  id: number;
  time: string;
  customerName: string;
  phone: string;
  guests: number;
  tableNumber: number;
  status: 'confirmed' | 'seated' | 'cancelled';
  date: Date;
}

@Component({
  selector: 'app-restaurant-admin-dashboard',
  templateUrl: './restaurant-admin-dashboard.component.html',
  styleUrls: ['./restaurant-admin-dashboard.component.scss']
})
export class RestaurantAdminDashboardComponent implements OnInit {
  activeTab = 'overview';
  restaurantName = '';
  restaurantOnline = true;
  todayRevenue = 45000;
  isMobile = false;
  sidenavOpened = true; // Default for desktop
  isSidebarOpen = true; // Added for explicit control

  queueList: QueueCustomer[] = [
    { id: 1, name: 'John Doe', phone: '+91 9876543210', partySize: 4, waitTime: 15, joinedAt: new Date() },
    { id: 2, name: 'Jane Smith', phone: '+91 9876543211', partySize: 2, waitTime: 10, joinedAt: new Date() },
    { id: 3, name: 'Bob Johnson', phone: '+91 9876543212', partySize: 6, waitTime: 25, joinedAt: new Date() }
  ];

  tables: Table[] = [
    { id: 1, number: 1, capacity: 2, status: 'available' },
    { id: 2, number: 2, capacity: 4, status: 'occupied', currentGuest: 'Alice Brown', occupiedSince: new Date() },
    { id: 3, number: 3, capacity: 4, status: 'available' },
    { id: 4, number: 4, capacity: 6, status: 'reserved', reservationId: 1 },
    { id: 5, number: 5, capacity: 2, status: 'occupied', currentGuest: 'Charlie Davis', occupiedSince: new Date() },
    { id: 6, number: 6, capacity: 4, status: 'available' },
    { id: 7, number: 7, capacity: 8, status: 'available' },
    { id: 8, number: 8, capacity: 2, status: 'available' }
  ];

  reservations: Reservation[] = [
    { id: 1, time: '7:00 PM', customerName: 'Emma Wilson', phone: '+91 9876543213', guests: 4, tableNumber: 4, status: 'confirmed', date: new Date() },
    { id: 2, time: '7:30 PM', customerName: 'Michael Chen', phone: '+91 9876543214', guests: 2, tableNumber: 1, status: 'confirmed', date: new Date() },
    { id: 3, time: '8:00 PM', customerName: 'Sarah Parker', phone: '+91 9876543215', guests: 6, tableNumber: 7, status: 'confirmed', date: new Date() }
  ];

  reservationColumns = ['time', 'name', 'guests', 'table', 'status', 'actions'];

  analytics = {
    customersServed: 45,
    avgWaitTime: 12,
    turnoverRate: 2.5,
    revenue: 45000
  };

  settings = {
    openingTime: '10:00',
    closingTime: '23:00',
    acceptQueue: true,
    acceptReservations: true
  };

  profile = {
    name: 'Manager',
    email: 'manager@annapoorna.com',
    phone: '+91 9876543210',
    logoUrl: 'assets/images/logo-placeholder.png' // Default logo
  };

  passwordForm = {
    current: '',
    new: '',
    confirm: ''
  };

  // Restaurant Public Page Configuration
  configuration = {
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    themeColor: '#ff5630',
    tagline: 'Authentic South Indian Cuisine',
    description: 'Famous for authentic South Indian vegetarian cuisine with a legacy of over 60 years.',
    address: '394, East Arokiasamy Road, RS Puram, Coimbatore - 641002',
    galleryImages: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de',
      'https://images.unsplash.com/photo-1544148103-0773bf10d330',
      'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2'
    ] as string[],
    menuImages: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      'https://images.unsplash.com/photo-1473093226795-af9932fe5856'
    ] as string[]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.restaurantName = this.route.snapshot.paramMap.get('restaurantName') || '';

    // Responsive Check
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
      this.sidenavOpened = !this.isMobile;
      this.isSidebarOpen = !this.isMobile;
    });

    // Check if manager is logged in
    const managerToken = localStorage.getItem(`manager_${this.restaurantName}`);
    if (!managerToken) {
      this.router.navigate([this.restaurantName, 'admin']);
    }

    // Load saved settings & configuration
    const savedSettings = localStorage.getItem(`settings_${this.restaurantName}`);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Merge saved settings with defaults to ensure all fields exist
      this.settings = { ...this.settings, ...parsed };
    }

    const savedConfig = localStorage.getItem(`config_${this.restaurantName}`);
    if (savedConfig) {
      this.configuration = { ...this.configuration, ...JSON.parse(savedConfig) };
    }

    // Load profile logo if saved
    const savedProfile = localStorage.getItem(`profile_${this.restaurantName}`);
    if (savedProfile) {
      this.profile = JSON.parse(savedProfile);
    }
  }

  getTabTitle(): string {
    const titles: { [key: string]: string } = {
      overview: 'Dashboard Overview',
      queue: 'Queue Management',
      tables: 'Table Management',
      reservations: 'Reservations',
      analytics: 'Analytics',
      settings: 'Settings',
      profile: 'My Profile',
      configuration: 'Website Configuration'
    };
    return titles[this.activeTab] || 'Dashboard';
  }

  // ... (getOccupiedTables, toggleRestaurantStatus)

  // Profile Management
  saveProfile(): void {
    localStorage.setItem(`profile_${this.restaurantName}`, JSON.stringify(this.profile));
    this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  updateLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Mock uploading by creating a fake local URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.logoUrl = e.target.result;
        this.saveProfile();
      };
      reader.readAsDataURL(file);
    }
  }

  // Configuration Management
  saveConfiguration(): void {
    localStorage.setItem(`config_${this.restaurantName}`, JSON.stringify(this.configuration));
    this.snackBar.open('Website configuration saved!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  // Password Management
  changePassword(): void {
    if (this.passwordForm.new !== this.passwordForm.confirm) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }
    // Mock API call
    this.snackBar.open('Password changed successfully', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
    this.passwordForm = { current: '', new: '', confirm: '' };
  }

  // Image Management Helpers
  processFile(event: any, callback: (result: string) => void) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => callback(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  onGallerySelect(event: any) {
    this.processFile(event, (result) => {
      if (!this.configuration.galleryImages) this.configuration.galleryImages = [];
      this.configuration.galleryImages.push(result);
      this.saveConfiguration();
    });
  }

  onMenuSelect(event: any) {
    this.processFile(event, (result) => {
      if (!this.configuration.menuImages) this.configuration.menuImages = [];
      this.configuration.menuImages.push(result);
      this.saveConfiguration();
    });
  }

  removeGalleryImage(index: number) {
    this.configuration.galleryImages.splice(index, 1);
    this.saveConfiguration();
  }

  removeMenuImage(index: number) {
    this.configuration.menuImages.splice(index, 1);
    this.saveConfiguration();
  }

  getOccupiedTables(): number {
    return this.tables.filter(t => t.status === 'occupied').length;
  }

  toggleRestaurantStatus(): void {
    const status = this.restaurantOnline ? 'ONLINE' : 'OFFLINE';
    this.snackBar.open(`Restaurant is now ${status}`, 'Close', {
      duration: 3000,
      panelClass: this.restaurantOnline ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  // Queue Management
  seatCustomer(customer: QueueCustomer): void {
    const availableTable = this.tables.find(t => t.status === 'available' && t.capacity >= customer.partySize);

    if (availableTable) {
      availableTable.status = 'occupied';
      availableTable.currentGuest = customer.name;
      availableTable.occupiedSince = new Date();

      const index = this.queueList.indexOf(customer);
      this.queueList.splice(index, 1);

      this.snackBar.open(`${customer.name} seated at Table ${availableTable.number}`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      this.activeTab = 'tables';
    } else {
      this.snackBar.open('No available tables for this party size', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  removeFromQueue(customer: QueueCustomer): void {
    if (confirm(`Remove ${customer.name} from queue?`)) {
      const index = this.queueList.indexOf(customer);
      this.queueList.splice(index, 1);

      this.snackBar.open(`${customer.name} removed from queue`, 'Close', {
        duration: 2000
      });
    }
  }

  // Table Management
  markOccupied(table: Table): void {
    const guestName = prompt('Enter guest name:');
    if (guestName) {
      table.status = 'occupied';
      table.currentGuest = guestName;
      table.occupiedSince = new Date();

      this.snackBar.open(`Table ${table.number} marked as occupied`, 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    }
  }

  vacateTable(table: Table): void {
    if (confirm(`Vacate Table ${table.number}?`)) {
      table.status = 'available';
      table.currentGuest = undefined;
      table.occupiedSince = undefined;

      this.snackBar.open(`Table ${table.number} is now available`, 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });

      // Update revenue
      this.todayRevenue += Math.floor(Math.random() * 2000) + 500;
      this.analytics.customersServed++;
    }
  }

  viewReservation(table: Table): void {
    const reservation = this.reservations.find(r => r.id === table.reservationId);
    if (reservation) {
      this.snackBar.open(`Reservation: ${reservation.customerName} at ${reservation.time}`, 'Close', {
        duration: 4000
      });
      this.activeTab = 'reservations';
    }
  }

  // Reservation Management
  editReservation(reservation: Reservation): void {
    const newTime = prompt(`Edit reservation time for ${reservation.customerName}:`, reservation.time);
    if (newTime) {
      reservation.time = newTime;
      this.snackBar.open('Reservation updated successfully', 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    }
  }

  cancelReservation(reservation: Reservation): void {
    if (confirm(`Cancel reservation for ${reservation.customerName}?`)) {
      reservation.status = 'cancelled';

      // Free up the table
      const table = this.tables.find(t => t.number === reservation.tableNumber);
      if (table) {
        table.status = 'available';
        table.reservationId = undefined;
      }

      this.snackBar.open('Reservation cancelled', 'Close', {
        duration: 2000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // Settings
  saveSettings(): void {
    localStorage.setItem(`settings_${this.restaurantName}`, JSON.stringify(this.settings));
    this.snackBar.open('Settings saved successfully', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  logout(): void {
    localStorage.removeItem(`manager_${this.restaurantName}`);
    localStorage.removeItem(`managerData_${this.restaurantName}`);
    this.snackBar.open('Logged out successfully', 'Close', { duration: 2000 });
    this.router.navigate([this.restaurantName, 'admin']);
  }
}
