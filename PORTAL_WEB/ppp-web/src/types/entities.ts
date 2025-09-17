// Tipos das entidades de domínio

export interface Company {
  id: string
  name: string
  cnpj: string
  isActive: boolean
  settings: CompanySettings
  createdAt: string
  updatedAt?: string
}

export interface CompanySettings {
  maxDailyWork: number // em horas
  minRestBetweenShifts: number // em horas
  maxContinuousWork: number // em horas
  requireLocationOnEvents: boolean
  clockSkewToleranceMinutes: number
}

export interface Driver {
  id: string
  companyId: string
  name: string
  cpf: string
  phone: string
  email: string
  status: DriverStatus
  createdAt: string
  updatedAt?: string
}

export const DriverStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Suspended: 'suspended',
  Terminated: 'terminated'
} as const

export type DriverStatus = typeof DriverStatus[keyof typeof DriverStatus]

export interface Vehicle {
  id: string
  companyId: string
  plate: string
  model: string
  brand: string
  year: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface Event {
  id: string
  driverId: string
  companyId: string
  vehicleId?: string
  type: EventType
  startedAt: string
  endedAt?: string
  locationStart?: Location
  locationEnd?: Location
  source: EventSource
  editedBy?: string
  editReason?: string
  deviceTimeSkewMs?: number
  createdAt: string
  updatedAt?: string
}

export const EventType = {
  ShiftStart: 'SHIFT_START',
  ShiftEnd: 'SHIFT_END',
  MealStart: 'MEAL_START',
  MealEnd: 'MEAL_END',
  RestStart: 'REST_START',
  RestEnd: 'REST_END',
  DisposalStart: 'DISPOSAL_START',
  DisposalEnd: 'DISPOSAL_END',
  InspectionStart: 'INSPECTION_START',
  InspectionEnd: 'INSPECTION_END'
} as const

export type EventType = typeof EventType[keyof typeof EventType]

export const EventSource = {
  MobileManual: 'mobile_manual',
  MobileAuto: 'mobile_auto',
  Portal: 'portal'
} as const

export type EventSource = typeof EventSource[keyof typeof EventSource]

export interface Location {
  latitude: number
  longitude: number
  accuracyMeters: number
}

export interface WorkdaySummary {
  id: string
  driverId: string
  date: string
  totalWorked: number // em minutos
  totalRest: number // em minutos
  totalMeal: number // em minutos
  totalDisposal: number // em minutos
  anomalies: string[]
  calculatedAt: string
}

// Tipos administrativos

export interface User {
  id: string
  name: string
  email: string
  status: UserStatus
  lastLoginAt?: string
  profilePictureUrl?: string
  preferences: UserPreferences
  roles: UserRole[]
  companyAccess: UserCompanyAccess[]
  createdAt: string
  updatedAt?: string
}

export const UserStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Suspended: 'suspended',
  Blocked: 'blocked'
} as const

export type UserStatus = typeof UserStatus[keyof typeof UserStatus]

export interface UserPreferences {
  language: string
  timeZone: string
  theme: 'light' | 'dark'
  emailNotifications: boolean
  smsNotifications: boolean
  itemsPerPage: number
}

export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  isSystemRole: boolean
  priority: number
  permissions: Permission[]
  createdAt: string
  updatedAt?: string
}

export interface Permission {
  id: string
  name: string
  displayName: string
  description: string
  module: string
  type: PermissionType
}

export const PermissionType = {
  Read: 'read',
  Create: 'create',
  Update: 'update',
  Delete: 'delete',
  Execute: 'execute'
} as const

export type PermissionType = typeof PermissionType[keyof typeof PermissionType]

export interface UserRole {
  id: string
  userId: string
  roleId: string
  role: Role
  assignedAt: string
  assignedBy: string
  expiresAt?: string
}

export interface UserCompanyAccess {
  id: string
  userId: string
  companyId: string
  company: Company
  grantedAt: string
  grantedBy: string
  isActive: boolean
}