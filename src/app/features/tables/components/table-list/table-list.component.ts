import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JoinQueueDialogComponent } from '../../../../shared/components/join-queue-dialog/join-queue-dialog.component';
import { QueueStatusDialogComponent } from '../../../../shared/components/queue-status-dialog/queue-status-dialog.component';
import { AuthService } from '../../../../core/auth.service';
import { TableQueueService, Table } from '../../../../core/services/table-queue.service';
import { RestaurantService, Restaurant } from '../../../../core/services/restaurant.service';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss']
})
export class TableListComponent implements OnInit {
  @Input() restaurantId: string = '';
  @ViewChild('infoDialog') infoDialog!: TemplateRef<any>;

  selectedTable: any = null;
  currentUser: any = null;
  tables: Table[] = [];
  myBookings: any[] = [];
  showAvailabilityCheck = true;
  partySize: number = 2;

  // Track user's bookings and queue entries
  myBookedTables: Set<number> = new Set();
  myQueueEntries: Map<number, string> = new Map(); // tableId -> queueId
  generalQueueEntryId: string | null = null;
  private queueSubscription?: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private tableQueueService: TableQueueService,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit(): void {
    // Try to get from input, if not, get from route
    if (!this.restaurantId) {
      this.restaurantId = this.getRestaurantNameFromRoute();
    }

    // Load restaurant-specific tables
    if (this.restaurantId) {
      // Find restaurant object to get numeric ID
      this.restaurantService.getBySlug(this.restaurantId).subscribe(res => {
        if (res && res.id) {
          this.tableQueueService.loadTables(res.id).subscribe();
        }
      });
    }

    // Subscribe to tables
    this.tableQueueService.tables$.subscribe(tables => {
      this.tables = tables;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser && !this.restaurantId) {
        // Mock data for "My Tables"
        this.myBookings = [
          {
            restaurantName: 'The Gourmet Kitchen',
            tableName: 'Table 3',
            ticketId: 'TKT-9X2Y1Z',
            time: '19:00 Today',
            guests: 4,
            status: 'Confirmed'
          },
          {
            restaurantName: 'Sushi Zen',
            tableName: 'Table 5',
            ticketId: 'TKT-8A1B2C',
            time: '20:30 Tomorrow',
            guests: 2,
            status: 'Pending'
          }
        ];
      }
    });

