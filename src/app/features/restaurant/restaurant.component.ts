import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent implements OnInit {
  restaurantId: string | null = null;
  restaurant = {
    name: 'The Gourmet Kitchen',
    cuisine: 'Italian, Continental',
    rating: 4.5,
    address: '123 Main Street, New York, NY 10001',
    image: 'assets/images/hero1.png',
    status: 'Open',
    hours: '10:00 AM - 11:00 PM',
    description: 'Experience the finest Italian cuisine in the heart of New York. We offer a wide range of pasta, pizza, and fine wines.',
    tags: ['Family Friendly', 'Outdoor Seating', 'Free Wi-Fi']
  };

  navLinks = [
    { path: 'tables', label: 'Tables', icon: 'table_restaurant' },
    { path: 'queue', label: 'Join Queue', icon: 'queue' },
    { path: 'reservation', label: 'Reservations', icon: 'event' }
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Get restaurant name from parent route (defined in AppRoutingModule)
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantName') || 
                        this.route.parent?.snapshot.paramMap.get('restaurantName') || null;
    
    if (this.restaurantId) {
      // In a real app, fetch restaurant details using the name/ID
      // For now, we just update the name to show it's working
      // decoding URI component just in case
      const decodedName = decodeURIComponent(this.restaurantId);
      
      // If the name is literally "restaurants" (due to routing fallback), ignore or redirect?
      // Since we added explicit redirects in AppRouting, this shouldn't happen often,
      // but good to keep "The Gourmet Kitchen" as default if it does.
      if (decodedName.toLowerCase() !== 'restaurants') {
         this.restaurant.name = decodedName;
      }
    }
  }
}
