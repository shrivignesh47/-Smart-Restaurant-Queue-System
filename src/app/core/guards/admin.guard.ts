import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const user = this.authService.currentUser;

        // Check if user is authenticated and has Admin role
        if (this.authService.isAuthenticated() && user?.role === 'Admin') {
            return true;
        }

        // If authenticated but not admin, redirect to home
        if (this.authService.isAuthenticated()) {
            return this.router.createUrlTree(['/']);
        }

        // If not authenticated, redirect to admin login
        return this.router.createUrlTree(['/sysqueue/admin/login']);
    }
}
