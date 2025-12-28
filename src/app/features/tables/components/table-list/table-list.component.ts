import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingDialogComponent } from '../../../../shared/components/booking-dialog/booking-dialog.component';
import { AuthService } from '../../../../core/auth.service';

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: string;
  type: string;
  features: string[];
  bookedBy?: string;
  ticketId?: string;
}

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

  tables: Table[] = [
    { id: 1, name: 'Table 1', capacity: 2, status: 'Available', type: 'Indoor', features: ['Near Window', 'Quiet'] },
    { id: 2, name: 'Table 2', capacity: 4, status: 'Occupied', type: 'Indoor', features: ['Booth', 'TV View'] },
    { id: 3, name: 'Table 3', capacity: 6, status: 'Reserved', type: 'Window', features: ['Scenic View', 'Large'] },
    { id: 4, name: 'Table 4', capacity: 2, status: 'Available', type: 'Outdoor', features: ['Smoking Area', 'Garden View'] },
    { id: 5, name: 'Table 5', capacity: 4, status: 'Available', type: 'Outdoor', features: ['Heated', 'Umbrella'] },
    { id: 6, name: 'Table 6', capacity: 8, status: 'Available', type: 'Indoor', features: ['Private Area', 'Round Table'] },
  ];

  myBookings: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Try to get from input, if not, get from route
    if (!this.restaurantId) {
      this.restaurantId = this.getRestaurantNameFromRoute();
    }
    
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
  }

  get isAllFull(): boolean {
    if (!this.restaurantId) return false;
    return this.tables.every(t => t.status !== 'Available');
  }

  openInfo(table: any) {
    this.selectedTable = table;
    this.dialog.open(this.infoDialog, {
      width: '300px'
    });
  }

  handleTableAction(table: any) {
    if (table.status === 'Available') {
      this.bookTable(table);
    } else {
      this.promptJoinQueue(table);
    }
  }

  bookTable(table: Table) {
    const dialogRef = this.dialog.open(BookingDialogComponent, {
      width: '400px',
      data: { tableName: table.name, tableId: table.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Mock successful booking
        table.status = 'Reserved';
        table.bookedBy = result.name;
        table.ticketId = result.ticketId;
        
        this.snackBar.open(`Success! Booked for ${result.name} (Ticket: ${result.ticketId})`, 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  promptJoinQueue(table: any) {
    const snackBarRef = this.snackBar.open(
      `${table.name} is currently ${table.status}. Would you like to join the queue?`, 
      'Join Queue', 
      { duration: 5000 }
    );

    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['../queue'], { relativeTo: this.route });
    });
  }

  joinGeneralQueue() {
    this.router.navigate(['../queue'], { relativeTo: this.route });
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
}
