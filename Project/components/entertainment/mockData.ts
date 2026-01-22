export interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  available: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface EntertainmentItem {
  id: string;
  category: 'concert' | 'theme-park' | 'museum' | 'zoo' | 'workshop' | 'sports' | 'nightlife' | 'cinema';
  
  // Basic Info
  title: string;
  description: string;
  longDescription: string;
  
  // Date & Time
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  
  // Location
  location: string;
  address: string;
  city: string;
  country: string;
  
  // Pricing
  price: number;
  ticketTypes: TicketType[];
  addOns?: AddOn[];
  
  // Media
  image: string;
  images: string[];
  
  // Ratings & Reviews
  rating: number;
  reviewCount: number;
  
  // Features
  features: string[];
  highlights: string[];
  
  // Metadata
  isOutdoor: boolean;
  ageRestriction?: string;
  accessibility: string[];
  
  // Venue
  venue: {
    name: string;
    capacity?: number;
    seatingChart?: string;
  };
  
  // AI Insight
  aiInsight: string;
}

export interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  date: string;
  tripType: string;
  comment: string;
  verified: boolean;
}

export const ENTERTAINMENT_ITEMS: EntertainmentItem[] = [
  {
    id: '1',
    category: 'concert',
    title: 'Coldplay: Music of Spheres',
    description: 'Experience the spectacular world tour with stunning visuals and chart-topping hits',
    longDescription: 'Coldplay\'s Music of the Spheres World Tour is a groundbreaking concert experience featuring state-of-the-art production, LED wristbands for the audience, and an environmentally sustainable touring approach. The show includes hits from across their career plus new material from their latest album.',
    date: 'Sat, Aug 24, 2024',
    startTime: '8:00 PM',
    endTime: '11:00 PM',
    duration: '3h',
    location: 'Wembley Stadium, London',
    address: 'Wembley, London HA9 0WS',
    city: 'London',
    country: 'United Kingdom',
    price: 120,
    ticketTypes: [
      { id: 'ga', name: 'General Admission', price: 120, description: 'Standing area, great atmosphere', available: 245 },
      { id: 'seated', name: 'Seated Tickets', price: 180, description: 'Reserved seating with excellent views', available: 89 },
      { id: 'vip', name: 'VIP Package', price: 350, description: 'Premium seating, lounge access, merchandise', available: 12 }
    ],
    addOns: [
      { id: 'parking', name: 'Premium Parking', price: 25, description: 'Reserved parking spot near entrance' },
      { id: 'merch', name: 'Merchandise Bundle', price: 45, description: 'Exclusive tour t-shirt and poster' },
      { id: 'fasttrack', name: 'Fast Track Entry', price: 15, description: 'Skip the regular queue' }
    ],
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewCount: 2340,
    features: ['Parking Available', 'Food & Drinks', 'Merchandise Shop', 'LED Wristbands', 'Photography Allowed', 'Accessible Seating'],
    highlights: [
      'Chart-topping hits from every era',
      'Stunning LED stage production',
      'Interactive light-up wristbands',
      'Eco-friendly sustainable tour',
      'Special guest appearances'
    ],
    isOutdoor: true,
    ageRestriction: 'All ages (under 14 with adult)',
    accessibility: ['Wheelchair accessible', 'Accessible toilets', 'BSL interpreter available', 'Hearing assistance'],
    venue: {
      name: 'Wembley Stadium',
      capacity: 90000,
      seatingChart: 'https://example.com/seating'
    },
    aiInsight: 'Arrive 30-45 minutes early for best parking options. VIP package holders get access to exclusive lounge with complimentary drinks. Coldplay typically performs 22-24 songs including 3 encore performances. Weather forecast shows clear skies - perfect for the outdoor spectacle!'
  },
  {
    id: '2',
    category: 'theme-park',
    title: 'Disneyland Park 1-Day Pass',
    description: 'Where dreams come true - experience the magic of Disney with thrilling rides and beloved characters',
    longDescription: 'Explore the magic of Disneyland Park with access to all attractions, shows, and character meet-and-greets. From classic rides like Space Mountain to newer attractions, enjoy a full day of family entertainment in the happiest place on earth.',
    date: 'Valid any day until Dec 31, 2024',
    startTime: '9:00 AM',
    endTime: '10:00 PM',
    duration: 'Full Day',
    location: 'Anaheim, California',
    address: '1313 Disneyland Dr, Anaheim, CA 92802',
    city: 'Anaheim',
    country: 'United States',
    price: 154,
    ticketTypes: [
      { id: '1day', name: '1-Day Ticket', price: 154, description: 'Single park access for one day', available: 500 },
      { id: '2day', name: '2-Day Ticket', price: 280, description: 'Two days of park access', available: 300 },
      { id: 'hopper', name: 'Park Hopper', price: 199, description: 'Visit both parks in one day', available: 200 }
    ],
    addOns: [
      { id: 'fastpass', name: 'Lightning Lane Pass', price: 30, description: 'Skip lines on popular attractions' },
      { id: 'dining', name: 'Dining Package', price: 65, description: 'Quick-service meals included' },
      { id: 'photo', name: 'PhotoPass', price: 25, description: 'Unlimited photo downloads' }
    ],
    image: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1538894818427-e04b2e202e7f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 5670,
    features: ['Parking Available', 'Restaurants', 'Souvenir Shops', 'Character Meet & Greets', 'Stroller Rental', 'First Aid'],
    highlights: [
      '60+ attractions and rides',
      'Daily parades and fireworks',
      'Character dining experiences',
      'Themed lands and immersive worlds',
      'Seasonal special events'
    ],
    isOutdoor: true,
    ageRestriction: 'All ages welcome',
    accessibility: ['Wheelchair accessible', 'Attraction accessibility guides', 'Service animal friendly', 'Mobility device rentals'],
    venue: {
      name: 'Disneyland Park',
      capacity: 85000
    },
    aiInsight: 'Rope drop strategy: Arrive 30min before opening and head straight to Space Mountain or Star Wars: Rise of the Resistance (lowest wait times). Download the Disneyland app for real-time wait times. Peak crowds hit between 1-3 PM - perfect time for sit-down lunch. End your day at Sleeping Beauty Castle for fireworks at 9:30 PM.'
  },
  {
    id: '3',
    category: 'museum',
    title: 'Louvre Museum Skip-Line Ticket',
    description: 'Explore the world\'s largest art museum featuring the Mona Lisa, Venus de Milo, and 35,000 masterpieces',
    longDescription: 'The Louvre Museum houses an unparalleled collection spanning 9,000 years of history. Skip the long entrance queues and explore iconic works including the Mona Lisa, Winged Victory, and Egyptian antiquities. Audio guides available in 12 languages.',
    date: 'Flexible time slots available',
    startTime: '9:00 AM',
    endTime: '6:00 PM',
    duration: 'Recommended 3-4h',
    location: 'Paris, France',
    address: 'Rue de Rivoli, 75001 Paris',
    city: 'Paris',
    country: 'France',
    price: 22,
    ticketTypes: [
      { id: 'adult', name: 'Adult Ticket', price: 22, description: 'Ages 18+, skip-the-line access', available: 1000 },
      { id: 'youth', name: 'Youth Ticket (18-25)', price: 18, description: 'Valid student ID required', available: 500 },
      { id: 'audio', name: 'Ticket + Audio Guide', price: 30, description: 'Entry plus multimedia guide', available: 800 }
    ],
    addOns: [
      { id: 'guide', name: 'Private Tour Guide', price: 85, description: '2-hour expert-led tour' },
      { id: 'workshop', name: 'Art Workshop', price: 35, description: 'Drawing class in the galleries' }
    ],
    image: 'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566127444979-b3d2b64f9b1f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581889419126-97b5fa4d0e5e?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviewCount: 8920,
    features: ['Audio Guides', 'Coat Check', 'Cafe & Restaurant', 'Museum Shop', 'Photography Allowed (no flash)', 'Free WiFi'],
    highlights: [
      'Mona Lisa by Leonardo da Vinci',
      'Venus de Milo sculpture',
      'Egyptian Antiquities collection',
      'Napoleon\'s Apartments',
      'Medieval Louvre foundations'
    ],
    isOutdoor: false,
    ageRestriction: 'All ages',
    accessibility: ['Wheelchair accessible', 'Audio descriptions', 'Tactile tours for visually impaired', 'Wheelchair rentals'],
    venue: {
      name: 'Musée du Louvre',
      capacity: 30000
    },
    aiInsight: 'Visit Wednesday or Friday evenings (open until 9:45 PM) to avoid tour groups. The Denon Wing (Mona Lisa) is busiest 11 AM-3 PM - see it first or after 4 PM. Don\'t miss the less-crowded Richelieu Wing for French paintings and sculptures. Photography allowed but no flash or selfie sticks near fragile works.'
  },
  {
    id: '4',
    category: 'sports',
    title: 'Arsenal vs Manchester United - Premier League',
    description: 'Witness the historic rivalry at Emirates Stadium with premium seating options',
    longDescription: 'Experience one of football\'s greatest rivalries live at Emirates Stadium. This Premier League clash promises high-intensity action, world-class players, and an electric atmosphere. Choose from various seating categories for the best matchday experience.',
    date: 'Sun, Sep 15, 2024',
    startTime: '4:30 PM',
    endTime: '6:30 PM',
    duration: '2h',
    location: 'Emirates Stadium, London',
    address: 'Hornsey Rd, London N7 7AJ',
    city: 'London',
    country: 'United Kingdom',
    price: 85,
    ticketTypes: [
      { id: 'upper', name: 'Upper Tier', price: 85, description: 'Great elevated views', available: 340 },
      { id: 'lower', name: 'Lower Tier', price: 140, description: 'Closer to the action', available: 89 },
      { id: 'club', name: 'Club Level', price: 280, description: 'Premium seats with lounge access', available: 23 }
    ],
    addOns: [
      { id: 'parking', name: 'Stadium Parking', price: 20, description: 'On-site parking reservation' },
      { id: 'scarf', name: 'Match Scarf', price: 18, description: 'Limited edition match scarf' },
      { id: 'program', name: 'Match Program', price: 5, description: 'Official matchday program' }
    ],
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewCount: 1240,
    features: ['Food & Beverages', 'Merchandise Store', 'Family Section', 'Accessible Seating', 'WiFi', 'Big Screen Replays'],
    highlights: [
      'Historic Premier League rivalry',
      'World-class players in action',
      'Electric matchday atmosphere',
      'Pre-match entertainment',
      'Post-match player walkout'
    ],
    isOutdoor: true,
    ageRestriction: 'All ages (under 16 with adult)',
    accessibility: ['Wheelchair spaces', 'Accessible toilets', 'Audio commentary', 'Easy access seating'],
    venue: {
      name: 'Emirates Stadium',
      capacity: 60704,
      seatingChart: 'https://example.com/emirates-seating'
    },
    aiInsight: 'Gates open 90 minutes before kickoff - arrive early for pre-match atmosphere. Sections 101-115 (lower tier) offer best sightlines behind the goals. Food and drink lines longest 30min before kickoff and at halftime - grab refreshments early. Weather forecast shows possible showers - bring a light jacket.'
  },
  {
    id: '5',
    category: 'cinema',
    title: 'The Lion King Musical',
    description: 'Broadway\'s award-winning spectacular bringing the Pride Lands to life with stunning costumes and music',
    longDescription: 'Experience the phenomenon that is THE LION KING. Winner of six Tony Awards including Best Musical, this theatrical masterpiece features Elton John and Tim Rice\'s beloved songs plus a score by Lebo M and Hans Zimmer. Witness the stunning costumes, innovative puppetry, and breathtaking choreography that bring the African savanna to the stage.',
    date: 'Thu, Sep 12, 2024',
    startTime: '7:30 PM',
    endTime: '10:00 PM',
    duration: '2h 30min (incl. intermission)',
    location: 'Minskoff Theatre, NYC',
    address: '200 W 45th St, New York, NY 10036',
    city: 'New York',
    country: 'United States',
    price: 95,
    ticketTypes: [
      { id: 'balcony', name: 'Balcony Seats', price: 95, description: 'Upper level with full stage view', available: 156 },
      { id: 'mezzanine', name: 'Mezzanine', price: 165, description: 'Mid-level premium seating', available: 67 },
      { id: 'orchestra', name: 'Orchestra', price: 245, description: 'Best seats in the house', available: 34 }
    ],
    addOns: [
      { id: 'playbill', name: 'Signed Playbill', price: 25, description: 'Autographed by cast members' },
      { id: 'vip', name: 'VIP Pre-Show', price: 50, description: 'Backstage tour and meet & greet' }
    ],
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a11d0?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507676184212-d03ab07a11d0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.95,
    reviewCount: 4230,
    features: ['Air Conditioned', 'Accessible Seating', 'Bar/Concessions', 'Coat Check', 'Playbill Included', 'Gift Shop'],
    highlights: [
      'Tony Award-winning masterpiece',
      'Iconic songs: Circle of Life, Can You Feel the Love Tonight',
      'Breathtaking costume design',
      'Innovative puppet artistry',
      'Perfect for all ages'
    ],
    isOutdoor: false,
    ageRestriction: 'Recommended 6+',
    accessibility: ['Wheelchair accessible', 'Listening devices', 'Audio description', 'Open captioning select performances'],
    venue: {
      name: 'Minskoff Theatre',
      capacity: 1621,
      seatingChart: 'https://example.com/minskoff-seating'
    },
    aiInsight: 'Arrive 30 minutes early for best merchandise selection and to avoid rush. Orchestra center seats (rows F-P) offer optimal viewing of the iconic opening scene. The show features a 15-minute intermission - perfect for grabbing refreshments. Photography and recording strictly prohibited. Dress code is smart casual - Broadway attire encouraged!'
  }
];

