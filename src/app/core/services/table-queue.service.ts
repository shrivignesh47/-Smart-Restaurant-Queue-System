import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RestaurantDataService } from '../../shared/services/restaurant-data.service';

export interface Table {
    id: number;
    name: string;
    capacity: number;
    status: 'Available' | 'Occupied' | 'Reserved';
    type: string;
    features: string[];
    bookedBy?: string;
    ticketId?: string;
    bookedUntil?: Date;
}

export interface QueueEntry {
    id: string;
    customerName: string;
    partySize: number;
    joinedAt: Date;
    estimatedWaitTime: number;
    position: number;
    status: 'Waiting' | 'Called' | 'Seated' | 'Cancelled';
    restaurantId?: string;
}

export interface Reservation {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    partySize: number;
    reservationDate: Date;
    reservationTime: string;
    tableId?: number;
    status: 'Pending' | 'Confirmed' | 'Cancelled';
    restaurantId?: string;
    specialRequests?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TableQueueService {
    private tablesSubject = new BehaviorSubject<Table[]>([]);
    private queueSubject = new BehaviorSubject<QueueEntry[]>([]);
    private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
    private currentRestaurantId: string = '';

    tables$ = this.tablesSubject.asObservable();
    queue$ = this.queueSubject.asObservable();
    reservations$ = this.reservationsSubject.asObservable();

    constructor(private restaurantDataService: RestaurantDataService) { }

    // Load tables for a specific restaurant
    loadRestaurantTables(restaurantId: string) {
        this.currentRestaurantId = restaurantId;
        const tables = this.restaurantDataService.getRestaurantTables(restaurantId);
        this.tablesSubject.next(tables);
    }

    // Helper method for testing - makes all tables unavailable
    makeAllTablesUnavailable() {
        const tables = this.tablesSubject.value;
        tables.forEach(table => {
            if (table.status === 'Available') {
                table.status = 'Occupied';
            }
        });
        this.tablesSubject.next([...tables]);
    }

    // Helper method for testing - makes tables available again
    makeTablesAvailable() {
        const tables = this.tablesSubject.value;
        tables.forEach((table, index) => {
            if (index < 3) { // Make first 3 tables available
                table.status = 'Available';
                table.bookedBy = undefined;
                table.ticketId = undefined;
            }
        });
        this.tablesSubject.next([...tables]);
    }

    // Table Management
    getTables(): Table[] {
        return this.tablesSubject.value;
    }

    getAvailableTables(partySize?: number): Table[] {
        const tables = this.tablesSubject.value;
        let available = tables.filter(t => t.status === 'Available');

        if (partySize) {
            available = available.filter(t => t.capacity >= partySize);
        }

        return available;
    }

    hasAvailableTables(partySize?: number): boolean {
        return this.getAvailableTables(partySize).length > 0;
    }

    bookTable(tableId: number, customerName: string, partySize: number): { success: boolean; ticketId?: string; message: string } {
        const tables = this.tablesSubject.value;
        const table = tables.find(t => t.id === tableId);

        if (!table) {
            return { success: false, message: 'Table not found' };
        }

        if (table.status !== 'Available') {
            return { success: false, message: 'Table is not available' };
        }

        if (table.capacity < partySize) {
            return { success: false, message: 'Table capacity is insufficient' };
        }

        const ticketId = this.generateTicketId();
        table.status = 'Reserved';
        table.bookedBy = customerName;
        table.ticketId = ticketId;
        table.bookedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

        this.tablesSubject.next([...tables]);

        return { success: true, ticketId, message: 'Table booked successfully' };
    }

    // Queue Management
    getQueue(): QueueEntry[] {
        return this.queueSubject.value;
    }

    getQueuePosition(queueId: string): number {
        const queue = this.queueSubject.value;
        const entry = queue.find(q => q.id === queueId);
        return entry ? entry.position : -1;
    }

    joinQueue(customerName: string, partySize: number, restaurantId?: string): { success: boolean; queueId?: string; position?: number; estimatedWait?: number } {
        const queue = this.queueSubject.value;
        const queueId = this.generateQueueId();
        const position = queue.length + 1;
        const estimatedWaitTime = position * 5; // 5 minutes per position

        const newEntry: QueueEntry = {
            id: queueId,
            customerName,
            partySize,
            joinedAt: new Date(),
            estimatedWaitTime,
            position,
            status: 'Waiting',
            restaurantId
        };

        this.queueSubject.next([...queue, newEntry]);

        return {
            success: true,
            queueId,
            position,
            estimatedWait: estimatedWaitTime
        };
    }

    leaveQueue(queueId: string): boolean {
        const queue = this.queueSubject.value;
        const updatedQueue = queue.filter(q => q.id !== queueId);

        // Recalculate positions
        updatedQueue.forEach((entry, index) => {
            entry.position = index + 1;
            entry.estimatedWaitTime = (index + 1) * 5;
        });

        this.queueSubject.next(updatedQueue);
        return true;
    }

    // Reservation Management (for future dates)
    createReservation(reservation: Omit<Reservation, 'id' | 'status'>): { success: boolean; reservationId?: string; message: string } {
        const reservationDate = new Date(reservation.reservationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if reservation is for today or past
        if (reservationDate <= today) {
            return {
                success: false,
                message: 'Reservations must be for future dates. For immediate seating, please check available tables or join the queue.'
            };
        }

        const reservationId = this.generateReservationId();
        const newReservation: Reservation = {
            ...reservation,
            id: reservationId,
            status: 'Pending'
        };

        const reservations = this.reservationsSubject.value;
        this.reservationsSubject.next([...reservations, newReservation]);

        return {
            success: true,
            reservationId,
            message: 'Reservation created successfully'
        };
    }

    getReservations(): Reservation[] {
        return this.reservationsSubject.value;
    }

    cancelReservation(reservationId: string): boolean {
        const reservations = this.reservationsSubject.value;
        const reservation = reservations.find(r => r.id === reservationId);

        if (reservation) {
            reservation.status = 'Cancelled';
            this.reservationsSubject.next([...reservations]);
            return true;
        }

        return false;
    }

    // Helper methods
    private generateTicketId(): string {
        return 'TKT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }

    private generateQueueId(): string {
        return 'Q-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    }

    private generateReservationId(): string {
        return 'RES-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    }

    // Check availability and suggest action
    checkAvailabilityAndSuggest(partySize: number): {
        hasAvailable: boolean;
        suggestedAction: 'book' | 'queue' | 'reserve';
        availableTables?: Table[];
        queueSize?: number;
        estimatedWait?: number;
    } {
        const availableTables = this.getAvailableTables(partySize);
        const queueSize = this.queueSubject.value.length;

        if (availableTables.length > 0) {
            return {
                hasAvailable: true,
                suggestedAction: 'book',
                availableTables,
                queueSize
            };
        } else {
            return {
                hasAvailable: false,
                suggestedAction: 'queue',
                queueSize,
                estimatedWait: (queueSize + 1) * 5
            };
        }
    }
}
