export interface RSVP {
  id: string;
  name: string;
  affiliation: string;
  guests: number;
  submittedAt?: string | Date; // Make it optional and accept either string or Date
}

export interface LandingPageSettings {
  backgroundType: 'image' | 'video';
  backgroundUrl: string;
  title: string;
}