import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantsComponent } from './restaurants.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
    { path: '', component: RestaurantsComponent }
];

@NgModule({
    declarations: [
        RestaurantsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class RestaurantsModule { }
