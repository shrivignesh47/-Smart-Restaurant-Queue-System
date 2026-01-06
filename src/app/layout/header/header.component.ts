import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, User } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { LoginDialogComponent } from '../../shared/components/login-dialog/login-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    // Subscribe to user changes
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.currentUser = user;
      console.log('[Header] User state changed:', user);
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  openLoginDialog() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '100%',
      maxWidth: '480px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        console.log('[Header] Login successful, user logged in');
        // No need to reload - the user$ subscription will update the UI automatically
      }
    });
  }

  logout() {
    this.authService.logout();
    console.log('[Header] User logged out');
    // Stay on current page, just update the UI
  }
}
