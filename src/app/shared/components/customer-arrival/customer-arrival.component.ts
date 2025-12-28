import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TableQueueService } from '../../../core/services/table-queue.service';

@Component({
    selector: 'app-customer-arrival',
    template: `
    <div class="arrival-container" style="max-width: 600px; margin: 80px auto; padding: 32px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h2 style="margin: 0;">Welcome to {{ restaurantName || 'Our Restaurant' }}!</h2>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content style="padding: 24px 0;">
          <p style="font-size: 1.1rem; margin-bottom: 24px;">
            How many people are in your party?
          </p>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Party Size</mat-label>
            <mat-select [(ngModel)]="partySize">
              <mat-option [value]="1">1 Person</mat-option>
              <mat-option [value]="2">2 People</mat-option>
              <mat-option [value]="3">3 People</mat-option>
              <mat-option [value]="4">4 People</mat-option>
              <mat-option [value]="5">5 People</mat-option>
              <mat-option [value]="6">6 People</mat-option>
              <mat-option [value]="7">7 People</mat-option>
              <mat-option [value]="8">8+ People</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" class="full-width" 
                  style="height: 56px; font-size: 1.1rem;"
                  (click)="checkAvailability()">
            <mat-icon>search</mat-icon> Check Availability
          </button>
        </mat-card-content>
      </mat-card>

      <div class="quick-actions" style="margin-top: 24px; text-align: center;">
        <p style="color: #666; margin-bottom: 12px;">Or choose an option:</p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button mat-stroked-button (click)="goToTables()">
            <mat-icon>table_restaurant</mat-icon> View All Tables
          </button>
          <button mat-stroked-button (click)="goToQueue()">
            <mat-icon>people</mat-icon> Join Queue
          </button>
          <button mat-stroked-button (click)="goToReservation()">
            <mat-icon>event</mat-icon> Make Reservation
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class CustomerArrivalComponent implements OnInit {
    partySize: number = 2;
    restaurantName: string = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private tableQueueService: TableQueueService
    ) { }

    ngOnInit() {
        this.restaurantName = this.route.snapshot.paramMap.get('restaurantName') || '';
    }

    checkAvailability() {
        const result = this.tableQueueService.checkAvailabilityAndSuggest(this.partySize);

        if (result.hasAvailable) {
            // Tables available - go to tables page
            this.router.navigate([this.restaurantName ? `/${this.restaurantName}/tables` : '/tables'], {
                queryParams: { checkAvailability: 'true', partySize: this.partySize }
            });
        } else {
            // No tables available - go to queue
            this.router.navigate([this.restaurantName ? `/${this.restaurantName}/queue` : '/queue'], {
                queryParams: { autoJoin: 'true', partySize: this.partySize }
            });
        }
    }

    goToTables() {
        this.router.navigate([this.restaurantName ? `/${this.restaurantName}/tables` : '/tables']);
    }

    goToQueue() {
        this.router.navigate([this.restaurantName ? `/${this.restaurantName}/queue` : '/queue']);
    }

    goToReservation() {
        this.router.navigate([this.restaurantName ? `/${this.restaurantName}/reservation` : '/reservation']);
    }
}
