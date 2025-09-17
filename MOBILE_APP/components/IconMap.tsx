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
  journey_start: 'hsl(120, 45%, 55%)', // success
  journey_end: 'hsl(0, 72%, 60%)', // destructive
  meal_start: 'hsl(39, 95%, 60%)', // warning
  meal_end: 'hsl(120, 45%, 55%)', // success
  rest_start: 'hsl(220, 70%, 55%)', // primary variant
  rest_end: 'hsl(120, 45%, 55%)', // success
  available: 'hsl(25.71, 64.71%, 60.78%)', // primary
  inspection: 'hsl(39, 95%, 60%)', // warning
} as const;

export type EventType = keyof typeof EventIcons;
export type StatusType = keyof typeof StatusIconsMap;