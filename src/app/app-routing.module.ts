import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tables',
    pathMatch: 'full'
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
    path: '**',
    redirectTo: '/tables'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
