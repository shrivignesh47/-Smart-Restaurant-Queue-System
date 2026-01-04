import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestaurantDataService, Restaurant } from '../../shared/services/restaurant-data.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent implements OnInit {
  searchQuery = '';
  selectedCity = 'all';
  sortBy = 'rating';

  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  cities: string[] = [];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private restaurantDataService: RestaurantDataService
  ) { }

  ngOnInit(): void {
    // Load all restaurants
    this.restaurants = this.restaurantDataService.getAllRestaurants();
    this.cities = ['all', ...this.restaurantDataService.getCities()];
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
        r.cuisine.some(c => c.toLowerCase().includes(query)) ||
        r.location.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    // Filter by city
    if (this.selectedCity && this.selectedCity !== 'all') {
      filtered = this.restaurantDataService.getRestaurantsByCity(this.selectedCity);

      // Apply search filter on city-filtered results
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(r =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine.some(c => c.toLowerCase().includes(query)) ||
          r.location.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
        );
      }
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
        this.filteredRestaurants.sort((a, b) => {
          const aTime = parseInt(a.waitTime);
          const bTime = parseInt(b.waitTime);
          return aTime - bTime;
        });
        break;
    }
  }

  viewRestaurant(restaurant: Restaurant): void {
    this.router.navigate([`/${restaurant.name}`]);
  }
}
