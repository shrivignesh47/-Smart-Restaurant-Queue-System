import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.scss']
})
export class BookingDialogComponent {
  bookingForm: FormGroup;
  isLoggedIn = false;
  showOtp = false;
  otpSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<BookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tableName: string, tableId: number }
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.currentUserValue;

    this.bookingForm = this.fb.group({
      name: [user?.name || '', Validators.required],
      phone: [user?.phone || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      otp: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  sendOtp(): void {
    if (this.bookingForm.get('name')?.valid && this.bookingForm.get('phone')?.valid) {
      this.otpSent = true;
      this.showOtp = true;
      // Dummy OTP logic - auto fill or just allow any
      // In real app, trigger API
    }
  }

  onConfirm(): void {
    if (this.showOtp) {
        // Validate OTP
        const otp = this.bookingForm.get('otp')?.value;
        if (otp && otp.length === 4) { // Dummy validation: length 4
            this.finalizeBooking();
        } else {
            // Mark as invalid or show error (simplified for now)
            if (!otp) alert('Please enter OTP (try 1234)');
        }
    } else {
        // If logged in, maybe skip OTP? Or always require?
        // User asked for OTP box, so let's enforce it for the flow
        this.sendOtp();
    }
  }
  
  finalizeBooking(): void {
      if (this.bookingForm.valid) {
        const result = {
          ...this.bookingForm.value,
          ticketId: this.generateTicketId()
        };
        
        if (!this.isLoggedIn) {
           this.authService.login(result.phone, result.name).subscribe();
        }
        
        this.dialogRef.close(result);
      }
  }

  private generateTicketId(): string {
    return 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}
