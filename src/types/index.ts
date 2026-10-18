export interface TravelPackage {
  id: string;
  title: string;
  destination: string;
  region: string;
  duration: number;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  description: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  category: "adventure" | "beach" | "cultural" | "wildlife" | "romantic" | "family";
  featured: boolean;
  maxGroupSize: number;
}

export interface ApiPackage {
  id: string;
  title: string;
  destination: string;
  region: string;
  duration: number;
  base_price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  category: string;
  featured: boolean;
  max_group_size: number;
  plans: Plan[];
}

export interface Plan {
  id: number;
  package_id: string;
  name: string;
  tier: string;
  price_multiplier: number;
  perks: string[];
  price: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals: string[];
  accommodation?: string;
}

export interface Booking {
  id: string;
  user_id: number;
  package_id: string;
  plan_id: number;
  travel_date: string;
  travelers: number;
  total_price: number;
  customer_name: string;
  email: string;
  phone: string;
  special_requests: string | null;
  status: "confirmed" | "pending" | "cancelled";
  created_at: string;
  packageTitle: string;
  destination: string;
  image: string;
  planName: string;
  planTier: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  packageTitle: string;
  avatar: string;
}
