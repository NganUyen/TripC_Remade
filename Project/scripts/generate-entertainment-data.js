/**
 * Entertainment Data Generator
 *
 * Generates realistic seed data for the Entertainment service
 * Can output to SQL or JSON format for database seeding
 */

const fs = require("fs");
const path = require("path");

// Configuration
const OUTPUT_DIR = path.join(__dirname, "../docs/entertainment");
const SQL_FILE = path.join(OUTPUT_DIR, "generated_seed_data.sql");
const JSON_FILE = path.join(OUTPUT_DIR, "generated_seed_data.json");

// Helper to generate UUID v4
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Date helper
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Sample data arrays
const CITIES = [
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lng: 106.6297 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { name: "Las Vegas", country: "USA", lat: 36.1699, lng: -115.1398 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
];

const VENUE_TYPES = [
  "Rooftop Bar",
  "Nightclub",
  "Live Music Venue",
  "Speakeasy",
  "Lounge",
  "Pub",
  "Concert Hall",
  "Theater",
];

const ENTERTAINMENT_ITEMS = [
  {
    title: "SkyBar 360° Rooftop Experience",
    subtitle: "Panoramic City Views with Live DJ",
    type: "venue",
    description:
      "Experience breathtaking 360° views from the highest rooftop bar in the city. Features live DJ sets nightly, craft cocktails, and premium bottle service.",
    long_description:
      "Located on the 52nd floor, SkyBar offers an unparalleled entertainment experience with stunning panoramic views. Our world-class DJs spin the latest tracks while you enjoy handcrafted cocktails from our award-winning mixologists. Perfect for special celebrations, date nights, or exclusive VIP experiences.",
    features: [
      "360° panoramic views",
      "Live DJ performances",
      "Premium cocktail menu",
      "VIP bottle service",
      "Indoor & outdoor seating",
      "Climate controlled",
    ],
    inclusions: [
      "Welcome cocktail",
      "Reserved seating for 2 hours",
      "Complimentary snacks",
      "Access to VIP lounge",
    ],
    min_price: 45,
    max_price: 250,
    images: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200",
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1200",
    ],
  },
  {
    title: "Electric Pulse Nightclub",
    subtitle: "Premier EDM & House Music Venue",
    type: "venue",
    description:
      "The city's hottest nightclub featuring international DJs, state-of-the-art sound systems, and an electrifying atmosphere.",
    long_description:
      "Electric Pulse is the ultimate destination for electronic music lovers. With a 15,000-square-foot dance floor, world-class lighting system, and top-tier DJ talent, we deliver unforgettable nights. VIP tables available with bottle service.",
    features: [
      "World-class sound system",
      "LED dance floor",
      "International DJs",
      "VIP bottle service",
      "Private cabanas",
      "Late night hours",
    ],
    inclusions: [
      "Entry ticket",
      "Coat check",
      "One complimentary drink",
      "Access to all areas",
    ],
    min_price: 35,
    max_price: 500,
    images: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200",
      "https://images.unsplash.com/photo-1571266028243-d220c8c3d4a5?q=80&w=1200",
      "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=1200",
    ],
  },
  {
    title: "Jazz & Blues Underground",
    subtitle: "Intimate Live Jazz Performances",
    type: "show",
    description:
      "Hidden speakeasy-style venue featuring nightly live jazz, blues, and soul performances from acclaimed musicians.",
    long_description:
      "Step back in time at our 1920s-inspired underground jazz club. Featuring plush velvet seating, candlelit tables, and the finest jazz musicians performing classic standards and modern interpretations. Full bar with prohibition-era cocktails.",
    features: [
      "Live jazz nightly",
      "Intimate 80-seat venue",
      "Full cocktail bar",
      "Vintage atmosphere",
      "Premium sound quality",
      "No phones policy",
    ],
    inclusions: [
      "Reserved seating",
      "Live performance",
      "Complimentary welcome drink",
      "Jazz history program",
    ],
    min_price: 40,
    max_price: 120,
    images: [
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200",
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1200",
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=1200",
    ],
  },
  {
    title: "Neon District Karaoke Palace",
    subtitle: "Private Karaoke Rooms & Bar",
    type: "venue",
    description:
      "Luxury karaoke experience with private rooms, extensive song library, and full food & beverage service.",
    long_description:
      "Experience karaoke like never before in our state-of-the-art private rooms. Each room features professional sound equipment, massive song libraries in multiple languages, mood lighting, and dedicated service staff. Perfect for groups, parties, and celebrations.",
    features: [
      "Private rooms (4-30 people)",
      "100,000+ song library",
      "Professional audio equipment",
      "Full menu service",
      "Themed room options",
      "Photo booth",
    ],
    inclusions: [
      "Room rental (2 hours)",
      "Premium sound system",
      "Tablet song selection",
      "Welcome drinks",
      "Unlimited song selections",
    ],
    min_price: 50,
    max_price: 300,
    images: [
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200",
      "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1200",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200",
    ],
  },
  {
    title: "Broadway Spectacular: Hamilton",
    subtitle: "Award-Winning Musical Theatre",
    type: "show",
    description:
      "The cultural phenomenon. The critically acclaimed musical that tells the story of American Founding Father Alexander Hamilton.",
    long_description:
      "Experience the revolutionary musical that's captivated audiences worldwide. Hamilton combines hip-hop, jazz, R&B, and Broadway to tell the story of America then, told by America now. Winner of 11 Tony Awards including Best Musical.",
    features: [
      "2 hours 45 minutes runtime",
      "Orchestra or balcony seating",
      "Historic theater venue",
      "Accessible seating available",
      "Merchandise available",
      "Program book included",
    ],
    inclusions: [
      "Show ticket",
      "Program book",
      "Coat check service",
      "Access to theater facilities",
    ],
    min_price: 89,
    max_price: 450,
    images: [
      "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200",
      "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1200",
      "https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=1200",
    ],
  },
  {
    title: "Comedy Night: Stand-Up Showcase",
    subtitle: "Featuring Top Local & International Comics",
    type: "show",
    description:
      "Hilarious stand-up comedy featuring a rotating lineup of established and up-and-coming comedians.",
    long_description:
      "Laugh until your sides hurt at our weekly comedy showcase. Each show features 4-5 talented comedians performing their best material. Full bar and food menu available. Ages 18+ only. Show typically runs 2 hours with intermission.",
    features: [
      "4-5 comedians per show",
      "Full bar service",
      "Food menu available",
      "Intimate club setting",
      "Meet & greet opportunities",
      "18+ venue",
    ],
    inclusions: [
      "Show ticket",
      "Reserved seating",
      "One complimentary drink",
      "Access to VIP lounge (premium tickets)",
    ],
    min_price: 25,
    max_price: 75,
    images: [
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1200",
      "https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=1200",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200",
    ],
  },
  {
    title: "Sunset Cocktail Cruise",
    subtitle: "Harbor Tour with Live Music",
    type: "tour",
    description:
      "Scenic harbor cruise during golden hour with live acoustic music, premium cocktails, and hors d'oeuvres.",
    long_description:
      "Set sail on a luxurious 3-hour sunset cruise around the harbor. Enjoy breathtaking views of the city skyline as the sun sets, accompanied by live acoustic music. Indulge in unlimited premium cocktails and gourmet hors d'oeuvres prepared by our onboard chef.",
    features: [
      "3-hour cruise",
      "Live acoustic music",
      "Open bar (premium)",
      "Gourmet hors d'oeuvres",
      "Indoor & outdoor seating",
      "Photo opportunities",
    ],
    inclusions: [
      "Cruise ticket",
      "Unlimited premium drinks",
      "Hors d'oeuvres",
      "Live entertainment",
      "Welcome champagne toast",
    ],
    min_price: 95,
    max_price: 180,
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200",
      "https://images.unsplash.com/photo-1583675505782-26e8e0b9b98e?q=80&w=1200",
    ],
  },
  {
    title: "The Secret Garden Speakeasy",
    subtitle: "Hidden Botanical Bar Experience",
    type: "venue",
    description:
      "Exclusive speakeasy hidden behind a flower shop. Password required. Botanical cocktails in a lush garden setting.",
    long_description:
      "Discover the city's best-kept secret. Enter through the flower shop and whisper the password to access our enchanting botanical speakeasy. Surrounded by living walls of plants and flowers, enjoy artisanal cocktails crafted with fresh herbs and botanical infusions.",
    features: [
      "Hidden entrance",
      "Password required",
      "Botanical cocktails",
      "Live plants & flowers",
      "Limited capacity",
      "Reservation only",
    ],
    inclusions: [
      "Entry access",
      "Reserved seating",
      "Botanical cocktail flight",
      "Herb-infused snacks",
    ],
    min_price: 55,
    max_price: 150,
    images: [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1200",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200",
      "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?q=80&w=1200",
    ],
  },
  {
    title: "Latin Night: Salsa & Bachata",
    subtitle: "Dance Party with Live Band",
    type: "event",
    description:
      "Weekly Latin dance party featuring live salsa band, dance lessons, and authentic Latin cuisine.",
    long_description:
      "Experience the passion and energy of Latin dance culture. Every Saturday night features a live 10-piece salsa band, complimentary beginner dance lesson at 8 PM, and authentic Latin food and drinks. All levels welcome - from beginners to advanced dancers.",
    features: [
      "Live salsa band",
      "Free dance lesson",
      "Latin cuisine",
      "Full bar",
      "Professional dancers",
      "Large dance floor",
    ],
    inclusions: [
      "Entry ticket",
      "Dance lesson",
      "One complimentary drink",
      "Welcome appetizer platter",
    ],
    min_price: 30,
    max_price: 60,
    images: [
      "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1200",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200",
    ],
  },
  {
    title: "Craft Beer Tasting Experience",
    subtitle: "Microbrewery Tour & Tasting",
    type: "tour",
    description:
      "Behind-the-scenes brewery tour with expert-guided tasting of 8 craft beers and artisan beer snacks.",
    long_description:
      "Go behind the scenes at our award-winning microbrewery. Learn the art and science of craft beer brewing from our master brewer, then taste 8 different beers including exclusive small-batch releases. Paired with artisan snacks selected to complement each beer.",
    features: [
      "Brewery tour",
      "8 beer tastings",
      "Expert guide",
      "Artisan food pairings",
      "Take-home tasting notes",
      "Discount at brewery shop",
    ],
    inclusions: [
      "Guided tour",
      "8x 4oz beer samples",
      "Food pairings",
      "Tasting glass to keep",
      "10% shop discount",
    ],
    min_price: 40,
    max_price: 70,
    images: [
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=1200",
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=1200",
      "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?q=80&w=1200",
    ],
  },
];

