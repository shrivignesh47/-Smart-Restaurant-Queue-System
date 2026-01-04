import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface User {
    id: number;
    name: string;
    role: string;
    contact_info: string;
    avatar?: string;
}

export interface AuthResponse {
    accessToken: string;
    id: number;
    name: string;
    role: string;
    contact_info: string;
}

export interface OtpResponse {
    message: string;
    otp?: string;
    otpToken: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private userSubject = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                this.userSubject.next(JSON.parse(userStr));
            } catch (e) {
                console.error('Failed to parse user', e);
                this.logout();
            }
        }
    }

    get currentUserValue(): User | null {
        return this.userSubject.value;
    }

    get token(): string | null {
        return localStorage.getItem('accessToken');
    }

    sendOtp(contact_info: string): Observable<OtpResponse> {
        console.log('[AuthService] Sending OTP to:', contact_info);
        console.log('[AuthService] API URL:', `${this.apiUrl}/send-otp`);

        return this.http.post<OtpResponse>(`${this.apiUrl}/send-otp`, { contact_info })
            .pipe(
                tap(response => console.log('[AuthService] OTP Response:', response)),
                catchError(error => {
                    console.error('[AuthService] Send OTP Error:', error);
                    return throwError(() => error);
                })
            );
    }

    verifyOtp(contact_info: string, otp: string, otpToken: string): Observable<AuthResponse> {
        console.log('[AuthService] Verifying OTP for:', contact_info);
        console.log('[AuthService] API URL:', `${this.apiUrl}/verify-otp`);

        return this.http.post<AuthResponse>(`${this.apiUrl}/verify-otp`, { contact_info, otp, otpToken })
            .pipe(
                tap(response => {
                    console.log('[AuthService] Verify Response:', response);
                    this.setSession(response);
                }),
                catchError(error => {
                    console.error('[AuthService] Verify OTP Error:', error);
                    return throwError(() => error);
                })
            );
    }

    private setSession(authResult: AuthResponse) {
        console.log('[AuthService] Setting session for user:', authResult.name);

        // Store token with expiration time (1 hour from now)
        const expiresAt = new Date().getTime() + (60 * 60 * 1000); // 1 hour in milliseconds
        localStorage.setItem('accessToken', authResult.accessToken);
        localStorage.setItem('tokenExpiry', expiresAt.toString());

        const user: User = {
            id: authResult.id,
            name: authResult.name,
            role: authResult.role,
            contact_info: authResult.contact_info
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);

        console.log('[AuthService] Session set. Token expires at:', new Date(expiresAt).toLocaleString());
    }

    logout() {
        console.log('[AuthService] Logging out user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
        this.userSubject.next(null);

        // Don't force navigate to login, just clear the session
        // The user can stay on the current page
    }

    isAuthenticated(): boolean {
        const token = this.token;
        if (!token) {
            return false;
        }

        // Check if token has expired
        const expiryStr = localStorage.getItem('tokenExpiry');
        if (expiryStr) {
            const expiry = parseInt(expiryStr, 10);
            const now = new Date().getTime();

            if (now > expiry) {
                console.log('[AuthService] Token expired, logging out');
                this.logout();
                return false;
            }
        }

        return true;
    }
}