export const MOCK_REVIEWS: Record<string, Review[]> = {
  '1': [
    {
      id: 'r1',
      userName: 'Sarah Mitchell',
      userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'August 2024',
      tripType: 'Concert with Friends',
      comment: 'Absolutely incredible show! The LED wristbands made the whole stadium feel connected. Coldplay performed all the classics plus amazing new songs. Production value was off the charts!',
      verified: true
    },
    {
      id: 'r2',
      userName: 'James Rodriguez',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'August 2024',
      tripType: 'Date Night',
      comment: 'Best concert I\'ve ever been to. The sustainability focus made it feel good too. VIP package was worth every penny - lounge was amazing and we got exclusive merchandise.',
      verified: true
    },
    {
      id: 'r3',
      userName: 'Emma Thompson',
      userImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      rating: 4,
      date: 'July 2024',
      tripType: 'Family Trip',
      comment: 'Fantastic experience for the whole family. Kids loved the light-up wristbands. Only minor issue was the parking took a while to exit, but overall magical night!',
      verified: true
    }
  ],
  '2': [
    {
      id: 'r4',
      userName: 'Michael Chen',
      userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'July 2024',
      tripType: 'Family Vacation',
      comment: 'Pure magic! The kids met all their favorite characters and we rode every major attraction. Lightning Lane pass was essential - saved hours of waiting. Fireworks were spectacular!',
      verified: true
    },
    {
      id: 'r5',
      userName: 'Lisa Anderson',
      userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'June 2024',
      tripType: 'Girls Trip',
      comment: 'Even as adults we had a blast! Galaxy\'s Edge was incredible. The PhotoPass package was worth it for all the character photos. Can\'t wait to come back!',
      verified: true
    },
    {
      id: 'r6',
      userName: 'David Park',
      userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
      rating: 4,
      date: 'May 2024',
      tripType: 'Anniversary',
      comment: 'Wonderful experience. Park was clean, staff were friendly. Only downside was how crowded it got in the afternoon. Definitely arrive early!',
      verified: true
    }
  ],
  '3': [
    {
      id: 'r7',
      userName: 'Sophie Laurent',
      userImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'August 2024',
      tripType: 'Cultural Trip',
      comment: 'Skip-the-line ticket was essential! Spent 4 hours and barely scratched the surface. The audio guide was excellent and very informative. A must-visit in Paris!',
      verified: true
    },
    {
      id: 'r8',
      userName: 'Robert Williams',
      userImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'July 2024',
      tripType: 'Solo Travel',
      comment: 'Breathtaking collection. Saw the Mona Lisa with surprisingly small crowds in the evening. Egyptian section was my favorite. Plan for at least half a day!',
      verified: true
    },
    {
      id: 'r9',
      userName: 'Anna Kowalski',
      userImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
      rating: 4,
      date: 'June 2024',
      tripType: 'Educational',
      comment: 'Incredible museum with so much history. Audio guide enhanced the experience greatly. Wear comfortable shoes - you\'ll be walking for hours!',
      verified: true
    }
  ],
  '4': [
    {
      id: 'r10',
      userName: 'Tom Harrison',
      userImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'September 2024',
      tripType: 'Lads Weekend',
      comment: 'Unreal atmosphere! The rivalry was intense and the match lived up to expectations. Lower tier seats gave us an amazing view. Emirates Stadium is world-class!',
      verified: true
    },
    {
      id: 'r11',
      userName: 'Marcus Johnson',
      userImage: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'August 2024',
      tripType: 'Father & Son',
      comment: 'First Premier League match for my son and it was perfect. Club level seats with lounge access made it special. Already booked our next match!',
      verified: true
    }
  ],
  '5': [
    {
      id: 'r12',
      userName: 'Rachel Green',
      userImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'September 2024',
      tripType: 'Family Outing',
      comment: 'Absolutely mesmerizing! The costumes and puppetry were beyond anything I imagined. Kids were captivated from start to finish. A true Broadway masterpiece!',
      verified: true
    },
    {
      id: 'r13',
      userName: 'Christopher Lee',
      userImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'August 2024',
      tripType: 'Anniversary',
      comment: 'Phenomenal production. Orchestra seats were perfect - every detail visible. Circle of Life opening gave me chills. Best show on Broadway hands down!',
      verified: true
    }
  ]
};

// Helper function to get entertainment item by ID
export function getEntertainmentById(id: string): EntertainmentItem | undefined {
  return ENTERTAINMENT_ITEMS.find(item => item.id === id);
}

// Helper function to get reviews for an item
export function getReviewsById(id: string): Review[] {
  return MOCK_REVIEWS[id] || [];
}
