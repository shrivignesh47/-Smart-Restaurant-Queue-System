import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-mobile-login-dialog',
    template: `
    <h2 mat-dialog-title>Customer Login</h2>
    <mat-dialog-content>
      <p class="text-sm text-gray-500 mb-4">
        Please enter your mobile number to continue with the reservation.
      </p>
      <form [formGroup]="loginForm">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Mobile Number</mat-label>
          <input matInput formControlName="mobile" placeholder="9876543210" type="tel">
          <mat-icon matPrefix class="mr-2">phone</mat-icon>
          <mat-error *ngIf="loginForm.get('mobile')?.hasError('required')">Mobile number is required</mat-error>
          <mat-error *ngIf="loginForm.get('mobile')?.hasError('pattern')">Invalid mobile number</mat-error>
        </mat-form-field>

        <div *ngIf="showOtp" class="mt-4 animate-in fade-in slide-in-from-top-4">
           <mat-form-field appearance="outline" class="w-full">
            <mat-label>Enter OTP</mat-label>
            <input matInput formControlName="otp" placeholder="123456" maxlength="6">
            <mat-hint>A mock OTP has been sent to your mobile</mat-hint>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="loginForm.get('mobile')?.invalid" (click)="handleSubmit()">
        {{ showOtp ? 'Verify & Continue' : 'Send OTP' }}
      </button>
    </mat-dialog-actions>
  `
})
export class MobileLoginDialogComponent {
    loginForm: FormGroup;
    showOtp = false;

    constructor(
        public dialogRef: MatDialogRef<MobileLoginDialogComponent>,
        private fb: FormBuilder
    ) {
        this.loginForm = this.fb.group({
            mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            otp: ['']
        });
    }

    handleSubmit() {
        if (!this.showOtp) {
            this.showOtp = true;
            this.loginForm.get('otp')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.loginForm.get('otp')?.updateValueAndValidity();
        } else {
            if (this.loginForm.valid) {
                this.dialogRef.close({ mobile: this.loginForm.value.mobile });
            }
        }
    }
}
