import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'smart-restaurant-queue';
  showHeader = true;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      // Hide header for admin and manager routes
      this.showHeader = !url.includes('/sysqueue/admin') &&
        !url.includes('/manager') &&
        !url.includes('/admin/dashboard') &&
        !url.includes('/scanner');
    });
  }
}
