import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ScannerService {
    private apiUrl = `${environment.apiUrl}/scanner`;

    constructor(private http: HttpClient) { }

    validateKey(accessKey: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/validate-key`, { accessKey });
    }

    checkIn(accessKey: string, reservationId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/check-in`, { accessKey, reservationId });
    }

    getReservation(reservationId: number, accessKey: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/reservation/${reservationId}?accessKey=${accessKey}`);
    }

    getDailyStats(accessKey: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/stats?accessKey=${accessKey}`);
    }
}
