import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../../../core/auth.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  @Input() restaurantId: string = '';
  
  currentUser: User | null = null;
  myReservations: any[] = [];

  selectedDate: Date = new Date();
  guests = 2;
  timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ];
  selectedTime: string | null = null;

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    if (!this.restaurantId) {
      this.restaurantId = this.getRestaurantNameFromRoute();
    }
    
    this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (this.currentUser && !this.restaurantId) {
            this.loadMyReservations();
        }
    });
  }

  loadMyReservations() {
      // Mock data
      this.myReservations = [
          {
              id: 'RES-101',
              restaurantName: 'The Gourmet Kitchen',
              date: new Date(),
              time: '19:30',
              guests: 4,
              status: 'Confirmed'
          }
      ];
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

  selectTime(time: string) {
    this.selectedTime = time;
  }
}
