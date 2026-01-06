import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

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
  private otpToken: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
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
    if (this.authService.isAuthenticated()) {
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

    this.authService.sendOtp(phone).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.otpSent = true;
        this.otpToken = res.otpToken;

        // Add OTP validator
        this.loginForm.get('otp')?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{6}$/)
        ]);
        this.loginForm.get('otp')?.updateValueAndValidity();

        // For demo purposes, we can show the mock OTP if returned by backend (usually disabled in prod)
        const message = res.otp ? `OTP sent: ${res.otp}` : `OTP sent to +91 ${phone}`;

        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });

        this.startResendTimer();
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err.error?.message || 'Failed to send OTP. Please try again.';
        this.snackBar.open(errMsg, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  verifyOTP(): void {
    this.isLoading = true;
    const phone = this.loginForm.get('phone')?.value;
    const otp = this.loginForm.get('otp')?.value;

    this.authService.verifyOtp(phone, otp, this.otpToken).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open('Login successful! Welcome back.', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err.error?.message || 'Invalid OTP. Please try again.';
        this.snackBar.open(errMsg, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  resendOTP(): void {
    if (this.resendTimer > 0) return;
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
}
