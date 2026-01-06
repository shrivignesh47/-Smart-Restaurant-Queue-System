import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TableQueueService, QueueEntry } from '../../../core/services/table-queue.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-queue-status-dialog',
  template: `
    <div class="queue-status-dialog">
      <h2 mat-dialog-title class="dialog-header">
        <mat-icon class="pulse-icon">schedule</mat-icon>
        Live Queue Status
      </h2>
      
      <mat-dialog-content>
        <!-- Seated State - Customer has been assigned a table -->
        <ng-container *ngIf="isSeated">
          <div class="my-position-card seated">
            <div class="position-badge">
              <mat-icon class="seated-icon">event_seat</mat-icon>
              <div class="position-label">Seated</div>
            </div>
            
            <div class="customer-info">
              <h3>{{ seatedEntry?.customer_name }}</h3>
              <p class="party-size">
                <mat-icon inline>people</mat-icon>
                Party of {{ seatedEntry?.party_size }}
              </p>
              <p class="queue-id">Queue ID: <span class="mono">{{ seatedEntry?.id }}</span></p>
            </div>
          </div>

          <div class="seated-alert">
            <div class="table-assignment">
              <mat-icon class="table-icon">table_restaurant</mat-icon>
              <div class="table-info">
                <h4>🎉 You've Been Seated!</h4>
                <p class="table-name">Your Table: <strong>{{ seatedEntry?.assigned_table_name || 'Table Assigned' }}</strong></p>
                <p class="instruction">Please proceed to your assigned table. Enjoy your meal!</p>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Regular Queue State -->
        <ng-container *ngIf="!isSeated">
          <!-- My Position Card -->
          <div class="my-position-card" [class.ready]="myEntry?.position === 1">
            <div class="position-badge">
              <div class="position-number">{{ myEntry?.position || '?' }}</div>
              <div class="position-label">Your Position</div>
            </div>
            
            <div class="customer-info">
              <h3>{{ myEntry?.customer_name }}</h3>
              <p class="party-size">
                <mat-icon inline>people</mat-icon>
                Party of {{ myEntry?.party_size }}
              </p>
              <p class="queue-id">Queue ID: <span class="mono">{{ myEntry?.id }}</span></p>
            </div>
          </div>

          <!-- Alert when ready -->
          <div *ngIf="myEntry?.position === 1" class="ready-alert">
            <mat-icon class="alert-icon">notifications_active</mat-icon>
            <div>
              <h4>🎉 Your Table is Ready!</h4>
              <p>Please wait for staff to assign you a table. You will be notified shortly!</p>
            </div>
          </div>

          <!-- Wait Time Info -->
          <div class="wait-info-card" *ngIf="myEntry && myEntry.position > 1">
            <div class="info-row">
              <mat-icon>schedule</mat-icon>
              <div>
                <span class="label">Estimated Wait</span>
                <span class="value">~{{ myEntry.estimated_wait_time }} minutes</span>
              </div>
            </div>
            <div class="info-row">
              <mat-icon>people_outline</mat-icon>
              <div>
                <span class="label">People Ahead</span>
                <span class="value">{{ myEntry.position - 1 }} {{ myEntry.position - 1 === 1 ? 'person' : 'people' }}</span>
              </div>
            </div>
            <div class="info-row">
              <mat-icon>groups</mat-icon>
              <div>
                <span class="label">Total in Queue</span>
                <span class="value">{{ totalQueueSize }}</span>
              </div>
            </div>
          </div>

          <!-- Queue List -->
          <div class="queue-list-section">
            <h4>Current Queue</h4>
            <div class="queue-list">
              <div *ngFor="let entry of queueList; let i = index" 
                   class="queue-item"
                   [class.is-me]="entry.id === myEntry?.id"
                   [class.is-next]="i === 0">
                <div class="item-position">
                  <span class="position-num">{{ entry.position }}</span>
                  <mat-icon *ngIf="i === 0" class="crown-icon">stars</mat-icon>
                </div>
                <div class="item-info">
                  <div class="item-name">
                    {{ entry.id === myEntry?.id ? 'You' : entry.customer_name }}
                    <mat-chip *ngIf="entry.id === myEntry?.id" class="me-chip">ME</mat-chip>
                  </div>
                  <div class="item-details">
                    Party of {{ entry.party_size }} • ~{{ entry.estimated_wait_time }} min wait
                  </div>
                </div>
                <div class="item-status">
                  <mat-icon *ngIf="entry.status === 'Waiting'" class="status-icon waiting">schedule</mat-icon>
                  <mat-icon *ngIf="entry.status === 'Called'" class="status-icon called">notifications_active</mat-icon>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Live Update Indicator -->
        <div class="live-indicator">
          <span class="pulse-dot"></span>
          <span class="live-text">Live Updates • Last updated {{ lastUpdateTime }}</span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="leaveQueue()" color="warn" *ngIf="!isSeated">
          <mat-icon>exit_to_app</mat-icon> Leave Queue
        </button>
        <button mat-raised-button mat-dialog-close color="primary">
          <mat-icon>close</mat-icon> Close
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .queue-status-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--primary-color);
      margin: 0;
    }

    .pulse-icon {
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }

    .my-position-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
      display: flex;
      gap: 24px;
      align-items: center;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }

    .my-position-card.ready {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      animation: glow 2s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 8px 24px rgba(56, 239, 125, 0.4); }
      50% { box-shadow: 0 12px 32px rgba(56, 239, 125, 0.6); }
    }

    .position-badge {
      text-align: center;
      min-width: 100px;
    }

    .position-number {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1;
      text-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .position-label {
      font-size: 0.9rem;
      opacity: 0.9;
      margin-top: 4px;
    }

    .customer-info h3 {
      margin: 0 0 8px;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .customer-info p {
      margin: 4px 0;
      opacity: 0.95;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .mono {
      font-family: 'Courier New', monospace;
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .ready-alert {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      gap: 16px;
      align-items: center;
      animation: shake 0.5s ease-in-out infinite;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .alert-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .ready-alert h4 {
      margin: 0 0 8px;
      font-size: 1.3rem;
    }

    .ready-alert p {
      margin: 0;
      opacity: 0.95;
    }

    .my-position-card.seated {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .seated-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .seated-alert {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    }

    .table-assignment {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .table-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.9;
    }

    .table-info h4 {
      margin: 0 0 12px;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .table-name {
      font-size: 1.2rem;
      margin: 0 0 8px;
    }

    .table-name strong {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 1.4rem;
    }

    .instruction {
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }

    .wait-info-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row mat-icon {
      color: var(--primary-color);
    }

    .info-row > div {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-row .label {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .info-row .value {
      font-weight: 600;
      color: #212529;
      font-size: 1.1rem;
    }

    .queue-list-section h4 {
      margin: 0 0 12px;
      color: #495057;
      font-size: 1.1rem;
    }

    .queue-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .queue-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      background: white;
      border: 1px solid #e9ecef;
      transition: all 0.2s ease;
    }

    .queue-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .queue-item.is-me {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      border: 2px solid var(--primary-color);
    }

    .queue-item.is-next {
      background: linear-gradient(135deg, #ffeaa715 0%, #ffbc0015 100%);
      border: 2px solid #ffc107;
    }

    .item-position {
      min-width: 50px;
      text-align: center;
      position: relative;
    }

    .position-num {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .crown-icon {
      position: absolute;
      top: -8px;
      right: -8px;
      color: #ffc107;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      font-weight: 600;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .me-chip {
      height: 20px;
      font-size: 0.7rem;
      background: var(--primary-color);
      color: white;
    }

    .item-details {
      font-size: 0.85rem;
      color: #6c757d;
    }

    .status-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .status-icon.waiting {
      color: #6c757d;
    }

    .status-icon.called {
      color: #28a745;
      animation: ring 1s ease-in-out infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 20px;
      font-size: 0.85rem;
      color: #6c757d;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #28a745;
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @media (max-width: 600px) {
      .queue-status-dialog {
        min-width: 100%;
      }

      .my-position-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class QueueStatusDialogComponent implements OnInit, OnDestroy {
  myEntry: QueueEntry | null = null;
  seatedEntry: QueueEntry | null = null;
  isSeated: boolean = false;
  queueList: QueueEntry[] = [];
  totalQueueSize: number = 0;
  lastUpdateTime: string = 'just now';

  private queueSubscription?: Subscription;
  private updateInterval?: Subscription;
  private seatedCheckInterval?: Subscription;
  private alertShown: boolean = false;
  private seatedAlertShown: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<QueueStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { queueId: string },
    private tableQueueService: TableQueueService
  ) { }

  ngOnInit() {
    this.queueSubscription = this.tableQueueService.queue$.subscribe(queue => {
      this.queueList = queue.sort((a, b) => a.position - b.position);
      this.totalQueueSize = queue.length;
      this.myEntry = queue.find(q => q.id.toString() === this.data.queueId) || null;

      if (this.myEntry && this.myEntry.position === 1 && !this.alertShown) {
        this.showReadyAlert();
        this.alertShown = true;
      }

      if (!this.myEntry && !this.isSeated) {
        this.checkIfSeated();
      }

      this.updateLastUpdateTime();
    });

    this.updateInterval = interval(10000).subscribe(() => {
      this.updateLastUpdateTime();
    });

    this.seatedCheckInterval = interval(3000).subscribe(() => {
      if (!this.isSeated) {
        this.checkIfSeated();
      }
    });

    this.checkIfSeated();
  }

  checkIfSeated() {
    if (this.data.queueId) {
      this.tableQueueService.getQueueEntry(parseInt(this.data.queueId)).subscribe({
        next: (entry) => {
          if (entry.status === 'Seated') {
            this.isSeated = true;
            this.seatedEntry = entry;

            if (!this.seatedAlertShown && entry.assigned_table_name) {
              this.showSeatedAlert(entry.assigned_table_name);
              this.seatedAlertShown = true;
            }
          }
        },
        error: () => { }
      });
    }
  }

  showSeatedAlert(tableName: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('You\'ve Been Seated! 🎉', {
        body: `Your table is ready: ${tableName}. Please proceed to your assigned table.`,
        icon: '/assets/icons/icon-192x192.png'
      });
    }
  }

  ngOnDestroy() {
    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
    }
    if (this.seatedCheckInterval) {
      this.seatedCheckInterval.unsubscribe();
    }
  }

  updateLastUpdateTime() {
    const now = new Date();
    this.lastUpdateTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  showReadyAlert() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Your Table is Ready! 🎉', {
        body: 'Please proceed to the restaurant now.',
        icon: '/assets/icons/icon-192x192.png'
      });
    }
  }

  leaveQueue() {
    if (this.myEntry && confirm('Are you sure you want to leave the queue?')) {
      this.tableQueueService.leaveQueue(this.myEntry.id);
      this.dialogRef.close({ left: true });
    }
  }
}
