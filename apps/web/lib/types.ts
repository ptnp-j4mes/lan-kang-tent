export type Tag = { key: string; name: string };

export type CampsiteLight = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  province: string;
  district: string | null;
  coverImageUrl: string | null;
  googleRating: number | null;
  memberRating: number | null;
  priceMin: number | null;
  isVerified: boolean;
  tags: Tag[];
  distanceKm?: number | null;
};

export type Amenity = { id: string; key: string; name: string; icon?: string | null };

export type ProvinceStat = { province: string; region: string | null; count: number };

export type MapFilters = {
  keyword?: string;
  province?: string;
  region?: string;
  rating?: number;
  priceMax?: number;
  amenities: string[];
  verified?: boolean;
  nearby?: { lat: number; lng: number; radius: number } | null;
};
