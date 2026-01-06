import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SeatCustomerDialogData {
    customerName: string;
    partySize: number;
    tables: Array<{
        id: number;
        name: string;
        capacity: number;
        type: string;
        status: string;
    }>;
}

@Component({
    selector: 'app-seat-customer-dialog',
    template: `
    <div class="seat-customer-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>event_seat</mat-icon>
        Assign Table
      </h2>
      
      <mat-dialog-content>
        <div class="customer-info-card">
          <div class="customer-avatar">
            <mat-icon>person</mat-icon>
          </div>
          <div class="customer-details">
            <h3>{{ data.customerName }}</h3>
            <p><mat-icon inline>people</mat-icon> Party of {{ data.partySize }}</p>
          </div>
        </div>

        <div class="table-selection-section">
          <h4>Select a Table</h4>
          <p class="hint">Choose a table that fits the party size ({{ data.partySize }} guests)</p>
          
          <div class="tables-grid">
            <div *ngFor="let table of availableTables" 
                 class="table-card"
                 [class.selected]="selectedTable?.id === table.id"
                 [class.insufficient-capacity]="table.capacity < data.partySize"
                 (click)="selectTable(table)">
              <div class="table-header">
                <span class="table-name">{{ table.name }}</span>
                <span class="table-type" [class.vip]="table.type === 'VIP'">{{ table.type }}</span>
              </div>
              <div class="table-capacity">
                <mat-icon>people_outline</mat-icon>
                <span>{{ table.capacity }} seats</span>
              </div>
              <div *ngIf="table.capacity < data.partySize" class="warning-badge">
                <mat-icon>warning</mat-icon> Too small
              </div>
              <div *ngIf="selectedTable?.id === table.id" class="selected-badge">
                <mat-icon>check_circle</mat-icon>
              </div>
            </div>
          </div>
          
          <p *ngIf="availableTables.length === 0" class="no-tables-message">
            <mat-icon>error_outline</mat-icon>
            No available tables at the moment.
          </p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" 
                [disabled]="!selectedTable"
                (click)="confirmSeating()">
          <mat-icon>event_seat</mat-icon>
          Seat at {{ selectedTable?.name || 'Table' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .seat-customer-dialog {
      min-width: 500px;
      max-width: 700px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1b2559;
      margin: 0;
      font-size: 1.5rem;
    }

    .dialog-title mat-icon {
      color: #667eea;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .customer-info-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .customer-avatar {
      width: 60px;
      height: 60px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .customer-avatar mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .customer-details h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .customer-details p {
      margin: 4px 0 0;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .table-selection-section h4 {
      margin: 0 0 4px;
      color: #1e293b;
      font-size: 1.1rem;
    }

    .hint {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0 0 16px;
    }

    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
      padding: 4px;
    }

    .table-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      background: white;
    }

    .table-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      transform: translateY(-2px);
    }

    .table-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }

    .table-card.insufficient-capacity {
      opacity: 0.6;
      border-color: #fbbf24;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .table-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 1rem;
    }

    .table-type {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 12px;
      background: #e2e8f0;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }

    .table-type.vip {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .table-capacity {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #64748b;
      font-size: 0.85rem;
    }

    .table-capacity mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .warning-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #fbbf24;
      color: #92400e;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .warning-badge mat-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .selected-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(102, 126, 234, 0.9);
      color: white;
      border-radius: 50%;
      padding: 8px;
      animation: popIn 0.3s ease;
    }

    @keyframes popIn {
      0% { transform: translate(-50%, -50%) scale(0); }
      50% { transform: translate(-50%, -50%) scale(1.2); }
      100% { transform: translate(-50%, -50%) scale(1); }
    }

    .selected-badge mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .no-tables-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ef4444;
      padding: 16px;
      background: #fef2f2;
      border-radius: 8px;
    }

    mat-dialog-actions button {
      min-height: 44px;
    }

    @media (max-width: 600px) {
      .seat-customer-dialog {
        min-width: 100%;
      }

      .tables-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class SeatCustomerDialogComponent {
    selectedTable: { id: number; name: string; capacity: number } | null = null;
    availableTables: Array<{ id: number; name: string; capacity: number; type: string; status: string }> = [];

    constructor(
        public dialogRef: MatDialogRef<SeatCustomerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SeatCustomerDialogData
    ) {
        // Filter only available tables and sort by capacity (ascending)
        this.availableTables = this.data.tables
            .filter(t => t.status === 'Available')
            .sort((a, b) => {
                // Prioritize tables with sufficient capacity
                const aFits = a.capacity >= data.partySize ? 0 : 1;
                const bFits = b.capacity >= data.partySize ? 0 : 1;
                if (aFits !== bFits) return aFits - bFits;
                // Then sort by capacity (smallest first that fits)
                return a.capacity - b.capacity;
            });

        // Auto-select the best fitting table if available
        const bestFit = this.availableTables.find(t => t.capacity >= data.partySize);
        if (bestFit) {
            this.selectedTable = bestFit;
        }
    }

    selectTable(table: { id: number; name: string; capacity: number; type: string }): void {
        this.selectedTable = table;
    }

    confirmSeating(): void {
        if (this.selectedTable) {
            this.dialogRef.close({
                tableId: this.selectedTable.id,
                tableName: this.selectedTable.name
            });
        }
    }
}