    // Check if we should show availability check on arrival
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['checkAvailability'] === 'true') {
      setTimeout(() => this.checkAvailabilityOnArrival(), 500);
    }
  }

  checkAvailabilityOnArrival() {
    const result = this.tableQueueService.checkAvailabilityAndSuggest(this.partySize);

    if (result.length > 0) {
      this.snackBar.open(
        `Great news! We have ${result.length} table(s) available for ${this.partySize} ${this.partySize === 1 ? 'guest' : 'guests'}.`,
        'OK',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
    } else {
      // No tables available - automatically navigate to queue
      const snackBarRef = this.snackBar.open(
        `No tables currently available for ${this.partySize} ${this.partySize === 1 ? 'guest' : 'guests'}. Redirecting to queue...`,
        'Go Now',
        { duration: 5000, panelClass: ['warning-snackbar'] }
      );

      // Auto-navigate after 2 seconds or when user clicks
      const autoNavigate = setTimeout(() => {
        this.navigateToQueue();
      }, 2000);

      snackBarRef.onAction().subscribe(() => {
        clearTimeout(autoNavigate);
        this.navigateToQueue();
      });

      snackBarRef.afterDismissed().subscribe(() => {
        clearTimeout(autoNavigate);
      });
    }
  }

  get isAllFull(): boolean {
    if (!this.restaurantId) return false;
    return this.tables.every(t => t.status !== 'Available');
  }

  get availableTablesCount(): number {
    return this.tables.filter(t => t.status === 'Available').length;
  }

  openInfo(table: any) {
    this.selectedTable = table;
    this.dialog.open(this.infoDialog, {
      width: '300px'
    });
  }

  handleTableAction(table: Table) {
    this.promptJoinQueue(table);
  }


  promptJoinQueue(table: Table) {
    // Open dialog for table-specific queue
    const dialogRef = this.dialog.open(JoinQueueDialogComponent, {
      width: '500px',
      data: {
        tableSpecific: true,
        tableId: table.id,
        tableName: table.name,
        capacity: table.capacity,
        status: table.status,
        queueSize: this.tableQueueService.getAvailableTables(table.capacity).length // Mock logic updated
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'join') {
        this.restaurantService.getBySlug(this.restaurantId).subscribe(res => {
          if (res && res.id) {
            this.tableQueueService.joinQueue({
              restaurant_id: res.id,
              customer_name: result.customerName,
              party_size: result.partySize,
              contact_info: 'User-Input' // Placeholder
            }).subscribe(newEntry => {
              this.myQueueEntries.set(table.id, newEntry.id.toString());
              this.openQueueStatusDialog(newEntry.id.toString());
            });
          }
        });
      }
    });
  }

  joinGeneralQueue() {
    // Open dialog for general queue
    const dialogRef = this.dialog.open(JoinQueueDialogComponent, {
      width: '500px',
      data: {
        tableSpecific: false,
        queueSize: this.tables.length // Simplified
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'join') {
        this.restaurantService.getBySlug(this.restaurantId).subscribe(res => {
          if (res && res.id) {
            this.tableQueueService.joinQueue({
              restaurant_id: res.id,
              customer_name: result.customerName,
              party_size: result.partySize
            }).subscribe(newEntry => {
              this.generalQueueEntryId = newEntry.id.toString();
              this.openQueueStatusDialog(newEntry.id.toString());
            });
          }
        });
      }
    });
  }

  navigateToQueue() {
    if (this.restaurantId) {
      this.router.navigate(['../queue'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/queue']);
    }
  }

  navigateToReservation() {
    if (this.restaurantId) {
      this.router.navigate(['../reservation'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/reservation']);
    }
  }

  openQueueStatusDialog(queueId: string) {
    this.dialog.open(QueueStatusDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { queueId },
      disableClose: false
    });
  }

  private getRestaurantNameFromRoute(): string {
    let route = this.route;
    while (route) {
      if (route.snapshot.paramMap.has('restaurantName')) {
        return route.snapshot.paramMap.get('restaurantName') || '';
      }
      if (!route.parent) break;
      route = route.parent;
    }
    return '';
  }

  getTableStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'available': return 'status-available';
      case 'occupied': return 'status-occupied';
      case 'reserved': return 'status-reserved';
      default: return '';
    }
  }

  // Check if current user booked this table
  isMyBooking(table: Table): boolean {
    if (!this.currentUser || !table.bookedBy) return false;
    return this.myBookedTables.has(table.id) ||
      table.bookedBy.toLowerCase().includes(this.currentUser.name?.toLowerCase() || '');
  }

  // Get user's queue position for a table
  getMyQueuePosition(table: Table): number | null {
    const queueId = this.myQueueEntries.get(table.id);
    if (!queueId) return null;

    const queue = this.tableQueueService.getQueue();
    const entry = queue.find(q => q.id.toString() === queueId);
    return entry ? entry.position : null;
  }

  // Get user's estimated wait time for a table
  getMyQueueWaitTime(table: Table): number {
    const queueId = this.myQueueEntries.get(table.id);
    if (!queueId) return 0;

    const queue = this.tableQueueService.getQueue();
    const entry = queue.find(q => q.id.toString() === queueId);
    return entry ? entry.estimated_wait_time : 0;
  }

  // View queue status for a specific table
  viewMyQueueStatus(table: Table) {
    const queueId = this.myQueueEntries.get(table.id);
    if (queueId) {
      this.openQueueStatusDialog(queueId);
    }
  }

  getGeneralQueuePosition(): number | null {
    if (!this.generalQueueEntryId) return null;
    const queue = this.tableQueueService.getQueue();
    const entry = queue.find(q => q.id.toString() === this.generalQueueEntryId);
    return entry ? entry.position : null;
  }

  getGeneralQueueWaitTime(): number {
    if (!this.generalQueueEntryId) return 0;
    const queue = this.tableQueueService.getQueue();
    const entry = queue.find(q => q.id.toString() === this.generalQueueEntryId);
    return entry ? entry.estimated_wait_time : 0;
  }

  viewGeneralQueueStatus() {
    if (this.generalQueueEntryId) {
      this.openQueueStatusDialog(this.generalQueueEntryId);
    }
  }
}