// Generate categories
function generateCategories() {
  return [
    {
      id: generateUUID(),
      name: "Rooftop Bars",
      slug: "rooftop-bars",
      description: "Sky-high cocktails with panoramic views",
      display_order: 1,
    },
    {
      id: generateUUID(),
      name: "Nightclubs",
      slug: "nightclubs",
      description: "Dance the night away at premier clubs",
      display_order: 2,
    },
    {
      id: generateUUID(),
      name: "Live Music",
      slug: "live-music",
      description: "Experience incredible live performances",
      display_order: 3,
    },
    {
      id: generateUUID(),
      name: "Speakeasies",
      slug: "speakeasies",
      description: "Hidden bars with craft cocktails",
      display_order: 4,
    },
    {
      id: generateUUID(),
      name: "Lounges",
      slug: "lounges",
      description: "Sophisticated ambiance and premium drinks",
      display_order: 5,
    },
    {
      id: generateUUID(),
      name: "Pubs",
      slug: "pubs",
      description: "Traditional pubs and beer gardens",
      display_order: 6,
    },
  ];
}

// Generate organizers
function generateOrganizers() {
  return [
    {
      id: generateUUID(),
      name: "NightLife Entertainment Group",
      slug: "nightlife-entertainment",
      description: "Premier entertainment and hospitality company",
      email: "booking@nightlife-ent.com",
      phone: "+1-555-0100",
      website: "https://nightlife-ent.com",
      rating_average: 4.8,
      is_verified: true,
    },
    {
      id: generateUUID(),
      name: "Stellar Events & Shows",
      slug: "stellar-events",
      description: "World-class event production and venue management",
      email: "info@stellarevents.com",
      phone: "+1-555-0200",
      website: "https://stellarevents.com",
      rating_average: 4.9,
      is_verified: true,
    },
    {
      id: generateUUID(),
      name: "Urban Music Collective",
      slug: "urban-music",
      description: "Live music venue operators and concert promoters",
      email: "bookings@urbanmusic.com",
      phone: "+1-555-0300",
      website: "https://urbanmusic.com",
      rating_average: 4.7,
      is_verified: true,
    },
  ];
}

