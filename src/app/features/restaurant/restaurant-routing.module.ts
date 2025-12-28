import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantComponent } from './restaurant.component';
import { TableListComponent } from '../tables/components/table-list/table-list.component';
import { QueueManagementComponent } from '../queue/components/queue-management/queue-management.component';
import { ReservationComponent } from '../reservation/components/reservation/reservation.component';

const routes: Routes = [
  {
    path: '',
    component: RestaurantComponent,
    children: [
      { path: '', redirectTo: 'tables', pathMatch: 'full' },
      { path: 'tables', component: TableListComponent },
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
