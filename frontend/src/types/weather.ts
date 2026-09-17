export type PersonaType = 
  | 'health' 
  | 'fitness' 
  | 'beach' 
  | 'traveler' 
  | 'family' 
  | 'agriculture' 
  | 'commuter' 
  | 'event'
  | 'custom';

export interface UserProfile {
  name: string;
  email: string;
  primaryPersona: PersonaType;
  selectedPersonas?: PersonaType[];
  customTrade?: string;
  isLoggedIn: boolean;
}

export interface LocationItem {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface DetailedCard {
  title: string;
  value: string;
  subtitle: string;
  color: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'cyan' | 'violet' | 'teal' | 'orange' | 'purple' | 'lime' | 'blue';
}

export interface PersonaInsight {
  persona: PersonaType;
  score: number;
  headline: string;
  summary: string;
  status_badge: string;
  recommendations: string[];
  metrics: Record<string, unknown>;
  detailed_cards: DetailedCard[];
}

export interface HourlyTrendItem {
  time: string;
  temp: number;
  rain_prob: number;
  uv: number;
  aqi?: number;
}

export interface DailyTrendItem {
  date: string;
  temp_max: number;
  temp_min: number;
  rain_prob: number;
}

export interface DashboardData {
  location: {
    city: string;
    latitude: number;
    longitude: number;
  };
  current_weather: {
    temp_c: number;
    feels_like_c: number;
    humidity: number;
    wind_kph: number;
    uv_index: number;
  };
  active_persona: PersonaType;
  persona_insight: PersonaInsight;
  hourly_forecast: HourlyTrendItem[];
  daily_forecast: DailyTrendItem[];
}

export interface SavedLocation {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  is_favorite: boolean;
}

export interface CustomAlert {
  id?: number;
  location_name: string;
  latitude: number;
  longitude: number;
  persona: PersonaType;
  metric: string;
  threshold_value: number;
  condition: 'gt' | 'lt';
  alert_message: string;
  is_active?: boolean;
}
