import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { RestaurantGuard } from './core/guards/restaurant.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'tables',
    loadChildren: () => import('./features/tables/tables.module').then(m => m.TablesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'queue',
    loadChildren: () => import('./features/queue/queue.module').then(m => m.QueueModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reservation',
    loadChildren: () => import('./features/reservation/reservation.module').then(m => m.ReservationModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'manager',
    loadChildren: () => import('./features/manager/manager.module').then(m => m.ManagerModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'restaurants',
    loadChildren: () => import('./features/restaurants/restaurants.module').then(m => m.RestaurantsModule)
  },
  {
    path: 'sysqueue/admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'partner',
    loadChildren: () => import('./features/partner/partner.module').then(m => m.PartnerModule)
  },
  {
    path: ':restaurantName',
    loadChildren: () => import('./features/restaurant/restaurant.module').then(m => m.RestaurantModule),
    canActivate: [RestaurantGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
