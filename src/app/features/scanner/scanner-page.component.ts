import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { RestaurantService } from '../../core/services/restaurant.service';
import { ScannerService } from '../../core/services/scanner.service';

@Component({
    selector: 'app-scanner-page',
    templateUrl: './scanner-page.component.html',
    styleUrls: ['./scanner-page.component.scss']
})
export class ScannerPageComponent implements OnInit {
    @ViewChild('scanner') scanner!: ZXingScannerComponent;

    restaurantName: string = '';
    restaurantId: number | null = null;
    isLoading = true;
    isValidated = false;
    accessKey = '';

    allowedFormats = [BarcodeFormat.QR_CODE];

    // Scanner state
    hasCameras = false;
    currentDevice: MediaDeviceInfo | undefined;
    availableDevices: MediaDeviceInfo[] = [];

    scanResult: string | null = null;
    processingScan = false;
    scannedReservation: any = null;
    isScanningPaused = false;

    // Daily Stats
    confirmedReservations: any[] = [];
    seatedGuests: any[] = [];
    viewMode: 'scanner' | 'list' = 'scanner';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private restaurantService: RestaurantService,
        private scannerService: ScannerService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.restaurantName = this.route.snapshot.paramMap.get('restaurantName') || '';
        if (!this.restaurantName) {
            this.router.navigate(['/']);
            return;
        }

        // Check if session is stored locally (simple persistence)
        const storedKey = sessionStorage.getItem(`scanner_key_${this.restaurantName}`);
        if (storedKey) {
            this.accessKey = storedKey;
        }

