import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-join-queue-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="mr-2" style="vertical-align: middle;">queue</mat-icon>
      {{ data.tableSpecific ? 'Join Queue for ' + data.tableName : 'Join General Queue' }}
    </h2>
    
    <mat-dialog-content>
      <div *ngIf="data.tableSpecific" class="table-info mb-4 p-3 bg-blue-50 rounded">
        <p class="text-sm text-gray-700">
          <strong>Table:</strong> {{ data.tableName }} ({{ data.capacity }} seats)<br>
          <strong>Status:</strong> {{ data.status }}<br>
          <strong>Current Queue:</strong> {{ data.queueSize || 0 }} people waiting
        </p>
      </div>

      <div *ngIf="!data.tableSpecific" class="general-info mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
        <p class="text-sm text-gray-700">
          <mat-icon inline style="font-size: 18px; vertical-align: middle; color: var(--primary-color);">info</mat-icon>
          Join the general queue. Managers will assign you to the next best available table based on your party size.
        </p>
      </div>

      <form [formGroup]="queueForm" class="queue-form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Your Name</mat-label>
          <input matInput formControlName="customerName" placeholder="Enter your name" required>
          <mat-error *ngIf="queueForm.get('customerName')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Party Size</mat-label>
          <mat-select formControlName="partySize">
            <mat-option [value]="1">1 Person</mat-option>
            <mat-option [value]="2">2 People</mat-option>
            <mat-option [value]="3">3 People</mat-option>
            <mat-option [value]="4">4 People</mat-option>
            <mat-option [value]="5">5 People</mat-option>
            <mat-option [value]="6">6 People</mat-option>
            <mat-option [value]="7">7 People</mat-option>
            <mat-option [value]="8">8+ People</mat-option>
          </mat-select>
          <mat-error *ngIf="queueForm.get('partySize')?.hasError('required')">
            Party size is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Phone Number (Optional)</mat-label>
          <input matInput formControlName="phone" placeholder="(123) 456-7890" type="tel">
        </mat-form-field>

        <div class="estimated-wait p-3 bg-gray-50 rounded">
          <p class="text-sm text-gray-600 mb-1">
            <mat-icon inline style="font-size: 16px; vertical-align: middle;">schedule</mat-icon>
            Estimated Wait Time
          </p>
          <p class="text-lg font-bold text-primary">
            ~{{ estimatedWaitTime }} minutes
          </p>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="queueForm.invalid"
              (click)="joinQueue()">
        <mat-icon>add_circle</mat-icon> Join Queue
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .w-full {
      width: 100%;
      margin-bottom: 16px;
    }
    
    mat-dialog-content {
      min-width: 400px;
      max-width: 500px;
    }

    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: 300px;
      }
    }
  `]
})
export class JoinQueueDialogComponent {
  queueForm: FormGroup;
  estimatedWaitTime: number = 15;

  constructor(
    public dialogRef: MatDialogRef<JoinQueueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      tableSpecific: boolean;
      tableId?: number;
      tableName?: string;
      capacity?: number;
      status?: string;
      queueSize?: number;
    },
    private fb: FormBuilder
  ) {
    this.queueForm = this.fb.group({
      customerName: ['', Validators.required],
      partySize: [2, Validators.required],
      phone: ['']
    });

    // Calculate estimated wait time
    this.estimatedWaitTime = data.tableSpecific
      ? (data.queueSize || 0) * 10 + 15  // Table-specific: 10 min per person + 15 base
      : (data.queueSize || 0) * 5 + 10;   // General: 5 min per person + 10 base

    // Update estimate when party size changes
    this.queueForm.get('partySize')?.valueChanges.subscribe(() => {
      this.updateEstimate();
    });
  }

  updateEstimate() {
    const partySize = this.queueForm.get('partySize')?.value || 2;
    const baseWait = this.data.tableSpecific ? 15 : 10;
    const perPersonWait = this.data.tableSpecific ? 10 : 5;
    this.estimatedWaitTime = (this.data.queueSize || 0) * perPersonWait + baseWait + (partySize * 2);
  }

  joinQueue() {
    if (this.queueForm.valid) {
      this.dialogRef.close({
        ...this.queueForm.value,
        tableId: this.data.tableId,
        tableSpecific: this.data.tableSpecific,
        action: 'join' // Indicate this is a join action
      });
    }
  }
}
