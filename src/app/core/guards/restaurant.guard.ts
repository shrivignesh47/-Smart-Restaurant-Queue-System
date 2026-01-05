import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { RestaurantService } from '../services/restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantGuard implements CanActivate {

  constructor(
    private restaurantService: RestaurantService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const restaurantName = route.paramMap.get('restaurantName');

    if (!restaurantName) {
      return this.router.createUrlTree(['/restaurants']);
    }

    return this.restaurantService.getBySlug(restaurantName).pipe(
      map(restaurant => {
        if (restaurant) {
          return true;
        } else {
          this.router.navigate(['/restaurants']);
          return false;
        }
      }),
      catchError((err) => {
        console.error('Restaurant not found:', err);
        return of(this.router.createUrlTree(['/restaurants']));
      })
    );
  }
}
