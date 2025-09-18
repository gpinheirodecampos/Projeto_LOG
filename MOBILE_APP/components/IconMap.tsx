import {
  Truck,
  Play,
  Square,
  Coffee,
  Clock,
  Bed,
  Search,
  AlertTriangle,
  CheckCircle,
  PauseCircle,
  StopCircle,
  Timer
} from 'lucide-react-native';

// Mapeamento de ícones para substituir emojis
export const EventIcons = {
  // Journey/Jornada
  journey_start: Truck,
  journey_end: StopCircle,
  
  // Meal/Refeição  
  meal_start: Coffee,
  meal_end: CheckCircle,
  
  // Rest/Descanso
  rest_start: Bed,
  rest_end: CheckCircle,
  
  // Available/Disposição
  available: Clock,
  
  // Inspection/Fiscalização
  inspection: Search,
  
  // Status indicators
  working: Play,
  paused: PauseCircle,
  stopped: Square,
  timer: Timer,
  
  // Alerts
  warning: AlertTriangle,
  success: CheckCircle,
} as const;

// Status icons mapping (sem emojis)
export const StatusIconsMap = {
  off_duty: Square,
  on_journey: Play, 
  meal: Coffee,
  rest: Bed,
  available: Clock,
  inspection: Search,
} as const;

// Cores para cada tipo de evento (seguindo shadcn/ui)
export const EventColors = {
  journey_start: '#16a34a', // success
  journey_end: '#ef4444', // destructive
  meal_start: '#f59e0b', // warning
  meal_end: '#16a34a', // success
  rest_start: '#4f46e5', // primary
  rest_end: '#16a34a', // success
  available: '#4f46e5', // primary
  inspection: '#f59e0b', // warning
} as const;

export type EventType = keyof typeof EventIcons;
export type StatusType = keyof typeof StatusIconsMap;