export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  companies: AuthUserCompany[]
  currentCompanyId?: string
}

export interface AuthUserCompany {
  id: string
  name: string
  cnpj: string
}

export interface LoginResponse {
  user: AuthUser
  token: string
  refreshToken: string
  expiresIn: number
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface PermissionCheck {
  permission: string
  companyId?: string
}

// Sistema de permissões granular
export const SystemPermissions = {
  // Empresas
  CompaniesRead: 'companies.read',
  CompaniesCreate: 'companies.create',
  CompaniesUpdate: 'companies.update',
  CompaniesDelete: 'companies.delete',

  // Usuários
  UsersRead: 'users.read',
  UsersCreate: 'users.create',
  UsersUpdate: 'users.update',
  UsersDelete: 'users.delete',
  UsersResetPassword: 'users.reset_password',

  // Motoristas
  DriversRead: 'drivers.read',
  DriversCreate: 'drivers.create',
  DriversUpdate: 'drivers.update',
  DriversDelete: 'drivers.delete',
  DriversViewEvents: 'drivers.view_events',
  DriversEditEvents: 'drivers.edit_events',

  // Veículos
  VehiclesRead: 'vehicles.read',
  VehiclesCreate: 'vehicles.create',
  VehiclesUpdate: 'vehicles.update',
  VehiclesDelete: 'vehicles.delete',

  // Relatórios
  ReportsView: 'reports.view',
  ReportsExport: 'reports.export',
  ReportsAdvanced: 'reports.advanced',

  // Sistema
  SystemSettings: 'system.settings',
  SystemAudit: 'system.audit',
  SystemBackup: 'system.backup'
} as const

export type SystemPermission = typeof SystemPermissions[keyof typeof SystemPermissions]

// Roles do sistema
export const SystemRoles = {
  SuperAdmin: 'SuperAdmin',
  CompanyAdmin: 'CompanyAdmin',
  FleetManager: 'FleetManager',
  HROperator: 'HROperator',
  Supervisor: 'Supervisor',
  Driver: 'Driver'
} as const

export type SystemRole = typeof SystemRoles[keyof typeof SystemRoles]