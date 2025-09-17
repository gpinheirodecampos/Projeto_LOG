// Tipos para requisições e respostas da API

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    size: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}

// Request types

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface CreateDriverRequest {
  name: string
  cpf: string
  phone: string
  email: string
  companyId: string
}

export interface UpdateDriverRequest {
  name?: string
  phone?: string
  email?: string
  status?: string
}

export interface CreateVehicleRequest {
  companyId: string
  plate: string
  model: string
  brand: string
  year: number
}

export interface UpdateVehicleRequest {
  plate?: string
  model?: string
  brand?: string
  year?: number
  isActive?: boolean
}

export interface CreateUserRequest {
  name: string
  email: string
  roleIds: string[]
  companyIds: string[]
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  status?: string
}

export interface CreateCompanyRequest {
  name: string
  cnpj: string
  settings?: Partial<CompanySettings>
}

export interface UpdateCompanyRequest {
  name?: string
  settings?: Partial<CompanySettings>
  isActive?: boolean
}

export interface CompanySettings {
  maxDailyWork: number
  minRestBetweenShifts: number
  maxContinuousWork: number
  requireLocationOnEvents: boolean
  clockSkewToleranceMinutes: number
}

// Query parameters

export interface DriversQuery {
  page?: number
  size?: number
  search?: string
  status?: string
  companyId?: string
}

export interface VehiclesQuery {
  page?: number
  size?: number
  search?: string
  isActive?: boolean
  companyId?: string
}

export interface UsersQuery {
  page?: number
  size?: number
  search?: string
  status?: string
  roleId?: string
}

export interface EventsQuery {
  driverId?: string
  companyId?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface ReportsQuery {
  companyId?: string
  driverIds?: string[]
  from: string
  to: string
  type: 'hours' | 'events' | 'summary'
}