        this.checkRestaurant();
    }

    checkRestaurant(): void {
        this.restaurantService.getBySlug(this.restaurantName).subscribe({
            next: (restaurant) => {
                if (!restaurant) {
                    this.router.navigate(['/']);
                    return;
                }

                if (!restaurant.has_scanner_key) {
                    this.snackBar.open('Scanner feature not enabled for this restaurant. Please contact manager.', 'Close', { duration: 5000 });
                    this.router.navigate(['/']);
                    return;
                }

                this.restaurantId = restaurant.id!;

                // If we have a stored key, try validate immediately
                if (this.accessKey) {
                    this.validateKey();
                } else {
                    this.isLoading = false;
                }
            },
            error: () => {
                this.router.navigate(['/']);
            }
        });
    }

    validateKey(): void {
        if (!this.accessKey || this.accessKey.length < 6) {
            this.snackBar.open('Please enter a valid access key', 'Close', { duration: 3000 });
            return;
        }

        this.isLoading = true;
        this.scannerService.validateKey(this.accessKey).subscribe({
            next: (response) => {
                if (response.valid && response.restaurant && response.restaurant.id === this.restaurantId) {
                    this.isValidated = true;
                    // Persist session
                    sessionStorage.setItem(`scanner_key_${this.restaurantName}`, this.accessKey);

                    this.setupCameras();
                    this.loadDailyStats(); // Load data on successful validation
                } else {
                    this.snackBar.open('Invalid access key for this restaurant', 'Close', { duration: 3000 });
                    sessionStorage.removeItem(`scanner_key_${this.restaurantName}`);
                }
                this.isLoading = false;
            },
            error: () => {
                this.snackBar.open('Invalid access key or server error', 'Close', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }

    loadDailyStats(): void {
        if (!this.accessKey) return;

        this.scannerService.getDailyStats(this.accessKey).subscribe({
            next: (data) => {
                this.confirmedReservations = data.confirmed || [];
                // Sort by time
                this.confirmedReservations.sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
                this.seatedGuests = data.seated || [];
            },
            error: (err) => console.error('Error loading stats', err)
        });
    }

    markAsSeated(reservationId: number): void {
        if (this.processingScan || !this.accessKey) return;

        this.processingScan = true; // Use processing flag to prevent double clicks
        this.scannerService.checkIn(this.accessKey, reservationId).subscribe({
            next: (res) => {
                this.snackBar.open('Guest marked as Seated via List', 'Close', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
                this.loadDailyStats(); // Refresh
                this.processingScan = false;
            },
            error: (err) => {
                this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
                this.processingScan = false;
            }
        });
    }

    // Refresh stats periodically
    startStatsRefresh(): void {
        // Implement polling if needed
    }

    setupCameras(): void {
        // Cameras are handled by the zxing-scanner component logic
        // We just listen to camerasFound event
    }

    onCamerasFound(devices: MediaDeviceInfo[]): void {
        this.availableDevices = devices;
        this.hasCameras = Boolean(devices && devices.length);
        if (this.hasCameras) {
            // Select back camera by default if available
            const backCamera = devices.find(device => /back|rear|environment/gi.test(device.label));
            this.currentDevice = backCamera || devices[0];
        }
    }

    onScanSuccess(resultString: string): void {
        if (this.processingScan || this.isScanningPaused) return;

        this.processingScan = true;
        this.scanResult = resultString;

        const reservationId = this.parseReservationId(resultString);

        if (!reservationId) {
            this.snackBar.open('Invalid QR Code format', 'Close', { duration: 3000 });
            this.processingScan = false;
            this.scanResult = null;
            return;
        }

        // 1. Try local cache
        const localMatch = this.confirmedReservations.find(r => r.id === reservationId);
        if (localMatch) {
            this.scannedReservation = localMatch;
            this.isScanningPaused = true;
            this.processingScan = false;
            return;
        }

        // 2. Fetch from server
        this.scannerService.getReservation(reservationId, this.accessKey).subscribe({
            next: (res) => {
                this.scannedReservation = res;
                this.isScanningPaused = true;
                this.processingScan = false;
            },
            error: (err) => {
                let msg = 'Reservation not found';
                if (err.status === 403) msg = 'Reservation belongs to another restaurant';

                this.snackBar.open(msg, 'Close', { duration: 3000 });
                this.processingScan = false;
                this.scanResult = null;

                this.isScanningPaused = true;
                setTimeout(() => this.isScanningPaused = false, 2000);
            }
        });
    }

    private parseReservationId(str: string): number | null {
        // Handle "RES-123"
        if (str.startsWith('RES-')) {
            const num = Number(str.replace('RES-', ''));
            return isNaN(num) ? null : num;
        }
        // Handle JSON
        try {
            const data = JSON.parse(str);
            return data.id || data.reservationId || null;
        } catch { }
        // Handle Number
        const num = Number(str);
        return isNaN(num) ? null : num;
    }

    confirmCheckIn(): void {
        if (!this.scannedReservation) return;

        this.processingScan = true;
        this.scannerService.checkIn(this.accessKey, this.scannedReservation.id).subscribe({
            next: (res) => {
                this.snackBar.open('Check-in Successful! Welcome ' + (this.scannedReservation.customer_name || 'Guest'), 'Close', {
                    duration: 5000,
                    panelClass: ['success-snackbar']
                });

                this.scannedReservation = null;
                this.scanResult = null;
                this.isScanningPaused = false;
                this.processingScan = false;
                this.loadDailyStats();
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Check-in failed', 'Close', { duration: 4000 });
                this.processingScan = false;
            }
        });
    }

    cancelCheckIn(): void {
        this.scannedReservation = null;
        this.scanResult = null;
        this.isScanningPaused = false;
        this.processingScan = false;
    }

    onDeviceSelectChange(selected: string) {
        const device = this.availableDevices.find(x => x.deviceId === selected);
        if (device) {
            this.currentDevice = device;
        }
    }

    // Switch camera (toggle front/back)
    switchCamera(): void {
        if (this.availableDevices.length < 2) return;

        const currentIndex = this.availableDevices.findIndex(d => d.deviceId === this.currentDevice?.deviceId);
        const nextIndex = (currentIndex + 1) % this.availableDevices.length;
        this.currentDevice = this.availableDevices[nextIndex];
    }

    // Toggle View Mode (Scanner vs List)
    toggleViewMode(): void {
        this.viewMode = this.viewMode === 'scanner' ? 'list' : 'scanner';
        if (this.viewMode === 'list') {
            this.loadDailyStats();
        }
    }

    logout(): void {
        this.isValidated = false;
        this.accessKey = '';
        this.scanResult = null;
        this.processingScan = false;
        // Clear session
        sessionStorage.removeItem(`scanner_key_${this.restaurantName}`);

        this.router.navigate(['/']); // Or stay on page but show auth screen
    }
}
