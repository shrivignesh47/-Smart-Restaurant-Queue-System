import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Table {
    id: number;
    restaurant_id: number;
    name: string;
    capacity: number;
    type: string;
    status: 'Available' | 'Occupied' | 'Reserved' | 'Dirty';
    features: string | string[];
    bookedBy?: string;
    ticketId?: string;
    bookedUntil?: string | Date;
}

export interface QueueEntry {
    id: number;
    restaurant_id: number;
    customer_name: string;
    party_size: number;
    contact_info?: string;
    joined_at: string | Date;
    estimated_wait_time: number;
    position: number;
    status: 'Waiting' | 'Called' | 'Seated' | 'Cancelled';
    assigned_table_id?: number;
    assigned_table_name?: string;
}

export interface Reservation {
    id: number;
    restaurant_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    party_size: number;
    reservation_date: string;
    reservation_time: string;
    table_id?: number;
    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Seated' | 'Ended';
    special_requests?: string;
    payment_status?: string;
    payment_amount?: number;
    restaurant_name?: string;
    user_id?: number;
    cancelled_by?: string;
    cancellation_reason?: string;
    created_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TableQueueService {
    private apiUrl = environment.apiUrl;

    private tablesSubject = new BehaviorSubject<Table[]>([]);
    private queueSubject = new BehaviorSubject<QueueEntry[]>([]);
    private reservationsSubject = new BehaviorSubject<Reservation[]>([]);

    tables$ = this.tablesSubject.asObservable();
    queue$ = this.queueSubject.asObservable();
    reservations$ = this.reservationsSubject.asObservable();

    constructor(private http: HttpClient) { }

    // Table Management
    loadTables(restaurantId: number): Observable<Table[]> {
        return this.http.get<Table[]>(`${this.apiUrl}/tables/restaurant/${restaurantId}`).pipe(
            tap(tables => {
                // Parse features and map snake_case to camelCase
                const parsedTables = (tables as any[]).map(t => ({
                    ...t,
                    features: typeof t.features === 'string' ? JSON.parse(t.features) : t.features,
                    bookedBy: t.booked_by,
                    ticketId: t.ticket_id
                }));
                this.tablesSubject.next(parsedTables as Table[]);
            })
        );
    }

    fetchAvailableTablesForSlot(restaurantId: number, date: string, time: string): Observable<Table[]> {
        return this.http.get<Table[]>(`${this.apiUrl}/tables/available`, {
            params: { restaurantId: restaurantId.toString(), date, time }
        });
    }

    updateTableStatus(tableId: number, status: string, bookingData?: { booked_by?: string, ticket_id?: string }): Observable<any> {
        const payload = { status, ...bookingData };
        return this.http.patch(`${this.apiUrl}/tables/${tableId}/status`, payload).pipe(
            tap(() => {
                const tables = this.tablesSubject.value;
                const index = tables.findIndex(t => t.id === tableId);
                if (index !== -1) {
                    tables[index] = {
                        ...tables[index],
                        status: status as any,
                        bookedBy: bookingData?.booked_by,
                        ticketId: bookingData?.ticket_id
                    };
                    if (status === 'Available') {
                        tables[index].bookedBy = undefined;
                        tables[index].ticketId = undefined;
                    }
                    this.tablesSubject.next([...tables]);
                }
            })
        );
    }

    createTable(table: Partial<Table>): Observable<Table> {
        return this.http.post<Table>(`${this.apiUrl}/tables`, table).pipe(
            tap(newTable => {
                const tables = this.tablesSubject.value;
                this.tablesSubject.next([...tables, newTable]);
            })
        );
    }

    bulkCreateTables(restaurant_id: number, specs: any[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/tables/bulk`, { restaurant_id, specs }).pipe(
            tap(() => this.loadTables(restaurant_id).subscribe())
        );
    }

    updateTable(tableId: number, table: Partial<Table>): Observable<Table> {
        return this.http.put<Table>(`${this.apiUrl}/tables/${tableId}`, table).pipe(
            tap(updatedTable => {
                const tables = this.tablesSubject.value;
                const index = tables.findIndex(t => t.id === tableId);
                if (index !== -1) {
                    tables[index] = { ...tables[index], ...updatedTable };
                    this.tablesSubject.next([...tables]);
                }
            })
        );
    }

    deleteTable(tableId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/tables/${tableId}`).pipe(
            tap(() => {
                const tables = this.tablesSubject.value;
                const filtered = tables.filter(t => t.id !== tableId);
                this.tablesSubject.next(filtered);
            })
        );
    }

    // Queue Management
    loadQueue(restaurantId: number): Observable<QueueEntry[]> {
        return this.http.get<QueueEntry[]>(`${this.apiUrl}/queue/restaurant/${restaurantId}`).pipe(
            tap(entries => this.queueSubject.next(entries))
        );
    }

    joinQueue(entry: Partial<QueueEntry>): Observable<QueueEntry> {
        return this.http.post<QueueEntry>(`${this.apiUrl}/queue`, entry).pipe(
            tap(newEntry => {
                const current = this.queueSubject.value;
                this.queueSubject.next([...current, newEntry]);
            })
        );
    }

    updateQueueStatus(entryId: number, status: string, tableInfo?: { tableId: number, tableName: string }): Observable<any> {
        const payload: any = { status };
        if (tableInfo) {
            payload.tableId = tableInfo.tableId;
            payload.tableName = tableInfo.tableName;
        }
        return this.http.patch(`${this.apiUrl}/queue/${entryId}/status`, payload).pipe(
            tap(() => {
                const entry = this.queueSubject.value.find(q => q.id === entryId);
                if (entry) {
                    this.loadQueue(entry.restaurant_id).subscribe();
                }
            })
        );
    }

    getQueueEntry(entryId: number): Observable<QueueEntry> {
        return this.http.get<QueueEntry>(`${this.apiUrl}/queue/${entryId}`);
    }

    // Reservation Management
    loadReservations(restaurantId: number): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/restaurant/${restaurantId}`).pipe(
            tap(reservations => this.reservationsSubject.next(reservations))
        );
    }

    loadUserReservations(userId: number): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/user/${userId}`).pipe(
            tap(reservations => this.reservationsSubject.next(reservations))
        );
    }

    createReservation(reservation: Partial<Reservation>): Observable<Reservation> {
        return this.http.post<Reservation>(`${this.apiUrl}/reservations`, reservation).pipe(
            tap(newRes => {
                const current = this.reservationsSubject.value;
                this.reservationsSubject.next([...current, newRes]);
            })
        );
    }

    updateReservation(resId: number, reservation: Partial<Reservation>): Observable<Reservation> {
        return this.http.put<Reservation>(`${this.apiUrl}/reservations/${resId}`, reservation).pipe(
            tap(updatedRes => {
                const reservations = this.reservationsSubject.value;
                const index = reservations.findIndex(r => r.id === resId);
                if (index !== -1) {
                    reservations[index] = { ...reservations[index], ...updatedRes };
                    this.reservationsSubject.next([...reservations]);
                }
            })
        );
    }

    updateReservationStatus(resId: number, status: string, additionalData?: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/reservations/${resId}/status`, { status, ...additionalData }).pipe(
            tap((response: any) => {
                const reservations = this.reservationsSubject.value;
                const index = reservations.findIndex(r => r.id === resId);
                if (index !== -1) {
                    reservations[index].status = status as any;
                    if (status === 'Cancelled') {
                        reservations[index].cancelled_by = response.cancelled_by;
                        reservations[index].cancellation_reason = response.cancellation_reason;
                    }
                    this.reservationsSubject.next([...reservations]);
                }
            })
        );
    }

    deleteReservation(resId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/reservations/${resId}`).pipe(
            tap(() => {
                const reservations = this.reservationsSubject.value;
                const updatedReservations = reservations.filter(r => r.id !== resId);
                this.reservationsSubject.next(updatedReservations);
            })
        );
    }

    // Helper: Check Availability (Legacy Logic updated for real data)
    getAvailableTables(partySize: number): Table[] {
        return this.tablesSubject.value.filter(t => t.status === 'Available' && t.capacity >= partySize);
    }

    getQueue(): QueueEntry[] {
        return this.queueSubject.value;
    }

    leaveQueue(entryId: number | string): void {
        const id = typeof entryId === 'string' ? parseInt(entryId) : entryId;
        this.updateQueueStatus(id, 'Cancelled').subscribe();
    }

    checkAvailabilityAndSuggest(partySize: number): Table[] {
        return this.getAvailableTables(partySize);
    }
}
