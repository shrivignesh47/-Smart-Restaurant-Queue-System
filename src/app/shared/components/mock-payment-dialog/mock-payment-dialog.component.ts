import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-mock-payment-dialog',
    template: `
    <h2 mat-dialog-title>Secure Payment</h2>
    <mat-dialog-content>
      <div class="payment-summary mb-4 p-4 bg-gray-50 rounded">
        <p class="flex justify-between mb-2">
          <span>Reservation For:</span>
          <strong>{{ data.customerName }}</strong>
        </p>
        <p class="flex justify-between mb-2">
          <span>Table Fee:</span>
          <strong>{{ data.amount | currency:'INR' }}</strong>
        </p>
        <mat-divider class="my-2"></mat-divider>
        <p class="flex justify-between text-lg font-bold">
          <span>Total Payable:</span>
          <span class="text-primary">{{ data.amount | currency:'INR' }}</span>
        </p>
      </div>

      <div class="payment-methods grid grid-cols-2 gap-3 mb-4">
        <div class="method-card p-3 border rounded text-center cursor-pointer hover:bg-blue-50" 
             [class.border-primary]="selectedMethod === ' UPI'"
             (click)="selectedMethod = 'UPI'">
          <mat-icon color="primary">account_balance</mat-icon>
          <p class="text-xs font-bold mt-1">UPI</p>
        </div>
        <div class="method-card p-3 border rounded text-center cursor-pointer hover:bg-blue-50"
             [class.border-primary]="selectedMethod === 'Card'"
             (click)="selectedMethod = 'Card'">
          <mat-icon color="primary">credit_card</mat-icon>
          <p class="text-xs font-bold mt-1">Card</p>
        </div>
      </div>

      <div *ngIf="processing" class="text-center py-4">
        <mat-spinner diameter="40" class="mx-auto mb-3"></mat-spinner>
        <p class="text-sm font-medium animate-pulse">Processing your payment...</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)" [disabled]="processing">Cancel</button>
      <button mat-flat-button color="primary" 
              (click)="processPayment()" 
              [disabled]="processing || !selectedMethod">
        Pay {{ data.amount | currency:'INR' }}
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    .method-card.border-primary {
      border-width: 2px;
      background: #f0f7ff;
    }
  `]
})
export class MockPaymentDialogComponent {
    processing = false;
    selectedMethod: string = '';

    constructor(
        public dialogRef: MatDialogRef<MockPaymentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { amount: number, customerName: string }
    ) { }

    processPayment() {
        this.processing = true;
        // Simulate network delay
        setTimeout(() => {
            this.processing = false;
            this.dialogRef.close(true);
        }, 2000);
    }
}
