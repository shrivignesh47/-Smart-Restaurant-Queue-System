import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-queue-management',
  templateUrl: './queue-management.component.html',
  styleUrls: ['./queue-management.component.scss']
})
export class QueueManagementComponent implements OnInit {
  @Input() restaurantId: string = '';

  currentQueueSize = 12;
  estimatedWaitTime = 25; // minutes
  userPosition: number | null = null;
  
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    if (!this.restaurantId) {
      this.restaurantId = this.getRestaurantNameFromRoute();
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

  joinQueue() {
    // Simulating joining queue
    this.userPosition = this.currentQueueSize + 1;
    this.currentQueueSize++;
    this.estimatedWaitTime += 2;
  }

  leaveQueue() {
    this.userPosition = null;
    this.currentQueueSize--;
    this.estimatedWaitTime -= 2;
  }
}
