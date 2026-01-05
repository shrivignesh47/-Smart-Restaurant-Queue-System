import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Table } from '../../../core/services/table-queue.service';

@Component({
    selector: 'app-table-dialog',
    template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Table' : 'Add New Table' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="tableForm" class="flex flex-col gap-4 mt-2">
        <mat-form-field appearance="outline">
          <mat-label>Table Name/Number</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Table 1 or T-01">
          <mat-error *ngIf="tableForm.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Capacity</mat-label>
          <input matInput type="number" formControlName="capacity">
          <mat-error *ngIf="tableForm.get('capacity')?.hasError('required')">Capacity is required</mat-error>
          <mat-error *ngIf="tableForm.get('capacity')?.hasError('min')">Capacity must be at least 1</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="Regular">Regular</mat-option>
            <mat-option value="VIP">VIP</mat-option>
            <mat-option value="Outdoor">Outdoor</mat-option>
            <mat-option value="Booth">Booth</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="Available">Available</mat-option>
            <mat-option value="Occupied">Occupied</mat-option>
            <mat-option value="Reserved">Reserved</mat-option>
            <mat-option value="Dirty">Dirty</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="tableForm.invalid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .gap-4 { gap: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
  `]
})
export class TableDialogComponent {
    tableForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<TableDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Table | null
    ) {
        this.tableForm = this.fb.group({
            name: [data?.name || '', Validators.required],
            capacity: [data?.capacity || 2, [Validators.required, Validators.min(1)]],
            type: [data?.type || 'Regular', Validators.required],
            status: [data?.status || 'Available', Validators.required]
        });
    }

    save() {
        if (this.tableForm.valid) {
            this.dialogRef.close(this.tableForm.value);
        }
    }
}
