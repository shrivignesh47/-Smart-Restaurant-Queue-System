import { Component, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Reservation } from '../../../core/services/table-queue.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-ticket-dialog',
  template: `
    <div class="ticket-wrapper">
      <div class="horizontal-ticket" #ticketSection>
        <!-- Left Dark Section -->
        <div class="left-section">
          <div class="event-title">
            <h2>{{data.restaurant_name || 'RESTAURANT'}}</h2>
            <p class="vip-text">RESERVATION TICKET</p>
          </div>

          <div class="ticket-details">
            <div class="detail-line">
              <span class="label">DATE:</span>
              <span class="value">{{data.reservation_date | date:'dd/MM/yyyy'}}</span>
            </div>
            <div class="detail-line">
              <span class="label">TIME:</span>
              <span class="value">{{data.reservation_time}}</span>
            </div>
            <div class="detail-line">
              <span class="label">GUESTS:</span>
              <span class="value">{{data.party_size}} People</span>
            </div>
          </div>

          <div class="admit-section">
            <div class="admit-text">ADMIT</div>
            <div class="barcode-placeholder">
              <qrcode [qrdata]="qrData" [width]="120" [errorCorrectionLevel]="'M'" [margin]="0"></qrcode>
            </div>
          </div>
        </div>

        <!-- Center Divider with Food Image -->
        <div class="center-divider">
          <div class="food-circle">
            <mat-icon class="food-icon">restaurant_menu</mat-icon>
          </div>
        </div>

        <!-- Right Light Section -->
        <div class="right-section">
          <div class="event-header">
            <span class="conference-label">RESTAURANT RESERVATION</span>
            <h1 class="event-name">{{data.restaurant_name || 'RESTAURANT NAME'}}</h1>
            <p class="event-subtitle">CONFIRMED BOOKING</p>
          </div>

          <div class="info-badges">
            <div class="badge-item">
              <span class="badge-label">DATE</span>
              <span class="badge-value">{{data.reservation_date | date:'dd/MM/yyyy'}}</span>
            </div>
            <div class="badge-item">
              <span class="badge-label">TABLE</span>
              <span class="badge-value">{{data.table_id || 'TBA'}}</span>
            </div>
            <div class="badge-item">
              <span class="badge-label">TICKET ID</span>
              <span class="badge-value">#{{data.id}}</span>
            </div>
          </div>

          <div class="venue-info">
            <div class="venue-line">
              <span class="venue-label">GUEST:</span>
              <span class="venue-value">{{data.customer_name}}</span>
            </div>
            <div class="venue-line">
              <span class="venue-label">TIME:</span>
              <span class="venue-value">{{data.reservation_time}}</span>
            </div>
          </div>

          <div class="contact-info">
            <div class="contact-item">
              <mat-icon>phone</mat-icon>
              <span>{{data.customer_phone}}</span>
            </div>
            <div class="contact-item" *ngIf="data.customer_email">
              <mat-icon>email</mat-icon>
              <span>{{data.customer_email}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button mat-stroked-button (click)="onClose()">
          <mat-icon>close</mat-icon> Close
        </button>
        <button mat-raised-button color="primary" (click)="downloadAsPDF()">
          <mat-icon>download</mat-icon> Download PDF
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ticket-wrapper {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      max-height: 85vh;
      overflow-y: auto;
    }

    .horizontal-ticket {
      display: flex;
      background: linear-gradient(135deg, #c3e4d8 0%, #d4f1e8 50%, #e8f5f1 100%);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      min-height: 350px;
      position: relative;
    }

    /* Left Dark Section */
    .left-section {
      flex: 0 0 280px;
      background: linear-gradient(135deg, #1a2332 0%, #2d3748 100%);
      padding: 30px 25px;
      color: white;
      position: relative;
      clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
    }

    .event-title h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .vip-text {
      margin: 0;
      font-size: 12px;
      font-weight: 600;
      opacity: 0.8;
      letter-spacing: 2px;
    }

    .ticket-details {
      margin-top: 30px;
      margin-bottom: 30px;
    }

    .detail-line {
      display: flex;
      margin-bottom: 12px;
      font-size: 13px;
    }

    .detail-line .label {
      font-weight: 700;
      width: 60px;
      opacity: 0.7;
    }

    .detail-line .value {
      font-weight: 600;
    }

    .admit-section {
      margin-top: 40px;
    }

    .admit-text {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 4px;
      margin-bottom: 12px;
    }

    .barcode-placeholder {
      background: white;
      padding: 8px;
      border-radius: 8px;
      display: inline-block;
    }

    /* Center Divider */
    .center-divider {
      position: absolute;
      left: 280px;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
    }

    .food-circle {
      width: 140px;
      height: 140px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      border: 8px solid #2d3748;
    }

    .food-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4318ff;
    }

    /* Right Light Section */
    .right-section {
      flex: 1;
      padding: 30px 30px 30px 60px;
      background: linear-gradient(135deg, #f0fdf9 0%, #e6f7f1 100%);
    }

    .event-header {
      margin-bottom: 24px;
    }

    .conference-label {
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .event-name {
      margin: 8px 0;
      font-size: 26px;
      font-weight: 900;
      color: #1e293b;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .event-subtitle {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      letter-spacing: 1px;
    }

    .info-badges {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .badge-item {
      text-align: center;
      background: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      flex: 1;
    }

    .badge-label {
      display: block;
      font-size: 9px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .badge-value {
      display: block;
      font-size: 14px;
      font-weight: 800;
      color: #1e293b;
    }

    .venue-info {
      margin-bottom: 20px;
    }

    .venue-line {
      display: flex;
      margin-bottom: 8px;
    }

    .venue-label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      width: 80px;
    }

    .venue-value {
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
    }

    .contact-info {
      display: flex;
      gap: 20px;
      margin-top: 16px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #64748b;
    }

    .contact-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #94a3b8;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .action-buttons button {
      border-radius: 12px;
      font-weight: 600;
    }

    .action-buttons mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .ticket-wrapper {
        padding: 10px;
      }

      .horizontal-ticket {
        flex-direction: column;
        min-height: auto;
      }

      .left-section {
        flex: 1;
        clip-path: none;
        padding: 30px 20px;
        border-radius: 20px 20px 0 0;
      }

      .event-title h2 {
        font-size: 22px;
      }

      .center-divider {
        position: relative;
        left: auto;
        top: auto;
        transform: none;
        margin: -40px auto;
        z-index: 10;
      }

      .food-circle {
        width: 100px;
        height: 100px;
        border-width: 6px;
      }

      .food-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .right-section {
        padding: 50px 20px 30px 20px;
        border-radius: 0 0 20px 20px;
      }

      .event-name {
        font-size: 22px;
      }

      .info-badges {
        flex-direction: column;
        gap: 12px;
      }

      .contact-info {
        flex-direction: column;
        gap: 12px;
      }

      .action-buttons {
        flex-direction: column;
        gap: 8px;
      }

      .action-buttons button {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .ticket-wrapper {
        padding: 5px;
      }

      .horizontal-ticket {
        border-radius: 16px;
      }

      .left-section {
        padding: 20px 15px;
      }

      .event-title h2 {
        font-size: 18px;
      }

      .detail-line {
        font-size: 11px;
      }

      .admit-text {
        font-size: 18px;
      }

      .barcode-placeholder {
        padding: 6px;
      }

      .food-circle {
        width: 80px;
        height: 80px;
        border-width: 5px;
      }

      .food-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .right-section {
        padding: 40px 15px 20px 15px;
      }

      .conference-label {
        font-size: 9px;
      }

      .event-name {
        font-size: 18px;
      }

      .event-subtitle {
        font-size: 11px;
      }

      .badge-item {
        padding: 10px 12px;
      }

      .badge-label {
        font-size: 8px;
      }

      .badge-value {
        font-size: 12px;
      }

      .venue-label,
      .venue-value {
        font-size: 11px;
      }

      .contact-item {
        font-size: 10px;
      }
    }
  `]
})
export class TicketDialogComponent {
  @ViewChild('ticketSection') ticketSection!: ElementRef;
  qrData: string;

