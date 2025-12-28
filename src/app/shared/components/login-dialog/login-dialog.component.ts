import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private snackBar: MatSnackBar
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

    setTimeout(() => {
      this.isLoading = false;
      this.otpSent = true;

      this.loginForm.get('otp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
      this.loginForm.get('otp')?.updateValueAndValidity();

      this.snackBar.open(`OTP sent to +91 ${phone}`, 'Close', { duration: 3000 });
      this.startResendTimer();
    }, 1000);
  }

  verifyOTP(): void {
    this.isLoading = true;
    const phone = this.loginForm.get('phone')?.value;
    const otp = this.loginForm.get('otp')?.value;

    setTimeout(() => {
      this.isLoading = false;

      if (otp === '123456') {
        const user = {
          name: 'User',
          phone: phone,
          id: Date.now().toString()
        };

        localStorage.setItem('currentUser', JSON.stringify(user));

        this.snackBar.open('Login successful!', 'Close', { duration: 2000 });
        this.dialogRef.close({ success: true, user });
      } else {
        this.snackBar.open('Invalid OTP. Use 123456 for demo.', 'Close', { duration: 3000 });
      }
    }, 1000);
  }

  resendOTP(): void {
    if (this.resendTimer > 0) return;
    this.snackBar.open('OTP resent!', 'Close', { duration: 2000 });
    this.startResendTimer();
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
