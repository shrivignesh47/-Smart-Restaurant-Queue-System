import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token: string | null = null;

    // Check if we're on a manager dashboard route
    const currentUrl = this.router.url;
    const managerRouteMatch = currentUrl.match(/^\/([^\/]+)\/admin/);

    if (managerRouteMatch) {
      // On manager dashboard - use restaurant-specific manager token
      const restaurantSlug = managerRouteMatch[1];
      token = localStorage.getItem(`manager_${restaurantSlug}`);
    }

    // Fallback to customer token if no manager token found
    if (!token) {
      token = this.authService.token;
    }

    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Only logout customer session if we were using customer token
          if (!managerRouteMatch) {
            this.authService.logout();
          }
        }
        return throwError(() => error);
      })
    );
  }
}

