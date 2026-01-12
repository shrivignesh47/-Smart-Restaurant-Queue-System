import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class CustomerGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const user = this.authService.currentUser;

        // Check if user is authenticated and has Customer role
        if (this.authService.isAuthenticated() && user?.role === 'Customer') {
            return true;
        }

        // If authenticated but not customer, redirect to appropriate dashboard
        if (this.authService.isAuthenticated()) {
            if (user?.role === 'Admin') {
                return this.router.createUrlTree(['/sysqueue/admin/dashboard']);
            }
            if (user?.role === 'RestaurantAdmin' || user?.role === 'RestaurantStaff') {
                return this.router.createUrlTree(['/partner']);
            }
        }

        // If not authenticated, redirect to login
        return this.router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
    }
}
