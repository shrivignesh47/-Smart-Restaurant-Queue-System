import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestaurantService } from '../../core/services/restaurant.service';

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

  restaurants: any[] = [];

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

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit() {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.restaurantService.getAll({ status: 'active' }).subscribe({
      next: (data) => {
        // Map backend data to UI format
        this.restaurants = data.slice(0, 4).map(r => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          image: r.cover_image_url || 'assets/images/hero1.png',
          logo: r.logo_url,
          rating: 4.5, // Default mock rating as backend doesn't have it yet
          cuisine: r.cuisine_type ? [r.cuisine_type] : ['South Indian'],
          location: r.city || 'Coimbatore',
          status: r.status === 'active' ? 'Open' : 'Closed',
          waitTime: '15-20 min',
          openingHours: r.opening_time ? `${r.opening_time.substring(0, 5)} - ${r.closing_time?.substring(0, 5)}` : '10:00 - 23:00',
          description: r.description || 'Authentic Tamil cuisine.'
        }));
      },
      error: (err) => {
        console.error('Error loading restaurants', err);
      }
    });
  }

  ngOnDestroy() {
  }
}
