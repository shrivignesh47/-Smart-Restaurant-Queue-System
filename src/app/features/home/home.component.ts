import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  heroSlides = [
    {
      icon: 'auto_awesome',
      badge: 'Smart Restaurant Management',
      title1: 'Seamless Dining',
      title2: 'Experience',
      desc: 'Manage tables, queues, and reservations with our intelligent restaurant management system. No more chaos, just smooth operations.',
      ctaPrimary: 'View Tables',
      ctaSecondary: 'Join Queue',
      image: 'assets/images/hero1.png'
    },
    {
      icon: 'restaurant',
      badge: 'Modern Dining',
      title1: 'Taste the',
      title2: 'Future',
      desc: 'Experience the next generation of dining with smart queues and instant table reservations.',
      ctaPrimary: 'Explore',
      ctaSecondary: 'Learn More',
      image: 'assets/images/hero2.png'
    }
  ];

  currentSlide = 0;
  slideInterval: any;

  restaurants = [
    {
      name: 'The Gourmet Kitchen',
      image: 'assets/images/hero1.png',
      cuisine: ['Italian', 'Continental'],
      status: 'Low',
      waitTime: '5 mins',
      rating: 4.5
    },
    {
      name: 'Sushi Zen',
      image: 'assets/images/hero2.png',
      cuisine: ['Japanese', 'Sushi'],
      status: 'Medium',
      waitTime: '15 mins',
      rating: 4.8
    },
    {
      name: 'Burger Point',
      image: 'assets/images/hero1.png',
      cuisine: ['American', 'Fast Food'],
      status: 'Busy',
      waitTime: '45 mins',
      rating: 4.2
    },
    {
      name: 'Spice Route',
      image: 'assets/images/hero2.png',
      cuisine: ['Indian', 'Spicy'],
      status: 'Low',
      waitTime: '10 mins',
      rating: 4.6
    }
  ];

  features = [
    { icon: 'table_bar', title: 'Real-Time Tables', desc: 'View live table availability and status updates instantly' },
    { icon: 'schedule', title: 'Smart Queue', desc: 'Join the waiting list and track your position in real-time' },
    { icon: 'calendar_today', title: 'Easy Reservations', desc: 'Book your table in advance with just a few clicks' },
    { icon: 'dashboard', title: 'Manager Dashboard', desc: 'Complete control over tables, queue, and reservations' }
  ];

  ngOnInit() {
    this.startSlider();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startSlider() {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
    }, 5000);
  }
}
