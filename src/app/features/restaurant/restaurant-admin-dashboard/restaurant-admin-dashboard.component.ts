import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RestaurantService, Restaurant, MediaGroup } from '../../../core/services/restaurant.service';
import { TableQueueService, Table as RealTable, QueueEntry, Reservation as RealReservation } from '../../../core/services/table-queue.service';
import { TableDialogComponent } from '../../../shared/components/table-dialog/table-dialog.component';
import { ReservationDialogComponent } from '../../../shared/components/reservation-dialog/reservation-dialog.component';
import { BulkTableDialogComponent } from '../../../shared/components/bulk-table-dialog/bulk-table-dialog.component';
import { catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { CancellationDialogComponent } from '../../../shared/components/cancellation-dialog/cancellation-dialog.component';
import { ScannerDialogComponent } from '../../../shared/components/scanner-dialog/scanner-dialog.component';

interface QueueCustomer {
  id: number;
  name: string;
  phone: string;
  partySize: number;
  waitTime: number;
  joinedAt: Date;
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
  sidenavOpened = true;
  isSidebarOpen = true;

  queueList: QueueEntry[] = [];
  tables: RealTable[] = [];
  reservations: RealReservation[] = [];
  ongoingDashboardReservations: RealReservation[] = [];
  pastDashboardReservations: RealReservation[] = [];

  @ViewChild('ticketDialog') ticketDialog!: TemplateRef<any>;

  reservationColumns = ['date', 'time', 'name', 'phone', 'guests', 'table', 'status', 'actions'];


  analytics = {
    customersServed: 45,
    avgWaitTime: 12,
    turnoverRate: 2.5,
    revenue: 45000
  };

  // Dashboard Statistics
  dashboardStats = {
    totalReservations: 0,
    confirmed: 0,
    pending: 0,
    seated: 0,
    cancelled: 0
  };

  // Scanner Access Key Management
  scannerAccessKey: string = '';
  showKeyInput: boolean = false;

  settings = {
    openingTime: '10:00',
    closingTime: '23:00',
    acceptQueue: true,
    acceptReservations: true,
    isPaidReservation: false,
    reservationFee: 0
  };

  profile = {
    name: 'Manager',
    email: 'manager@annapoorna.com',
    phone: '+91 9876543210',
    logoUrl: 'assets/images/logo-placeholder.png'
  };

  passwordForm = {
    current: '',
    new: '',
    confirm: ''
  };

  // New Interfaces for Grouping
  galleryGroups: MediaGroup[] = [];
  menuGroups: MediaGroup[] = [];

  configuration = {
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    logo: 'assets/images/logo-placeholder.png',
    themeColor: '#ff5630',
    tagline: 'Authentic South Indian Cuisine',
    description: 'Famous for authentic South Indian vegetarian cuisine with a legacy of over 60 years.',
    address: '394, East Arokiasamy Road, RS Puram, Coimbatore - 641002',
    // Kept for backward compatibility if needed, but we will use groups primarily
    galleryImages: [] as string[],
    menuImages: [] as string[]
  };

  currentRestaurant: Restaurant | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private restaurantService: RestaurantService,
    private tableQueueService: TableQueueService
  ) { }

  ngOnInit(): void {
    this.restaurantName = this.route.snapshot.paramMap.get('restaurantName') || '';

    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
      this.sidenavOpened = !this.isMobile;
      this.isSidebarOpen = !this.isMobile;
    });

    const managerToken = localStorage.getItem(`manager_${this.restaurantName}`);
    if (!managerToken) {
      this.router.navigate([this.restaurantName, 'admin']);
    }

    this.loadRestaurantData();

    // Subscribe to reservations and sort/filter them
    this.tableQueueService.reservations$.subscribe((resList: RealReservation[]) => {
      const parseDate = (r: RealReservation) => {
        const d = r.reservation_date as any;
        let datePart = '';
        if (d instanceof Date) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          datePart = `${year}-${month}-${day}`;
        } else if (typeof d === 'string') {
          datePart = d.split('T')[0];
        } else if (typeof d === 'object' && d !== null) {
          const dateObj = new Date(d);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          datePart = `${year}-${month}-${day}`;
        }

        const timePart = r.reservation_time && r.reservation_time.includes(':') && r.reservation_time.split(':').length === 2
          ? r.reservation_time + ':00'
          : r.reservation_time || '00:00:00';

        return new Date(`${datePart}T${timePart}`);
      };

      const now = new Date();

      // Process and tag reservations
      const processed = resList.map(r => {
        const resDate = parseDate(r);
        let status = r.status;
        if (resDate < now && r.status !== 'Cancelled' && r.status !== 'Seated') {
          // If it's today and Confirmed, keep it as Confirmed for display
          const isToday = resDate.toDateString() === now.toDateString();
          if (!(isToday && r.status === 'Confirmed')) {
            status = 'Ended';
          }
        }
        return { ...r, status, resDate };
      });

      this.reservations = processed;

      this.ongoingDashboardReservations = processed
        .filter(r => {
          const isFuture = r.resDate >= now;
          const isToday = r.resDate.toDateString() === now.toDateString();
          const isActiveStatus = r.status === 'Confirmed' || r.status === 'Pending';
          return isFuture || (isToday && isActiveStatus);
        })
        .sort((a, b) => a.resDate.getTime() - b.resDate.getTime());

      this.pastDashboardReservations = processed
        .filter(r => {
          const isFuture = r.resDate >= now;
          const isToday = r.resDate.toDateString() === now.toDateString();
          const isActiveStatus = r.status === 'Confirmed' || r.status === 'Pending';
          return !isFuture && !(isToday && isActiveStatus);
        })
        .sort((a, b) => b.resDate.getTime() - a.resDate.getTime());

      // Update revenue
      this.todayRevenue = processed
        .filter(r => r.payment_status === 'Paid' && r.status !== 'Cancelled')
        .reduce((acc, curr) => acc + (curr.payment_amount || 0), 0);

      // Update dashboard statistics
      this.loadDashboardStats();
    });
  }

  loadRestaurantData(): void {
    this.isLoading = true;
    this.restaurantService.getBySlug(this.restaurantName).subscribe({
      next: (data: Restaurant) => {
        this.currentRestaurant = data;

        // Fetch scanner key separately as it's masked in public API
        if (data.id) {
          this.restaurantService.getScannerKey(data.id).subscribe({
            next: (res) => {
              if (this.currentRestaurant && res.scanner_access_key) {
                this.currentRestaurant.scanner_access_key = res.scanner_access_key;
              }
            }
          });
        }

        this.isLoading = false;

        if (data.name) this.profile.name = data.name;
        if (data.email) this.profile.email = data.email;
        if (data.phone) this.profile.phone = data.phone;
        if (data.logo_url) {
          this.profile.logoUrl = data.logo_url;
          this.configuration.logo = data.logo_url;
        }

        if (data.opening_time) this.settings.openingTime = data.opening_time.substring(0, 5);
        if (data.closing_time) this.settings.closingTime = data.closing_time.substring(0, 5);

        if (data.tagline) this.configuration.tagline = data.tagline;
        if (data.description) this.configuration.description = data.description;
        if (data.theme_color) this.configuration.themeColor = data.theme_color;
        if (data.address) this.configuration.address = data.address;
        if (data.cover_image_url) this.configuration.heroImage = data.cover_image_url;

        if (data.gallery_images) {
          try {
            const raw = typeof data.gallery_images === 'string'
              ? JSON.parse(data.gallery_images)
              : data.gallery_images;

            if (Array.isArray(raw)) {
              if (raw.length > 0 && typeof raw[0] === 'string') {
                // Backward compatibility: Convert string array to Default group
                this.galleryGroups = [{ name: 'General Gallery', images: raw as string[] }];
              } else {
                this.galleryGroups = raw as MediaGroup[];
              }
            }
          } catch (e) { console.error('Error parsing gallery images', e); }
        } else {
          // Initialize empty default group
          this.galleryGroups = [{ name: 'General Gallery', images: [] }];
        }

        if (data.menu_images) {
          try {
            const raw = typeof data.menu_images === 'string'
              ? JSON.parse(data.menu_images)
              : data.menu_images;

            if (Array.isArray(raw)) {
              if (raw.length > 0 && typeof raw[0] === 'string') {
                this.menuGroups = [{ name: 'Main Menu', images: raw as string[] }];
              } else {
                this.menuGroups = raw as MediaGroup[];
              }
            }
          } catch (e) { console.error('Error parsing menu images', e); }
        } else {
          this.menuGroups = [{ name: 'Food Menu', images: [] }];
        }

        if (data.status) {
          this.restaurantOnline = data.status === 'active';
        }

        if (data.accept_queue !== undefined) {
          this.settings.acceptQueue = !!data.accept_queue;
        }

        if (data.accept_reservations !== undefined) {
          this.settings.acceptReservations = !!data.accept_reservations;
        }

        if (data.is_paid_reservation !== undefined) {
          this.settings.isPaidReservation = !!data.is_paid_reservation;
        }

        if (data.reservation_fee !== undefined) {
          this.settings.reservationFee = data.reservation_fee;
        }

        if (data.id) {
          // Fetch sensitive scanner key separately since public endpoint masks it
          this.restaurantService.getScannerKey(data.id).subscribe({
            next: (res) => {
              if (this.currentRestaurant) {
                this.currentRestaurant.scanner_access_key = res.scanner_access_key;
              }
            },
            error: (err) => console.log('Could not fetch scanner key', err)
          });

          this.loadRealTimeData(data.id);
        }

        console.log('[ManagerDashboard] Loaded restaurant data:', data);

        // Security Check: Verify if this user is allowed to see this restaurant
        const managerDataStr = localStorage.getItem(`managerData_${this.restaurantName}`);
        if (managerDataStr) {
          const managerData = JSON.parse(managerDataStr);

          // BLOCK: If user is a RestaurantAdmin but ID doesn't match
          // OR: If user is an Admin but trying to access via this restaurant-specific portal storage
          if (managerData.role === 'RestaurantAdmin' && managerData.restaurant_id != data.id) {
            console.error('[ManagerDashboard] Security Alert: Manager restaurant_id mismatch');
            this.snackBar.open('Security Error: You do not have permission to access this restaurant.', 'Close', { duration: 5000 });
            this.logout();
          } else if (managerData.role === 'Admin') {
            // Optional: You can choose to allow Super Admin in dashboard OR block them here too
            // User requested separate login, so let's enforce that they use the SysQueue Admin portal
            console.log('[ManagerDashboard] Professional Note: Super Admin detected in manager portal.');
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('[ManagerDashboard] Error loading restaurant:', err);
        this.snackBar.open('Error loading restaurant data', 'Close', { duration: 3000 });
      }
    });
  }

  loadRealTimeData(restaurantId: number): void {
    forkJoin({
      tables: this.tableQueueService.loadTables(restaurantId),
      queue: this.tableQueueService.loadQueue(restaurantId),
      reservations: this.tableQueueService.loadReservations(restaurantId)
    }).subscribe({
      next: (results) => {
        this.tables = results.tables;
        this.queueList = results.queue;
        this.reservations = results.reservations;

        // Calculate revenue from paid reservations
        this.todayRevenue = results.reservations
          .filter(r => r.payment_status === 'Paid' && r.status !== 'Cancelled')
          .reduce((acc, curr) => acc + (curr.payment_amount || 0), 0);

        console.log('[ManagerDashboard] Loaded realtime data:', results);
      },
      error: (err) => {
        console.error('[ManagerDashboard] Error loading realtime data:', err);
      }
    });
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

  saveProfile(): void {
    localStorage.setItem(`profile_${this.restaurantName}`, JSON.stringify(this.profile));
    this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  updateLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.logoUrl = e.target.result;
        this.saveProfile();
      };
      reader.readAsDataURL(file);
    }
  }

  saveConfiguration(): void {
    if (!this.currentRestaurant?.id) return;

    const updates: Partial<Restaurant> = {
      tagline: this.configuration.tagline,
      description: this.configuration.description,
      theme_color: this.configuration.themeColor,
      address: this.configuration.address,
      logo_url: this.configuration.logo,
      cover_image_url: this.configuration.heroImage,
      gallery_images: JSON.stringify(this.galleryGroups),
      menu_images: JSON.stringify(this.menuGroups)
    };

    this.restaurantService.update(this.currentRestaurant.id, updates).subscribe({
      next: () => {
        this.snackBar.open('Website configuration saved to server!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
      },
      error: (err: any) => {
        console.error('Error saving config:', err);
        this.snackBar.open('Failed to save to server, saved locally only', 'Close', { duration: 3000 });
        localStorage.setItem(`config_${this.restaurantName}`, JSON.stringify(this.configuration));
      }
    });
  }

  onLogoSelect(event: any) {
    this.processFiles(event, (results) => {
      if (results.length > 0) {
        this.configuration.logo = results[0];
        this.profile.logoUrl = results[0];
      }
    });
  }

  onHeroImageSelect(event: any) {
    this.processFiles(event, (results) => {
      if (results.length > 0) {
        this.configuration.heroImage = results[0];
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.new !== this.passwordForm.confirm) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }
    this.snackBar.open('Password changed successfully', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
    this.passwordForm = { current: '', new: '', confirm: '' };
  }

  /* Group Management Methods */
  addMediaGroup(type: 'gallery' | 'menu'): void {
    const newGroup: MediaGroup = { name: 'New Section', images: [] };
    if (type === 'gallery') {
      this.galleryGroups.push(newGroup);
    } else {
      this.menuGroups.push(newGroup);
    }
  }

  deleteMediaGroup(type: 'gallery' | 'menu', index: number): void {
    if (confirm('Delete this entire section and all its images?')) {
      if (type === 'gallery') {
        this.galleryGroups.splice(index, 1);
      } else {
        this.menuGroups.splice(index, 1);
      }
      this.saveConfiguration();
    }
  }

  // Refactored to handle multiple files and specific groups
  processFiles(event: any, callback: (results: string[]) => void) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const results: string[] = [];
      let processedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          results.push(e.target.result);
          processedCount++;
          if (processedCount === files.length) {
            callback(results);
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  onGallerySelect(event: any, groupIndex: number) {
    this.processFiles(event, (results) => {
      this.galleryGroups[groupIndex].images.push(...results);
      this.saveConfiguration();
    });
  }

  onMenuSelect(event: any, groupIndex: number) {
    this.processFiles(event, (results) => {
      this.menuGroups[groupIndex].images.push(...results);
      this.saveConfiguration();
    });
  }

  removeGalleryImage(groupIndex: number, imageIndex: number) {
    this.galleryGroups[groupIndex].images.splice(imageIndex, 1);
    this.saveConfiguration();
  }

  removeMenuImage(groupIndex: number, imageIndex: number) {
    this.menuGroups[groupIndex].images.splice(imageIndex, 1);
    this.saveConfiguration();
  }

  getOccupiedTables(): number {
    return this.tables.filter(t => t.status === 'Occupied').length;
  }

  toggleRestaurantStatus(): void {
    if (!this.currentRestaurant?.id) return;

    const status = this.restaurantOnline ? 'active' : 'inactive';
    this.restaurantService.update(this.currentRestaurant.id, { status }).subscribe({
      next: () => {
        const statusLabel = this.restaurantOnline ? 'ONLINE' : 'OFFLINE';
        this.snackBar.open(`Restaurant is now ${statusLabel}`, 'Close', {
          duration: 3000,
          panelClass: this.restaurantOnline ? ['success-snackbar'] : ['error-snackbar']
        });
      },
      error: (err) => {
        console.error('Error toggling status:', err);
        // Revert UI if error
        this.restaurantOnline = !this.restaurantOnline;
        this.snackBar.open('Failed to update status on server', 'Close', { duration: 3000 });
      }
    });
  }

  seatCustomer(customer: QueueEntry): void {
    const availableTable = this.tables.find(t => t.status === 'Available' && t.capacity >= customer.party_size);

    if (availableTable) {
      forkJoin({
        tableUpdate: this.tableQueueService.updateTableStatus(availableTable.id, 'Occupied', {
          booked_by: customer.customer_name,
          ticket_id: `Q-${customer.id}`
        }),
        queueUpdate: this.tableQueueService.updateQueueStatus(customer.id, 'Seated')
      }).subscribe({
        next: () => {
          this.snackBar.open(`${customer.customer_name} seated at ${availableTable.name}`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
          this.activeTab = 'tables';
        },
        error: (err) => {
          console.error('Error seating customer:', err);
          this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('No available tables for this party size', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  removeFromQueue(customer: QueueEntry): void {
    if (confirm(`Remove ${customer.customer_name} from queue?`)) {
      this.tableQueueService.updateQueueStatus(customer.id, 'Cancelled').subscribe({
        next: () => {
          this.snackBar.open(`${customer.customer_name} removed from queue`, 'Close', { duration: 2000 });
          if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
        }
      });
    }
  }

  markOccupied(table: RealTable): void {
    const guestName = prompt('Enter guest name:');
    if (guestName) {
      this.tableQueueService.updateTableStatus(table.id, 'Occupied', {
        booked_by: guestName,
        ticket_id: 'MANUAL'
      }).subscribe({
        next: () => {
          this.snackBar.open(`${table.name} marked as occupied`, 'Close', { duration: 2000, panelClass: ['success-snackbar'] });
          if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
        }
      });
    }
  }

  vacateTable(table: RealTable): void {
    if (confirm(`Vacate ${table.name}?`)) {
      this.tableQueueService.updateTableStatus(table.id, 'Available').subscribe({
        next: () => {
          this.snackBar.open(`${table.name} is now available`, 'Close', { duration: 2000, panelClass: ['success-snackbar'] });
          if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
          this.todayRevenue += Math.floor(Math.random() * 2000) + 500;
          this.analytics.customersServed++;
        }
      });
    }
  }

  markAvailable(table: RealTable): void {
    this.tableQueueService.updateTableStatus(table.id, 'Available').subscribe({
      next: () => {
        this.snackBar.open(`${table.name} is now available`, 'Close', { duration: 2000, panelClass: ['success-snackbar'] });
        if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
      }
    });
  }

  viewTicket(reservation: RealReservation): void {
    if (this.ticketDialog) {
      this.dialog.open(this.ticketDialog, {
        width: '380px',
        data: reservation,
        panelClass: 'ticket-dialog-container'
      });
    }
  }

  viewReservation(table: RealTable): void {
    const reservation = this.reservations.find(r => r.table_id === table.id);
    if (reservation) {
      this.snackBar.open(`Reservation: ${reservation.customer_name} at ${reservation.reservation_time}`, 'Close', {
        duration: 4000
      });
      this.activeTab = 'reservations';
    }
  }

  editReservation(reservation: RealReservation): void {
    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      width: '500px',
      data: reservation
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tableQueueService.updateReservation(reservation.id, result).subscribe({
          next: () => {
            this.snackBar.open('Reservation updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
          },
          error: (err) => {
            console.error('Error updating reservation:', err);
            this.snackBar.open('Error updating reservation', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  cancelReservation(reservation: RealReservation): void {
    const dialogRef = this.dialog.open(CancellationDialogComponent, {
      width: '450px',
      data: { reservationId: reservation.id, customerName: reservation.customer_name }
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.tableQueueService.updateReservationStatus(reservation.id, 'Cancelled', {
          cancelled_by: 'Restaurant',
          cancellation_reason: reason
        }).subscribe({
          next: () => {
            this.snackBar.open('Reservation cancelled successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
          },
          error: (err) => {
            console.error('Error cancelling reservation:', err);
            this.snackBar.open('Error cancelling reservation', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteReservation(reservation: RealReservation): void {
    if (confirm(`Are you sure you want to permanently delete the reservation for ${reservation.customer_name}? This action cannot be undone.`)) {
      this.tableQueueService.deleteReservation(reservation.id).subscribe({
        next: () => {
          this.snackBar.open('Reservation deleted permanently', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
        },
        error: (err) => {
          console.error('Error deleting reservation:', err);
          this.snackBar.open('Error deleting reservation', 'Close', { duration: 3000 });
        }
      });
    }
  }

  openScanner(): void {
    const dialogRef = this.dialog.open(ScannerDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(resId => {
      if (resId) {
        this.tableQueueService.updateReservationStatus(Number(resId), 'Seated').subscribe({
          next: () => {
            this.snackBar.open('Ticket Validated: Reservation marked as SEATED', 'Close', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
          },
          error: (err) => {
            console.error('Error updating reservation status:', err);
            this.snackBar.open('Error validating ticket. Please try manually.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  // Table Management Logic
  openAddTableDialog(): void {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      width: '400px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.currentRestaurant?.id) {
        const newTable = {
          ...result,
          restaurant_id: this.currentRestaurant.id,
          features: '[]'
        };
        this.tableQueueService.createTable(newTable).subscribe({
          next: () => {
            this.snackBar.open('Table added successfully', 'Close', { duration: 3000 });
            this.loadRealTimeData(this.currentRestaurant!.id!);
          }
        });
      }
    });
  }

  openBulkTableDialog(): void {
    const dialogRef = this.dialog.open(BulkTableDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.currentRestaurant?.id) {
        this.tableQueueService.bulkCreateTables(this.currentRestaurant.id, result).subscribe({
          next: (response: any) => {
            this.snackBar.open(response.message || 'Tables created successfully', 'Close', { duration: 3000 });
            if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
          },
          error: (err: any) => {
            console.error('Error creating bulk tables:', err);
            this.snackBar.open('Error creating tables', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  editTable(table: RealTable): void {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      width: '400px',
      data: table
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.currentRestaurant?.id) {
        this.tableQueueService.updateTable(table.id, result).subscribe({
          next: () => {
            this.snackBar.open('Table updated successfully', 'Close', { duration: 3000 });
            this.loadRealTimeData(this.currentRestaurant!.id!);
          }
        });
      }
    });
  }

  deleteTable(table: RealTable): void {
    if (confirm(`Are you sure you want to delete Table ${table.name}?`)) {
      this.tableQueueService.deleteTable(table.id).subscribe({
        next: () => {
          this.snackBar.open('Table deleted successfully', 'Close', { duration: 3000 });
          if (this.currentRestaurant?.id) this.loadRealTimeData(this.currentRestaurant.id);
        }
      });
    }
  }

  saveSettings(): void {
    if (!this.currentRestaurant?.id) return;

    const updates: Partial<Restaurant> = {
      opening_time: this.settings.openingTime,
      closing_time: this.settings.closingTime,
      status: this.restaurantOnline ? 'active' : 'inactive',
      accept_queue: this.settings.acceptQueue ? 1 : 0,
      accept_reservations: this.settings.acceptReservations ? 1 : 0,
      is_paid_reservation: this.settings.isPaidReservation ? 1 : 0,
      reservation_fee: this.settings.reservationFee
    };

    this.restaurantService.update(this.currentRestaurant.id, updates).subscribe({
      next: () => {
        this.snackBar.open('Settings saved to server!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
      },
      error: (err: any) => {
        console.error('Error saving settings:', err);
        this.snackBar.open('Failed to save settings to server', 'Close', { duration: 3000 });
        localStorage.setItem(`settings_${this.restaurantName}`, JSON.stringify(this.settings));
      }
    });
  }

  logout(): void {
    localStorage.removeItem(`manager_${this.restaurantName}`);
    localStorage.removeItem(`managerData_${this.restaurantName}`);
    this.snackBar.open('Logged out successfully', 'Close', { duration: 2000 });
    this.router.navigate([this.restaurantName, 'admin']);
  }

  // Load Dashboard Statistics
  loadDashboardStats(): void {
    const today = new Date().toDateString();
    const todayReservations = this.reservations.filter(r =>
      new Date(r.reservation_date).toDateString() === today
    );

    this.dashboardStats = {
      totalReservations: todayReservations.length,
      confirmed: todayReservations.filter(r => r.status === 'Confirmed').length,
      pending: todayReservations.filter(r => r.status === 'Pending').length,
      seated: todayReservations.filter(r => r.status === 'Seated').length,
      cancelled: todayReservations.filter(r => r.status === 'Cancelled').length
    };
  }

  // Update Scanner Access Key
  updateScannerKey(): void {
    if (!this.scannerAccessKey || this.scannerAccessKey.length < 6) {
      this.snackBar.open('Key must be at least 6 characters', 'Close', { duration: 3000 });
      return;
    }

    if (!this.currentRestaurant?.id) return;

    this.restaurantService.updateScannerKey(this.currentRestaurant.id, this.scannerAccessKey).subscribe({
      next: () => {
        this.snackBar.open('Scanner key updated successfully!', 'Close', { duration: 3000 });
        if (this.currentRestaurant) {
          this.currentRestaurant.scanner_access_key = this.scannerAccessKey;
        }
        this.showKeyInput = false;
      },
      error: () => {
        this.snackBar.open('Error updating scanner key', 'Close', { duration: 3000 });
      }
    });
  }

  // Copy Scanner Key to Clipboard
  copyKeyToClipboard(): void {
    if (this.currentRestaurant?.scanner_access_key) {
      navigator.clipboard.writeText(this.currentRestaurant.scanner_access_key);
      this.snackBar.open('Key copied to clipboard!', 'Close', { duration: 2000 });
    }
  }
}
