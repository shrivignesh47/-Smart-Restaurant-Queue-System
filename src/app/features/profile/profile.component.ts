import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isSaving = false;
  stats = {
    totalBookings: 12,
    queueVisits: 8,
    reservations: 5,
    favoriteRestaurants: 3
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],
      dateOfBirth: [''],
      gender: [''],
      avatar: [''],
      address: [''],
      city: [''],
      state: [''],
      pincode: ['', [Validators.pattern(/^\d{6}$/)]],
      country: ['India'],
      dietaryPreferences: [[]],
      allergies: [''],
      emailNotifications: [true],
      smsNotifications: [true]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    // Load from localStorage or API
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      this.profileForm.patchValue(profile);
    } else {
      // Load from currentUser
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        this.profileForm.patchValue({
          name: user.name || '',
          phone: user.phone || '',
          avatar: user.avatar || ''
        });
      }
    }

    // Load stats (in real app, fetch from API)
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileForm.patchValue({ avatar: e.target.result });
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

    this.isSaving = true;

    // Simulate API call
    setTimeout(() => {
      const profileData = this.profileForm.value;

      // Save to localStorage (in real app, save to backend)
      localStorage.setItem('userProfile', JSON.stringify(profileData));

      // Update currentUser
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.name = profileData.name;
      currentUser.phone = profileData.phone;
      currentUser.avatar = profileData.avatar;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      this.isSaving = false;

      this.snackBar.open('Profile updated successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 1500);
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
      // Clear all user data
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userStats');

      this.snackBar.open('Account deleted successfully', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });

      // Redirect to home
      setTimeout(() => {
        this.router.navigate(['/']);
        window.location.reload();
      }, 1500);
    }
  }
}
