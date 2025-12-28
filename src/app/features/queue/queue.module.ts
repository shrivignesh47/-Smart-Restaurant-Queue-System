import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { QueueManagementComponent } from './components/queue-management/queue-management.component';

const routes: Routes = [
  { path: '', component: QueueManagementComponent }
];

@NgModule({
  declarations: [
    QueueManagementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    QueueManagementComponent
  ]
})
export class QueueModule { }
