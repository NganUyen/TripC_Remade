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
    category: 'concert', // Mapping 'Karaoke' to 'concert' for icon compatibility or adding new types
    title: 'Galaxy KTV VIP Room',
    description: 'Premium karaoke experience with state-of-the-art sound systems and private butler service.',
    longDescription: 'Experience the ultimate karaoke night at Galaxy KTV. Our VIP rooms feature top-tier audio equipment, huge 4K screens, and a massive library of songs in multiple languages. Perfect for birthday parties, corporate events, or a fun night out with friends.',
    date: 'Daily',
    startTime: '6:00 PM',
    endTime: '3:00 AM',
    duration: 'Hourly',
    location: 'District 1, HCMC',
    address: '123 Nguyen Hue, District 1, Ho Chi Minh City',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    price: 50,
    ticketTypes: [
      { id: 'standard', name: 'Standard Room', price: 20, description: 'Fits up to 6 people', available: 10 },
      { id: 'vip', name: 'VIP Suite', price: 50, description: 'Fits up to 15 people, Includes Fruit Plater', available: 5 },
      { id: 'super-vip', name: 'Presidential Suite', price: 100, description: 'Fits up to 30 people, Private Bar', available: 2 }
    ],
    addOns: [
      { id: 'birthday', name: 'Birthday Decor', price: 30, description: 'Balloons and "Happy Birthday" setup' },
      { id: 'snack', name: 'Snack Combo', price: 15, description: '3 bags of chips + nuts' },
      { id: 'extra-mic', name: 'Extra Wireless Mic', price: 5, description: 'Add an extra microphone' }
    ],
    image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 1250,
    features: ['Private Rooms', 'Food & Drinks', 'Multi-language Songs', 'High-End Audio', 'Butler Service', 'Valet Parking'],
    highlights: [
      'Over 100,000 songs updated daily',
      'Premium Harman Kardon sound system',
      'Private restrooms in VIP suites',
      'Gourmet food menu available',
      'Happy Hour 6PM - 8PM'
    ],
    isOutdoor: false,
    ageRestriction: '18+',
    accessibility: ['Elevator access', 'Accessible restrooms'],
    venue: {
      name: 'Galaxy KTV Center',
      capacity: 200,
    },
    aiInsight: 'Book the "Presidential Suite" for the best sound isolation. Happy Hour deals (50% off room charge) are valid Mon-Thu before 8 PM. Their signature cocktail pitchers are highly recommended for groups.'
  },
  {
    id: '2',
    category: 'nightlife',
    title: 'Skyline Rooftop Bar',
    description: 'Sip signature cocktails with a breathtaking panoramic view of the city skyline.',
    longDescription: 'Perched on the 45th floor, Skyline Rooftop Bar offers the best views in the city. Featuring an extensive cocktail menu crafted by award-winning mixologists, live jazz bands on weekends, and a chic, sophisticated atmosphere.',
    date: 'Daily',
    startTime: '5:00 PM',
    endTime: '2:00 AM',
    duration: 'Reservation',
    location: 'Marina Bay',
    address: '10 Bayfront Ave, Singapore',
    city: 'Singapore',
    country: 'Singapore',
    price: 35,
    ticketTypes: [
      { id: 'standing', name: 'Standing Table', price: 35, description: 'Entry + 1 Drink', available: 50 },
      { id: 'sofa', name: 'Sofa Booth', price: 150, description: 'Min spend $150, seats 4-6', available: 10 },
      { id: 'vip-deck', name: 'VIP Deck', price: 300, description: 'Min spend $300, Best View', available: 3 }
    ],
    addOns: [
      { id: 'bubbly', name: 'Champagne Bottle', price: 120, description: 'Moët & Chandon Impérial' },
      { id: 'platter', name: 'Seafood Platter', price: 80, description: 'Oysters, Prawns, Sashimi' }
    ],
    image: 'https://images.unsplash.com/photo-1519671482538-518b48d195f4?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1519671482538-518b48d195f4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570560258879-af7f8e918f89?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewCount: 3200,
    features: ['Live Music', 'Outdoor Seating', 'Mixology Bar', 'Dress Code', 'Valet Parking', 'City View'],
    highlights: [
      '360-degree panoramic city views',
      'Award-winning mixologists',
      'Live Jazz Fri-Sun',
      'Sunset Hour specifics',
      'Exclusive VIP area'
    ],
    isOutdoor: true,
    ageRestriction: '21+',
    accessibility: ['Wheelchair accessible elevator'],
    venue: {
      name: 'Skyline Tower',
      capacity: 300
    },
    aiInsight: 'Arrive at 5:30 PM to catch the sunset. The "Singapore Sling 2.0" is their signature drink. Dress code is Smart Casual - no flip flops or shorts allowed.'
  },
  {
    id: '3',
    category: 'nightlife',
    title: 'The Jazz Corner',
    description: 'Intimate jazz club featuring international artists and fine whiskey collection.',
    longDescription: 'Step back in time at The Jazz Corner, a speakeasy-style venue dedicated to the golden age of jazz. Enjoy live performances from world-renowned artists while sipping on rare whiskeys and classic cocktails.',
    date: 'Tue-Sun',
    startTime: '7:30 PM',
    endTime: '12:00 AM',
    duration: 'Show',
    location: 'Greenwich Village, NY',
    address: '123 Blue Note St, NY',
    city: 'New York',
    country: 'USA',
    price: 45,
    ticketTypes: [
      { id: 'bar', name: 'Bar Seating', price: 45, description: 'Stool at the bar', available: 15 },
      { id: 'table', name: 'Table Seat', price: 65, description: 'Reserved table close to stage', available: 40 }
    ],
    addOns: [
      { id: 'whiskey', name: 'Whiskey Flight', price: 40, description: 'Tasting of 3 premium whiskies' }
    ],
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviewCount: 850,
    features: ['Live Jazz', 'Whiskey Bar', 'Intimate', 'Table Service'],
    highlights: [
      'Grammy-winning performers',
      'Extensive single-malt collection',
      'Authentic speakeasy vibe',
      'Acoustically treated room'
    ],
    isOutdoor: false,
    ageRestriction: '21+',
    accessibility: ['Ground floor access'],
    venue: {
      name: 'The Jazz Corner',
      capacity: 80
    },
    aiInsight: 'Tables 10-15 offer the best center-stage view. The kitchen closes at 10 PM, so order food early. Tuesdays are "Jam Session" nights where surprise guests often show up.'
  },
  {
    id: '4',
    category: 'concert', // Mapping for Pub/Live Music
    title: 'O\'Malley\'s Irish Pub',
    description: 'Authentic Irish pub with live folk music, Guinness on tap, and hearty food.',
    longDescription: 'A slice of Dublin in the heart of the city. O\'Malley\'s offers a warm, welcoming atmosphere with traditional Irish decor, live folk bands every night, and the best fish and chips in town.',
    date: 'Daily',
    startTime: '11:00 AM',
    endTime: '2:00 AM',
    duration: 'Open Entry',
    location: 'Boston, MA',
    address: '45 Clover Lane, Boston',
    city: 'Boston',
    country: 'USA',
    price: 0,
    ticketTypes: [
      { id: 'free', name: 'Free Entry', price: 0, description: 'Walk-ins welcome', available: 100 },
      { id: 'booth', name: 'Booth Reservation', price: 20, description: 'Reserve a booth for 4-6', available: 8 }
    ],
    addOns: [],
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviewCount: 2100,
    features: ['Live Folk Music', 'Draft Beer', 'Sports Screening', 'Patio'],
    highlights: [
      'Live Irish Folk bands daily',
      'Perfect pint of Guinness',
      'Sunday Roast special',
      'Friendly atmosphere'
    ],
    isOutdoor: true,
    ageRestriction: '21+ after 9PM',
    accessibility: ['Ramp entrance'],
    venue: {
      name: 'O\'Malley\'s',
      capacity: 150
    },
    aiInsight: 'Friday nights get very crowded; arrive by 7 PM to grab a table. The Beef & Guinness Stew is a local favorite.'
  }
];

export const MOCK_REVIEWS: Record<string, Review[]> = {
  '1': [
    {
      id: 'r1',
      userName: 'Jenny Tran',
      userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'Oct 2024',
      tripType: 'Birthday Party',
      comment: 'Had my birthday here in the VIP Suite. The sound system is insane! Staff were super attentive and the fruit platter was huge.',
      verified: true
    }
  ],
  '2': [
    {
      id: 'r2',
      userName: 'Markus Doe',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      rating: 5,
      date: 'Sep 2024',
      tripType: 'Date Night',
      comment: 'The view is unbeatable. Expensive, but worth it for a special occasion. Jazz band was classy.',
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
