import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RestaurantService, MediaGroup } from '../../../../core/services/restaurant.service';

interface MenuItem {
    url: string;
    group: string;
    type: 'image' | 'pdf';
}

interface Category {
    name: string;
    count: number;
}

@Component({
    selector: 'app-restaurant-menu',
    template: `
    <div class="menu-container">
        <h2 class="section-title">Our Menu</h2>

        <div *ngIf="loading" class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && allItems.length > 0; else noMenu">
            
            <!-- Filter Tabs -->
            <div class="filter-bar">
                <button 
                    class="filter-btn" 
                    [class.active]="selectedCategory === 'All'"
                    (click)="selectedCategory = 'All'">
                    All ({{ allItems.length }})
                </button>
                <button 
                    *ngFor="let cat of categories"
                    class="filter-btn" 
                    [class.active]="selectedCategory === cat.name"
                    (click)="selectedCategory = cat.name">
                    {{ cat.name }} ({{ cat.count }})
                </button>
            </div>

            <div class="menu-grid">
                <div *ngFor="let item of filteredItems; let i = index" 
                     class="menu-item" 
                     [class.pdf-item]="item.type === 'pdf'"
                     (click)="handleItemClick(item, i)">
                    
                    <!-- Image Menu -->
                    <ng-container *ngIf="item.type === 'image'">
                        <img [src]="item.url" loading="lazy" alt="Menu Page">
                        <div class="overlay">
                            <mat-icon>zoom_in</mat-icon>
                        </div>
                    </ng-container>
                    
                    <!-- PDF Menu -->
                    <div *ngIf="item.type === 'pdf'" class="pdf-content">
                        <mat-icon class="pdf-icon">picture_as_pdf</mat-icon>
                        <span class="pdf-label">PDF Menu</span>
                        <a mat-stroked-button color="primary" [href]="getSafeUrl(item.url)" target="_blank" (click)="$event.stopPropagation()">
                            Open PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <ng-template #noMenu>
            <div class="empty-state" *ngIf="!loading">
                <mat-icon>restaurant_menu</mat-icon>
                <p>Menu images coming soon.</p>
            </div>
        </ng-template>

        <!-- Lightbox for Menu Images -->
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
    .menu-container { padding: 32px; animation: fadeIn 0.4s ease; max-width: 1200px; margin: 0 auto; }
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
        background: #4318ff;
        color: white;
        border-color: #4318ff;
        box-shadow: 0 4px 10px rgba(67, 24, 255, 0.3);
    }

    .menu-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
        gap: 24px; 
    }
    
    .menu-item { 
        position: relative;
        aspect-ratio: 3/4; 
        border-radius: 16px; 
        overflow: hidden; 
        box-shadow: 0 10px 20px rgba(112, 144, 176, 0.12);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        background: #fff;
        border: 1px solid #f0f0f0;
    }
    
    .menu-item:hover { 
        transform: translateY(-5px); 
        box-shadow: 0 15px 30px rgba(112, 144, 176, 0.2);
    }
    
    .menu-item img { 
        width: 100%; 
        height: 100%; 
        object-fit: cover; 
        transition: transform 0.5s ease;
    }

    .menu-item:hover img {
        transform: scale(1.05);
    }

    .pdf-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        background: #f8faff;
        color: #1b2559;
    }

    .pdf-icon { font-size: 48px; width: 48px; height: 48px; color: #e53935; }
    .pdf-label { font-weight: 700; font-size: 1rem; }

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

    .menu-item:hover .overlay {
        opacity: 1;
    }

    .overlay mat-icon {
        color: white;
        font-size: 32px;
        width: 32px;
        height: 32px;
    }

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
        max-height: 90vh;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .lightbox-img {
        max-width: 100%;
        max-height: 90vh;
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

    .close-btn { position: absolute; top: 24px; right: 24px; color: white; background: rgba(255, 255, 255, 0.1); z-index: 1001; }
    .nav-btn {
        position: absolute; top: 50%; transform: translateY(-50%);
        color: white; background: rgba(255, 255, 255, 0.1);
        width: 50px; height: 50px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 50%; z-index: 1001;
    }
    .nav-btn:hover { background: rgba(255, 255, 255, 0.2); }
    .prev { left: 24px; }
    .next { right: 24px; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class RestaurantMenuComponent implements OnInit {
    allItems: MenuItem[] = [];
    categories: Category[] = [];
    selectedCategory = 'All';
    loading = true;

    // Lightbox State
    lightboxOpen = false;
    currentImageIndex = 0; // Index in the FILTERED list (images only usually)

    constructor(
        private route: ActivatedRoute,
        private restaurantService: RestaurantService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit() {
        const parentParams = this.route.parent?.snapshot.paramMap;
        const restaurantSlug = parentParams?.get('restaurantName');

        if (restaurantSlug) {
            this.restaurantService.getBySlug(restaurantSlug).subscribe({
                next: (data) => {
                    if (data.menu_images) {
                        this.processMenuData(data.menu_images);
                    }
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading menu', err);
                    this.loading = false;
                }
            });
        }
    }

    processMenuData(rawData: any) {
        try {
            const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

            let groups: MediaGroup[] = [];
            if (Array.isArray(parsed)) {
                if (parsed.length > 0 && typeof parsed[0] === 'string') {
                    groups = [{ name: 'Main Menu', images: parsed as string[] }];
                } else {
                    groups = parsed as MediaGroup[];
                }
            }

            // Flatten items
            this.allItems = [];
            const catMap = new Map<string, number>();

            groups.forEach(g => {
                if (g.images && g.images.length > 0) {
                    const count = catMap.get(g.name) || 0;
                    catMap.set(g.name, count + g.images.length);

                    g.images.forEach(img => {
                        this.allItems.push({
                            url: img,
                            group: g.name,
                            type: img.includes('application/pdf') ? 'pdf' : 'image'
                        });
                    });
                }
            });

            this.categories = Array.from(catMap.entries()).map(([name, count]) => ({ name, count }));

        } catch (e) { console.error('Error processing menu', e); }
    }

    get filteredItems(): MenuItem[] {
        if (this.selectedCategory === 'All') {
            return this.allItems;
        }
        return this.allItems.filter(item => item.group === this.selectedCategory);
    }

    // Lightbox only for images
    handleItemClick(item: MenuItem, index: number) {
        if (item.type === 'image') {
            this.openLightbox(index);
        }
        // PDFs have their own button, but clicking the card could also open it
        if (item.type === 'pdf') {
            window.open(item.url, '_blank');
        }
    }

    openLightbox(index: number) {
        // We need to map the grid index to an image-only index if we want skip PDFs?
        // Or just show all. Showing PDF in lightbox image tag won't work.
        // For simplicity: If we filter, we just iterate whatever is in filteredItems.
        // If it's PDF, we might skip it or show a placeholder.
        // Better: 'nextImage' should skip PDFs.

        this.currentImageIndex = index;
        this.lightboxOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightboxOpen = false;
        document.body.style.overflow = '';
    }

    get currentImageUrl(): string {
        const items = this.filteredItems;
        const item = items[this.currentImageIndex];
        return item && item.type === 'image' ? item.url : '';
    }

    get currentGroupName(): string {
        return this.filteredItems[this.currentImageIndex]?.group || '';
    }

    hasNext(): boolean {
        // Check if there is a next IMAGE
        let i = this.currentImageIndex + 1;
        while (i < this.filteredItems.length) {
            if (this.filteredItems[i].type === 'image') return true;
            i++;
        }
        return false;
    }

    hasPrev(): boolean {
        let i = this.currentImageIndex - 1;
        while (i >= 0) {
            if (this.filteredItems[i].type === 'image') return true;
            i--;
        }
        return false;
    }

    nextImage() {
        let i = this.currentImageIndex + 1;
        while (i < this.filteredItems.length) {
            if (this.filteredItems[i].type === 'image') {
                this.currentImageIndex = i;
                return;
            }
            i++;
        }
    }

    prevImage() {
        let i = this.currentImageIndex - 1;
        while (i >= 0) {
            if (this.filteredItems[i].type === 'image') {
                this.currentImageIndex = i;
                return;
            }
            i--;
        }
    }

    isPdf(url: string): boolean {
        return url.includes('application/pdf');
    }

    getSafeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
