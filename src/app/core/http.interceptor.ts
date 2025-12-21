import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // TODO: Add token to request headers if needed
    // const authToken = 'your-auth-token';
    // const authReq = req.clone({
    //   setHeaders: { Authorization: `Bearer ${authToken}` }
    // });

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // TODO: Implement proper error handling and logging service
        return throwError(() => error);
      })
    );
  }
}
