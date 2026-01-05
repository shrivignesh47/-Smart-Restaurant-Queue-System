import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Reservation } from '../../../core/services/table-queue.service';

@Component({
  selector: 'app-reservation-dialog',
  template: `
    <h2 mat-dialog-title>Edit Reservation</h2>
    <mat-dialog-content>
      <form [formGroup]="resForm" class="flex flex-col gap-4 mt-2">
        <mat-form-field appearance="outline">
          <mat-label>Customer Name</mat-label>
          <input matInput formControlName="customer_name">
        </mat-form-field>

        <div class="flex gap-4">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Date</mat-label>
            <input matInput type="date" formControlName="reservation_date">
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Time</mat-label>
            <input matInput type="time" formControlName="reservation_time">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Party Size</mat-label>
          <input matInput type="number" formControlName="party_size">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Confirmed">Confirmed</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
            <mat-option value="Seated">Seated</mat-option>
          </mat-select>
        </mat-form-field>

        <ng-container *ngIf="resForm.get('status')?.value === 'Cancelled'">
          <mat-form-field appearance="outline">
            <mat-label>Cancellation Reason</mat-label>
            <textarea matInput formControlName="cancellation_reason" rows="3" placeholder="Reason for restaurant-side cancellation"></textarea>
            <mat-error *ngIf="resForm.get('cancellation_reason')?.hasError('required')">
              Reason is required for cancellation
            </mat-error>
          </mat-form-field>
        </ng-container>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="resForm.invalid" (click)="save()">Save Changes</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-1 { flex: 1; }
    .gap-4 { gap: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
  `]
})
export class ReservationDialogComponent {
  resForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Reservation
  ) {
    // Format date for input type="date" (YYYY-MM-DD)
    let formattedDate = '';
    if (data.reservation_date) {
      formattedDate = new Date(data.reservation_date).toISOString().split('T')[0];
    }

    this.resForm = this.fb.group({
      customer_name: [data.customer_name, Validators.required],
      reservation_date: [formattedDate, Validators.required],
      reservation_time: [data.reservation_time, Validators.required],
      party_size: [data.party_size, [Validators.required, Validators.min(1)]],
      status: [data.status, Validators.required],
      customer_email: [data.customer_email],
      customer_phone: [data.customer_phone],
      special_requests: [data.special_requests],
      table_id: [data.table_id],
      restaurant_id: [data.restaurant_id],
      cancellation_reason: [data.cancellation_reason || ''],
      cancelled_by: [data.cancelled_by || '']
    });

    // Toggle required validator for cancellation reason
    this.resForm.get('status')?.valueChanges.subscribe(status => {
      const reasonControl = this.resForm.get('cancellation_reason');
      if (status === 'Cancelled') {
        reasonControl?.setValidators([Validators.required, Validators.minLength(5)]);
        if (!this.resForm.get('cancelled_by')?.value) {
          this.resForm.patchValue({ cancelled_by: 'Restaurant' });
        }
      } else {
        reasonControl?.clearValidators();
      }
      reasonControl?.updateValueAndValidity();
    });
  }

  save() {
    if (this.resForm.valid) {
      this.dialogRef.close(this.resForm.value);
    }
  }
}
