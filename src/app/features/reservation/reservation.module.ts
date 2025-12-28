import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReservationComponent } from './components/reservation/reservation.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: ReservationComponent }
];

@NgModule({
  declarations: [
    ReservationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ReservationComponent
  ]
})
export class ReservationModule { }
