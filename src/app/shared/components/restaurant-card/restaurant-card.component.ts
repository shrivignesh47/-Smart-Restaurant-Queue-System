import { Component, Input } from '@angular/core';
import { Restaurant } from '../../services/restaurant-data.service';

@Component({
  selector: 'app-restaurant-card',
  templateUrl: './restaurant-card.component.html',
  styleUrls: ['./restaurant-card.component.scss']
})
export class RestaurantCardComponent {
  @Input() restaurant!: any;
  @Input() showFullDetails: boolean = false;
}
