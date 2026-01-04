import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-restaurant-gallery',
    template: `
    <div class="gallery-container">
        <h2 class="section-title">Photo Gallery</h2>
        <div class="gallery-grid" *ngIf="images.length > 0; else noGallery">
            <div *ngFor="let img of images" class="gallery-item">
                <img [src]="img" alt="Gallery Photo">
            </div>
        </div>
        <ng-template #noGallery>
            <div class="empty-state">
                <mat-icon>collections</mat-icon>
                <p>No photos available yet.</p>
            </div>
        </ng-template>
    </div>
  `,
    styles: [`
    .gallery-container { padding: 24px; animation: fadeIn 0.4s ease; }
    .section-title { font-size: 1.5rem; color: #1b2559; margin-bottom: 24px; font-weight: 700; }
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .gallery-item { aspect-ratio: 1; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: transform 0.2s; cursor: pointer; }
    .gallery-item:hover { transform: scale(1.02); }
    .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
    .empty-state { text-align: center; padding: 48px; color: #a3aed0; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RestaurantGalleryComponent implements OnInit {
    images: string[] = [];

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        const parentParams = this.route.parent?.snapshot.paramMap;
        const restaurantName = parentParams?.get('restaurantName');
        if (restaurantName) {
            const savedConfig = localStorage.getItem(`config_${restaurantName}`);
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                if (config.galleryImages) this.images = config.galleryImages;
            }
        }
    }
}
