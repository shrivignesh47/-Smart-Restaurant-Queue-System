import { Injectable } from '@angular/core';

export interface RestaurantTable {
  id: number;
  name: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  type: string;
  features: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string[];
  status: 'Low' | 'Medium' | 'Busy';
  waitTime: string;
  rating: number;
  location: string;
  city: string;
  address: string;
  description: string;
  specialties: string[];
  priceRange: string;
  openingHours: string;
  tables: RestaurantTable[];
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantDataService {
  private restaurants: Restaurant[] = [
    {
      id: 'annapoorna',
      name: 'Annapoorna',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      cuisine: ['South Indian', 'Tamil', 'Vegetarian'],
      status: 'Low',
      waitTime: '5 mins',
      rating: 4.6,
      location: 'Coimbatore',
      city: 'Coimbatore',
      address: '394, East Arokiasamy Road, RS Puram, Coimbatore - 641002',
      description: 'Famous for authentic South Indian vegetarian cuisine with a legacy of over 60 years. Known for their delicious dosas, idlis, and traditional Tamil meals.',
      specialties: ['Ghee Roast Dosa', 'Filter Coffee', 'Meals', 'Pongal'],
      priceRange: '₹₹',
      openingHours: '6:00 AM - 10:30 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 2, status: 'Available', type: 'Indoor', features: ['AC', 'Near Window'] },
        { id: 2, name: 'Table 2', capacity: 4, status: 'Available', type: 'Indoor', features: ['Family Seating', 'Quiet Corner'] },
        { id: 3, name: 'Table 3', capacity: 4, status: 'Occupied', type: 'Indoor', features: ['Central Location'] },
        { id: 4, name: 'Table 4', capacity: 6, status: 'Available', type: 'Indoor', features: ['Large Family Table', 'Round Table'] },
        { id: 5, name: 'Table 5', capacity: 2, status: 'Reserved', type: 'Indoor', features: ['Cozy', 'Near Kitchen'] },
        { id: 6, name: 'Table 6', capacity: 8, status: 'Available', type: 'Hall', features: ['Group Dining', 'Spacious'] }
      ]
    },
    {
      id: 'anandhas',
      name: 'Anandhas',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      cuisine: ['South Indian', 'Vegetarian', 'Sweets'],
      status: 'Medium',
      waitTime: '15 mins',
      rating: 4.7,
      location: 'Chennai',
      city: 'Chennai',
      address: '89, Usman Road, T. Nagar, Chennai - 600017',
      description: 'A popular chain known for their variety of South Indian dishes and sweets. Perfect for family dining with a wide range of vegetarian options.',
      specialties: ['Variety Dosa', 'Sweets', 'Chaat', 'Thali'],
      priceRange: '₹₹',
      openingHours: '7:00 AM - 11:00 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 4, status: 'Available', type: 'Indoor', features: ['AC', 'Family Booth'] },
        { id: 2, name: 'Table 2', capacity: 2, status: 'Occupied', type: 'Indoor', features: ['Couple Seating'] },
        { id: 3, name: 'Table 3', capacity: 6, status: 'Available', type: 'Indoor', features: ['Large Table', 'Near Sweets Counter'] },
        { id: 4, name: 'Table 4', capacity: 4, status: 'Occupied', type: 'Indoor', features: ['Corner Booth'] },
        { id: 5, name: 'Table 5', capacity: 2, status: 'Available', type: 'Indoor', features: ['Quick Dining'] },
        { id: 6, name: 'Table 6', capacity: 8, status: 'Reserved', type: 'Private', features: ['Private Room', 'AC'] },
        { id: 7, name: 'Table 7', capacity: 4, status: 'Available', type: 'Indoor', features: ['Central'] }
      ]
    },
    {
      id: 'gowrishankar',
      name: 'Gowrishankar',
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
      cuisine: ['Tamil', 'Traditional', 'Vegetarian'],
      status: 'Busy',
      waitTime: '25 mins',
      rating: 4.5,
      location: 'Madurai',
      city: 'Madurai',
      address: '56, West Masi Street, Near Meenakshi Temple, Madurai - 625001',
      description: 'Traditional Tamil restaurant serving authentic Madurai cuisine. Famous for their spicy Chettinad dishes and traditional meals.',
      specialties: ['Chettinad Meals', 'Parotta', 'Kothu Parotta', 'Jigarthanda'],
      priceRange: '₹₹',
      openingHours: '6:30 AM - 10:00 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 4, status: 'Occupied', type: 'Indoor', features: ['Traditional Seating'] },
        { id: 2, name: 'Table 2', capacity: 4, status: 'Occupied', type: 'Indoor', features: ['Fan Cooled'] },
        { id: 3, name: 'Table 3', capacity: 6, status: 'Occupied', type: 'Indoor', features: ['Family Table'] },
        { id: 4, name: 'Table 4', capacity: 2, status: 'Reserved', type: 'Indoor', features: ['Small Table'] },
        { id: 5, name: 'Table 5', capacity: 8, status: 'Occupied', type: 'Hall', features: ['Large Group', 'Traditional'] }
      ]
    },
    {
      id: 'hmr',
      name: 'HMR (Hotel Maharaja)',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      cuisine: ['South Indian', 'Multi-Cuisine', 'Non-Vegetarian'],
      status: 'Low',
      waitTime: '8 mins',
      rating: 4.8,
      location: 'Salem',
      city: 'Salem',
      address: '123, Cherry Road, Near Bus Stand, Salem - 636001',
      description: 'Multi-cuisine restaurant offering both vegetarian and non-vegetarian South Indian delicacies. Known for their biryanis and traditional Tamil Nadu meals.',
      specialties: ['Biryani', 'Chicken Chettinad', 'Fish Fry', 'Mutton Curry'],
      priceRange: '₹₹₹',
      openingHours: '11:00 AM - 11:00 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 2, status: 'Available', type: 'Indoor', features: ['AC', 'Premium'] },
        { id: 2, name: 'Table 2', capacity: 4, status: 'Available', type: 'Indoor', features: ['Booth', 'TV View'] },
        { id: 3, name: 'Table 3', capacity: 4, status: 'Available', type: 'Indoor', features: ['Window Seat'] },
        { id: 4, name: 'Table 4', capacity: 6, status: 'Occupied', type: 'Indoor', features: ['Family Dining'] },
        { id: 5, name: 'Table 5', capacity: 2, status: 'Available', type: 'Indoor', features: ['Couple Seating'] },
        { id: 6, name: 'Table 6', capacity: 8, status: 'Available', type: 'Private', features: ['Private Dining', 'AC', 'Soundproof'] },
        { id: 7, name: 'Table 7', capacity: 4, status: 'Available', type: 'Outdoor', features: ['Garden View', 'Open Air'] }
      ]
    },
    {
      id: 'saravana-bhavan',
      name: 'Saravana Bhavan',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
      cuisine: ['South Indian', 'Vegetarian', 'Tamil'],
      status: 'Medium',
      waitTime: '12 mins',
      rating: 4.7,
      location: 'Chennai',
      city: 'Chennai',
      address: '77, Usman Road, T. Nagar, Chennai - 600017',
      description: 'World-renowned chain serving authentic South Indian vegetarian food. Famous globally for their consistent quality and traditional recipes.',
      specialties: ['Masala Dosa', 'Rava Dosa', 'Mini Tiffin', 'Filter Coffee'],
      priceRange: '₹₹',
      openingHours: '6:00 AM - 11:00 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 4, status: 'Available', type: 'Indoor', features: ['AC', 'Standard'] },
        { id: 2, name: 'Table 2', capacity: 2, status: 'Occupied', type: 'Indoor', features: ['Quick Service'] },
        { id: 3, name: 'Table 3', capacity: 4, status: 'Available', type: 'Indoor', features: ['Family Seating'] },
        { id: 4, name: 'Table 4', capacity: 6, status: 'Occupied', type: 'Indoor', features: ['Large Table'] },
        { id: 5, name: 'Table 5', capacity: 2, status: 'Available', type: 'Indoor', features: ['Window View'] },
        { id: 6, name: 'Table 6', capacity: 4, status: 'Reserved', type: 'Indoor', features: ['Corner Booth'] },
        { id: 7, name: 'Table 7', capacity: 8, status: 'Available', type: 'Hall', features: ['Group Dining', 'Spacious'] },
        { id: 8, name: 'Table 8', capacity: 4, status: 'Available', type: 'Indoor', features: ['Central'] }
      ]
    },
    {
      id: 'murugan-idli',
      name: 'Murugan Idli Shop',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
      cuisine: ['South Indian', 'Tamil', 'Breakfast'],
      status: 'Low',
      waitTime: '10 mins',
      rating: 4.6,
      location: 'Chennai',
      city: 'Chennai',
      address: '12/1, Luz Church Road, Mylapore, Chennai - 600004',
      description: 'Legendary for their soft idlis and variety of chutneys. A must-visit for authentic Chennai-style breakfast.',
      specialties: ['Soft Idli', '7 Chutneys', 'Podi Idli', 'Ghee Pongal'],
      priceRange: '₹',
      openingHours: '6:00 AM - 12:00 PM, 4:00 PM - 9:00 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 2, status: 'Available', type: 'Indoor', features: ['Quick Dining'] },
        { id: 2, name: 'Table 2', capacity: 4, status: 'Available', type: 'Indoor', features: ['Family Table'] },
        { id: 3, name: 'Table 3', capacity: 2, status: 'Occupied', type: 'Indoor', features: ['Counter Seating'] },
        { id: 4, name: 'Table 4', capacity: 4, status: 'Available', type: 'Indoor', features: ['Standard'] },
        { id: 5, name: 'Table 5', capacity: 6, status: 'Available', type: 'Indoor', features: ['Large Group'] }
      ]
    },
    {
      id: 'junior-kuppanna',
      name: 'Junior Kuppanna',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
      cuisine: ['Chettinad', 'Non-Vegetarian', 'Tamil'],
      status: 'Medium',
      waitTime: '18 mins',
      rating: 4.8,
      location: 'Coimbatore',
      city: 'Coimbatore',
      address: '456, Avinashi Road, Peelamedu, Coimbatore - 641004',
      description: 'Authentic Chettinad cuisine with a focus on traditional non-vegetarian dishes. Known for their spicy and flavorful preparations.',
      specialties: ['Nattu Kozhi Curry', 'Mutton Chukka', 'Chettinad Fish Fry', 'Biryani'],
      priceRange: '₹₹₹',
      openingHours: '11:30 AM - 3:30 PM, 6:30 PM - 11:00 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 4, status: 'Available', type: 'Indoor', features: ['AC', 'Premium Seating'] },
        { id: 2, name: 'Table 2', capacity: 2, status: 'Occupied', type: 'Indoor', features: ['Couple Table'] },
        { id: 3, name: 'Table 3', capacity: 6, status: 'Occupied', type: 'Indoor', features: ['Family Dining', 'Round Table'] },
        { id: 4, name: 'Table 4', capacity: 4, status: 'Available', type: 'Indoor', features: ['Booth Seating'] },
        { id: 5, name: 'Table 5', capacity: 8, status: 'Reserved', type: 'Private', features: ['Private Room', 'AC', 'Traditional Decor'] },
        { id: 6, name: 'Table 6', capacity: 4, status: 'Available', type: 'Indoor', features: ['Window View'] }
      ]
    },
    {
      id: 'a2b',
      name: 'Adyar Ananda Bhavan (A2B)',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
      cuisine: ['South Indian', 'Sweets', 'Vegetarian'],
      status: 'Low',
      waitTime: '7 mins',
      rating: 4.5,
      location: 'Chennai',
      city: 'Chennai',
      address: '168, Eldams Road, Teynampet, Chennai - 600018',
      description: 'Popular chain known for sweets, snacks, and South Indian meals. Perfect for both dining and takeaway sweets.',
      specialties: ['Mysore Pak', 'Ghee Sweets', 'Variety Rice', 'Chaat Items'],
      priceRange: '₹₹',
      openingHours: '7:00 AM - 10:30 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 2, status: 'Available', type: 'Indoor', features: ['AC', 'Quick Service'] },
        { id: 2, name: 'Table 2', capacity: 4, status: 'Available', type: 'Indoor', features: ['Family Seating'] },
        { id: 3, name: 'Table 3', capacity: 4, status: 'Available', type: 'Indoor', features: ['Near Sweets Display'] },
        { id: 4, name: 'Table 4', capacity: 6, status: 'Occupied', type: 'Indoor', features: ['Large Table'] },
        { id: 5, name: 'Table 5', capacity: 2, status: 'Available', type: 'Indoor', features: ['Counter Seating'] },
        { id: 6, name: 'Table 6', capacity: 8, status: 'Available', type: 'Hall', features: ['Group Dining', 'Spacious'] }
      ]
    },
    {
      id: 'sangeetha',
      name: 'Sangeetha Restaurant',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      cuisine: ['South Indian', 'North Indian', 'Multi-Cuisine'],
      status: 'Medium',
      waitTime: '14 mins',
      rating: 4.4,
      location: 'Chennai',
      city: 'Chennai',
      address: '45, Cathedral Road, Gopalapuram, Chennai - 600086',
      description: 'Multi-cuisine restaurant offering a wide variety of South and North Indian dishes. Family-friendly atmosphere with quick service.',
      specialties: ['Paneer Butter Masala', 'Rava Masala Dosa', 'Meals', 'Chinese'],
      priceRange: '₹₹',
      openingHours: '7:00 AM - 11:00 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 4, status: 'Available', type: 'Indoor', features: ['AC', 'Standard'] },
        { id: 2, name: 'Table 2', capacity: 2, status: 'Occupied', type: 'Indoor', features: ['Couple Seating'] },
        { id: 3, name: 'Table 3', capacity: 6, status: 'Occupied', type: 'Indoor', features: ['Family Table'] },
        { id: 4, name: 'Table 4', capacity: 4, status: 'Available', type: 'Indoor', features: ['Booth'] },
        { id: 5, name: 'Table 5', capacity: 4, status: 'Reserved', type: 'Indoor', features: ['Window Seat'] },
        { id: 6, name: 'Table 6', capacity: 8, status: 'Available', type: 'Private', features: ['Private Dining', 'AC'] },
        { id: 7, name: 'Table 7', capacity: 2, status: 'Available', type: 'Indoor', features: ['Quick Dining'] }
      ]
    },
    {
      id: 'ponnusamy',
      name: 'Ponnusamy Hotel',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
      cuisine: ['Chettinad', 'Non-Vegetarian', 'Tamil'],
      status: 'Busy',
      waitTime: '22 mins',
      rating: 4.7,
      location: 'Chennai',
      city: 'Chennai',
      address: '104, Poonamallee High Road, Egmore, Chennai - 600008',
      description: 'Iconic Chettinad restaurant famous for their non-vegetarian specialties. A Chennai institution for authentic Chettinad flavors.',
      specialties: ['Chicken 65', 'Mutton Varuval', 'Crab Masala', 'Prawn Fry'],
      priceRange: '₹₹₹',
      openingHours: '11:00 AM - 11:00 PM',
      tables: [
        { id: 1, name: 'Table 1', capacity: 4, status: 'Occupied', type: 'Indoor', features: ['AC', 'Premium'] },
        { id: 2, name: 'Table 2', capacity: 2, status: 'Occupied', type: 'Indoor', features: ['Couple Seating'] },
        { id: 3, name: 'Table 3', capacity: 6, status: 'Occupied', type: 'Indoor', features: ['Family Dining'] },
        { id: 4, name: 'Table 4', capacity: 4, status: 'Reserved', type: 'Indoor', features: ['Booth Seating'] },
        { id: 5, name: 'Table 5', capacity: 8, status: 'Occupied', type: 'Private', features: ['Private Room', 'AC'] },
        { id: 6, name: 'Table 6', capacity: 4, status: 'Available', type: 'Indoor', features: ['Standard'] }
      ]
    }
  ];

  constructor() { }

  getAllRestaurants(): Restaurant[] {
    return this.restaurants;
  }

  getRestaurantsByCity(city: string): Restaurant[] {
    if (!city || city === 'all') {
      return this.restaurants;
    }
    return this.restaurants.filter(r => r.city.toLowerCase() === city.toLowerCase());
  }

  getFeaturedRestaurants(count: number = 4): Restaurant[] {
    return this.restaurants.slice(0, count);
  }

  getRestaurantById(id: string): Restaurant | undefined {
    return this.restaurants.find(r => r.id === id);
  }

  getRestaurantByName(name: string): Restaurant | undefined {
    return this.restaurants.find(r =>
      r.name.toLowerCase() === name.toLowerCase() ||
      r.name.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
    );
  }

  getRestaurantTables(restaurantIdOrName: string): RestaurantTable[] {
    // Try to find by ID first, then by name
    let restaurant = this.getRestaurantById(restaurantIdOrName);
    if (!restaurant) {
      restaurant = this.getRestaurantByName(restaurantIdOrName);
    }
    return restaurant ? restaurant.tables : [];
  }

  getCities(): string[] {
    const cities = [...new Set(this.restaurants.map(r => r.city))];
    return cities.sort();
  }
}
