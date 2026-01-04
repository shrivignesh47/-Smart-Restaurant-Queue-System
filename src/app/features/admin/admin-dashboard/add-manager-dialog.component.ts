import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-add-manager-dialog',
    template: `
    <h2 mat-dialog-title>Create Restaurant Manager</h2>
    <mat-dialog-content>
      <form [formGroup]="managerForm" class="dialog-form">
        <p class="dialog-desc">Create login credentials for a restaurant manager.</p>

        <mat-form-field appearance="outline" class="full-width" *ngIf="!data.fixedRestaurant">
          <mat-label>Select Restaurant</mat-label>
          <mat-select formControlName="restaurantId">
            <mat-option *ngFor="let r of data.restaurants" [value]="r.id">
              {{ r.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div *ngIf="data.fixedRestaurant" class="fixed-restaurant-info">
          <strong>Restaurant:</strong> {{ data.fixedRestaurant.name }}
        </div>

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
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="managerForm.invalid" (click)="onSubmit()">
        Create Manager
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 16px; padding-top: 10px; }
    .full-width { width: 100%; }
    .dialog-desc { margin: 0 0 16px; color: #707eae; }
    .fixed-restaurant-info { 
      padding: 12px; 
      background: #f4f7fe; 
      border-radius: 8px; 
      margin-bottom: 16px;
      color: #1b2559;
    }
  `]
})
export class AddManagerDialogComponent {
    managerForm: FormGroup;
    hidePassword = true;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<AddManagerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.managerForm = this.fb.group({
            restaurantId: [data.fixedRestaurant ? data.fixedRestaurant.id : '', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        if (this.managerForm.valid) {
            this.dialogRef.close(this.managerForm.value);
        }
    }
}
