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

@NgModule({
  declarations: [
    HeroCarouselComponent,
    BookingDialogComponent,
    CustomerArrivalComponent,
    JoinQueueDialogComponent,
    QueueStatusDialogComponent,
    LoginDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
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
    LoginDialogComponent
  ]
})
export class SharedModule { }
