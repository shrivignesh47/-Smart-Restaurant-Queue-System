import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, User } from '../../../../core/services/auth.service';
import { TableQueueService, Reservation } from '../../../../core/services/table-queue.service';
import { RestaurantService, Restaurant } from '../../../../core/services/restaurant.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MobileLoginDialogComponent } from '../../../../shared/components/mobile-login-dialog/mobile-login-dialog.component';
import { MockPaymentDialogComponent } from '../../../../shared/components/mock-payment-dialog/mock-payment-dialog.component';
import { CancellationDialogComponent } from '../../../../shared/components/cancellation-dialog/cancellation-dialog.component';
import { TicketDialogComponent } from '../../../../shared/components/ticket-dialog/ticket-dialog.component';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  @Input() restaurantId: string = '';

  currentUser: User | null = null;
  myReservations: Reservation[] = [];
  reservationForm: FormGroup;
  availableTables: any[] = [];
  isLoadingTables = false;
  viewMode: 'new' | 'history' = 'history';

  ongoingReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];

  minDate: Date;
  timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tableQueueService: TableQueueService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private dialog: MatDialog
  ) {
    // Set minimum date to today
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0);

    this.reservationForm = this.fb.group({
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', Validators.required],
      partySize: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      reservationDate: [this.minDate, Validators.required],
      reservationTime: ['', Validators.required],
      tableId: [null, Validators.required],
      specialRequests: ['']
    });

    // Watch for date/time changes to load available tables
    this.reservationForm.get('reservationDate')?.valueChanges.subscribe(() => this.loadAvailableTables());
    this.reservationForm.get('reservationTime')?.valueChanges.subscribe(() => this.loadAvailableTables());
    this.reservationForm.get('partySize')?.valueChanges.subscribe(() => this.loadAvailableTables());
  }

  ngOnInit(): void {
    if (!this.restaurantId) {
      this.restaurantId = this.getRestaurantNameFromRoute();
    }

    // Default to history if global view, otherwise new
    this.viewMode = this.restaurantId ? 'new' : 'history';

    this.authService.user$.subscribe(user => {
      this.currentUser = user;

      if (this.currentUser) {
        this.reservationForm.patchValue({
          customerName: this.currentUser.name,
          customerEmail: this.currentUser.email || '',
          customerPhone: this.currentUser.contact_info || ''
        });

        this.loadMyReservations();
      }
    });

    // Subscribe to reservations and sort them
    this.tableQueueService.reservations$.subscribe((allReservations: Reservation[]) => {
      // Filter for current user only (by ID or Phone) for privacy and accuracy
      const reservations = this.currentUser
        ? allReservations.filter(r =>
          Number(r.user_id) === Number(this.currentUser?.id) ||
          (r.customer_phone && r.customer_phone === this.currentUser?.contact_info)
        )
        : [];

      const parseDate = (r: Reservation) => {
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
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      // Process and tag reservations
      const processedReservations = reservations.map(r => {
        const resDate = parseDate(r);
        let status = r.status;

        // Only mark as Ended if it's REALLY old (not today) or if it's past and not Confirmed/Seated/Cancelled
        // BUT if it's Confirmed, we want to see it as Confirmed even if slightly past
        if (resDate < now && r.status !== 'Cancelled' && r.status !== 'Seated') {
          // If it's today and Confirmed, keep it as Confirmed
          const isToday = resDate.toDateString() === now.toDateString();
          if (!(isToday && r.status === 'Confirmed')) {
            status = 'Ended';
          }
        }
        return { ...r, status, resDate };
      });

      // Original array sorted by date (All tab)
      this.myReservations = [...processedReservations].sort((a, b) => b.resDate.getTime() - a.resDate.getTime());

      // Ongoing: Future reservations OR any Confirmed/Pending reservation for today (even if time passed)
      this.ongoingReservations = processedReservations
        .filter(r => {
          const isFuture = r.resDate >= now;
          const isToday = r.resDate.toDateString() === now.toDateString();
          const isActiveStatus = r.status === 'Confirmed' || r.status === 'Pending';

          // Show if in future OR if it's an active booking for today (even if past its time)
          // Also show recently cancelled ones if they were for today/future
          return isFuture || (isToday && isActiveStatus) || (r.status === 'Cancelled' && isFuture);
        })
        .sort((a, b) => a.resDate.getTime() - b.resDate.getTime());

      // Past: Anything where time has passed AND not in ongoing
      const ongoingIds = new Set(this.ongoingReservations.map(r => r.id));
      this.pastReservations = processedReservations
        .filter(r => !ongoingIds.has(r.id) || r.status === 'Ended' || r.status === 'Seated')
        .filter(r => r.resDate < now || r.status === 'Ended' || r.status === 'Seated')
        .sort((a, b) => b.resDate.getTime() - a.resDate.getTime());
    });
  }

  loadAvailableTables() {
    const date = this.reservationForm.get('reservationDate')?.value;
    const time = this.reservationForm.get('reservationTime')?.value;
    const partySize = this.reservationForm.get('partySize')?.value;

    if (!date || !time || !this.restaurantId) return;

    this.isLoadingTables = true;
    const formattedDate = new Date(date).toISOString().split('T')[0];

    this.restaurantService.getBySlug(this.restaurantId).subscribe(res => {
      if (res.id) {
        this.tableQueueService.fetchAvailableTablesForSlot(res.id, formattedDate, time).subscribe({
          next: (tables) => {
            this.availableTables = tables.filter(t => t.capacity >= partySize);
            this.isLoadingTables = false;

            const selectedTableId = this.reservationForm.get('tableId')?.value;
            if (selectedTableId && !this.availableTables.find(t => t.id === selectedTableId)) {
              this.reservationForm.patchValue({ tableId: null });
            }
          },
          error: () => {
            this.isLoadingTables = false;
          }
        });
      }
    });
  }

  loadMyReservations() {
    if (this.currentUser) {
      this.tableQueueService.loadUserReservations(this.currentUser.id).subscribe();
    }
  }

  submitReservation() {
    if (this.reservationForm.invalid) {
      this.snackBar.open('Please fill in all required fields and select a table', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.reservationForm.value;
    const reservationDate = new Date(formValue.reservationDate);

    // Allow today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      this.snackBar.open('Reservations cannot be for past dates.', 'Close', { duration: 5000, panelClass: ['warning-snackbar'] });
      return;
    }

    this.restaurantService.getBySlug(this.restaurantId).subscribe((res: Restaurant) => {
      if (!res.id) return;

      const proceedWithReservation = () => {
        this.handlePaymentAndConfirm(res, formValue);
      };

      if (!this.currentUser) {
        const dialogRef = this.dialog.open(MobileLoginDialogComponent, { width: '400px' });
        dialogRef.afterClosed().subscribe(loginResult => {
          if (loginResult && loginResult.mobile) {
            this.reservationForm.patchValue({ customerPhone: loginResult.mobile });
            proceedWithReservation();
          }
        });
      } else {
        proceedWithReservation();
      }
    });
  }

  private handlePaymentAndConfirm(res: Restaurant, formValue: any) {
    const confirmAndCreate = (paymentData?: { status: string, amount: number }) => {
      // Fix timezone issue: Create date string manually using local time parts
      const d = new Date(formValue.reservationDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      this.tableQueueService.createReservation({
        customer_name: formValue.customerName,
        customer_email: formValue.customerEmail,
        customer_phone: formValue.customerPhone,
        party_size: formValue.partySize,
        reservation_date: formattedDate,
        reservation_time: formValue.reservationTime,
        special_requests: formValue.specialRequests,
        table_id: formValue.tableId,
        restaurant_id: res.id,
        user_id: this.currentUser?.id,
        payment_status: paymentData?.status || 'Free',
        payment_amount: paymentData?.amount || 0
      }).subscribe({
        next: (newRes: Reservation) => {
          this.snackBar.open(`Reservation confirmed! ID: ${newRes.id}`, 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.reservationForm.reset({
            customerName: this.currentUser?.name || '',
            customerEmail: this.currentUser?.email || '',
            partySize: 2,
            reservationDate: this.minDate
          });
          this.availableTables = [];
          this.loadMyReservations();
          this.viewMode = 'history';
        }
      });
    };

    if (res.is_paid_reservation && res.reservation_fee) {
      const payDialog = this.dialog.open(MockPaymentDialogComponent, {
        width: '450px',
        data: { amount: res.reservation_fee, customerName: formValue.customerName }
      });

      payDialog.afterClosed().subscribe(paid => {
        if (paid) {
          confirmAndCreate({ status: 'Paid', amount: res.reservation_fee || 0 });
        } else {
          this.snackBar.open('Payment cancelled. Reservation not confirmed.', 'Close', { duration: 3000 });
        }
      });
    } else {
      confirmAndCreate({ status: 'Free', amount: 0 });
    }
  }

  cancelReservation(reservationId: number) {
    const dialogRef = this.dialog.open(CancellationDialogComponent, {
      width: '450px',
      data: { reservationId }
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.tableQueueService.updateReservationStatus(reservationId, 'Cancelled', {
          cancelled_by: 'Customer',
          cancellation_reason: reason
        }).subscribe({
          next: () => {
            this.snackBar.open('Reservation cancelled successfully', 'Close', {
              duration: 3000,
              panelClass: ['info-snackbar']
            });
            this.loadMyReservations();
          }
        });
      }
    });
  }

  viewTicket(reservation: Reservation) {
    this.dialog.open(TicketDialogComponent, {
      width: '95vw',
      maxWidth: '900px',
      data: reservation,
      panelClass: 'ticket-dialog-panel'
    });
  }

  navigateToTables() {
    if (this.restaurantId) {
      this.router.navigate(['../tables'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/tables']);
    }
  }

  navigateToQueue() {
    if (this.restaurantId) {
      this.router.navigate(['../queue'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/queue']);
    }
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

  getReservationStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'status-confirmed-bg';
      case 'seated': return 'status-confirmed-bg';
      case 'pending': return 'status-pending-bg';
      case 'cancelled': return 'status-cancelled-bg';
      case 'ended': return 'status-ended-bg';
      default: return '';
    }
  }
}
