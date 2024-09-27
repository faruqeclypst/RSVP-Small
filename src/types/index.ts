export interface RSVP {
  id: string;
  name: string;
  affiliation: string;
  guests: number;
}

export interface LandingPageSettings {
  title: string;
  backgroundType: 'image' | 'video';
  backgroundUrl: string;
}