import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { HeroCarouselComponent } from './components/hero-carousel/hero-carousel.component';
import { BookingDialogComponent } from './components/booking-dialog/booking-dialog.component';
import { CustomerArrivalComponent } from './components/customer-arrival/customer-arrival.component';
import { JoinQueueDialogComponent } from './components/join-queue-dialog/join-queue-dialog.component';
import { QueueStatusDialogComponent } from './components/queue-status-dialog/queue-status-dialog.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { RestaurantCardComponent } from './components/restaurant-card/restaurant-card.component';
import { TableDialogComponent } from './components/table-dialog/table-dialog.component';
import { ReservationDialogComponent } from './components/reservation-dialog/reservation-dialog.component';
import { BulkTableDialogComponent } from './components/bulk-table-dialog/bulk-table-dialog.component';
import { MockPaymentDialogComponent } from './components/mock-payment-dialog/mock-payment-dialog.component';
import { MobileLoginDialogComponent } from './components/mobile-login-dialog/mobile-login-dialog.component';
import { CancellationDialogComponent } from './components/cancellation-dialog/cancellation-dialog.component';
import { TicketDialogComponent } from './components/ticket-dialog/ticket-dialog.component';
import { ScannerDialogComponent } from './components/scanner-dialog/scanner-dialog.component';
import { QRCodeModule } from 'angularx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  declarations: [
    HeroCarouselComponent,
    BookingDialogComponent,
    CustomerArrivalComponent,
    JoinQueueDialogComponent,
    QueueStatusDialogComponent,
    LoginDialogComponent,
    RestaurantCardComponent,
    TableDialogComponent,
    ReservationDialogComponent,
    BulkTableDialogComponent,
    MockPaymentDialogComponent,
    MobileLoginDialogComponent,
    CancellationDialogComponent,
    TicketDialogComponent,
    ScannerDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    QRCodeModule,
    ZXingScannerModule
  ],
  exports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HeroCarouselComponent,
    BookingDialogComponent,
    CustomerArrivalComponent,
    JoinQueueDialogComponent,
    QueueStatusDialogComponent,
    LoginDialogComponent,
    RestaurantCardComponent,
    TableDialogComponent,
    ReservationDialogComponent,
    BulkTableDialogComponent,
    MockPaymentDialogComponent,
    MobileLoginDialogComponent,
    CancellationDialogComponent,
    TicketDialogComponent,
    ScannerDialogComponent,
    QRCodeModule,
    ZXingScannerModule
  ]
})
export class SharedModule { }
