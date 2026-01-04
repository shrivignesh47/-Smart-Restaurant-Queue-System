import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-add-admin-dialog',
    template: `
    <h2 mat-dialog-title>Add New Admin User</h2>
    <mat-dialog-content>
      <form [formGroup]="adminForm" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="fullName" placeholder="E.g. Admin User">
          <mat-icon matSuffix>badge</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" placeholder="Enter username">
          <mat-icon matSuffix>person</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter password">
          <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
            <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="Super Admin">Super Admin</mat-option>
            <mat-option value="System Admin">System Admin</mat-option>
            <mat-option value="Support Admin">Support Admin</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="adminForm.invalid" (click)="onSubmit()">
        Create Admin
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 16px; padding-top: 10px; }
    .full-width { width: 100%; }
  `]
})
export class AddAdminDialogComponent {
    adminForm: FormGroup;
    hidePassword = true;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<AddAdminDialogComponent>
    ) {
        this.adminForm = this.fb.group({
            fullName: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required],
            role: ['System Admin', Validators.required]
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        if (this.adminForm.valid) {
            this.dialogRef.close(this.adminForm.value);
        }
    }
}
