import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestaurantDataService, Restaurant } from '../../shared/services/restaurant-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  heroSlides = [
    {
      icon: 'auto_awesome',
      badge: 'Smart Tamil Restaurant Management',
      title1: 'Authentic Tamil',
      title2: 'Dining Experience',
      desc: 'Skip the wait at your favorite Tamil restaurants - Annapoorna, Anandhas, Gowrishankar, HMR. Join the queue remotely and enjoy seamless dining.',
      ctaPrimary: 'View Tables',
      ctaSecondary: 'Join Queue',
      image: 'assets/images/hero1.png'
    },
    {
      icon: 'restaurant',
      badge: 'Traditional Tamil Cuisine',
      title1: 'Savor the',
      title2: 'Best of Tamil Nadu',
      desc: 'Experience authentic South Indian flavors at popular restaurants with smart queue management and instant table reservations.',
      ctaPrimary: 'Explore',
      ctaSecondary: 'Learn More',
      image: 'assets/images/hero2.png'
    }
  ];

  restaurants: Restaurant[] = [];


  features = [
    { icon: 'table_bar', title: 'Real-Time Tables', desc: 'View live table availability and status updates instantly' },
    { icon: 'schedule', title: 'Smart Queue', desc: 'Join the waiting list and track your position in real-time' },
    { icon: 'calendar_today', title: 'Easy Reservations', desc: 'Book your table in advance with just a few clicks' },
    { icon: 'dashboard', title: 'Manager Dashboard', desc: 'Complete control over tables, queue, and reservations' }
  ];

  testimonials = [
    { name: 'Priya Krishnan', role: 'Restaurant Manager', comment: 'Smart Queue transformed how we handle our weekend rush at Annapoorna. No more angry customers waiting in line!', avatar: 'assets/images/hero1.png' },
    { name: 'Rajesh Kumar', role: 'Food Blogger', comment: 'I love being able to see the wait time at Gowrishankar before I even leave my house. A game changer for Tamil food lovers!', avatar: 'assets/images/hero2.png' },
    { name: 'Lakshmi Venkat', role: 'Regular Customer', comment: 'Booking a table at Anandhas has never been easier. The best way to enjoy authentic South Indian food without the wait!', avatar: 'assets/images/hero1.png' }
  ];

  customerFeatures = [
    { title: 'Join the Waiting Queue', desc: 'Join the waiting queue for a table.', icon: 'people' },
    { title: 'Book a Table in Advance', desc: 'Book a table in advance (if available).', icon: 'event_available' },
    { title: 'Real-Time Queue Position', desc: 'View real-time queue position and estimated waiting time.', icon: 'schedule' }
  ];

  constructor(private restaurantDataService: RestaurantDataService) { }

  ngOnInit() {
    // Load featured restaurants (first 4)
    this.restaurants = this.restaurantDataService.getFeaturedRestaurants(4);
  }

  ngOnDestroy() {
  }
}
