import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-profile-dialog',
  template: `
    <div class="profile-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>My Profile</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="profile-info-section">
          <div class="avatar-section">
            <div class="avatar-circle">
              <span class="avatar-initials">{{getInitials()}}</span>
            </div>
            <div class="user-info">
              <h3>{{data.user?.name || 'Admin'}}</h3>
              <p class="user-email">{{data.user?.contact_info || 'admin'}}</p>
              <span class="user-role">{{data.user?.role || 'Administrator'}}</span>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <form [formGroup]="profileForm" class="profile-form">
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>person</mat-icon>
              Personal Information
            </h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter your full name">
              <mat-icon matSuffix>badge</mat-icon>
              <mat-error *ngIf="profileForm.get('name')?.hasError('required')">
                Name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="contact_info" placeholder="Enter username">
              <mat-icon matSuffix>account_circle</mat-icon>
              <mat-error *ngIf="profileForm.get('contact_info')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>
          </div>

          <mat-divider></mat-divider>

          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>lock</mat-icon>
              Security Settings
            </h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" placeholder="Leave blank to keep current password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-hint>Leave blank if you don't want to change password</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width" 
                           *ngIf="profileForm.get('password')?.value">
              <mat-label>Confirm New Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="confirmPassword" placeholder="Confirm new password">
              <mat-icon matSuffix>lock_outline</mat-icon>
              <mat-error *ngIf="profileForm.get('confirmPassword')?.hasError('required')">
                Please confirm password
              </mat-error>
              <mat-error *ngIf="profileForm.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <div class="password-hint" *ngIf="profileForm.get('password')?.value">
              <mat-icon>info</mat-icon>
              <span>You will need to login again with your new password</span>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isSaving">
          Cancel
        </button>
        <button mat-raised-button color="primary" 
                (click)="onSave()" 
                [disabled]="profileForm.invalid || isSaving">
          <mat-spinner *ngIf="isSaving" diameter="20" class="button-spinner"></mat-spinner>
          <mat-icon *ngIf="!isSaving">save</mat-icon>
          <span>{{isSaving ? 'Updating...' : 'Update Profile'}}</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .profile-dialog {
      min-width: 500px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a237e;
    }

    mat-dialog-content {
      padding: 0 !important;
      max-height: 70vh;
      overflow-y: auto;
    }

    .profile-info-section {
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .avatar-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid rgba(255, 255, 255, 0.3);
    }

    .avatar-initials {
      font-size: 32px;
      font-weight: 700;
      color: white;
    }

    .user-info h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .user-email {
      margin: 0 0 8px 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .user-role {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .profile-form {
      padding: 0;
    }

    .form-section {
      padding: 24px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1a237e;
    }

    .section-title mat-icon {
      color: #667eea;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-divider {
      margin: 0;
    }

    .password-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #fff3e0;
      border-radius: 8px;
      color: #e65100;
      font-size: 13px;
      margin-top: 8px;
    }

    .password-hint mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    mat-dialog-actions button {
      margin-left: 8px;
    }

    .button-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    mat-dialog-actions button mat-icon {
      margin-right: 8px;
    }

    /* Scrollbar styling */
    mat-dialog-content::-webkit-scrollbar {
      width: 8px;
    }

    mat-dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    mat-dialog-content::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    mat-dialog-content::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class AdminProfileDialogComponent implements OnInit {
  profileForm: FormGroup;
  hidePassword = true;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AdminProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: [data.user?.name || '', Validators.required],
      contact_info: [data.user?.contact_info || '', Validators.required],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void { }

  getInitials(): string {
    const name = this.data.user?.name || 'Admin';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.snackBar.open('Please fix form errors', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isSaving = true;
    const formValue = this.profileForm.value;

    const updates: any = {
      name: formValue.name,
      contact_info: formValue.contact_info
    };

    // Only include password if it was changed
    if (formValue.password && formValue.password.trim() !== '') {
      updates.password = formValue.password;
    }

    console.log('[AdminProfile] Updating profile with:', updates);

    this.authService.updateAdminProfile(this.data.user.id, updates).subscribe({
      next: (response) => {
        console.log('[AdminProfile] Update successful:', response);
        this.isSaving = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isSaving = false;
        console.error('[AdminProfile] Error updating profile:', error);
        const errorMessage = error.error?.message || 'Error updating profile';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
