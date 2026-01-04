import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantComponent } from './restaurant.component';
import { TableListComponent } from '../tables/components/table-list/table-list.component';
import { QueueManagementComponent } from '../queue/components/queue-management/queue-management.component';
import { ReservationComponent } from '../reservation/components/reservation/reservation.component';
import { RestaurantAdminLoginComponent } from './restaurant-admin-login/restaurant-admin-login.component';
import { RestaurantAdminDashboardComponent } from './restaurant-admin-dashboard/restaurant-admin-dashboard.component';
import { RestaurantMenuComponent } from './components/restaurant-menu/restaurant-menu.component';
import { RestaurantGalleryComponent } from './components/restaurant-gallery/restaurant-gallery.component';

const routes: Routes = [
  {
    path: 'admin',
    children: [
      { path: '', component: RestaurantAdminLoginComponent },
      { path: 'dashboard', component: RestaurantAdminDashboardComponent }
    ]
  },
  {
    path: '',
    component: RestaurantComponent,
    children: [
      { path: '', redirectTo: 'tables', pathMatch: 'full' },
      { path: 'tables', component: TableListComponent },
      { path: 'menu', component: RestaurantMenuComponent },
      { path: 'gallery', component: RestaurantGalleryComponent },
      { path: 'queue', component: QueueManagementComponent },
      { path: 'reservation', component: ReservationComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantRoutingModule { }
