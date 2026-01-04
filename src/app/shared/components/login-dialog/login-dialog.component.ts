import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  otpSent = false;
  isLoading = false;
  resendTimer = 0;
  private timerInterval?: any;
  private otpToken: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      otp: ['']
    });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    if (!this.otpSent) {
      this.sendOTP();
    } else {
      this.verifyOTP();
    }
  }

  sendOTP(): void {
    this.isLoading = true;
    const phone = this.loginForm.get('phone')?.value;

    console.log('[LoginDialog] Sending OTP for:', phone);

    this.authService.sendOtp(phone).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.otpSent = true;
        this.otpToken = res.otpToken;

        this.loginForm.get('otp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
        this.loginForm.get('otp')?.updateValueAndValidity();

        // Show OTP in snackbar for testing (remove in production)
        const message = res.otp ? `OTP: ${res.otp}` : `OTP sent to +91 ${phone}`;
        this.snackBar.open(message, 'Close', { duration: 5000 });

        this.startResendTimer();
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err.error?.message || 'Failed to send OTP. Please try again.';
        this.snackBar.open(errMsg, 'Close', { duration: 4000 });
        console.error('[LoginDialog] Send OTP Error:', err);
      }
    });
  }

  verifyOTP(): void {
    this.isLoading = true;
    const phone = this.loginForm.get('phone')?.value;
    const otp = this.loginForm.get('otp')?.value;

    console.log('[LoginDialog] Verifying OTP for:', phone);

    this.authService.verifyOtp(phone, otp, this.otpToken).subscribe({
      next: (res) => {
        this.isLoading = false;

        this.snackBar.open('Login successful!', 'Close', { duration: 2000 });

        // Close dialog and pass success
        this.dialogRef.close({ success: true, user: res });
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err.error?.message || 'Invalid OTP. Please try again.';
        this.snackBar.open(errMsg, 'Close', { duration: 4000 });
        console.error('[LoginDialog] Verify OTP Error:', err);
      }
    });
  }

  resendOTP(): void {
    if (this.resendTimer > 0) return;

    // Reset OTP sent flag and resend
    this.otpSent = false;
    this.sendOTP();
  }

  startResendTimer(): void {
    this.resendTimer = 30;
    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  close(): void {
    this.dialogRef.close();
  }
}
