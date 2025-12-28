import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TableListComponent } from './components/table-list/table-list.component';

const routes: Routes = [
  { path: '', component: TableListComponent }
];

@NgModule({
  declarations: [
    TableListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    TableListComponent
  ]
})
export class TablesModule { }
