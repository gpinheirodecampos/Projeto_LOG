export interface DriverEvent {
  id: string;
  type: 'journey_start' | 'journey_end' | 'meal_start' | 'meal_end' | 'rest_start' | 'rest_end' | 'available' | 'inspection';
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  duration?: number; // in seconds
  reason?: string; // for adjustments
  notes?: string; // optional notes
}

export interface DriverState {
  currentStatus: 'off_duty' | 'on_journey' | 'meal' | 'rest' | 'available';
  currentEventStart?: string;
  totalJourneyTime: number;
  totalRestTime: number;
  events: DriverEvent[];
  lastSyncTime?: string;
}

export const EVENT_LABELS = {
  journey_start: 'Início da Jornada',
  journey_end: 'Fim da Jornada',
  meal_start: 'Início da Refeição',
  meal_end: 'Fim da Refeição',
  rest_start: 'Início do Descanso',
  rest_end: 'Fim do Descanso',
  available: 'À Disposição',
  inspection: 'Fiscalização',
};

export const STATUS_LABELS = {
  off_duty: 'FORA DE JORNADA',
  on_journey: 'EM JORNADA',
  meal: 'REFEIÇÃO',
  rest: 'DESCANSANDO',
  available: 'À DISPOSIÇÃO',
};

export const STATUS_ICONS = {
  off_duty: '🏠',
  on_journey: '🚛',
  meal: '🍽️',
  rest: '😴',
  available: '⏳',
};

export const EVENT_COLORS = {
  journey_start: '#4CAF50',
  journey_end: '#F44336',
  meal_start: '#FF9800',
  meal_end: '#4CAF50',
  rest_start: '#9C27B0',
  rest_end: '#4CAF50',
  available: '#1976D2',
  inspection: '#FF5722',
};