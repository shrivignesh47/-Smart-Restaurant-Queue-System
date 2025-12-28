import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Restaurant {
  id: number;
  name: string;
  image: string;
  rating: number;
  cuisines: string[];
  location: string;
  hours: string;
  priceRange: string;
  isOpen: boolean;
  tablesAvailable: number;
  queueLength: number;
  isFavorite: boolean;
  distance?: number;
}

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent implements OnInit {
  searchQuery = '';
  selectedCuisine = '';
  sortBy = 'rating';

  restaurants: Restaurant[] = [
    {
      id: 1,
      name: 'La Bella Italia',
      image: 'assets/images/hero1.png',
      rating: 4.5,
      cuisines: ['Italian', 'Continental'],
      location: '123 Main Street, New York, NY 10001',
      hours: '10:00 AM - 11:00 PM',
      priceRange: '₹₹₹',
      isOpen: true,
      tablesAvailable: 5,
      queueLength: 3,
      isFavorite: false,
      distance: 2.5
    },
    {
      id: 2,
      name: 'Dragon Wok',
      image: 'assets/images/hero2.png',
      rating: 4.3,
      cuisines: ['Chinese', 'Asian'],
      location: '456 Park Avenue, New York, NY 10002',
      hours: '11:00 AM - 10:00 PM',
      priceRange: '₹₹',
      isOpen: true,
      tablesAvailable: 0,
      queueLength: 8,
      isFavorite: false,
      distance: 1.8
    },
    {
      id: 3,
      name: 'Spice Garden',
      image: 'assets/images/hero3.png',
      rating: 4.7,
      cuisines: ['Indian', 'Vegetarian'],
      location: '789 Broadway, New York, NY 10003',
      hours: '12:00 PM - 11:00 PM',
      priceRange: '₹₹',
      isOpen: true,
      tablesAvailable: 8,
      queueLength: 2,
      isFavorite: true,
      distance: 3.2
    },
    {
      id: 4,
      name: 'Taco Fiesta',
      image: 'assets/images/hero1.png',
      rating: 4.2,
      cuisines: ['Mexican', 'Latin'],
      location: '321 5th Avenue, New York, NY 10004',
      hours: '11:00 AM - 12:00 AM',
      priceRange: '₹₹',
      isOpen: true,
      tablesAvailable: 3,
      queueLength: 5,
      isFavorite: false,
      distance: 4.1
    },
    {
      id: 5,
      name: 'Sakura Sushi',
      image: 'assets/images/hero2.png',
      rating: 4.6,
      cuisines: ['Japanese', 'Sushi'],
      location: '654 Madison Avenue, New York, NY 10005',
      hours: '5:00 PM - 11:00 PM',
      priceRange: '₹₹₹₹',
      isOpen: false,
      tablesAvailable: 0,
      queueLength: 0,
      isFavorite: false,
      distance: 5.3
    },
    {
      id: 6,
      name: 'The Burger Joint',
      image: 'assets/images/hero3.png',
      rating: 4.1,
      cuisines: ['American', 'Fast Food'],
      location: '987 Lexington Avenue, New York, NY 10006',
      hours: '10:00 AM - 10:00 PM',
      priceRange: '₹',
      isOpen: true,
      tablesAvailable: 12,
      queueLength: 1,
      isFavorite: false,
      distance: 2.1
    }
  ];

  filteredRestaurants: Restaurant[] = [];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.filteredRestaurants = [...this.restaurants];
    this.sortRestaurants();
  }

  filterRestaurants(): void {
    let filtered = [...this.restaurants];

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.cuisines.some(c => c.toLowerCase().includes(query)) ||
        r.location.toLowerCase().includes(query)
      );
    }

    // Filter by cuisine
    if (this.selectedCuisine) {
      filtered = filtered.filter(r =>
        r.cuisines.some(c => c.toLowerCase() === this.selectedCuisine.toLowerCase())
      );
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
      case 'distance':
        this.filteredRestaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'price':
        this.filteredRestaurants.sort((a, b) => a.priceRange.length - b.priceRange.length);
        break;
    }
  }

  viewRestaurant(restaurant: Restaurant): void {
    this.router.navigate([`/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`]);
  }

  bookTable(restaurant: Restaurant, event: Event): void {
    event.stopPropagation();
    if (!restaurant.isOpen) {
      this.snackBar.open('Restaurant is currently closed', 'Close', { duration: 3000 });
      return;
    }
    this.router.navigate([`/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}/tables`]);
  }

  viewMenu(restaurant: Restaurant, event: Event): void {
    event.stopPropagation();
    this.snackBar.open('Menu feature coming soon!', 'Close', { duration: 2000 });
  }

  toggleFavorite(restaurant: Restaurant, event: Event): void {
    event.stopPropagation();
    restaurant.isFavorite = !restaurant.isFavorite;

    const message = restaurant.isFavorite
      ? `Added ${restaurant.name} to favorites`
      : `Removed ${restaurant.name} from favorites`;

    this.snackBar.open(message, 'Close', { duration: 2000 });
  }
}
