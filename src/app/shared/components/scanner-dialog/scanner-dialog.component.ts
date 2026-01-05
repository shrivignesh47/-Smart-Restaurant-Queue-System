import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BarcodeFormat } from '@zxing/library';

@Component({
    selector: 'app-scanner-dialog',
    template: `
    <div class="scanner-container">
      <div class="header">
        <h2>Scan Entry Ticket</h2>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="scanner-wrapper">
        <zxing-scanner
          [formats]="allowedFormats"
          (scanSuccess)="onScanSuccess($event)"
          (permissionResponse)="onPermissionResponse($event)"
          [enable]="scannerEnabled"
        ></zxing-scanner>
        <div class="scan-overlay">
          <div class="scan-frame"></div>
        </div>
      </div>

      <div class="footer">
        <p *ngIf="!hasPermission">Waiting for camera permission...</p>
        <p *ngIf="hasPermission">Center the QR code in the frame</p>
      </div>
    </div>
  `,
    styles: [`
    .scanner-container {
      padding: 0;
      overflow: hidden;
      background: #1a202c;
      color: white;
      border-radius: 12px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #2d3748;
    }

    .header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .scanner-wrapper {
      position: relative;
      width: 100%;
      height: 400px;
      background: black;
    }

    zxing-scanner {
      width: 100%;
      height: 100%;
    }

    .scan-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .scan-frame {
      width: 250px;
      height: 250px;
      border: 2px solid #4318ff;
      border-radius: 24px;
      box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5);
      position: relative;
    }

    .scan-frame::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: #4318ff;
      box-shadow: 0 0 10px #4318ff;
      animation: scan 2s linear infinite;
    }

    @keyframes scan {
      0% { top: 0; }
      100% { top: 100%; }
    }

    .footer {
      padding: 16px;
      text-align: center;
      background: #2d3748;
    }

    .footer p {
      margin: 0;
      font-size: 0.9rem;
      color: #a0aec0;
    }
  `]
})
export class ScannerDialogComponent {
    allowedFormats = [BarcodeFormat.QR_CODE];
    hasPermission = false;
    scannerEnabled = true;

    constructor(public dialogRef: MatDialogRef<ScannerDialogComponent>) { }

    onScanSuccess(result: string) {
        console.log('Scan Result:', result);
        // Extract ID from RES-ID format
        if (result.startsWith('RES-')) {
            const id = result.split('-')[1];
            this.scannerEnabled = false;
            this.dialogRef.close(id);
        }
    }

    onPermissionResponse(result: boolean) {
        this.hasPermission = result;
    }
}
