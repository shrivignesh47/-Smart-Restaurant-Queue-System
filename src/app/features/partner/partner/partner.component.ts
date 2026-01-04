import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.scss']
})
export class PartnerComponent implements OnInit {
  partnerForm: FormGroup;
  submitted = false;

  restaurantTypes = [
    'Fine Dining',
    'Casual Dining',
    'Fast Food',
    'Cafe',
    'South Indian',
    'Multi-Cuisine',
    'Other'
  ];

  restaurantSizes = [
    'Small (1-50 seats)',
    'Medium (51-150 seats)',
    'Large (151-300 seats)',
    'Very Large (300+ seats)'
  ];

  howDidYouHear = [
    'Search Engine',
    'Social Media',
    'Friend/Colleague',
    'Advertisement',
    'Other'
  ];

  workflowSteps = [
    {
      icon: 'restaurant_menu',
      title: 'Submit Your Details',
      description: 'Fill out our partnership form with your restaurant information and requirements.'
    },
    {
      icon: 'people',
      title: 'Consultation Call',
      description: 'Our team will reach out to understand your needs and demonstrate the SysQueue platform.'
    },
    {
      icon: 'settings',
      title: 'Customization & Setup',
      description: 'We\'ll configure the system according to your restaurant\'s specific requirements.'
    },
    {
      icon: 'rocket_launch',
      title: 'Go Live',
      description: 'Launch your smart queue system and start providing seamless dining experiences!'
    }
  ];

  benefits = [
    {
      icon: 'trending_up',
      title: 'Increase Efficiency',
      description: 'Reduce wait times and optimize table turnover with intelligent queue management.'
    },
    {
      icon: 'sentiment_satisfied',
      title: 'Improve Customer Satisfaction',
      description: 'Keep customers informed with real-time updates and reduce frustration.'
    },
    {
      icon: 'analytics',
      title: 'Data-Driven Insights',
      description: 'Access detailed analytics to make informed decisions about your operations.'
    },
    {
      icon: 'phone_android',
      title: 'Mobile-First Experience',
      description: 'Customers can join queues and book tables from anywhere using their smartphones.'
    },
    {
      icon: 'support_agent',
      title: '24/7 Support',
      description: 'Our dedicated support team is always available to help you succeed.'
    },
    {
      icon: 'attach_money',
      title: 'Affordable Pricing',
      description: 'Flexible pricing plans that scale with your business needs.'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.partnerForm = this.fb.group({
      restaurantName: ['', [Validators.required, Validators.minLength(2)]],
      ownerName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      restaurantType: ['', Validators.required],
      restaurantSize: ['', Validators.required],
      location: ['', Validators.required],
      currentSystem: [''],
      howDidYouHear: [''],
      message: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
  }

  get f() {
    return this.partnerForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.partnerForm.invalid) {
      return;
    }

    // TODO: Implement actual form submission to backend
    console.log('Form submitted:', this.partnerForm.value);
    alert('Thank you for your interest! Our team will contact you within 24 hours.');

    // Reset form
    this.partnerForm.reset();
    this.submitted = false;
  }
}
