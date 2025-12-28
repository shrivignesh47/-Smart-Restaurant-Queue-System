import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { HeroCarouselComponent } from './components/hero-carousel/hero-carousel.component';

@NgModule({
  declarations: [
    HeroCarouselComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    MaterialModule,
    HeroCarouselComponent
  ]
})
export class SharedModule { }
