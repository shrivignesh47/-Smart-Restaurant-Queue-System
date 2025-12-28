import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { JoinQueueDialogComponent } from '../../../../shared/components/join-queue-dialog/join-queue-dialog.component';
import { TableQueueService, QueueEntry } from '../../../../core/services/table-queue.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-queue-management',
  templateUrl: './queue-management.component.html',
  styleUrls: ['./queue-management.component.scss']
})
export class QueueManagementComponent implements OnInit, OnDestroy {
  @Input() restaurantId: string = '';

  queue: QueueEntry[] = [];
  currentQueueSize = 0;
  estimatedWaitTime = 0;
  userQueueEntry: QueueEntry | null = null;
  customerName: string = '';
  partySize: number = 2;

  private queueSubscription?: Subscription;
  private updateInterval?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private tableQueueService: TableQueueService
  ) { }

  ngOnInit(): void {
    if (!this.restaurantId) {
      this.restaurantId = this.getRestaurantNameFromRoute();
    }

    // Subscribe to queue updates
    this.queueSubscription = this.tableQueueService.queue$.subscribe(queue => {
      this.queue = queue;
      this.currentQueueSize = queue.length;

      // Update user's entry if they're in queue
      if (this.userQueueEntry) {
        const updated = queue.find(q => q.id === this.userQueueEntry!.id);
        if (updated) {
          this.userQueueEntry = updated;
          this.estimatedWaitTime = updated.estimatedWaitTime;
        } else {
          // User was removed from queue
          this.userQueueEntry = null;
        }
      }
    });

    // Simulate real-time updates every 10 seconds
    this.updateInterval = interval(10000).subscribe(() => {
      if (this.userQueueEntry && this.userQueueEntry.position > 1) {
        // Simulate queue movement
        this.simulateQueueProgress();
      }
    });

    // Check if customer should be auto-directed here
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['autoJoin'] === 'true') {
      this.snackBar.open(
        'No tables are currently available. Join the queue to be notified when a table is ready.',
        'OK',
        { duration: 5000, panelClass: ['info-snackbar'] }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
    }
  }

  get userPosition(): number | null {
    return this.userQueueEntry ? this.userQueueEntry.position : null;
  }

  get isInQueue(): boolean {
    return this.userQueueEntry !== null;
  }

  joinQueue() {
    if (!this.customerName || this.customerName.trim() === '') {
      this.snackBar.open('Please enter your name', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.partySize < 1 || this.partySize > 20) {
      this.snackBar.open('Party size must be between 1 and 20', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const result = this.tableQueueService.joinQueue(
      this.customerName,
      this.partySize,
      this.restaurantId
    );

    if (result.success) {
      // Find the queue entry
      const queue = this.tableQueueService.getQueue();
      this.userQueueEntry = queue.find(q => q.id === result.queueId) || null;
      this.estimatedWaitTime = result.estimatedWait || 0;

      this.snackBar.open(
        `You've joined the queue! Position: ${result.position}. Estimated wait: ${result.estimatedWait} minutes`,
        'Close',
        {
          duration: 5000,
          panelClass: ['success-snackbar']
        }
      );
    }
  }

  leaveQueue() {
    if (!this.userQueueEntry) return;

    const confirmed = confirm('Are you sure you want to leave the queue?');
    if (confirmed) {
      const success = this.tableQueueService.leaveQueue(this.userQueueEntry.id);

      if (success) {
        this.snackBar.open('You have left the queue', 'Close', {
          duration: 3000,
          panelClass: ['info-snackbar']
        });
        this.userQueueEntry = null;
      }
    }
  }

  checkTables() {
    if (this.restaurantId) {
      this.router.navigate(['../tables'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/tables']);
    }
  }

  makeReservation() {
    if (this.restaurantId) {
      this.router.navigate(['../reservation'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/reservation']);
    }
  }

  private simulateQueueProgress() {
    // Simulate someone leaving the queue occasionally
    if (Math.random() > 0.7 && this.queue.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(3, this.queue.length));
      const entryToRemove = this.queue[randomIndex];

      if (entryToRemove && entryToRemove.id !== this.userQueueEntry?.id) {
        this.tableQueueService.leaveQueue(entryToRemove.id);
      }
    }
  }

  private getRestaurantNameFromRoute(): string {
    let route = this.route;
    while (route) {
      if (route.snapshot.paramMap.has('restaurantName')) {
        return route.snapshot.paramMap.get('restaurantName') || '';
      }
      if (!route.parent) break;
      route = route.parent;
    }
    return '';
  }
}
