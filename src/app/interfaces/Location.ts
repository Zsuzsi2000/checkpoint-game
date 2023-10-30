export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location extends Coordinates {
  address: string;
  staticMapImageUrl: string;
}

