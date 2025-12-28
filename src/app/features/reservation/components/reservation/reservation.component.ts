import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '../../../../core/auth.service';
import { TableQueueService, Reservation } from '../../../../core/services/table-queue.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    private fb: FormBuilder
  ) {
    // Set minimum date to tomorrow
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
    this.minDate.setHours(0, 0, 0, 0);

    this.reservationForm = this.fb.group({
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', Validators.required],
      partySize: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      reservationDate: [this.minDate, Validators.required],
      reservationTime: ['', Validators.required],
      specialRequests: ['']
    });
  }

  ngOnInit(): void {
    if (!this.restaurantId) {
      this.restaurantId = this.getRestaurantNameFromRoute();
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      // Pre-fill form if user is logged in
      if (this.currentUser) {
        this.reservationForm.patchValue({
          customerName: this.currentUser.name,
          customerEmail: this.currentUser.email || ''
        });

        if (!this.restaurantId) {
          this.loadMyReservations();
        }
      }
    });

    // Subscribe to reservations
    this.tableQueueService.reservations$.subscribe(reservations => {
      this.myReservations = reservations;
    });
  }

  loadMyReservations() {
    this.myReservations = this.tableQueueService.getReservations();
  }

  submitReservation() {
    if (this.reservationForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.reservationForm.value;
    const reservationDate = new Date(formValue.reservationDate);

    // Validate date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate <= today) {
      this.snackBar.open(
        'Reservations must be for future dates. For immediate seating, please check Tables or join the Queue.',
        'Go to Tables',
        { duration: 8000, panelClass: ['warning-snackbar'] }
      ).onAction().subscribe(() => {
        this.navigateToTables();
      });
      return;
    }

    const result = this.tableQueueService.createReservation({
      customerName: formValue.customerName,
      customerEmail: formValue.customerEmail,
      customerPhone: formValue.customerPhone,
      partySize: formValue.partySize,
      reservationDate: reservationDate,
      reservationTime: formValue.reservationTime,
      specialRequests: formValue.specialRequests,
      restaurantId: this.restaurantId
    });

    if (result.success) {
      this.snackBar.open(
        `Reservation created successfully! ID: ${result.reservationId}`,
        'Close',
        {
          duration: 5000,
          panelClass: ['success-snackbar']
        }
      );

      // Reset form
      this.reservationForm.reset({
        customerName: this.currentUser?.name || '',
        customerEmail: this.currentUser?.email || '',
        partySize: 2,
        reservationDate: this.minDate
      });
    } else {
      this.snackBar.open(result.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  cancelReservation(reservationId: string) {
    const confirmed = confirm('Are you sure you want to cancel this reservation?');
    if (confirmed) {
      const success = this.tableQueueService.cancelReservation(reservationId);
      if (success) {
        this.snackBar.open('Reservation cancelled', 'Close', {
          duration: 3000,
          panelClass: ['info-snackbar']
        });
      }
    }
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
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}
