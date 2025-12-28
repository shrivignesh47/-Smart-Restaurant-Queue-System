import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TableQueueService } from '../../core/services/table-queue.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent implements OnInit, OnDestroy {
  restaurantId: string | null = null;
  restaurant = {
    name: 'The Gourmet Kitchen',
    cuisine: 'Italian, Continental',
    rating: 4.5,
    address: '123 Main Street, New York, NY 10001',
    image: 'assets/images/hero1.png',
    status: 'Open',
    hours: '10:00 AM - 11:00 PM',
    description: 'Experience the finest Italian cuisine in the heart of New York. We offer a wide range of pasta, pizza, and fine wines.',
    tags: ['Family Friendly', 'Outdoor Seating', 'Free Wi-Fi']
  };

  navLinks = [
    { path: 'tables', label: 'Tables', icon: 'table_restaurant', alwaysShow: true },
    { path: 'queue', label: 'Join Queue', icon: 'queue', alwaysShow: false },
    { path: 'reservation', label: 'Reservations', icon: 'event', alwaysShow: true }
  ];

  hasAvailableTables: boolean = true;
  private tablesSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tableQueueService: TableQueueService
  ) { }

  ngOnInit(): void {
    // Get restaurant name from parent route (defined in AppRoutingModule)
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantName') ||
      this.route.parent?.snapshot.paramMap.get('restaurantName') || null;

    if (this.restaurantId) {
      // In a real app, fetch restaurant details using the name/ID
      // For now, we just update the name to show it's working
      // decoding URI component just in case
      const decodedName = decodeURIComponent(this.restaurantId);

      // If the name is literally "restaurants" (due to routing fallback), ignore or redirect?
      // Since we added explicit redirects in AppRouting, this shouldn't happen often,
      // but good to keep "The Gourmet Kitchen" as default if it does.
      if (decodedName.toLowerCase() !== 'restaurants') {
        this.restaurant.name = decodedName;
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