// Generate entertainment items with sessions and ticket types
function generateEntertainmentData() {
  const categories = generateCategories();
  const organizers = generateOrganizers();
  const items = [];
  const sessions = [];
  const ticketTypes = [];

  ENTERTAINMENT_ITEMS.forEach((itemTemplate, index) => {
    const city = CITIES[index % CITIES.length];
    const category = categories[index % categories.length];
    const organizer = organizers[index % organizers.length];
    const itemId = generateUUID();

    const item = {
      id: itemId,
      title: itemTemplate.title,
      subtitle: itemTemplate.subtitle,
      slug: itemTemplate.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: itemTemplate.description,
      long_description: itemTemplate.long_description,
      type: itemTemplate.type,
      category_id: category.id,
      organizer_id: organizer.id,
      min_price: itemTemplate.min_price,
      max_price: itemTemplate.max_price,
      currency: "USD",
      location: {
        address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        city: city.name,
        country: city.country,
        lat: city.lat,
        lng: city.lng,
      },
      images: itemTemplate.images,
      features: itemTemplate.features,
      inclusions: itemTemplate.inclusions,
      exclusions: [
        "Personal expenses",
        "Gratuities",
        "Transportation to venue",
      ],
      cancellation_policy:
        "Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.",
      important_info: [
        "Valid ID required for entry",
        "Dress code: Smart casual",
        "Must be 21+ to enter",
        "No outside food or drinks",
        "Photography allowed",
      ],
      status: "published",
      is_featured: Math.random() > 0.7,
      is_trending: Math.random() > 0.6,
      available: true,
      rating_average: 4.0 + Math.random() * 1.0,
      rating_count: Math.floor(Math.random() * 500) + 50,
      total_bookings: Math.floor(Math.random() * 1000) + 100,
      total_views: Math.floor(Math.random() * 5000) + 500,
    };

    items.push(item);

    // Generate ticket types for this item
    const ticketTypeTemplates = [
      {
        name: "General Admission",
        price: itemTemplate.min_price,
        features: ["Standard entry", "General seating", "Access to main area"],
      },
      {
        name: "VIP Experience",
        price: Math.floor(itemTemplate.min_price * 1.8),
        features: [
          "Priority entry",
          "VIP seating",
          "Complimentary drink",
          "VIP lounge access",
        ],
      },
      {
        name: "Premium Package",
        price: itemTemplate.max_price,
        features: [
          "Fast track entry",
          "Premium reserved seating",
          "Bottle service",
          "VIP lounge access",
          "Dedicated server",
        ],
      },
    ];

    ticketTypeTemplates.forEach((tt) => {
      ticketTypes.push({
        id: generateUUID(),
        item_id: itemId,
        name: tt.name,
        description: tt.features.join(", "),
        price: tt.price,
        currency: "USD",
        available_stock: Math.floor(Math.random() * 100) + 20,
        max_per_booking: 8,
        features: tt.features,
        is_active: true,
      });
    });

    // Generate sessions for next 14 days
    for (let day = 0; day < 14; day++) {
      const sessionDate = addDays(new Date("2026-02-01"), day);

      // Generate 2-3 sessions per day
      const sessionTimes = ["18:00:00", "20:30:00", "23:00:00"];
      const numSessions = Math.floor(Math.random() * 2) + 2;

      for (let s = 0; s < numSessions; s++) {
        const startTime = sessionTimes[s];
        const totalSpots = Math.floor(Math.random() * 100) + 50;
        const bookedSpots = Math.floor(Math.random() * totalSpots * 0.6);

        sessions.push({
          id: generateUUID(),
          item_id: itemId,
          date: formatDate(sessionDate),
          start_time: startTime,
          end_time: addHours(startTime, 3),
          total_spots: totalSpots,
          available_spots: totalSpots - bookedSpots,
          status:
            bookedSpots >= totalSpots
              ? "sold_out"
              : bookedSpots >= totalSpots * 0.9
                ? "limited"
                : "available",
          is_active: true,
        });
      }
    }
  });

  return { categories, organizers, items, sessions, ticketTypes };
}

