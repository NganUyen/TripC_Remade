-- =====================================================================
-- ENTERTAINMENT SERVICE - GENERATED SEED DATA
-- Generated: 2026-02-01T12:38:33.279Z
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

INSERT INTO entertainment_categories (id, name, slug, description, display_order, is_active) VALUES
('7b4f577c-0a67-41b4-9e6c-337a61a7b9ea', 'Rooftop Bars', 'rooftop-bars', 'Sky-high cocktails with panoramic views', 1, true);
INSERT INTO entertainment_categories (id, name, slug, description, display_order, is_active) VALUES
('aa75178d-7f6e-411a-a382-38465edde2f6', 'Nightclubs', 'nightclubs', 'Dance the night away at premier clubs', 2, true);
INSERT INTO entertainment_categories (id, name, slug, description, display_order, is_active) VALUES
('bad009bb-eecb-4eb9-bad0-814cc9fb1aaf', 'Live Music', 'live-music', 'Experience incredible live performances', 3, true);
INSERT INTO entertainment_categories (id, name, slug, description, display_order, is_active) VALUES
('e08d3dbc-8e56-4dce-a6f1-e0c2bcf9ec77', 'Speakeasies', 'speakeasies', 'Hidden bars with craft cocktails', 4, true);
INSERT INTO entertainment_categories (id, name, slug, description, display_order, is_active) VALUES
('bae19049-1dd4-4962-8543-0415b6e1ac07', 'Lounges', 'lounges', 'Sophisticated ambiance and premium drinks', 5, true);
INSERT INTO entertainment_categories (id, name, slug, description, display_order, is_active) VALUES
('e6012f53-cf10-40de-ba14-4aaf128d642f', 'Pubs', 'pubs', 'Traditional pubs and beer gardens', 6, true);

-- =====================================================================
-- ORGANIZERS
-- =====================================================================

INSERT INTO entertainment_organizers (id, name, slug, description, email, phone, website, rating_average, is_verified) VALUES
('0338d851-b968-4490-b0ec-dff0d2549e3f', 'NightLife Entertainment Group', 'nightlife-entertainment', 'Premier entertainment and hospitality company', 'booking@nightlife-ent.com', '+1-555-0100', 'https://nightlife-ent.com', 4.8, true);
INSERT INTO entertainment_organizers (id, name, slug, description, email, phone, website, rating_average, is_verified) VALUES
('fe91fad4-069e-4556-a71e-06bcc09729f0', 'Stellar Events & Shows', 'stellar-events', 'World-class event production and venue management', 'info@stellarevents.com', '+1-555-0200', 'https://stellarevents.com', 4.9, true);
INSERT INTO entertainment_organizers (id, name, slug, description, email, phone, website, rating_average, is_verified) VALUES
('6058a6b0-386a-4e60-a46b-70de46f3d072', 'Urban Music Collective', 'urban-music', 'Live music venue operators and concert promoters', 'bookings@urbanmusic.com', '+1-555-0300', 'https://urbanmusic.com', 4.7, true);

