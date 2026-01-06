import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    id?: number;
    name: string;
    role: string;
    contact_info: string;
    password?: string;
    restaurant_id?: number;
    email?: string;
    date_of_birth?: string;
    gender?: string;
    street_address?: string;
    city?: string;
    state?: string;
    pin_code?: string;
    country?: string;
    dietary_preferences?: any;
    food_allergies?: string;
    created_at?: string;
    updated_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getAll(role?: string): Observable<User[]> {
        let params = new HttpParams();
        if (role) {
            params = params.set('role', role);
        }
        return this.http.get<User[]>(this.apiUrl, { params });
    }

    getById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    create(user: User): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    update(id: number, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
