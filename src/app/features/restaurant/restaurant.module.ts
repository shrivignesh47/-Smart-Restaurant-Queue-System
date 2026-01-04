import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { RestaurantRoutingModule } from './restaurant-routing.module';
import { RestaurantComponent } from './restaurant.component';
import { TablesModule } from '../tables/tables.module';
import { QueueModule } from '../queue/queue.module';
import { ReservationModule } from '../reservation/reservation.module';
import { RestaurantAdminLoginComponent } from './restaurant-admin-login/restaurant-admin-login.component';
import { RestaurantAdminDashboardComponent } from './restaurant-admin-dashboard/restaurant-admin-dashboard.component';
import { RestaurantMenuComponent } from './components/restaurant-menu/restaurant-menu.component';
import { RestaurantGalleryComponent } from './components/restaurant-gallery/restaurant-gallery.component';

@NgModule({
  declarations: [
    RestaurantComponent,
    RestaurantAdminLoginComponent,
    RestaurantAdminDashboardComponent,
    RestaurantMenuComponent,
    RestaurantGalleryComponent
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