-- =====================================================================
-- ENTERTAINMENT ITEMS
-- =====================================================================

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '2bafda13-ca3c-4338-96ed-79b8c296b196', 
  'SkyBar 360° Rooftop Experience', 
  'Panoramic City Views with Live DJ', 
  'skybar-360-rooftop-experience',
  'Experience breathtaking 360° views from the highest rooftop bar in the city. Features live DJ sets nightly, craft cocktails, and premium bottle service.',
  'Located on the 52nd floor, SkyBar offers an unparalleled entertainment experience with stunning panoramic views. Our world-class DJs spin the latest tracks while you enjoy handcrafted cocktails from our award-winning mixologists. Perfect for special celebrations, date nights, or exclusive VIP experiences.',
  'venue',
  '7b4f577c-0a67-41b4-9e6c-337a61a7b9ea',
  '0338d851-b968-4490-b0ec-dff0d2549e3f',
  45,
  250,
  'USD',
  '{"address":"615 Main Street","city":"Ho Chi Minh City","country":"Vietnam","lat":10.8231,"lng":106.6297}'::jsonb,
  '["https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200","https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200","https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1200"]'::jsonb,
  '["360° panoramic views","Live DJ performances","Premium cocktail menu","VIP bottle service","Indoor & outdoor seating","Climate controlled"]'::jsonb,
  '["Welcome cocktail","Reserved seating for 2 hours","Complimentary snacks","Access to VIP lounge"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  false,
  false,
  true,
  4.27,
  427,
  637,
  4152
);

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '99f330e8-480f-4856-848d-aaa6accdf798', 
  'Electric Pulse Nightclub', 
  'Premier EDM & House Music Venue', 
  'electric-pulse-nightclub',
  'The city''s hottest nightclub featuring international DJs, state-of-the-art sound systems, and an electrifying atmosphere.',
  'Electric Pulse is the ultimate destination for electronic music lovers. With a 15,000-square-foot dance floor, world-class lighting system, and top-tier DJ talent, we deliver unforgettable nights. VIP tables available with bottle service.',
  'venue',
  'aa75178d-7f6e-411a-a382-38465edde2f6',
  'fe91fad4-069e-4556-a71e-06bcc09729f0',
  35,
  500,
  'USD',
  '{"address":"681 Main Street","city":"Paris","country":"France","lat":48.8566,"lng":2.3522}'::jsonb,
  '["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200","https://images.unsplash.com/photo-1571266028243-d220c8c3d4a5?q=80&w=1200","https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=1200"]'::jsonb,
  '["World-class sound system","LED dance floor","International DJs","VIP bottle service","Private cabanas","Late night hours"]'::jsonb,
  '["Entry ticket","Coat check","One complimentary drink","Access to all areas"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  false,
  true,
  true,
  4.45,
  244,
  896,
  3821
);

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '737b3220-718e-4c37-8f45-7921143a3bf2', 
  'Jazz & Blues Underground', 
  'Intimate Live Jazz Performances', 
  'jazz-blues-underground',
  'Hidden speakeasy-style venue featuring nightly live jazz, blues, and soul performances from acclaimed musicians.',
  'Step back in time at our 1920s-inspired underground jazz club. Featuring plush velvet seating, candlelit tables, and the finest jazz musicians performing classic standards and modern interpretations. Full bar with prohibition-era cocktails.',
  'show',
  'bad009bb-eecb-4eb9-bad0-814cc9fb1aaf',
  '6058a6b0-386a-4e60-a46b-70de46f3d072',
  40,
  120,
  'USD',
  '{"address":"666 Main Street","city":"New York","country":"USA","lat":40.7128,"lng":-74.006}'::jsonb,
  '["https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200","https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1200","https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=1200"]'::jsonb,
  '["Live jazz nightly","Intimate 80-seat venue","Full cocktail bar","Vintage atmosphere","Premium sound quality","No phones policy"]'::jsonb,
  '["Reserved seating","Live performance","Complimentary welcome drink","Jazz history program"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  false,
  false,
  true,
  4.32,
  386,
  845,
  1865
);

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790', 
  'Neon District Karaoke Palace', 
  'Private Karaoke Rooms & Bar', 
  'neon-district-karaoke-palace',
  'Luxury karaoke experience with private rooms, extensive song library, and full food & beverage service.',
  'Experience karaoke like never before in our state-of-the-art private rooms. Each room features professional sound equipment, massive song libraries in multiple languages, mood lighting, and dedicated service staff. Perfect for groups, parties, and celebrations.',
  'venue',
  'e08d3dbc-8e56-4dce-a6f1-e0c2bcf9ec77',
  '0338d851-b968-4490-b0ec-dff0d2549e3f',
  50,
  300,
  'USD',
  '{"address":"148 Main Street","city":"Tokyo","country":"Japan","lat":35.6762,"lng":139.6503}'::jsonb,
  '["https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200","https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1200","https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200"]'::jsonb,
  '["Private rooms (4-30 people)","100,000+ song library","Professional audio equipment","Full menu service","Themed room options","Photo booth"]'::jsonb,
  '["Room rental (2 hours)","Premium sound system","Tablet song selection","Welcome drinks","Unlimited song selections"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  false,
  false,
  true,
  4.24,
  283,
  236,
  2115
);

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '867b31fd-57af-4584-be13-eb87a740ae7e', 
  'Broadway Spectacular: Hamilton', 
  'Award-Winning Musical Theatre', 
  'broadway-spectacular-hamilton',
  'The cultural phenomenon. The critically acclaimed musical that tells the story of American Founding Father Alexander Hamilton.',
  'Experience the revolutionary musical that''s captivated audiences worldwide. Hamilton combines hip-hop, jazz, R&B, and Broadway to tell the story of America then, told by America now. Winner of 11 Tony Awards including Best Musical.',
  'show',
  'bae19049-1dd4-4962-8543-0415b6e1ac07',
  'fe91fad4-069e-4556-a71e-06bcc09729f0',
  89,
  450,
  'USD',
  '{"address":"243 Main Street","city":"London","country":"UK","lat":51.5074,"lng":-0.1278}'::jsonb,
  '["https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200","https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1200","https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=1200"]'::jsonb,
  '["2 hours 45 minutes runtime","Orchestra or balcony seating","Historic theater venue","Accessible seating available","Merchandise available","Program book included"]'::jsonb,
  '["Show ticket","Program book","Coat check service","Access to theater facilities"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  true,
  true,
  true,
  4.32,
  367,
  1099,
  4334
);

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f', 
  'Comedy Night: Stand-Up Showcase', 
  'Featuring Top Local & International Comics', 
  'comedy-night-stand-up-showcase',
  'Hilarious stand-up comedy featuring a rotating lineup of established and up-and-coming comedians.',
  'Laugh until your sides hurt at our weekly comedy showcase. Each show features 4-5 talented comedians performing their best material. Full bar and food menu available. Ages 18+ only. Show typically runs 2 hours with intermission.',
  'show',
  'e6012f53-cf10-40de-ba14-4aaf128d642f',
  '6058a6b0-386a-4e60-a46b-70de46f3d072',
  25,
  75,
  'USD',
  '{"address":"241 Main Street","city":"Bangkok","country":"Thailand","lat":13.7563,"lng":100.5018}'::jsonb,
  '["https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1200","https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=1200","https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200"]'::jsonb,
  '["4-5 comedians per show","Full bar service","Food menu available","Intimate club setting","Meet & greet opportunities","18+ venue"]'::jsonb,
  '["Show ticket","Reserved seating","One complimentary drink","Access to VIP lounge (premium tickets)"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  true,
  false,
  true,
  4.55,
  53,
  136,
  2223
);

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679', 
  'Sunset Cocktail Cruise', 
  'Harbor Tour with Live Music', 
  'sunset-cocktail-cruise',
  'Scenic harbor cruise during golden hour with live acoustic music, premium cocktails, and hors d''oeuvres.',
  'Set sail on a luxurious 3-hour sunset cruise around the harbor. Enjoy breathtaking views of the city skyline as the sun sets, accompanied by live acoustic music. Indulge in unlimited premium cocktails and gourmet hors d''oeuvres prepared by our onboard chef.',
  'tour',
  '7b4f577c-0a67-41b4-9e6c-337a61a7b9ea',
  '0338d851-b968-4490-b0ec-dff0d2549e3f',
  95,
  180,
  'USD',
  '{"address":"164 Main Street","city":"Las Vegas","country":"USA","lat":36.1699,"lng":-115.1398}'::jsonb,
  '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200","https://images.unsplash.com/photo-1583675505782-26e8e0b9b98e?q=80&w=1200"]'::jsonb,
  '["3-hour cruise","Live acoustic music","Open bar (premium)","Gourmet hors d''oeuvres","Indoor & outdoor seating","Photo opportunities"]'::jsonb,
  '["Cruise ticket","Unlimited premium drinks","Hors d''oeuvres","Live entertainment","Welcome champagne toast"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  false,
  true,
  true,
  4.39,
  418,
  727,
  880
);

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c', 
  'The Secret Garden Speakeasy', 
  'Hidden Botanical Bar Experience', 
  'the-secret-garden-speakeasy',
  'Exclusive speakeasy hidden behind a flower shop. Password required. Botanical cocktails in a lush garden setting.',
  'Discover the city''s best-kept secret. Enter through the flower shop and whisper the password to access our enchanting botanical speakeasy. Surrounded by living walls of plants and flowers, enjoy artisanal cocktails crafted with fresh herbs and botanical infusions.',
  'venue',
  'aa75178d-7f6e-411a-a382-38465edde2f6',
  'fe91fad4-069e-4556-a71e-06bcc09729f0',
  55,
  150,
  'USD',
  '{"address":"4 Main Street","city":"Dubai","country":"UAE","lat":25.2048,"lng":55.2708}'::jsonb,
  '["https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1200","https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200","https://images.unsplash.com/photo-1578474846511-04ba529f0b88?q=80&w=1200"]'::jsonb,
  '["Hidden entrance","Password required","Botanical cocktails","Live plants & flowers","Limited capacity","Reservation only"]'::jsonb,
  '["Entry access","Reserved seating","Botanical cocktail flight","Herb-infused snacks"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  false,
  true,
  true,
  4.04,
  181,
  394,
  4199
);

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  'a64c6f2e-88a0-4956-870d-87963cfbece8', 
  'Latin Night: Salsa & Bachata', 
  'Dance Party with Live Band', 
  'latin-night-salsa-bachata',
  'Weekly Latin dance party featuring live salsa band, dance lessons, and authentic Latin cuisine.',
  'Experience the passion and energy of Latin dance culture. Every Saturday night features a live 10-piece salsa band, complimentary beginner dance lesson at 8 PM, and authentic Latin food and drinks. All levels welcome - from beginners to advanced dancers.',
  'event',
  'bad009bb-eecb-4eb9-bad0-814cc9fb1aaf',
  '6058a6b0-386a-4e60-a46b-70de46f3d072',
  30,
  60,
  'USD',
  '{"address":"636 Main Street","city":"Ho Chi Minh City","country":"Vietnam","lat":10.8231,"lng":106.6297}'::jsonb,
  '["https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1200","https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200","https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200"]'::jsonb,
  '["Live salsa band","Free dance lesson","Latin cuisine","Full bar","Professional dancers","Large dance floor"]'::jsonb,
  '["Entry ticket","Dance lesson","One complimentary drink","Welcome appetizer platter"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  false,
  true,
  true,
  4.80,
  157,
  506,
  3212
);

