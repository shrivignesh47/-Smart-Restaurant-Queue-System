import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TableQueueService } from '../../core/services/table-queue.service';
import { RestaurantDataService } from '../../shared/services/restaurant-data.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent implements OnInit, OnDestroy {
  restaurantId: string | null = null;
  restaurant: any = {
    name: 'The Gourmet Kitchen',
    cuisine: 'Italian, Continental',
    rating: 4.5,
    address: '123 Main Street, New York, NY 10001',
    image: 'assets/images/hero1.png',
    status: 'Open',
    hours: '10:00 AM - 11:00 PM',
    description: 'Experience the finest Italian cuisine in the heart of New York. We offer a wide range of pasta, pizza, and fine wines.',
    tags: ['Family Friendly', 'Outdoor Seating', 'Free Wi-Fi'],
    themeColor: '#1976d2'
  };

  navLinks = [
    { path: 'tables', label: 'Tables', icon: 'table_restaurant', alwaysShow: true },
    { path: 'menu', label: 'Menu', icon: 'restaurant_menu', alwaysShow: true },
    { path: 'gallery', label: 'Gallery', icon: 'collections', alwaysShow: true },
    { path: 'queue', label: 'Join Queue', icon: 'queue', alwaysShow: false },
    { path: 'reservation', label: 'Reservations', icon: 'event', alwaysShow: true }
  ];

  hasAvailableTables: boolean = true;
  private tablesSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tableQueueService: TableQueueService,
    private restaurantDataService: RestaurantDataService
  ) { }

  ngOnInit(): void {
    // Get restaurant name from parent route (defined in AppRoutingModule)
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantName') ||
      this.route.parent?.snapshot.paramMap.get('restaurantName') || null;

    if (this.restaurantId) {
      // Decode URI component
      const decodedName = decodeURIComponent(this.restaurantId);

      // Fetch actual restaurant data from the service
      if (decodedName.toLowerCase() !== 'restaurants') {
        const restaurantData = this.restaurantDataService.getRestaurantByName(decodedName);

        if (restaurantData) {
          // Map the restaurant data to the component's restaurant object
          this.restaurant = {
            name: restaurantData.name,
            cuisine: Array.isArray(restaurantData.cuisine) ? restaurantData.cuisine.join(', ') : restaurantData.cuisine,
            rating: restaurantData.rating,
            address: restaurantData.address,
            image: restaurantData.image,
            status: restaurantData.status === 'Low' ? 'Open' : restaurantData.status === 'Busy' ? 'Busy' : 'Open',
            hours: restaurantData.openingHours || '10:00 AM - 11:00 PM',
            description: restaurantData.description,
            tags: restaurantData.specialties || ['Family Friendly', 'Outdoor Seating', 'Free Wi-Fi']
          };
        } else {
          // Fallback: just update the name if restaurant not found in service
          this.restaurant.name = decodedName;
        }
      }
    }

    // Subscribe to table availability changes
    this.tablesSubscription = this.tableQueueService.tables$.subscribe(tables => {
      this.hasAvailableTables = tables.some(t => t.status === 'Available');
    });

    // Listen to route changes to update tab visibility
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkAndRedirectIfNeeded();
    });

    // Initial check
    this.checkAndRedirectIfNeeded();

    // Load custom configuration from Manager Dashboard
    if (this.restaurantId) {
      const savedConfig = localStorage.getItem(`config_${this.restaurantId}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        this.restaurant = {
          ...this.restaurant,
          image: config.heroImage || this.restaurant.image,
          description: config.description || this.restaurant.description,
          address: config.address || this.restaurant.address,
          themeColor: config.themeColor || this.restaurant.themeColor
        };
        // If tagline is used in template, add it
        if (config.tagline) {
          this.restaurant.cuisine = config.tagline; // Overwriting cuisine for now as tagline
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.tablesSubscription) {
      this.tablesSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  get visibleNavLinks() {
    return this.navLinks.filter(link => {
      if (link.alwaysShow) return true;
      // Show Join Queue only when no tables are available
      if (link.path === 'queue') {
        return !this.hasAvailableTables;
      }
      return true;
    });
  }

  private checkAndRedirectIfNeeded(): void {
    const currentUrl = this.router.url;

    // If user is on queue page but tables became available, redirect to tables
    if (currentUrl.includes('/queue') && this.hasAvailableTables) {
      const basePath = this.restaurantId ? `/${this.restaurantId}` : '';
      this.router.navigate([`${basePath}/tables`]);
    }
  }
}