function addHours(timeStr, hours) {
  const [h, m, s] = timeStr.split(":").map(Number);
  const newHour = (h + hours) % 24;
  return `${String(newHour).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Generate SQL INSERT statements
function generateSQL(data) {
  let sql = `-- =====================================================================
-- ENTERTAINMENT SERVICE - GENERATED SEED DATA
-- Generated: ${new Date().toISOString()}
-- =====================================================================

BEGIN;

-- Delete existing data (in correct order to respect foreign keys)
DELETE FROM entertainment_sessions;
DELETE FROM entertainment_ticket_types;
DELETE FROM entertainment_items;
DELETE FROM entertainment_organizers;
DELETE FROM entertainment_categories;

-- =====================================================================
-- CATEGORIES
-- =====================================================================

`;

  data.categories.forEach((cat) => {
    sql += `INSERT INTO entertainment_categories (id, name, slug, description, display_order, is_active) VALUES
('${cat.id}', '${cat.name}', '${cat.slug}', '${cat.description}', ${cat.display_order}, true);\n`;
  });

  sql += `\n-- =====================================================================
-- ORGANIZERS
-- =====================================================================\n\n`;

  data.organizers.forEach((org) => {
    sql += `INSERT INTO entertainment_organizers (id, name, slug, description, email, phone, website, rating_average, is_verified) VALUES
('${org.id}', '${org.name}', '${org.slug}', '${org.description}', '${org.email}', '${org.phone}', '${org.website}', ${org.rating_average}, ${org.is_verified});\n`;
  });

  sql += `\n-- =====================================================================
-- ENTERTAINMENT ITEMS
-- =====================================================================\n\n`;

  data.items.forEach((item) => {
    const locationJson = JSON.stringify(item.location).replace(/'/g, "''");
    const imagesJson = JSON.stringify(item.images).replace(/'/g, "''");
    const featuresJson = JSON.stringify(item.features).replace(/'/g, "''");
    const inclusionsJson = JSON.stringify(item.inclusions).replace(/'/g, "''");
    const exclusionsJson = JSON.stringify(item.exclusions).replace(/'/g, "''");
    const importantInfoJson = JSON.stringify(item.important_info).replace(
      /'/g,
      "''",
    );

    sql += `INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '${item.id}', 
  '${item.title.replace(/'/g, "''")}', 
  '${item.subtitle.replace(/'/g, "''")}', 
  '${item.slug}',
  '${item.description.replace(/'/g, "''")}',
  '${item.long_description.replace(/'/g, "''")}',
  '${item.type}',
  '${item.category_id}',
  '${item.organizer_id}',
  ${item.min_price},
  ${item.max_price},
  '${item.currency}',
  '${locationJson}'::jsonb,
  '${imagesJson}'::jsonb,
  '${featuresJson}'::jsonb,
  '${inclusionsJson}'::jsonb,
  '${exclusionsJson}'::jsonb,
  '${item.cancellation_policy.replace(/'/g, "''")}',
  '${importantInfoJson}'::jsonb,
  '${item.status}',
  ${item.is_featured},
  ${item.is_trending},
  ${item.available},
  ${item.rating_average.toFixed(2)},
  ${item.rating_count},
  ${item.total_bookings},
  ${item.total_views}
);\n\n`;
  });

  sql += `\n-- =====================================================================
