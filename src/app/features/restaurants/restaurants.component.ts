import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent implements OnInit {
  searchQuery = '';
  selectedCity = 'all';
  sortBy = 'rating';

  restaurants: any[] = [];
  filteredRestaurants: any[] = [];
  cities: string[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.isLoading = true;
    // Fetch only active restaurants
    this.restaurantService.getAll({ status: 'active' }).subscribe({
      next: (data) => {
        this.restaurants = data.map(r => this.mapToDisplay(r));
        // Extract unique cities
        const uniqueCities = new Set(this.restaurants.map(r => r.city).filter(c => c));
        this.cities = ['all', ...Array.from(uniqueCities)].sort();

        this.filteredRestaurants = [...this.restaurants];
        this.sortRestaurants();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading restaurants', err);
        this.snackBar.open('Failed to load restaurants', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  mapToDisplay(r: any): any {
    // Map backend data to the format expected by the card component
    return {
      ...r,
      // Use cover image or fallback
      image: r.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      location: r.city || 'Tamil Nadu',
      // Mock / Default values for missing backend fields
      rating: 4.5,
      waitTime: '10-20 mins',
      status: 'Medium', // Maps to CSS class 'medium' (Low, Medium, Busy)
      // Convert comma-separated string to array
      cuisine: r.cuisine_type ? r.cuisine_type.split(',').map((c: string) => c.trim()) : [],
      specialties: [],
      priceRange: '₹₹',
      openingHours: (r.opening_time && r.closing_time) ?
        `${r.opening_time.toString().substring(0, 5)} - ${r.closing_time.toString().substring(0, 5)}` : '10:00 - 22:00'
    };
  }

  filterRestaurants(): void {
    let filtered = [...this.restaurants];

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        (r.name && r.name.toLowerCase().includes(query)) ||
        (r.cuisine && r.cuisine.some((c: string) => c.toLowerCase().includes(query))) ||
        (r.location && r.location.toLowerCase().includes(query)) ||
        (r.description && r.description.toLowerCase().includes(query))
      );
    }

    // Filter by city
    if (this.selectedCity && this.selectedCity !== 'all') {
      filtered = filtered.filter(r => r.city && r.city.toLowerCase() === this.selectedCity.toLowerCase());
    }

    this.filteredRestaurants = filtered;
    this.sortRestaurants();
  }

  sortRestaurants(): void {
    switch (this.sortBy) {
      case 'rating':
        this.filteredRestaurants.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        this.filteredRestaurants.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'waitTime':
        // Mock sorting for mock wait times
        this.filteredRestaurants.sort((a, b) => parseInt(a.waitTime) - parseInt(b.waitTime));
        break;
    }
  }

  viewRestaurant(restaurant: any): void {
    // Navigate using slug if available, else name
    this.router.navigate([`/${restaurant.slug || restaurant.name}`]);
  }
}