  constructor(
    public dialogRef: MatDialogRef<TicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Reservation
  ) {
    this.qrData = `RES-${this.data.id}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  async downloadAsPDF() {
    const element = this.ticketSection.nativeElement;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: null
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('l', 'mm', 'a4');

    const pdfWidth = 297;
    const pdfHeight = 210;

    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const x = 10;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

    pdf.addPage();

    pdf.setFillColor(27, 37, 89);
    pdf.rect(0, 0, pdfWidth, 30, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TERMS AND CONDITIONS', pdfWidth / 2, 18, { align: 'center' });

    pdf.setTextColor(30, 41, 59);
    let yPos = 45;
    const lineHeight = 6;
    const margin = 20;
    const maxWidth = pdfWidth - (margin * 2);

    const terms = [
      {
        title: '1. Reservation Policy',
        content: 'This reservation is confirmed for the date and time specified. Please arrive 15 minutes before your scheduled time. Late arrivals may result in reduced dining time or cancellation.'
      },
      {
        title: '2. Cancellation Policy',
        content: 'Cancellations must be made at least 24 hours in advance. Cancellations within 24 hours may be subject to a fee. No-shows will be charged the full reservation fee if applicable.'
      },
      {
        title: '3. Party Size',
        content: 'The reservation is valid for the number of guests specified. Additional guests may not be accommodated without prior notice.'
      },
      {
        title: '4. QR Code',
        content: 'Please present the QR code upon arrival. This ticket is non-transferable and valid only for the reservation holder.'
      },
      {
        title: '5. Special Requests',
        content: 'Special dietary requirements or seating preferences should be communicated at booking. We will do our best to accommodate requests.'
      },
      {
        title: '6. Payment',
        content: 'Payment for meals is due at the end of your dining experience. Reservation fees, if applicable, are non-refundable except in cases of restaurant cancellation.'
      },
      {
        title: '7. Restaurant Rights',
        content: 'The restaurant reserves the right to cancel or modify reservations due to unforeseen circumstances. Guests will be notified promptly.'
      }
    ];

    terms.forEach((term) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(term.title, margin, yPos);
      yPos += lineHeight;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const lines = pdf.splitTextToSize(term.content, maxWidth);
      pdf.text(lines, margin, yPos);
      yPos += (lines.length * lineHeight) + 4;
    });

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Reservation #${this.data.id} | ${this.data.restaurant_name} | ${new Date().toLocaleDateString()}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });

    pdf.save(`Reservation-Ticket-${this.data.id}.pdf`);
  }
}
