import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService, MediaGroup } from '../../../../core/services/restaurant.service';

interface GalleryItem {
    url: string;
    group: string;
}

interface Category {
    name: string;
    count: number;
}

@Component({
    selector: 'app-restaurant-gallery',
    template: `
    <div class="gallery-container">
        <h2 class="section-title">Photo Gallery</h2>
        
        <div *ngIf="loading" class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && allImages.length > 0; else noGallery">
            
            <!-- Filter Tabs -->
            <div class="filter-bar">
                <button 
                    class="filter-btn" 
                    [class.active]="selectedCategory === 'All'"
                    (click)="selectedCategory = 'All'">
                    All ({{ allImages.length }})
                </button>
                <button 
                    *ngFor="let cat of categories"
                    class="filter-btn" 
                    [class.active]="selectedCategory === cat.name"
                    (click)="selectedCategory = cat.name">
                    {{ cat.name }} ({{ cat.count }})
                </button>
            </div>

            <!-- Gallery Grid -->
            <div class="gallery-grid">
                <div *ngFor="let item of filteredImages; let i = index" 
                     class="gallery-item" 
                     (click)="openLightbox(i)">
                    <img [src]="item.url" loading="lazy" alt="Gallery Photo">
                    <div class="overlay">
                        <mat-icon>zoom_in</mat-icon>
                    </div>
                </div>
            </div>

        </div>

        <ng-template #noGallery>
            <div class="empty-state" *ngIf="!loading">
                <mat-icon>collections</mat-icon>
                <p>No photos available yet.</p>
            </div>
        </ng-template>

        <!-- Lightbox -->
        <div class="lightbox" *ngIf="lightboxOpen" (click)="closeLightbox()">
            <button class="close-btn" mat-icon-button (click)="closeLightbox()">
                <mat-icon>close</mat-icon>
            </button>
            
            <button class="nav-btn prev" mat-icon-button (click)="$event.stopPropagation(); prevImage()" *ngIf="hasPrev()">
                <mat-icon>chevron_left</mat-icon>
            </button>

            <div class="lightbox-content" (click)="$event.stopPropagation()">
                <img [src]="currentImageUrl" class="lightbox-img">
                <div class="lightbox-caption" *ngIf="currentGroupName">
                    {{ currentGroupName }}
                </div>
            </div>

            <button class="nav-btn next" mat-icon-button (click)="$event.stopPropagation(); nextImage()" *ngIf="hasNext()">
                <mat-icon>chevron_right</mat-icon>
            </button>
        </div>
    </div>
  `,
    styles: [`
    .gallery-container { padding: 32px; animation: fadeIn 0.4s ease; max-width: 1200px; margin: 0 auto; }
    .section-title { font-size: 2rem; color: #1b2559; margin-bottom: 32px; font-weight: 800; letter-spacing: -0.5px; }
    
    .loading-state { display: flex; justify-content: center; padding: 60px; }

    /* Filter Bar Styles */
    .filter-bar { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 12px; 
        margin-bottom: 32px; 
        border-bottom: 1px solid #e0e5f2;
        padding-bottom: 16px;
    }

    .filter-btn {
        background: transparent;
        border: 1px solid #e0e5f2;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 0.9rem;
        font-weight: 600;
        color: #707eae;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
    }

    .filter-btn:hover {
        background: #f4f7fe;
        color: #2b3674;
        border-color: #d1d5db;
    }

    .filter-btn.active {
        background: #ee5d50;
        color: white;
        border-color: #ee5d50;
        box-shadow: 0 4px 10px rgba(238, 93, 80, 0.3);
    }
    
    .gallery-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
        gap: 20px; 
    }
    
    .gallery-item { 
        position: relative;
        aspect-ratio: 1; 
        border-radius: 16px; 
        overflow: hidden; 
        box-shadow: 0 10px 20px rgba(112, 144, 176, 0.12);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        background: #f4f7fe;
    }
    
    .gallery-item:hover { 
        transform: translateY(-5px); 
        box-shadow: 0 15px 30px rgba(112, 144, 176, 0.2);
    }
    
    .gallery-item img { 
        width: 100%; 
        height: 100%; 
        object-fit: cover; 
        transition: transform 0.5s ease;
    }

    .gallery-item:hover img {
        transform: scale(1.1);
    }

    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .gallery-item:hover .overlay {
        opacity: 1;
    }

    .overlay mat-icon {
        color: white;
        font-size: 32px;
        width: 32px;
        height: 32px;
    }
    
    .empty-state { text-align: center; padding: 60px; color: #a3aed0; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.5; }

    /* Lightbox Styles */
    .lightbox {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
        backdrop-filter: blur(5px);
    }

    .lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 85vh;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .lightbox-img {
        max-width: 100%;
        max-height: 85vh;
        display: block;
        object-fit: contain;
    }

    .lightbox-caption {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px;
        background: rgba(0,0,0,0.7);
        color: white;
        font-weight: 500;
        text-align: center;
    }

    .close-btn {
        position: absolute;
        top: 24px;
        right: 24px;
        color: white;
        background: rgba(255, 255, 255, 0.1);
        z-index: 1001;
    }

    .nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        color: white;
        background: rgba(255, 255, 255, 0.1);
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        z-index: 1001;
    }
    
    .nav-btn:hover { background: rgba(255, 255, 255, 0.2); }
    .prev { left: 24px; }
    .next { right: 24px; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class RestaurantGalleryComponent implements OnInit {
    allImages: GalleryItem[] = [];
    categories: Category[] = [];
    selectedCategory = 'All';
    loading = true;

    // Lightbox State
    lightboxOpen = false;
    currentImageIndex = 0; // Index in the FILTERED list

    constructor(
        private route: ActivatedRoute,
        private restaurantService: RestaurantService
    ) { }

    ngOnInit() {
        const parentParams = this.route.parent?.snapshot.paramMap;
        const restaurantSlug = parentParams?.get('restaurantName');

        if (restaurantSlug) {
            this.restaurantService.getBySlug(restaurantSlug).subscribe({
                next: (data) => {
                    if (data.gallery_images) {
                        this.processGalleryData(data.gallery_images);
                    }
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading gallery', err);
                    this.loading = false;
                }
            });
        }
    }

    processGalleryData(rawData: any) {
        try {
            const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

            let groups: MediaGroup[] = [];
            if (Array.isArray(parsed)) {
                if (parsed.length > 0 && typeof parsed[0] === 'string') {
                    groups = [{ name: 'General', images: parsed as string[] }];
                } else {
                    groups = parsed as MediaGroup[];
                }
            }

            // Flatten images and build categories
            this.allImages = [];
            const catMap = new Map<string, number>();

            groups.forEach(g => {
                if (g.images && g.images.length > 0) {
                    const count = catMap.get(g.name) || 0;
                    catMap.set(g.name, count + g.images.length);

                    g.images.forEach(img => {
                        this.allImages.push({ url: img, group: g.name });
                    });
                }
            });

            this.categories = Array.from(catMap.entries()).map(([name, count]) => ({ name, count }));

        } catch (e) { console.error('Error processing gallery', e); }
    }

    get filteredImages(): GalleryItem[] {
        if (this.selectedCategory === 'All') {
            return this.allImages;
        }
        return this.allImages.filter(item => item.group === this.selectedCategory);
    }

    // Lightbox Methods
    openLightbox(index: number) {
        this.currentImageIndex = index;
        this.lightboxOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightboxOpen = false;
        document.body.style.overflow = '';
    }

    get currentImageUrl(): string {
        const images = this.filteredImages;
        return images[this.currentImageIndex]?.url || '';
    }

    get currentGroupName(): string {
        const images = this.filteredImages;
        return images[this.currentImageIndex]?.group || '';
    }

    hasNext(): boolean {
        return this.currentImageIndex < this.filteredImages.length - 1;
    }

    hasPrev(): boolean {
        return this.currentImageIndex > 0;
    }

    nextImage() {
        if (this.hasNext()) this.currentImageIndex++;
    }

    prevImage() {
        if (this.hasPrev()) this.currentImageIndex--;
    }

    @HostListener('document:keydown.escape')
    onEscape() {
        if (this.lightboxOpen) this.closeLightbox();
    }

    @HostListener('document:keydown.arrowright')
    onArrowRight() {
        if (this.lightboxOpen && this.hasNext()) this.nextImage();
    }

    @HostListener('document:keydown.arrowleft')
    onArrowLeft() {
        if (this.lightboxOpen && this.hasPrev()) this.prevImage();
    }
}
