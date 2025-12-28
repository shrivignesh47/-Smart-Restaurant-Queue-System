# Queue and Reservation System - Implementation Guide

## System Overview

This implementation provides a comprehensive queue and reservation management system for restaurants with intelligent customer routing based on table availability.

## Customer Flow

### 1. **Customer Arrival**
When a customer arrives (either physically or via the app), they are directed to the **Tables** section.

### 2. **Automatic Routing Logic**

#### Scenario A: Tables Available
- **What happens**: Customer sees available tables matching their party size
- **Action**: Customer can immediately book a table
- **Result**: Table is reserved with a ticket ID
- **Duration**: Booking is valid for 2 hours

#### Scenario B: No Tables Available
- **What happens**: System detects no available tables for the party size
- **Automatic redirect**: Customer is prompted to join the queue
- **Message displayed**: "No tables currently available for X guests. Queue size: Y. Estimated wait: Z minutes."
- **Action button**: "Join Queue"

### 3. **Queue System**
- Customers provide their name and party size
- System assigns a queue position and unique Queue ID
- Real-time updates on:
  - Current position in queue
  - Estimated wait time (5 minutes per position)
  - Total queue size
- Customers can leave the queue at any time
- Queue positions automatically recalculate when people leave

### 4. **Reservation System (Future Dates Only)**
- **Important**: Reservations are ONLY for future dates (tomorrow onwards)
- **Today/Immediate seating**: Customers must use Tables or Queue
- **Validation**: System prevents same-day reservations
- **Required information**:
  - Customer name, email, phone
  - Party size
  - Reservation date (must be tomorrow or later)
  - Preferred time slot
  - Optional special requests
- **Confirmation**: Unique reservation ID generated

## Technical Implementation

### Core Service: `TableQueueService`

Located at: `src/app/core/services/table-queue.service.ts`

#### Key Methods:

```typescript
// Check availability and get routing suggestion
checkAvailabilityAndSuggest(partySize: number): {
  hasAvailable: boolean;
  suggestedAction: 'book' | 'queue' | 'reserve';
  availableTables?: Table[];
  queueSize?: number;
  estimatedWait?: number;
}

// Book a table immediately
bookTable(tableId: number, customerName: string, partySize: number): {
  success: boolean;
  ticketId?: string;
  message: string;
}

// Join the waiting queue
joinQueue(customerName: string, partySize: number, restaurantId?: string): {
  success: boolean;
  queueId?: string;
  position?: number;
  estimatedWait?: number;
}

// Create advance reservation
createReservation(reservation: Omit<Reservation, 'id' | 'status'>): {
  success: boolean;
  reservationId?: string;
  message: string;
}
```

### Components

#### 1. **TableListComponent**
- Path: `src/app/features/tables/components/table-list/table-list.component.ts`
- **Features**:
  - Displays all tables with status (Available, Occupied, Reserved)
  - On arrival, checks availability automatically
  - Shows snackbar with availability status
  - Provides "Join Queue" button if all tables full
  - Handles immediate table booking

#### 2. **QueueManagementComponent**
- Path: `src/app/features/queue/components/queue-management/queue-management.component.ts`
- **Features**:
  - Real-time queue status display
  - Join queue form (name + party size)
  - Live position tracking
  - Estimated wait time calculation
  - Leave queue functionality
  - Alternative action buttons (Check Tables, Make Reservation)

#### 3. **ReservationComponent**
- Path: `src/app/features/reservation/components/reservation/reservation.component.ts`
- **Features**:
  - Future-date-only validation
  - Comprehensive booking form
  - Date picker with minimum date (tomorrow)
  - Time slot selection
  - Special requests field
  - Automatic redirect to Tables/Queue for same-day requests

#### 4. **CustomerArrivalComponent** (Optional)
- Path: `src/app/shared/components/customer-arrival/customer-arrival.component.ts`
- **Features**:
  - Welcome screen for new customers
  - Party size selection
  - Automatic routing based on availability
  - Quick action buttons for all options

