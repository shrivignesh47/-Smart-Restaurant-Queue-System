import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-restaurant-menu',
    template: `
    <div class="menu-container">
        <h2 class="section-title">Our Menu</h2>
        <div class="menu-grid" *ngIf="images.length > 0; else noMenu">
            <div *ngFor="let img of images" class="menu-item">
                <img [src]="img" alt="Menu Page">
            </div>
        </div>
        <ng-template #noMenu>
            <div class="empty-state">
                <mat-icon>restaurant_menu</mat-icon>
                <p>Menu images coming soon.</p>
            </div>
        </ng-template>
    </div>
  `,
    styles: [`
    .menu-container { padding: 24px; animation: fadeIn 0.4s ease; }
    .section-title { font-size: 1.5rem; color: #1b2559; margin-bottom: 24px; font-weight: 700; }
    .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .menu-item { border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.2s; }
    .menu-item:hover { transform: translateY(-4px); }
    .menu-item img { width: 100%; height: auto; display: block; }
    .empty-state { text-align: center; padding: 48px; color: #a3aed0; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RestaurantMenuComponent implements OnInit {
    images: string[] = [];

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        // Get config from parent via localstorage since router-outlet doesn't easily pass inputs
        const parentParams = this.route.parent?.snapshot.paramMap;
        const restaurantName = parentParams?.get('restaurantName');
        if (restaurantName) {
            const savedConfig = localStorage.getItem(`config_${restaurantName}`);
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                if (config.menuImages) this.images = config.menuImages;
            }
        }
    }
}
