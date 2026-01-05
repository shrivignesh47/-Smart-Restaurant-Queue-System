import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TableQueueService } from '../../core/services/table-queue.service';
import { RestaurantDataService } from '../../shared/services/restaurant-data.service';
import { Subscription, filter } from 'rxjs';
import { RestaurantService, Restaurant } from '../../core/services/restaurant.service';

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
    themeColor: '#1976d2',
    acceptQueue: true,
    acceptReservations: true
  };

  private pollSubscription?: Subscription;

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
    private restaurantDataService: RestaurantDataService,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit(): void {
    // Get restaurant name from parent route (defined in AppRoutingModule)
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantName') ||
      this.route.parent?.snapshot.paramMap.get('restaurantName') || null;

    if (this.restaurantId) {
      this.loadRealRestaurantData();
      // Poll for status/settings updates every 5 seconds
      this.pollSubscription = new Subscription();
      const interval = setInterval(() => this.loadRealRestaurantData(), 5000);
      this.pollSubscription.add(() => clearInterval(interval));
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
  }

  private loadRealRestaurantData(): void {
    if (!this.restaurantId) return;

    this.restaurantService.getBySlug(this.restaurantId).subscribe({
      next: (data: Restaurant) => {
        console.log('[RestaurantComponent] Loaded API data:', data);

        // Update restaurant object for template
        this.restaurant = {
          name: data.name,
          cuisine: data.cuisine_type || 'General Cuisine',
          address: data.address || '',
          image: data.cover_image_url || 'assets/images/hero1.png',
          status: data.status === 'active' ? 'Open' : 'Closed',
          hours: `${data.opening_time || '10:00'} - ${data.closing_time || '23:00'}`,
          description: data.description || '',
          themeColor: data.theme_color || '#1976d2',
          tagline: data.tagline || '',
          acceptQueue: data.accept_queue === 1 || data.accept_queue === true,
          acceptReservations: data.accept_reservations === 1 || data.accept_reservations === true,
          logo: data.logo_url
        };

        // If tagline exists, use it as cuisine display
        if (data.tagline) {
          this.restaurant.cuisine = data.tagline;
        }

        // Apply theme color to body or local styles
        document.documentElement.style.setProperty('--restaurant-theme', this.restaurant.themeColor);

        // Load real-time data for all tabs
        if (data.id) {
          this.tableQueueService.loadTables(data.id).subscribe();
          this.tableQueueService.loadQueue(data.id).subscribe();
        }
      },
      error: (err: any) => {
        console.error('[RestaurantComponent] Error loading restaurant:', err);
        // Fallback to local storage if API fails (legacy support)
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
          if (config.tagline) this.restaurant.cuisine = config.tagline;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.tablesSubscription) {
      this.tablesSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  get visibleNavLinks() {
    return this.navLinks.filter(link => {
      // Hide Reservations if disabled by manager
      if (link.path === 'reservation') {
        return !!this.restaurant.acceptReservations;
      }

      // Handle Queue visibility
      if (link.path === 'queue') {
        // Hide completely if disabled by manager
        if (!this.restaurant.acceptQueue) return false;

        // Dynamic feature: Only show tab if no tables are available
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