## Usage Examples

### Example 1: Customer Wants Immediate Seating

```typescript
// Customer arrives and checks tables
// System automatically checks availability

const result = tableQueueService.checkAvailabilityAndSuggest(4); // Party of 4

if (result.hasAvailable) {
  // Show available tables
  // Customer can book immediately
} else {
  // Prompt to join queue
  // Show estimated wait time
}
```

### Example 2: Joining the Queue

```typescript
// Customer joins queue
const queueResult = tableQueueService.joinQueue('John Doe', 4);

// Result:
// {
//   success: true,
//   queueId: 'Q-ABC123XYZ',
//   position: 5,
//   estimatedWait: 25 // minutes
// }
```

### Example 3: Making a Reservation

```typescript
// Customer tries to book for today - REJECTED
const todayReservation = tableQueueService.createReservation({
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  customerPhone: '123-456-7890',
  partySize: 2,
  reservationDate: new Date(), // Today
  reservationTime: '19:00'
});

// Result:
// {
//   success: false,
//   message: 'Reservations must be for future dates...'
// }

// Customer books for tomorrow - SUCCESS
const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);

const futureReservation = tableQueueService.createReservation({
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  customerPhone: '123-456-7890',
  partySize: 2,
  reservationDate: tomorrowDate,
  reservationTime: '19:00'
});

// Result:
// {
//   success: true,
//   reservationId: 'RES-XYZ789ABC',
//   message: 'Reservation created successfully'
// }
```

## Routing Configuration

### URL Structure

```
/tables                    - View all tables, book immediately
/tables?checkAvailability=true&partySize=4  - Auto-check on arrival

/queue                     - Join waiting queue
/queue?autoJoin=true       - Prompted to join (no tables available)

/reservation               - Make advance reservation (future dates only)

/:restaurantName/tables    - Restaurant-specific tables
/:restaurantName/queue     - Restaurant-specific queue
/:restaurantName/reservation - Restaurant-specific reservation
```

## Data Models

### Table
```typescript
interface Table {
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
```

### QueueEntry
```typescript
interface QueueEntry {
  id: string;
  customerName: string;
  partySize: number;
  joinedAt: Date;
  estimatedWaitTime: number;
  position: number;
  status: 'Waiting' | 'Called' | 'Seated' | 'Cancelled';
  restaurantId?: string;
}
```

### Reservation
```typescript
interface Reservation {
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
```

## Key Features

✅ **Intelligent Routing**: Automatic direction to tables or queue based on availability
✅ **Real-time Updates**: Queue positions and wait times update automatically
✅ **Future-Only Reservations**: Enforced validation for advance bookings
✅ **Unique Identifiers**: Ticket IDs, Queue IDs, and Reservation IDs for tracking
✅ **User-Friendly Messages**: Clear guidance on what action to take
✅ **Flexible Navigation**: Easy switching between Tables, Queue, and Reservations
✅ **Responsive Design**: Works on all devices
✅ **Form Validation**: Comprehensive validation for all user inputs

## Testing the System

1. **Test Available Tables Flow**:
   - Navigate to `/tables`
   - Should see available tables
   - Click "Book" on an available table
   - Fill in booking dialog
   - Receive ticket ID

2. **Test Queue Flow**:
   - Mark all tables as Occupied/Reserved
   - Navigate to `/tables`
   - Should see "Join Queue" prompt
   - Click to join queue
   - Receive queue position and wait time

3. **Test Reservation Flow**:
   - Navigate to `/reservation`
   - Try to select today's date - should show error
   - Select tomorrow or later - should succeed
   - Fill in all required fields
   - Receive reservation ID

## Future Enhancements

- SMS/Email notifications when table is ready
- Integration with payment systems
- Table preference selection
- Loyalty program integration
- Multi-restaurant support
- Admin dashboard for managing queue
- Analytics and reporting
