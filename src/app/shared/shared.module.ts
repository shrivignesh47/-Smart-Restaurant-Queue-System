import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { HeroCarouselComponent } from './components/hero-carousel/hero-carousel.component';
import { BookingDialogComponent } from './components/booking-dialog/booking-dialog.component';

@NgModule({
  declarations: [
    HeroCarouselComponent,
    BookingDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    HeroCarouselComponent,
    BookingDialogComponent
  ]
})
export class SharedModule { }