-- TICKET TYPES
-- =====================================================================\n\n`;

  data.ticketTypes.forEach((tt) => {
    const featuresJson = JSON.stringify(tt.features).replace(/'/g, "''");
    sql += `INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '${tt.id}',
  '${tt.item_id}',
  '${tt.name}',
  '${tt.description.replace(/'/g, "''")}',
  ${tt.price},
  '${tt.currency}',
  ${tt.available_stock},
  ${tt.max_per_booking},
  '${featuresJson}'::jsonb,
  ${tt.is_active}
);\n`;
  });

  sql += `\n-- =====================================================================
-- SESSIONS (Next 14 days)
-- =====================================================================\n\n`;

  data.sessions.forEach((session) => {
    sql += `INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '${session.id}',
  '${session.item_id}',
  '${session.date}',
  '${session.start_time}',
  '${session.end_time}',
  ${session.total_spots},
  ${session.available_spots},
  '${session.status}',
  ${session.is_active}
);\n`;
  });

  sql += "\nCOMMIT;\n\n";
  sql += `-- Generated ${data.items.length} items, ${data.ticketTypes.length} ticket types, ${data.sessions.length} sessions\n`;

  return sql;
}

// Main execution
console.log("🎭 Generating Entertainment Seed Data...\n");

const data = generateEntertainmentData();

console.log(`✅ Generated:
  - ${data.categories.length} categories
  - ${data.organizers.length} organizers  
  - ${data.items.length} entertainment items
  - ${data.ticketTypes.length} ticket types
  - ${data.sessions.length} sessions
`);

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate and save SQL
const sql = generateSQL(data);
fs.writeFileSync(SQL_FILE, sql, "utf8");
console.log(`📄 SQL file saved: ${SQL_FILE}`);

// Save JSON for frontend mock data
fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), "utf8");
console.log(`📄 JSON file saved: ${JSON_FILE}`);

console.log("\n✨ Data generation complete!");
console.log("\nNext steps:");
console.log("1. Run the SQL file against your database");
console.log("2. Verify the data in your database");
console.log("3. Test the frontend with the generated data");
