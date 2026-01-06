import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { JoinQueueDialogComponent } from '../../../../shared/components/join-queue-dialog/join-queue-dialog.component';
import { TableQueueService, QueueEntry } from '../../../../core/services/table-queue.service';
import { RestaurantService, Restaurant } from '../../../../core/services/restaurant.service';
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
    private tableQueueService: TableQueueService,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit(): void {
    if (!this.restaurantId) {
      this.restaurantId = this.getRestaurantNameFromRoute();
    }

    // Subscribe to queue updates
    this.queueSubscription = this.tableQueueService.queue$.subscribe(queue => {
      this.queue = queue;
      this.currentQueueSize = queue.length;

      // Try to load from localStorage if not set but we have a stored ID
      if (!this.userQueueEntry) {
        const storedQueueId = localStorage.getItem(`queue_${this.restaurantId}`);
        if (storedQueueId) {
          const found = queue.find(q => q.id.toString() === storedQueueId);
          if (found) {
            this.userQueueEntry = found;
          } else {
            // If not found in current queue, we might have been seated or cancelled
            // But we should verify this by checking if it's in the background
            localStorage.removeItem(`queue_${this.restaurantId}`);
          }
        }
      }

      // Update user's entry if they're in queue
      if (this.userQueueEntry) {
        const updated = queue.find(q => q.id === this.userQueueEntry!.id);
        if (updated) {
          this.userQueueEntry = updated;
          this.estimatedWaitTime = updated.estimated_wait_time;
        } else {
          // User was removed from queue list (Seated or Cancelled)
          this.userQueueEntry = null;
          localStorage.removeItem(`queue_${this.restaurantId}`);
        }
      }
    });

    // Load initial data
    this.restaurantService.getBySlug(this.restaurantId).subscribe(res => {
      if (res.id) {
        this.tableQueueService.loadQueue(res.id).subscribe();
        this.tableQueueService.loadTables(res.id).subscribe();
      }
    });

    // Periodic refresh
    this.updateInterval = interval(30000).subscribe(() => {
      this.restaurantService.getBySlug(this.restaurantId).subscribe(res => {
        if (res.id) this.tableQueueService.loadQueue(res.id).subscribe();
      });
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
      this.snackBar.open('Please enter your name', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    this.restaurantService.getBySlug(this.restaurantId).subscribe(res => {
      if (res.id) {
        this.tableQueueService.joinQueue({
          restaurant_id: res.id,
          customer_name: this.customerName,
          party_size: this.partySize,
          contact_info: 'User-Input'
        }).subscribe({
          next: (newEntry) => {
            this.userQueueEntry = newEntry;
            localStorage.setItem(`queue_${this.restaurantId}`, newEntry.id.toString());
            this.snackBar.open(`Joined queue! Position: ${newEntry.position}`, 'Close', { duration: 5000 });
          },
          error: (err) => {
            console.error('Error joining queue:', err);
            this.snackBar.open('Error joining queue', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  leaveQueue() {
    if (!this.userQueueEntry) return;

    if (confirm('Are you sure you want to leave the queue?')) {
      this.tableQueueService.updateQueueStatus(this.userQueueEntry.id, 'Cancelled').subscribe({
        next: () => {
          this.snackBar.open('You have left the queue', 'Close', { duration: 3000 });
          this.userQueueEntry = null;
          localStorage.removeItem(`queue_${this.restaurantId}`);
        }
      });
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
