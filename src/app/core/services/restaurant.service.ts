import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MediaGroup {
    name: string;
    images: string[];
}

export interface Restaurant {
    id?: number;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    pin_code?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
    cover_image_url?: string;
    cuisine_type?: string;
    opening_time?: string;
    closing_time?: string;
    status?: 'active' | 'inactive' | 'suspended';
    created_by?: number;
    created_at?: string;
    updated_at?: string;

    // Website Configuration
    theme_color?: string;
    tagline?: string;
    gallery_images?: string[] | string;
    menu_images?: string[] | string;
    accept_queue?: number | boolean;
    accept_reservations?: number | boolean;
    is_paid_reservation?: number | boolean;
    reservation_fee?: number;
    scanner_access_key?: string;
    scanner_key_updated_at?: string;
    has_scanner_key?: boolean;
}

export interface RestaurantStats {
    admin_count: number;
    staff_count: number;
}

@Injectable({
    providedIn: 'root'
})
export class RestaurantService {
    private apiUrl = `${environment.apiUrl}/restaurants`;

    constructor(private http: HttpClient) { }

    getAll(filters?: { status?: string; city?: string }): Observable<Restaurant[]> {
        let params = new HttpParams();
        if (filters?.status) {
            params = params.set('status', filters.status);
        }
        if (filters?.city) {
            params = params.set('city', filters.city);
        }
        return this.http.get<Restaurant[]>(this.apiUrl, { params });
    }

    getById(id: number): Observable<Restaurant> {
        return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
    }

    getBySlug(slug: string): Observable<Restaurant> {
        return this.http.get<Restaurant>(`${this.apiUrl}/slug/${slug}`);
    }

    create(restaurant: Partial<Restaurant>): Observable<Restaurant> {
        console.log('[RestaurantService] Creating restaurant:', restaurant);
        return this.http.post<Restaurant>(this.apiUrl, restaurant);
    }

    update(id: number, restaurant: Partial<Restaurant>): Observable<Restaurant> {
        console.log('[RestaurantService] Updating restaurant:', id, restaurant);
        return this.http.put<Restaurant>(`${this.apiUrl}/${id}`, restaurant);
    }

    delete(id: number): Observable<any> {
        console.log('[RestaurantService] Deleting restaurant:', id);
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    getStats(id: number): Observable<RestaurantStats> {
        return this.http.get<RestaurantStats>(`${this.apiUrl}/${id}/stats`);
    }

    updateScannerKey(id: number, scannerKey: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/scanner-key`, { scannerKey });
    }

    getScannerKey(id: number): Observable<{ scanner_access_key: string }> {
        return this.http.get<{ scanner_access_key: string }>(`${this.apiUrl}/${id}/scanner-key`);
    }
}