INSERT INTO entertainment_items (
  id, title, subtitle, slug, description, long_description, type,
  category_id, organizer_id, min_price, max_price, currency,
  location, images, features, inclusions, exclusions,
  cancellation_policy, important_info,
  status, is_featured, is_trending, available,
  rating_average, rating_count, total_bookings, total_views
) VALUES (
  '951c0790-bcca-4805-b988-16d591a298c1', 
  'Craft Beer Tasting Experience', 
  'Microbrewery Tour & Tasting', 
  'craft-beer-tasting-experience',
  'Behind-the-scenes brewery tour with expert-guided tasting of 8 craft beers and artisan beer snacks.',
  'Go behind the scenes at our award-winning microbrewery. Learn the art and science of craft beer brewing from our master brewer, then taste 8 different beers including exclusive small-batch releases. Paired with artisan snacks selected to complement each beer.',
  'tour',
  'e08d3dbc-8e56-4dce-a6f1-e0c2bcf9ec77',
  '0338d851-b968-4490-b0ec-dff0d2549e3f',
  40,
  70,
  'USD',
  '{"address":"874 Main Street","city":"Paris","country":"France","lat":48.8566,"lng":2.3522}'::jsonb,
  '["https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=1200","https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=1200","https://images.unsplash.com/photo-1618885472179-5e474019f2a9?q=80&w=1200"]'::jsonb,
  '["Brewery tour","8 beer tastings","Expert guide","Artisan food pairings","Take-home tasting notes","Discount at brewery shop"]'::jsonb,
  '["Guided tour","8x 4oz beer samples","Food pairings","Tasting glass to keep","10% shop discount"]'::jsonb,
  '["Personal expenses","Gratuities","Transportation to venue"]'::jsonb,
  'Free cancellation up to 24 hours before the event. 50% refund for cancellations 12-24 hours before. No refund for cancellations within 12 hours.',
  '["Valid ID required for entry","Dress code: Smart casual","Must be 21+ to enter","No outside food or drinks","Photography allowed"]'::jsonb,
  'published',
  true,
  true,
  true,
  4.10,
  413,
  1059,
  4174
);


-- =====================================================================
-- TICKET TYPES
-- =====================================================================

INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '70f15bc2-facc-4f80-b0db-cc1283679fc3',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  45,
  'USD',
  71,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'e704a742-7581-454d-a889-6966f45f1062',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  81,
  'USD',
  109,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'c42bf37f-de37-4073-a916-fa553452be55',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  250,
  'USD',
  94,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '0a31cfb4-83cf-4602-923d-7e3d24ef01f2',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  35,
  'USD',
  53,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '4922b1fa-6c16-44e6-bcd2-bc5fc5014f53',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  63,
  'USD',
  31,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '346d6c85-91fd-43e9-9f3d-5bf1a94133b4',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  500,
  'USD',
  108,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'b7d3deb7-32b1-427d-8e39-5940862e728b',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  40,
  'USD',
  114,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '08761e45-8cd0-4c27-aeff-49313f1ed59d',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  72,
  'USD',
  70,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'f6c38ba1-3aec-4413-aebb-40ed3d70c600',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  120,
  'USD',
  62,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '0baf1160-9f54-469d-bd65-803810d5aac0',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  50,
  'USD',
  98,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '34c0cdac-9cfe-49ff-9c8d-1c26c6ffaf2c',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  90,
  'USD',
  52,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '017a1c19-870d-407d-a7a9-4ef0fe00f281',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  300,
  'USD',
  55,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '6e47bc3b-4ffb-42aa-bd59-8c6765adf815',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  89,
  'USD',
  109,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'b3702812-07d3-4a29-b30a-195c945c3c18',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  160,
  'USD',
  48,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '6cd4628e-bebd-4830-9393-78277dd1b0e7',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  450,
  'USD',
  21,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'c4bd255c-55ce-4691-bd82-447aa5a3cfbd',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  25,
  'USD',
  89,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '37d81086-7c6e-4ca7-a1ab-032f6c648ebe',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  45,
  'USD',
  22,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '2f9bb281-49de-48a0-b21b-c49309227a8f',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  75,
  'USD',
  60,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '3a65c353-63f4-45e1-b751-67986984d8d0',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  95,
  'USD',
  105,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'af3bb08e-d63c-4261-9eb4-0fb204333d21',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  171,
  'USD',
  73,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '4dc05f28-bb48-45dd-9823-0c8c9cdc3ba9',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  180,
  'USD',
  92,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '40963017-652a-4d0a-b2d0-9e4e691a96c9',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  55,
  'USD',
  65,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '18a90afa-fe39-45fe-8732-c118b9bb4acf',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  99,
  'USD',
  45,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'fdb06a99-bbf4-45f8-9cd7-7ce1d32a7da1',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  150,
  'USD',
  49,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '14a3f70f-824e-4cc6-a067-0af5a4cdf886',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  30,
  'USD',
  80,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '9f5bbd4a-11c5-42a0-85f1-5e2326ba1016',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  54,
  'USD',
  115,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '893fcba8-2116-49fb-969a-dbc251d86390',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  60,
  'USD',
  99,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'e756f93a-2a4c-4cf4-875b-585b0026590c',
  '951c0790-bcca-4805-b988-16d591a298c1',
  'General Admission',
  'Standard entry, General seating, Access to main area',
  40,
  'USD',
  54,
  8,
  '["Standard entry","General seating","Access to main area"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  '4dd12846-55c7-4be7-a8ca-f9bab48cef95',
  '951c0790-bcca-4805-b988-16d591a298c1',
  'VIP Experience',
  'Priority entry, VIP seating, Complimentary drink, VIP lounge access',
  72,
  'USD',
  33,
  8,
  '["Priority entry","VIP seating","Complimentary drink","VIP lounge access"]'::jsonb,
  true
);
INSERT INTO entertainment_ticket_types (
  id, item_id, name, description, price, currency,
  available_stock, max_per_booking, features, is_active
) VALUES (
  'ae3f08b7-973b-422b-860a-34aa02a0bac9',
  '951c0790-bcca-4805-b988-16d591a298c1',
  'Premium Package',
  'Fast track entry, Premium reserved seating, Bottle service, VIP lounge access, Dedicated server',
  70,
  'USD',
  58,
  8,
  '["Fast track entry","Premium reserved seating","Bottle service","VIP lounge access","Dedicated server"]'::jsonb,
  true
);

-- =====================================================================
-- SESSIONS (Next 14 days)
-- =====================================================================

INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '039337ce-01f4-459a-8263-0633df82dac7',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  106,
  53,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '334e71eb-81db-4075-b387-fe7a01b480aa',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  53,
  40,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '2379f902-03f4-4d75-85c8-370b2fafb95f',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  119,
  49,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '01a713d1-02d0-4e96-8788-d977bb168254',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  110,
  78,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'bc3a2576-d0ee-468a-ae9b-f37696b499bc',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-02',
  '23:00:00',
  '02:00:00',
  111,
  70,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd7e00cd4-4cef-434f-88f1-605cd4bfeb93',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  121,
  90,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7ae0aa5c-2495-4c95-bd20-8c8a1231b19b',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  148,
  120,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '4ccd91b9-cf44-4257-a53b-e61353faca6a',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  141,
  86,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b5041a64-701d-4733-b737-9970dddfae8d',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  126,
  90,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '77b91051-df9e-413a-a523-b269da0afeea',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  147,
  72,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '87fb2957-8705-411d-8bbc-6cf2b2001080',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  100,
  78,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ff92ffab-a8ec-4729-9e1b-69228fb7eb88',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  129,
  121,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8097512f-fb61-4139-9bf3-e1bfb9da91b1',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  88,
  55,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '2a83b0e0-030b-4b11-a2d6-f4b22b8e2363',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  140,
  121,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'e46bfa40-c0bd-47cd-a219-c03299825e4c',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  149,
  93,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'bc8da515-dbb8-454c-aa8d-0d2826aea709',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  135,
  62,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ecec3a02-9eb5-40ef-bc46-feb3d5a2b0ec',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  91,
  38,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1fcd431e-dceb-4595-8f5d-5bfcb3b45483',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  142,
  90,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7489e4bb-2f6f-415c-905a-44ce34b02be2',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  122,
  98,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8472a8e7-b67c-4699-936d-3df9eb8d0cd7',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-09',
  '23:00:00',
  '02:00:00',
  87,
  47,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'af77618a-c935-42d8-92bd-c099f9593932',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  130,
  74,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '51c1558a-e842-40d3-bc33-d531aafcd251',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  118,
  73,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7866ec39-b993-4981-a17a-0cba58824192',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  111,
  105,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a5eeb6ee-8258-4942-bc67-225b6593562d',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  72,
  56,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '91e278f1-6699-4bd2-b7f4-a5f0359b6f82',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-11',
  '23:00:00',
  '02:00:00',
  55,
  49,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c1370a02-4d31-4463-bd31-312e1e7d84c9',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  108,
  67,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1be14541-faf8-417b-9eb5-bb3b5a9582e2',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  86,
  40,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fda3ad8f-6f94-4d91-afc8-315af880b8f2',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-12',
  '23:00:00',
  '02:00:00',
  73,
  73,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1c8f3791-362e-4c92-a0be-2d1b78ae193e',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  109,
  99,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7df3d5f9-0494-431b-8290-f4484569c388',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  130,
  89,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f514d5f7-b3c7-41ee-8874-43c5d9da9621',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-13',
  '23:00:00',
  '02:00:00',
  89,
  66,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'e3e63319-b827-4e9a-ab2e-3569966f8b4b',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  56,
  26,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '182e3276-cb26-4e0f-9ab6-0343fa325981',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  80,
  61,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '90d4cec4-01ce-4abe-ac9a-871dc3c6db1b',
  '2bafda13-ca3c-4338-96ed-79b8c296b196',
  '2026-02-14',
  '23:00:00',
  '02:00:00',
  77,
  71,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '2f355949-73bb-472f-a00f-02059427dcfd',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  68,
  43,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '55cbac73-a560-4b64-8cfc-eadb9786bb0d',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  112,
  64,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ef52038d-4060-4c13-a349-cc8d777816ce',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  54,
  53,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '09ddf289-c9f8-4824-a133-2e05cac00b27',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  126,
  91,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '639e3b54-80c6-40fb-9632-c32d64f8f186',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-02',
  '23:00:00',
  '02:00:00',
  118,
  90,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '547ffecd-f122-4b3f-a7b1-5f204dac77bd',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  115,
  68,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b4a0aaea-f1bf-4d6f-9dc0-4108f0d52870',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  87,
  67,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ce8a5275-c168-4c7e-ad12-c1074d829661',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  116,
  98,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ea6a3601-504d-4a51-a9f3-d80db6386fd8',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  116,
  50,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '016fa431-a4a1-4548-905a-34459afeaeb2',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-04',
  '23:00:00',
  '02:00:00',
  74,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b8bba0b9-a292-4348-aa47-aacdd6267c7f',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  56,
  38,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '36e415d6-6cd1-402d-a1c2-e3c93a338d74',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  84,
  79,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '6b668f0e-ef4c-4575-83c9-e2aad4733fa3',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  118,
  73,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '3d3af592-bf0f-4279-83d9-9425edf64114',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  138,
  127,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '642baae6-d664-4285-ab47-3334a14d3837',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-06',
  '23:00:00',
  '02:00:00',
  83,
  73,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '356a0062-6ab1-42ac-8251-fd932c65ce7d',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  91,
  38,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '70765346-70e6-4fb5-830a-e4f94d9738f5',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  111,
  106,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1af282b7-be36-412e-8379-bbb9703659fa',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-07',
  '23:00:00',
  '02:00:00',
  68,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ef75a7a2-ef1e-46a5-88f5-6a6b062eaa10',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  110,
  73,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '5ec2b712-229a-4fb5-a473-9897e33b2e5a',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  51,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '727399aa-0abe-4a07-86ca-09eaeb67b753',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-08',
  '23:00:00',
  '02:00:00',
  138,
  131,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '15d3628b-5549-4f41-94ef-b1ea44c67d08',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  123,
  72,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '30189152-1069-4065-bd61-845907cc692a',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  71,
  54,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '93adf8fa-63c8-4265-8aa3-2f4c6bc49637',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-09',
  '23:00:00',
  '02:00:00',
  113,
  60,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ca8a2d22-dae9-4e75-8b5c-1f187c1b5cef',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  113,
  102,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b368fc23-2927-458f-9e0f-3599e915a625',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  131,
  95,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '78a7e7c3-95fa-457a-a368-1b5d86c2a968',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  73,
  32,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '50c3d4c5-d875-4c3c-aded-3a78b4cc2896',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  115,
  67,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ecc42946-c046-4e32-a2d1-d86381bf57f1',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-11',
  '23:00:00',
  '02:00:00',
  81,
  39,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a8ca801e-3f2d-485d-87a6-808037044d41',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  95,
  56,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fec4205f-20d7-4455-9e4b-ef5f3312e718',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  86,
  86,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fc36f696-fee8-433e-a22e-737c36bf9808',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  82,
  59,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8328c291-8357-46bb-9345-f678d4949c92',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  67,
  44,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0cf69548-f5c3-4497-8708-9a14d49cd365',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-13',
  '23:00:00',
  '02:00:00',
  114,
  89,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '2e601739-de70-423c-b4e7-0f5697b62dbb',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  65,
  38,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '86426b8e-b58d-446f-a6a7-c80a6b9608b7',
  '99f330e8-480f-4856-848d-aaa6accdf798',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  133,
  61,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f38961e6-2dd3-4ed9-a7c5-b3553cdaf345',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  123,
  81,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f5ee6e5a-3ded-4a71-b921-2e58afa46521',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  120,
  80,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c9034891-a791-474d-84c1-8e1377252bd0',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  64,
  31,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8ee80755-617d-4bb1-a3ab-ea2d7ffb78af',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  101,
  96,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '32230d04-0e2d-4a0f-98a8-b5f57a052ba0',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  108,
  75,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a1572917-3d35-43ab-9b2b-7f69139fb08e',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  58,
  40,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '431cb5b7-7b9b-42c1-b53d-94d7b645346d',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-03',
  '23:00:00',
  '02:00:00',
  121,
  97,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '3fa3cc9f-dbf6-4e36-ac80-94298054aa72',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  144,
  79,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '73f461b3-cf44-43da-9921-a4c1e49900d2',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  133,
  118,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '6398621d-7b7a-40da-90d0-0e1b0799a4b9',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-04',
  '23:00:00',
  '02:00:00',
  87,
  86,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '550a102b-ea92-4b07-a5ae-2a27d7d50943',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  91,
  57,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '714ddfc8-97e3-4f92-bf2d-0f7f15aac264',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  84,
  43,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b92a3e8f-d69c-4fa9-ba46-b17bc8cd67a0',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  55,
  43,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c94f03e2-df37-40eb-9f46-aaacfaaec8e6',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  131,
  57,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '3b451485-75b7-426f-ac49-08dd8deb07a7',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  137,
  103,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a88a73b9-e18c-403d-bfc7-8d8dff6dd644',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  115,
  49,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '53f4c07a-a71b-47ad-8634-06d4c7962156',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  74,
  61,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '68fe2b57-8c89-41ea-9293-176133dcf704',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  127,
  122,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ca7b44fe-95be-43a1-a2c6-dbb2baa958fd',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-08',
  '23:00:00',
  '02:00:00',
  58,
  42,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '850ee83d-b206-46dc-a05d-2b02f6b3e49b',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  56,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'cfc90565-993c-4225-b986-9bf3cc45b7dc',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  142,
  78,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd6c3ef96-d9de-4085-868a-57b065306adb',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-09',
  '23:00:00',
  '02:00:00',
  99,
  92,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '52c8f5e6-847b-4444-9155-dd827dbf0285',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  88,
  39,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0640f1d5-1b4f-408f-a63b-6531fad63d63',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  107,
  105,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b056db73-b9c1-41ae-87b7-bce5fc7d9130',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-10',
  '23:00:00',
  '02:00:00',
  109,
  68,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '5ec31301-82fa-4667-be1a-e541a3ce0fae',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  91,
  86,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '2a72fdd4-922c-41f7-9c9d-e4d3bf705d33',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  148,
  122,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '2813eee3-122e-414e-b539-60dd7d7dc6b5',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-11',
  '23:00:00',
  '02:00:00',
  64,
  31,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '14ed3b03-c8c5-47fc-8f54-865b92877e16',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  135,
  83,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'acd83184-55e4-4f83-873b-dfa46436e40e',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  64,
  50,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '72d02ded-7971-4d89-91f1-5023f74809ca',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-12',
  '23:00:00',
  '02:00:00',
  121,
  60,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f6db7758-4cff-4ba4-9168-5b12c6115534',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  132,
  83,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b470025e-878f-444b-8ee0-cefbb175dc5f',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  70,
  62,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '5a205055-f0de-4576-9f84-5c4068324aeb',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-13',
  '23:00:00',
  '02:00:00',
  82,
  68,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '5b5c9226-c35a-4ee3-aadb-12c5c1c5abce',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  51,
  23,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'e32b0120-f488-48e1-a918-3d19623c10f4',
  '737b3220-718e-4c37-8f45-7921143a3bf2',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  93,
  76,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '804276e1-a66b-4579-8e94-1f9314d8c237',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  140,
  115,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '92c45d99-08f3-464f-8158-d005d3ed4fe6',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  69,
  51,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'abc1bc29-53d1-4eeb-a32f-6747e3b7175f',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-01',
  '23:00:00',
  '02:00:00',
  66,
  66,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '46114ee4-70d3-4aab-8d7c-5be8365f0aab',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  110,
  105,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c3f14b0a-cda5-48cb-a0bb-684891a810c6',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  149,
  75,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ce2e44ef-ec4f-4380-81bb-0fd63e9dd421',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  74,
  54,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '4f01fb4d-150b-4394-9cbd-ab97443aaaa3',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  56,
  54,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '088f9a08-f70a-4318-b957-61be7fd7bac7',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-03',
  '23:00:00',
  '02:00:00',
  94,
  61,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f877486f-79d6-4bbc-8ae4-436d6e75f995',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  105,
  88,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '71d9e521-123f-4351-b34c-c7aa5b5b1fc4',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  121,
  69,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ad35b7f5-e8d4-4d62-bce6-90b180d24b87',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  140,
  117,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'e7d606bc-a448-47ad-9a45-1dbade121d1f',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  131,
  127,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8041018d-89e4-4393-b9f0-aa73a68ab3c2',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-05',
  '23:00:00',
  '02:00:00',
  87,
  83,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'e5d6fe12-f0b1-4714-8b55-9891358ea49b',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  67,
  40,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '77064183-7b47-47ae-9001-0170fe001206',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  118,
  65,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '12ee907f-de79-4bdb-8c90-2579ffb419e3',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-06',
  '23:00:00',
  '02:00:00',
  119,
  57,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f4742139-5764-4b0f-98d8-365fb9621c89',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  139,
  79,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8ca0af52-a715-41ef-a8df-4728e8493052',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  124,
  53,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7e56b00a-089f-4cf7-9360-8c5903e2eda9',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  111,
  107,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7f7dbab1-33cd-4faf-ac0d-d083a797963c',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  90,
  66,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '24a3d90d-324d-47d8-8b70-2dc4ba9310ea',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  135,
  113,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'aaad325d-1dfd-4e97-815f-73e1200a967e',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  149,
  128,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1d622869-1e90-4c04-be1d-53f583901a95',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-09',
  '23:00:00',
  '02:00:00',
  52,
  23,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b9f89c9d-a54f-4377-a47e-98a1dbc0e002',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  136,
  73,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b3439d67-45a4-4b48-a2c4-66da6013bd4f',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  143,
  133,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'cd600120-843f-47f5-b022-2bc75563b189',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  118,
  58,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '69ac370d-4e42-4e53-8610-784dabe3cc5c',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  79,
  38,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd1878660-5195-4191-a123-271d23ed3158',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-11',
  '23:00:00',
  '02:00:00',
  82,
  38,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'beb3824b-977b-4204-b16f-99a0df3aa06f',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  96,
  68,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0f4e61d7-16b9-48fa-b7b9-9643aff34986',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  90,
  68,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'cd6368b8-e4da-4e63-9596-30a3e6512818',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  95,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '3b109d1b-d906-4659-af84-db5ce1fd297b',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  144,
  89,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '43563576-f539-4c79-8b6f-c4d92e61ddf7',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-13',
  '23:00:00',
  '02:00:00',
  74,
  49,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b97b4e1f-2f6c-4306-8a42-8a0e3eaf4cc0',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  75,
  72,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '97572e9c-4fa3-4504-b245-1c60aa1e3497',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  138,
  66,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b80240fe-5e28-49fa-8772-ff2013fb5826',
  '84faa22e-4122-4ddf-aced-3fc6b8dbf790',
  '2026-02-14',
  '23:00:00',
  '02:00:00',
  131,
  99,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd96ef563-9e03-45c0-8ed8-afca74f9662a',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  113,
  83,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'cbf9b1b1-64c7-4537-944a-0d8a7560fb88',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  128,
  118,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '71c6fa9a-69c9-4adb-a79c-51fdce35a5a4',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-01',
  '23:00:00',
  '02:00:00',
  111,
  55,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '05a794b7-ded3-48ed-90c9-f044b2be7ed3',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  92,
  58,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ebcc14d9-7159-429d-afbf-93a652257524',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  64,
  54,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0c14af6a-40f7-4341-b433-718b2cc77c8d',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  76,
  57,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '280a05be-2c59-47ba-befc-e86df4382624',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  73,
  64,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c2ee7cd4-15db-4deb-8237-68c541e368a5',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-03',
  '23:00:00',
  '02:00:00',
  108,
  92,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd0056019-3131-41e0-bbad-d2afa0dd1b11',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  87,
  59,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9837a306-fef6-4684-a5b5-5ee5e978df90',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  126,
  72,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c9c0597e-9940-4975-a1cf-65d33488443b',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  87,
  47,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd3249d4e-420b-44a7-8f08-0e630d27ee68',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  128,
  104,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b5a59ada-6c8a-4268-9901-892fc6650df8',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-05',
  '23:00:00',
  '02:00:00',
  70,
  52,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '49fa25b4-e984-4c0e-9d4d-fc92865a3555',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  97,
  80,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '009a3ee7-87c3-4aa4-a3ed-c94827714f99',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  93,
  71,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '56ae3d31-8472-463d-89ed-b2a36bebdbf4',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  59,
  28,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '165febe0-dc68-4989-aa5d-fe29f240c3a1',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  87,
  81,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '3fdaf657-c02f-48d5-b253-08daf2a1ac3d',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-07',
  '23:00:00',
  '02:00:00',
  74,
  51,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '49149003-eb1f-462f-8f8e-68519cd22c76',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  132,
  90,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f5c4f0e6-3ea2-4095-b226-0cf97eeffe3e',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  57,
  52,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a04610fd-c95c-48db-a5a2-f77d8cacbcda',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  105,
  103,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd9af141f-2997-4672-8aeb-c345aa38afd1',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  101,
  57,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '11f750c0-0d47-4fc2-ad4b-f679da12dcf5',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  81,
  60,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '66b22ec9-b836-4179-a5f7-20ea23565b50',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  50,
  40,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'eed429aa-921f-4541-b3a4-4b64827c8b1b',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-10',
  '23:00:00',
  '02:00:00',
  79,
  69,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '52493cba-50ec-4928-9fde-7d05d084d9d4',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  101,
  79,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b17cc0f5-032a-4bf4-a958-df444f8d7740',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  72,
  42,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0f060596-95db-4c12-8a61-c35d091f260d',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  53,
  51,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8b2dea64-1316-49bb-8511-91c18b073800',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  96,
  84,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '44843817-8f1b-45db-9fd2-fc27cc47416f',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  109,
  59,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '107368b4-9a4c-4b35-9f2d-d74e2accc502',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  128,
  86,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '837b87c7-7372-4b30-b455-62059453cb91',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  67,
  48,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9c3e1ec2-8795-4ad3-8350-b6dc076ae235',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  54,
  43,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '73ed86bb-7a03-4621-882a-71d5a6822664',
  '867b31fd-57af-4584-be13-eb87a740ae7e',
  '2026-02-14',
  '23:00:00',
  '02:00:00',
  59,
  44,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '95a81968-19f4-4d87-b235-dd5a3b065534',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  63,
  43,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '4a68a44e-58db-4310-829b-757a93551b9a',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  126,
  104,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ca8ef049-dac9-41bb-9d73-cd57f3fa6728',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  131,
  121,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd748f458-09e8-4dc7-8b20-8e55eaca471f',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  70,
  36,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '934ab368-be83-40e4-a68f-cdd467af640b',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-02',
  '23:00:00',
  '02:00:00',
  60,
  60,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9beb3024-89a5-48ca-9148-1246f65ed890',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  126,
  58,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'bfeb2b52-e748-4053-b002-16cf3a16105a',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  85,
  36,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '047055dc-f73f-46b2-8765-ae7e8fa3354d',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  64,
  28,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c10e3c9d-fb14-4f9f-9f39-427d6aeb67f9',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  51,
  48,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7083e688-28a4-48e8-bba1-32d90a02fe07',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-04',
  '23:00:00',
  '02:00:00',
  113,
  49,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '4ab9f98e-452d-4ca7-99ff-caae3425674a',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  142,
  75,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '5bd3bdb8-9541-4dec-aaff-66593a34323c',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  61,
  42,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '60396b9e-7844-405c-864f-6a9a892fa972',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  97,
  53,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '985f782e-f720-459a-81cb-0e0a97a9b6d2',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  65,
  46,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'cdde39b9-f2e4-437f-89bd-f8ea02f895ef',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  54,
  46,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd57da3ab-30eb-4adb-9982-211e68ebfc90',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  52,
  28,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b42d5de7-a5c8-4382-ba4c-0c045a077ff3',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-07',
  '23:00:00',
  '02:00:00',
  100,
  77,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '32253cac-309e-4a33-9c6f-eaa758a6d3fa',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  88,
  46,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '326e5aa3-fa79-483d-b3d8-24e72474ad64',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  147,
  144,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fa6edac7-fa6d-455a-82c7-c94d215351df',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  60,
  54,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9b634814-948d-44ae-87cc-b7e89bebb87c',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  53,
  50,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd5a4165f-e5b3-4682-97f8-5ab534011375',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  97,
  94,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '4626aa70-0d54-48b0-9769-12168955f11d',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  63,
  49,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f2c6fda8-2154-40ee-80a9-8cef89bbe9ec',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  86,
  82,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '07a6ee02-c8d8-4e21-b0e1-d093ff5f417c',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  79,
  79,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c8498fac-4a40-4a40-9161-d78b90a65f1e',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-11',
  '23:00:00',
  '02:00:00',
  78,
  68,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f491eeef-4478-4b07-bc63-a47196c4d9e1',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  135,
  74,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '5777a6e3-3b4d-49f0-af13-a0d31855e09a',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  145,
  98,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a9a0d8bf-23b4-4111-86f4-cc860e7e50bc',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-12',
  '23:00:00',
  '02:00:00',
  74,
  64,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'dfd6be6a-cf7c-4f8e-9f51-36fd8ebc626a',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  93,
  93,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '20d24c36-e668-42d2-a491-09e217768477',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  115,
  74,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '85173087-c86b-4cf7-b6fd-10f641ea5a89',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-13',
  '23:00:00',
  '02:00:00',
  114,
  57,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '381f2a9c-cbf9-4f2b-9176-4bf29b816431',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  87,
  62,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'da71efe9-2836-4fa4-a63e-291c56aaca00',
  '0dfe1feb-66b3-4a16-b7d4-eed51d19db5f',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  89,
  87,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '695dfd10-3a85-4b23-9f45-c986c604a7dc',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  149,
  148,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fc0afe23-b615-4c21-aaaa-2b4f835766d9',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  143,
  100,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f8154550-3ee4-404a-b98e-738373e03565',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  74,
  55,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '4e62bc93-e7d1-49c3-9c7a-51cca48a34d4',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  72,
  51,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fbc9233a-a454-4fd8-9f52-af9c47e38031',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-02',
  '23:00:00',
  '02:00:00',
  53,
  42,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b41e2abc-1912-41a8-a919-c762f0a7a6da',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  73,
  38,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '3368dceb-11c6-4dea-8355-30d83bacd5a2',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  56,
  25,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'e643927f-0eba-4687-92cf-9ee03bfa501b',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  60,
  37,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'af41b4e3-b74b-49e4-819b-1ac31ad41589',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  75,
  70,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '546e86aa-dd93-49aa-bf9a-7a601020273b',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-04',
  '23:00:00',
  '02:00:00',
  88,
  38,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ddabb03d-f94c-4a03-a2e7-c3ce5255cf08',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  118,
  70,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '3660a1f1-1440-4be3-a7fc-46022823c5c6',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  71,
  32,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b68b3fe6-9344-4a52-88e1-493ccffec1db',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-05',
  '23:00:00',
  '02:00:00',
  121,
  71,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'e720b187-1fa0-4801-8baf-874a083d3a4c',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  67,
  47,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '69fd0cc4-5453-460f-9c64-cd10f29c5a0c',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  55,
  40,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c8d919d9-d2d0-4a91-8706-f803df9f426e',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  102,
  83,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '6c3f4857-e8fb-4f56-b480-e63f14b7e378',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  67,
  65,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b45e570e-0db9-4ba5-ba2c-b39c065700a0',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-07',
  '23:00:00',
  '02:00:00',
  62,
  33,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '2934c045-06cb-4d7e-affe-24bf65eac787',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  82,
  70,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '5b64f8b3-dee0-40d6-b0e0-85542fac34c4',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  82,
  76,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8acda933-6cdf-4277-a80a-d09eb9c45f04',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-08',
  '23:00:00',
  '02:00:00',
  81,
  57,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '6d90ea23-2c78-4860-b911-c1eabd3986da',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  51,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '466cf8ce-0a01-448e-951b-cde877abef01',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  122,
  75,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '352c4dc1-21b9-47d2-9843-89795cd4becb',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-09',
  '23:00:00',
  '02:00:00',
  101,
  99,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '09db9755-8153-4963-aa25-edec10a15fa0',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  70,
  31,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'cdac90d4-ad46-4fd6-9572-2411c3592233',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  77,
  42,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ebfb9cbe-bf5a-40c5-85ba-834e74eb9d2d',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  57,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '969f20b0-ca5f-4efb-9b1d-490d5b23289f',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  85,
  70,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd6ce4eca-895a-4b09-b31a-5f714d1339d4',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-11',
  '23:00:00',
  '02:00:00',
  55,
  44,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c1370d43-2457-4031-8176-1b7a265be4b4',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  119,
  68,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9442d578-005b-4687-b254-eee2fbed3b14',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  78,
  41,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '711dc5b7-15a5-4f2e-a51c-4125cb39b1d5',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-12',
  '23:00:00',
  '02:00:00',
  121,
  78,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fdc1b443-318c-4514-b30d-252474f4e3d7',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  84,
  62,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a84a3562-c9ad-40cc-b3d6-84febfac0228',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  131,
  123,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9807fe77-f73b-409b-a77e-8bb6bf0f60f2',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-13',
  '23:00:00',
  '02:00:00',
  114,
  80,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '413ab73c-cd0b-4cc9-a748-38ea29bfc63b',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  121,
  63,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fc923d79-ea91-4bae-ad2a-8f99a87745c5',
  '48a05c1d-c356-4cc2-be9b-5d9ac4867679',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  129,
  70,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8d88107c-5095-445f-b0fe-63c2fa2e1257',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  139,
  58,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '084a9861-2b26-4c28-a2f5-f17bcd1edabe',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  70,
  50,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f1ff493e-2c34-43f5-ace5-3fbec16105cd',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-01',
  '23:00:00',
  '02:00:00',
  63,
  42,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b08a7dab-fe4c-4a03-87c7-dc62afe61ce7',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  122,
  77,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7a06cc99-14af-4bc7-8035-3142a6f6f147',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  70,
  68,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f16aeabf-0098-42ad-a520-ac4339443cac',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  111,
  88,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '35d91016-291a-4eee-b5c6-40706f40c488',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  127,
  103,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '818b6743-3218-47ae-baab-278742af5382',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  63,
  61,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ea40b1a1-f7b4-49fb-b03f-d0d1b8d1fff6',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  133,
  82,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0802880d-a022-4832-ab9e-163a0007058d',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  82,
  60,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd58e2587-802b-4c60-b3a7-ecfc45fefb1e',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  82,
  59,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '87cd2e51-c93b-4a00-b1b6-662d5008b64f',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  129,
  102,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a4520ed5-d407-48a3-ac74-1f201504ee77',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  68,
  53,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a61fa754-92d1-4738-9360-4d5a748e240c',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  55,
  37,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ca2a7391-fed4-4583-9665-08a8894d3c23',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  86,
  76,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c515a8b3-67c6-4f7f-a4f6-4618fcc14bb8',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  59,
  58,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '996c3e6b-d554-45a9-8ff9-734a3bc834c4',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  58,
  47,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '5b85bd8a-ff4c-4163-b0a2-0d909bbff0fb',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-08',
  '23:00:00',
  '02:00:00',
  66,
  59,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c297ed84-00dd-4210-a4d6-8627b8fd0bb2',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  98,
  77,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '336f73fa-095a-42f5-8450-283fa473fbd7',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  65,
  59,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ca7e76d6-c0a9-4fd5-ad5b-582e1e3df354',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  110,
  105,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '35a15fc3-20b2-4fb6-8601-e12f5f43a580',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  143,
  103,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f77c07de-47e6-4534-bc14-2959f59f34e4',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  63,
  62,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '50fb63a2-127f-4343-b320-09fb8b405a95',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  98,
  58,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9d4fbe55-6cc5-4c65-8e30-f94f2f458032',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-11',
  '23:00:00',
  '02:00:00',
  111,
  58,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '14ff87f6-ebb9-4ccf-94fd-f7fb2e0b9fa5',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  61,
  56,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '52eaf9ad-d0fe-4d99-bec4-5c357acc4e5d',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  136,
  74,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd348b5e5-70e1-4137-a492-229acfb32c2a',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  62,
  43,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '50337a9b-31e2-4afa-b3c6-19a8218bace7',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  69,
  49,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c0fb9c54-848f-4f1f-a402-61983975dda4',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-13',
  '23:00:00',
  '02:00:00',
  133,
  130,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ae9a56b4-2281-430e-99b3-56e7b583cab2',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  139,
  128,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '229a5f3c-44ca-4a71-baa4-63cd37c7114a',
  '1bc80f81-4360-4e3c-bad9-a8ea4bd53a0c',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  85,
  70,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1a1ccdf0-7464-4f55-bdd6-9d6a8962bd85',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  56,
  51,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a18ea717-9a73-453d-bee5-08cddf4ced1c',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  85,
  60,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'e13f052e-09c1-4406-b21d-3f83d3eb6104',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-01',
  '23:00:00',
  '02:00:00',
  147,
  71,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1ed73dd0-d005-4710-a6d1-532ddf2b9370',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  54,
  52,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9712309e-3c3f-48bf-a2de-0869ebff8e47',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  121,
  112,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '77f0a0b8-60d9-4e1c-be44-3d55dad7d408',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-02',
  '23:00:00',
  '02:00:00',
  63,
  37,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '07c290b5-08a7-44d7-8187-a43a99dcd06d',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  148,
  115,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9ecdc310-3703-4900-8858-4e11be9348c1',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  145,
  65,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f55f7613-5a4a-4e41-8b5a-c4ef1362f9c9',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-03',
  '23:00:00',
  '02:00:00',
  149,
  112,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '28341639-b727-4952-b61d-d7c6324e36b1',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  145,
  139,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '31bf0f9c-1afd-4c6e-b43f-4217c77e444b',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  132,
  121,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'cd947b09-3677-4d55-a3b4-16c280d44731',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  118,
  71,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '697c42d7-b7c9-4824-ad04-f22d61a54a7b',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  92,
  63,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ca344465-6e3c-4db4-8c39-b698cef2a445',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-05',
  '23:00:00',
  '02:00:00',
  113,
  82,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a609eeb5-ca74-45e7-bcde-a3a85a61a1e5',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  126,
  93,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'b1aa4733-3d6a-4a6d-b8fc-b60fdb5ccaa2',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  91,
  78,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9c866858-9067-48c1-8852-e7f55b7e4c5b',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  77,
  73,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '097395dc-8f90-4f6d-93cc-6e432c620967',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  107,
  56,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0168b0b8-2386-4fd1-8d10-ae3e98ef7d4c',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  109,
  69,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f188685d-d18f-4544-bf56-1749344d4b51',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  95,
  53,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '067a33fd-b341-4d5d-b9c7-45e0cca5aa64',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-08',
  '23:00:00',
  '02:00:00',
  73,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '6a378611-8724-4f26-b303-62ee45d3bc23',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  73,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c6fbbb48-6f57-4db0-93f5-e896afaa16aa',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  135,
  60,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '56946205-2929-4ea1-920f-858458fcff2d',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-09',
  '23:00:00',
  '02:00:00',
  133,
  80,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '07230e10-4e28-4256-a32f-798fa9021023',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  119,
  50,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c18357cb-c1e8-4148-ab23-73821c2e471f',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  107,
  70,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a9264216-f92d-4d4d-93a5-7d821649d824',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-10',
  '23:00:00',
  '02:00:00',
  103,
  64,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '59a597bd-bace-4328-b375-8b2b7ecab9cd',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  108,
  90,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7b25cb1f-3272-4fe7-91f6-8c058f5e9882',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  52,
  49,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0ee2117a-4047-47d3-a488-eb1d3efeb0a8',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  76,
  59,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '42fad005-5bd4-46f0-b23e-211b4b6f0e1f',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  75,
  61,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '7700bf73-c263-4564-bd7a-1b0c80cb2b64',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-12',
  '23:00:00',
  '02:00:00',
  64,
  64,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ddc348c0-41d7-4ee5-861d-0e4aeed17e54',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  120,
  99,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '814c55e4-1382-444c-b576-f75bed4a561d',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  114,
  56,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f6b9c1e6-4956-4e57-8edb-c9850c4e05eb',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  82,
  52,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '16d0214b-f78a-4061-8b80-e75ca97cd44d',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  116,
  77,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'e3d7af8e-70a3-4316-b558-8dad7368d3a5',
  'a64c6f2e-88a0-4956-870d-87963cfbece8',
  '2026-02-14',
  '23:00:00',
  '02:00:00',
  60,
  31,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'cf437dcf-4e4d-4b7a-a5fb-808939ea2bf1',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-01',
  '18:00:00',
  '21:00:00',
  76,
  49,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fe991023-2cae-415d-8061-6df6011542d2',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-01',
  '20:30:00',
  '23:30:00',
  109,
  63,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '6073f86b-55bf-4722-9b58-c68d0c89c191',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-01',
  '23:00:00',
  '02:00:00',
  106,
  90,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '2df855ea-3657-4969-a66c-76f9df3753e8',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-02',
  '18:00:00',
  '21:00:00',
  68,
  52,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '422d9df5-f4db-4a54-bec8-44ebab897893',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-02',
  '20:30:00',
  '23:30:00',
  133,
  76,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0cf0f0ad-bbc9-4874-a8b5-8983e86baeca',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-02',
  '23:00:00',
  '02:00:00',
  129,
  118,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '4a6dff3c-f64f-4613-8fcb-6f9a23bfb8b6',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-03',
  '18:00:00',
  '21:00:00',
  139,
  104,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '5ba4c82d-353c-4d61-98da-f3cde670029f',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-03',
  '20:30:00',
  '23:30:00',
  109,
  47,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '97ec2348-ed70-4469-a3fc-fd02bfb2760e',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-04',
  '18:00:00',
  '21:00:00',
  75,
  59,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '19168719-e164-4bf4-9859-906337586d76',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-04',
  '20:30:00',
  '23:30:00',
  68,
  35,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '346b49a9-201e-4d03-90f5-2eb9e7c57b20',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-05',
  '18:00:00',
  '21:00:00',
  133,
  86,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd9ca1af1-c344-438c-bcb2-5f0f84cc7835',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-05',
  '20:30:00',
  '23:30:00',
  94,
  82,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '55014a51-42cc-4f5b-b973-7ffc3ce9bbbd',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-05',
  '23:00:00',
  '02:00:00',
  129,
  110,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0dbf228c-6c7f-4898-8ca5-ce102ee19891',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-06',
  '18:00:00',
  '21:00:00',
  141,
  88,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'c2f535ab-74b0-48ed-b8d9-326457b96adb',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-06',
  '20:30:00',
  '23:30:00',
  70,
  69,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fb9ec258-492a-4775-b793-781c42d68af3',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-06',
  '23:00:00',
  '02:00:00',
  67,
  58,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '19bb25a8-6dcb-46c4-a75d-b48b6d594b37',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-07',
  '18:00:00',
  '21:00:00',
  85,
  85,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1900e7a2-65ca-4290-86a4-22f0bb2714ab',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-07',
  '20:30:00',
  '23:30:00',
  57,
  55,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1b7a81dd-82aa-4201-85a1-a093a063056b',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-07',
  '23:00:00',
  '02:00:00',
  72,
  63,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '8b176c8e-fd00-4648-9630-acfa9f337ae0',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-08',
  '18:00:00',
  '21:00:00',
  109,
  70,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a9ce0483-4118-4af9-ac89-4814e533a6a3',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-08',
  '20:30:00',
  '23:30:00',
  66,
  38,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0e1007a5-9ad7-48ed-80d5-deda847ed608',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-09',
  '18:00:00',
  '21:00:00',
  127,
  127,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'd16f42eb-769d-4c4d-888c-b7d85097d515',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-09',
  '20:30:00',
  '23:30:00',
  78,
  47,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '28b6299f-b0b1-423c-8a6d-c0e86c859956',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-09',
  '23:00:00',
  '02:00:00',
  71,
  63,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '0fad0658-a3ce-4014-83dd-76d45e9f2cb3',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-10',
  '18:00:00',
  '21:00:00',
  125,
  121,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '93a01e2b-bd9d-44ce-adc5-02859661f929',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-10',
  '20:30:00',
  '23:30:00',
  99,
  79,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '9813762b-3d05-46d3-be9e-1d8d3e6ed636',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-10',
  '23:00:00',
  '02:00:00',
  75,
  59,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '6759fdde-0aeb-48d4-a454-3f936bd7adb4',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-11',
  '18:00:00',
  '21:00:00',
  128,
  118,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '1ce32329-9f5e-4cb3-bb91-b278c8a2350d',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-11',
  '20:30:00',
  '23:30:00',
  83,
  51,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'ce8bc0c1-cf3b-41a2-bd7b-bebdacac0a22',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-12',
  '18:00:00',
  '21:00:00',
  70,
  51,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'f8b16fb6-6f48-4ffd-95e4-8cbcb3b60ca6',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-12',
  '20:30:00',
  '23:30:00',
  60,
  37,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '2a87d237-1d8c-450f-991a-d21692a6f519',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-12',
  '23:00:00',
  '02:00:00',
  76,
  61,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '4b43929d-c6e5-4580-ab76-bc44dc8aa1ac',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-13',
  '18:00:00',
  '21:00:00',
  78,
  53,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  '4e00d94a-d9aa-4c8d-85b7-bb218c6279ae',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-13',
  '20:30:00',
  '23:30:00',
  106,
  45,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'fcf056f2-3a56-4960-819e-53ed82284242',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-14',
  '18:00:00',
  '21:00:00',
  145,
  85,
  'available',
  true
);
INSERT INTO entertainment_sessions (
  id, item_id, date, start_time, end_time,
  total_spots, available_spots, status, is_active
) VALUES (
  'a2f53d78-3813-444c-941f-ba68d948f6e4',
  '951c0790-bcca-4805-b988-16d591a298c1',
  '2026-02-14',
  '20:30:00',
  '23:30:00',
  78,
  46,
  'available',
  true
);

COMMIT;

-- Generated 10 items, 30 ticket types, 352 sessions
