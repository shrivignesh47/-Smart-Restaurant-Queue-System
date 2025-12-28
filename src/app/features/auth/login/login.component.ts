import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  otpSent: boolean = false;
  isLoading: boolean = false;
  resendTimer: number = 0;
  private timerInterval?: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      otp: [''],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  formatPhoneNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    this.loginForm.patchValue({ phone: value }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    if (!this.otpSent) {
      this.sendOTP();
    } else {
      this.verifyOTP();
    }
  }

  sendOTP(): void {
    this.isLoading = true;
    const phone = this.loginForm.get('phone')?.value;

    // Simulate OTP sending (replace with actual API call)
    setTimeout(() => {
      this.isLoading = false;
      this.otpSent = true;

      // Add OTP validator
      this.loginForm.get('otp')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]);
      this.loginForm.get('otp')?.updateValueAndValidity();

      this.snackBar.open(
        `OTP sent to +91 ${phone}. Use 123456 for demo.`,
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );

      this.startResendTimer();
    }, 1500);
  }

  verifyOTP(): void {
    this.isLoading = true;
    const phone = this.loginForm.get('phone')?.value;
    const otp = this.loginForm.get('otp')?.value;

    // Simulate OTP verification (replace with actual API call)
    setTimeout(() => {
      this.isLoading = false;

      // Demo: Accept 123456 as valid OTP
      if (otp === '123456') {
        // Create user session
        const user = {
          name: 'User',
          phone: phone,
          id: Date.now().toString()
        };

        // Store in localStorage (in real app, use proper auth service)
        localStorage.setItem('currentUser', JSON.stringify(user));

        this.snackBar.open(
          'Login successful! Welcome back.',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );

        // Navigate to home
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 500);
      } else {
        this.snackBar.open(
          'Invalid OTP. Please try again. (Use 123456 for demo)',
          'Close',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );
      }
    }, 1500);
  }

  resendOTP(): void {
    if (this.resendTimer > 0) return;

    this.snackBar.open(
      'OTP resent successfully!',
      'Close',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );

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
}
