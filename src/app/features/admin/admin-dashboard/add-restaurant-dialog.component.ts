import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-restaurant-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.edit ? 'Edit' : 'Register New' }} Restaurant</h2>
    <mat-dialog-content>
      <form [formGroup]="restaurantForm" class="dialog-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Restaurant Name</mat-label>
            <input matInput formControlName="name" placeholder="E.g. The Gourmet Kitchen">
            <mat-icon matSuffix>restaurant</mat-icon>
            <mat-error *ngIf="restaurantForm.get('name')?.hasError('required')">
              Restaurant name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" 
                      placeholder="Brief description of your restaurant"></textarea>
            <mat-icon matSuffix>description</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cuisine Type</mat-label>
            <input matInput formControlName="cuisine_type" placeholder="E.g. Italian, Chinese, Indian">
            <mat-icon matSuffix>restaurant_menu</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-section">
          <h3>Location Details</h3>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <input matInput formControlName="address" placeholder="Street address">
            <mat-icon matSuffix>location_on</mat-icon>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <input matInput formControlName="city" placeholder="City">
              <mat-error *ngIf="restaurantForm.get('city')?.hasError('required')">
                City is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>State</mat-label>
              <input matInput formControlName="state" placeholder="State">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>PIN Code</mat-label>
            <input matInput formControlName="pin_code" placeholder="PIN Code">
          </mat-form-field>
        </div>

        <div class="form-section">
          <h3>Contact Information</h3>
          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" placeholder="10-digit number">
              <mat-icon matSuffix>phone</mat-icon>
              <mat-error *ngIf="restaurantForm.get('phone')?.hasError('required')">
                Phone is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="contact@restaurant.com">
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <div class="form-section">
          <h3>Operating Hours</h3>
          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Opening Time</mat-label>
              <input matInput type="time" formControlName="opening_time">
              <mat-icon matSuffix>schedule</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Closing Time</mat-label>
              <input matInput type="time" formControlName="closing_time">
              <mat-icon matSuffix>schedule</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <div class="form-section" *ngIf="!data.edit">
          <h3>Manager Credentials (Optional)</h3>
          <p class="section-desc">Create a manager account for this restaurant. Leave blank to create later.</p>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Manager Username</mat-label>
            <input matInput formControlName="managerUsername" placeholder="Enter username">
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Manager Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" 
                   formControlName="managerPassword" placeholder="Enter password">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="restaurantForm.invalid || isSubmitting" (click)="onSubmit()">
        <mat-spinner *ngIf="isSubmitting" diameter="20" class="inline-spinner"></mat-spinner>
        <span *ngIf="!isSubmitting">{{ data.edit ? 'Update' : 'Create' }} Restaurant</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { 
      display: flex; 
      flex-direction: column; 
      gap: 24px; 
      padding-top: 10px;
      max-height: 70vh;
      overflow-y: auto;
    }
    .form-section { 
      display: flex; 
      flex-direction: column; 
      gap: 12px;
      padding: 16px;
      background: #f8faff;
      border-radius: 12px;
    }
    .form-section h3 { 
      margin: 0 0 8px 0; 
      font-size: 1rem; 
      color: #1b2559; 
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-desc { 
      margin: -8px 0 8px; 
      font-size: 0.85rem; 
      color: #707eae; 
    }
    .full-width { width: 100%; }
    .row { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 16px; 
    }
    .inline-spinner {
      display: inline-block;
      margin-right: 8px;
    }
    mat-dialog-content {
      padding: 0 24px !important;
    }
  `]
})
export class AddRestaurantDialogComponent {
  restaurantForm: FormGroup;
  hidePassword = true;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddRestaurantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const restaurant = data.restaurant;

    this.restaurantForm = this.fb.group({
      name: [restaurant?.name || '', Validators.required],
      description: [restaurant?.description || ''],
      cuisine_type: [restaurant?.cuisine_type || ''],
      address: [restaurant?.address || ''],
      city: [restaurant?.city || '', Validators.required],
      state: [restaurant?.state || ''],
      pin_code: [restaurant?.pin_code || ''],
      phone: [restaurant?.phone || '', Validators.required],
      email: [restaurant?.email || ''],
      opening_time: [restaurant?.opening_time || '11:00'],
      closing_time: [restaurant?.closing_time || '23:00'],
      managerUsername: [''],
      managerPassword: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.restaurantForm.valid) {
      this.isSubmitting = true;
      this.dialogRef.close(this.restaurantForm.value);
    }
  }
}
