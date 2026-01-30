export interface PopularLocation {
    id: string;
    name: string;
    type: 'airport' | 'hotel' | 'landmark' | 'district' | 'station';
    city: string;
    country: string;
    address?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export const popularLocations: PopularLocation[] = [
    // Hanoi
    { id: 'hn-airport', name: 'Noi Bai International Airport', type: 'airport', city: 'Hanoi', country: 'Vietnam', address: 'Phu Minh, Soc Son, Hanoi' },
    { id: 'hn-old-quarter', name: 'Old Quarter', type: 'district', city: 'Hanoi', country: 'Vietnam', address: 'Hoan Kiem District, Hanoi' },
    { id: 'hn-west-lake', name: 'West Lake', type: 'landmark', city: 'Hanoi', country: 'Vietnam', address: 'Tay Ho District, Hanoi' },
    { id: 'hn-train-station', name: 'Hanoi Railway Station', type: 'station', city: 'Hanoi', country: 'Vietnam', address: '120 Le Duan, Hoan Kiem, Hanoi' },
    { id: 'hn-opera-house', name: 'Hanoi Opera House', type: 'landmark', city: 'Hanoi', country: 'Vietnam', address: '1 Trang Tien, Hoan Kiem, Hanoi' },
    { id: 'hn-hoan-kiem', name: 'Hoan Kiem Lake', type: 'landmark', city: 'Hanoi', country: 'Vietnam', address: 'Hoan Kiem District, Hanoi' },
    { id: 'hn-my-dinh', name: 'My Dinh Stadium', type: 'landmark', city: 'Hanoi', country: 'Vietnam', address: 'Nam Tu Liem, Hanoi' },
    { id: 'hn-lotte', name: 'Lotte Center Hanoi', type: 'landmark', city: 'Hanoi', country: 'Vietnam', address: '54 Lieu Giai, Ba Dinh, Hanoi' },

    // Ho Chi Minh City
    { id: 'hcm-tan-son-nhat', name: 'Tan Son Nhat International Airport', type: 'airport', city: 'Ho Chi Minh City', country: 'Vietnam', address: 'Tan Binh District, HCMC' },
    { id: 'hcm-district-1', name: 'District 1', type: 'district', city: 'Ho Chi Minh City', country: 'Vietnam', address: 'District 1, HCMC' },
    { id: 'hcm-ben-thanh', name: 'Ben Thanh Market', type: 'landmark', city: 'Ho Chi Minh City', country: 'Vietnam', address: 'Le Loi, District 1, HCMC' },
    { id: 'hcm-saigon-station', name: 'Saigon Railway Station', type: 'station', city: 'Ho Chi Minh City', country: 'Vietnam', address: '1 Nguyen Thong, District 3, HCMC' },
    { id: 'hcm-landmark-81', name: 'Landmark 81', type: 'landmark', city: 'Ho Chi Minh City', country: 'Vietnam', address: '720A Dien Bien Phu, Binh Thanh, HCMC' },
    { id: 'hcm-phu-my-hung', name: 'Phu My Hung', type: 'district', city: 'Ho Chi Minh City', country: 'Vietnam', address: 'District 7, HCMC' },
    { id: 'hcm-thu-thiem', name: 'Thu Thiem New Urban Area', type: 'district', city: 'Ho Chi Minh City', country: 'Vietnam', address: 'District 2, HCMC' },

    // Da Nang
    { id: 'dn-airport', name: 'Da Nang International Airport', type: 'airport', city: 'Da Nang', country: 'Vietnam', address: 'Hai Chau District, Da Nang' },
    { id: 'dn-beach', name: 'My Khe Beach', type: 'landmark', city: 'Da Nang', country: 'Vietnam', address: 'Ngu Hanh Son, Da Nang' },
    { id: 'dn-dragon-bridge', name: 'Dragon Bridge', type: 'landmark', city: 'Da Nang', country: 'Vietnam', address: 'Hai Chau District, Da Nang' },
    { id: 'dn-train-station', name: 'Da Nang Railway Station', type: 'station', city: 'Da Nang', country: 'Vietnam', address: '791 Hai Phong, Hai Chau, Da Nang' },

    // Nha Trang
    { id: 'nt-airport', name: 'Cam Ranh International Airport', type: 'airport', city: 'Nha Trang', country: 'Vietnam', address: 'Cam Ranh, Khanh Hoa' },
    { id: 'nt-beach', name: 'Nha Trang Beach', type: 'landmark', city: 'Nha Trang', country: 'Vietnam', address: 'Tran Phu, Nha Trang' },
    { id: 'nt-vinpearl', name: 'Vinpearl Land', type: 'landmark', city: 'Nha Trang', country: 'Vietnam', address: 'Hon Tre Island, Nha Trang' },

    // Phu Quoc
    { id: 'pq-airport', name: 'Phu Quoc International Airport', type: 'airport', city: 'Phu Quoc', country: 'Vietnam', address: 'Duong To, Phu Quoc' },
    { id: 'pq-long-beach', name: 'Long Beach', type: 'landmark', city: 'Phu Quoc', country: 'Vietnam', address: 'Duong Dong, Phu Quoc' },

    // Hoi An
    { id: 'ha-ancient-town', name: 'Hoi An Ancient Town', type: 'landmark', city: 'Hoi An', country: 'Vietnam', address: 'Hoi An, Quang Nam' },
    { id: 'ha-an-bang-beach', name: 'An Bang Beach', type: 'landmark', city: 'Hoi An', country: 'Vietnam', address: 'Cam An, Hoi An' },

    // Dalat
    { id: 'dl-airport', name: 'Lien Khuong Airport', type: 'airport', city: 'Dalat', country: 'Vietnam', address: 'Duc Trong, Lam Dong' },
    { id: 'dl-xuan-huong-lake', name: 'Xuan Huong Lake', type: 'landmark', city: 'Dalat', country: 'Vietnam', address: 'Dalat City Center' },

    // Vung Tau
    { id: 'vt-beach', name: 'Vung Tau Beach', type: 'landmark', city: 'Vung Tau', country: 'Vietnam', address: 'Vung Tau City' },
    { id: 'vt-christ-statue', name: 'Christ of Vung Tau', type: 'landmark', city: 'Vung Tau', country: 'Vietnam', address: 'Nho Mountain, Vung Tau' },

    // Can Tho
    { id: 'ct-airport', name: 'Can Tho International Airport', type: 'airport', city: 'Can Tho', country: 'Vietnam', address: 'Binh Thuy, Can Tho' },
    { id: 'ct-floating-market', name: 'Cai Rang Floating Market', type: 'landmark', city: 'Can Tho', country: 'Vietnam', address: 'Cai Rang, Can Tho' },
];
