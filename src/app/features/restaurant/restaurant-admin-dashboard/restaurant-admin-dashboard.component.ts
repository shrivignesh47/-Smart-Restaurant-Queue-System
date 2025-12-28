import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.restaurantName = this.route.snapshot.paramMap.get('restaurantName') || '';

    // Check if manager is logged in
    const managerToken = localStorage.getItem(`manager_${this.restaurantName}`);
    if (!managerToken) {
      this.router.navigate([this.restaurantName, 'admin']);
    }

    // Load saved settings
    const savedSettings = localStorage.getItem(`settings_${this.restaurantName}`);
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    }
  }

  getTabTitle(): string {
    const titles: { [key: string]: string } = {
      overview: 'Dashboard Overview',
      queue: 'Queue Management',
      tables: 'Table Management',
      reservations: 'Reservations',
      analytics: 'Analytics',
      settings: 'Settings'
    };
    return titles[this.activeTab] || 'Dashboard';
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
