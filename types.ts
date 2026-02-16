export enum Currency {
  USD = 'USD',
  JPY = 'JPY',
  EUR = 'EUR',
  TWD = 'TWD'
}

export enum ActivityType {
  SIGHTSEEING = 'Sightseeing',
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  SHOPPING = 'Shopping',
  ACCOMMODATION = 'Accommodation'
}

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  description: string;
  type: ActivityType;
  location?: { lat: number; lng: number };
  address?: string; // Added address field for CSV import
  isCompleted: boolean;
  notes?: string;
  priceEstimate?: number;
  currency?: Currency;
  images?: string[]; // Base64 strings of uploaded photos
}

export interface Expense {
  id: string;
  amount: number;
  currency: Currency;
  category: ActivityType;
  description: string;
  date: string; // ISO String or YYYY-MM-DD
  exchangeRateToBase: number; 
  notes?: string;
}

export interface Ticket {
  id: string;
  type: 'Hotel' | 'Flight' | 'Train' | 'Event';
  title: string;
  date: string;
  qrCodeUrl?: string; 
  details: string;
  files?: string[]; // Changed to array for multiple attachments
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export type ViewState = 'itinerary' | 'map' | 'expenses' | 'wallet';