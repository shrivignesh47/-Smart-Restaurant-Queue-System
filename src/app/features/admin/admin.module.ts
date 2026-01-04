import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AddRestaurantDialogComponent } from './admin-dashboard/add-restaurant-dialog.component';
import { AddAdminDialogComponent } from './admin-dashboard/add-admin-dialog.component';
import { AddManagerDialogComponent } from './admin-dashboard/add-manager-dialog.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminDashboardComponent,
    AddRestaurantDialogComponent,
    AddAdminDialogComponent,
    AddManagerDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
