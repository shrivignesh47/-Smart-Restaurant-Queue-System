import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RestaurantDataService } from '../../shared/services/restaurant-data.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantGuard implements CanActivate {

  constructor(
    private restaurantDataService: RestaurantDataService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const restaurantName = route.paramMap.get('restaurantName');

    if (!restaurantName) {
      return this.router.createUrlTree(['/restaurants']);
    }

    // Check if restaurant exists in our data
    const restaurant = this.restaurantDataService.getRestaurantById(restaurantName.toLowerCase());

    if (!restaurant) {
      // Also try to find by name (case-insensitive)
      const allRestaurants = this.restaurantDataService.getAllRestaurants();
      const foundByName = allRestaurants.find(r =>
        r.name.toLowerCase() === restaurantName.toLowerCase() ||
        r.name.toLowerCase().replace(/\s+/g, '-') === restaurantName.toLowerCase()
      );

      if (!foundByName) {
        // Restaurant not found, redirect to restaurants list
        console.warn(`Restaurant "${restaurantName}" not found. Redirecting to restaurants page.`);
        return this.router.createUrlTree(['/restaurants']);
      }
    }

    return true;
  }
}
