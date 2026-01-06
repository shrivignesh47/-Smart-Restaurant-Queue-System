import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { TableQueueService } from '../../core/services/table-queue.service';
import { CancellationDialogComponent } from '../../shared/components/cancellation-dialog/cancellation-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isSaving = false;
  isLoading = true;
  stats = {
    totalBookings: 0,
    queueVisits: 0,
    reservations: 0,
    favoriteRestaurants: 0
  };
  myReservations: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private http: HttpClient,
    private authService: AuthService,
    private tableQueueService: TableQueueService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],
      date_of_birth: [''],
      gender: [''],
      street_address: [''],
      city: [''],
      state: [''],
      pin_code: ['', [Validators.pattern(/^\d{6}$/)]],
      country: ['India'],
      dietary_preferences: [''],
      food_allergies: [''],
      email_notifications: [true],
      sms_notifications: [true]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      this.snackBar.open('Please login to view profile', 'Close', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      return;
    }

    console.log('[Profile] Loading profile for user ID:', currentUser.id);

    // Fetch user profile from backend
    this.http.get(`${environment.apiUrl}/users/${currentUser.id}`).subscribe({
      next: (user: any) => {
        console.log('[Profile] Loaded user data:', user);
        this.isLoading = false;

        // Convert dietary_preferences string to array for multi-select
        let dietaryPreferences = user.dietary_preferences || '';
        if (typeof dietaryPreferences === 'string' && dietaryPreferences) {
          dietaryPreferences = dietaryPreferences.split(',').map((item: string) => item.trim());
        } else if (!Array.isArray(dietaryPreferences)) {
          dietaryPreferences = [];
        }

        // Patch form with user data
        this.profileForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          phone: user.contact_info || '',
          date_of_birth: user.date_of_birth || '',
          gender: user.gender || '',
          street_address: user.street_address || '',
          city: user.city || '',
          state: user.state || '',
          pin_code: user.pin_code || '',
          country: user.country || 'India',
          dietary_preferences: dietaryPreferences,
          food_allergies: user.food_allergies || '',
          email_notifications: user.email_notifications !== false,
          sms_notifications: user.sms_notifications !== false
        });

        this.loadReservations(currentUser.id);
      },
      error: (err) => {
        console.error('[Profile] Error loading profile:', err);
        this.isLoading = false;
        this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
      }
    });
  }

  loadReservations(userId: number): void {
    this.http.get(`${environment.apiUrl}/reservations/user/${userId}`).subscribe({
      next: (reservations: any) => {
        this.myReservations = reservations;
        this.stats.reservations = reservations.length;
        this.stats.totalBookings = reservations.length;
      },
      error: (err) => {
        console.error('[Profile] Error loading reservations:', err);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Handle avatar upload (implement later)
        console.log('[Profile] Avatar selected:', file.name);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.snackBar.open('Please login to save profile', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const profileData = { ...this.profileForm.value };

    // Convert dietary_preferences array to comma-separated string
    if (Array.isArray(profileData.dietary_preferences)) {
      profileData.dietary_preferences = profileData.dietary_preferences.join(', ');
    }

    console.log('[Profile] Saving profile data:', profileData);

    // Save to backend
    this.http.put(`${environment.apiUrl}/users/${currentUser.id}`, profileData).subscribe({
      next: (response: any) => {
        console.log('[Profile] Profile saved successfully:', response);
        this.isSaving = false;

        // Update user in AuthService
        const updatedUser = {
          ...currentUser,
          name: profileData.name,
          contact_info: profileData.phone
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Reload to update header
        window.location.reload();
      },
      error: (err) => {
        console.error('[Profile] Error saving profile:', err);
        this.isSaving = false;
        this.snackBar.open('Error saving profile', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  cancelEdit(): void {
    this.loadProfile();
    this.snackBar.open('Changes discarded', 'Close', { duration: 2000 });
  }

  deleteAccount(): void {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmed) {
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) return;

      // Call delete API
      this.http.delete(`${environment.apiUrl}/users/${currentUser.id}`).subscribe({
        next: () => {
          this.authService.logout();
          this.snackBar.open('Account deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('[Profile] Error deleting account:', err);
          this.snackBar.open('Error deleting account', 'Close', { duration: 3000 });
        }
      });
    }
  }

  cancelReservation(reservationId: number) {
    const dialogRef = this.dialog.open(CancellationDialogComponent, {
      width: '450px',
      data: { reservationId }
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.tableQueueService.updateReservationStatus(reservationId, 'Cancelled', {
          cancelled_by: 'Customer',
          cancellation_reason: reason
        }).subscribe({
          next: () => {
            this.snackBar.open('Reservation cancelled successfully', 'Close', {
              duration: 3000,
              panelClass: ['info-snackbar']
            });
            const user = this.authService.currentUserValue;
            if (user) this.loadReservations(user.id);
          }
        });
      }
    });
  }
}
