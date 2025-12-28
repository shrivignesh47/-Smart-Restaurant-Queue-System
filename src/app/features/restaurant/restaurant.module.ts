import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { RestaurantRoutingModule } from './restaurant-routing.module';
import { RestaurantComponent } from './restaurant.component';
import { TablesModule } from '../tables/tables.module';
import { QueueModule } from '../queue/queue.module';
import { ReservationModule } from '../reservation/reservation.module';

@NgModule({
  declarations: [
    RestaurantComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RestaurantRoutingModule,
    TablesModule,
    QueueModule,
    ReservationModule
  ]
})
export class RestaurantModule { }
