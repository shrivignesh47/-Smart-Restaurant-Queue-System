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
          </mat-form-field>

          <div *ngIf="data.edit" class="row">
            <mat-form-field appearance="outline">
               <mat-label>Type</mat-label>
               <mat-select formControlName="type">
                 <mat-option value="public">Public</mat-option>
                 <mat-option value="private">Private</mat-option>
               </mat-select>
             </mat-form-field>

             <mat-form-field appearance="outline">
               <mat-label>Tables</mat-label>
               <input matInput type="number" formControlName="tables">
             </mat-form-field>
           </div>
        </div>

        <div class="form-section" *ngIf="!data.edit">
          <h3>Manager Credentials</h3>
          <p class="section-desc">These credentials will be used by the restaurant manager to login.</p>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Manager Username</mat-label>
            <input matInput formControlName="managerUsername" placeholder="Enter username">
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Manager Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="managerPassword" placeholder="Enter password">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="restaurantForm.invalid" (click)="onSubmit()">
        {{ data.edit ? 'Update' : 'Create' }} Restaurant
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 20px; padding-top: 10px; }
    .form-section { display: flex; flex-direction: column; gap: 12px; }
    .form-section h3 { margin: 0; font-size: 1rem; color: #1b2559; font-weight: 700; }
    .section-desc { margin: -8px 0 8px; font-size: 0.85rem; color: #707eae; }
    .full-width { width: 100%; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  `]
})
export class AddRestaurantDialogComponent {
  restaurantForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddRestaurantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const formConfig: any = {
      name: [data.restaurant?.name || '', Validators.required],
      managerUsername: ['', data.edit ? [] : Validators.required],
      managerPassword: ['', data.edit ? [] : Validators.required]
    };

    if (data.edit) {
      formConfig.type = [data.restaurant?.type || 'public', Validators.required];
      formConfig.tables = [data.restaurant?.tables || 0, [Validators.required, Validators.min(0)]];
    }

    this.restaurantForm = this.fb.group(formConfig);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.restaurantForm.valid) {
      this.dialogRef.close(this.restaurantForm.value);
    }
  }
}
