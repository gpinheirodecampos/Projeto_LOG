# 👥 MODELO DE ENTIDADES ADMINISTRATIVAS - PORTAL WEB

## VISÃO GERAL

O portal web deve permitir que **administradores** gerenciem toda a estrutura organizacional do sistema. Este documento define as entidades necessárias para implementar um sistema robusto de **RBAC (Role-Based Access Control)** e gerenciamento de recursos.

### HIERARQUIA DE ACESSO
```
Super Admin
    ├── Company Admin (por empresa)
    │   ├── Fleet Manager
    │   ├── HR Operator  
    │   └── Supervisor
    └── Driver (acesso apenas ao app mobile)
```

---

## ENTIDADES ADMINISTRATIVAS

### 1. **User (Usuário do Sistema)**

```csharp
/// <summary>
/// Entidade: Usuário do sistema (portal web)
/// Representa qualquer pessoa que acessa o portal administrativo
/// </summary>
public class User : Entity
{
    public string Name { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public UserStatus Status { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? ProfilePictureUrl { get; private set; }
    public UserPreferences Preferences { get; private set; }

    // Relacionamentos
    private readonly List<UserRole> _userRoles = new();
    private readonly List<UserCompanyAccess> _companyAccess = new();
    
    public IReadOnlyList<UserRole> UserRoles => _userRoles.AsReadOnly();
    public IReadOnlyList<UserCompanyAccess> CompanyAccess => _companyAccess.AsReadOnly();

    // Propriedades calculadas
    public bool IsSuperAdmin => _userRoles.Any(ur => ur.Role.Name == "SuperAdmin");
    public bool IsActive => Status == UserStatus.Active;
}

public enum UserStatus
{
    Active = 1,
    Inactive = 2,
    Suspended = 3,
    Blocked = 4
}
```

### 2. **Role (Perfil/Função)**

```csharp
/// <summary>
/// Entidade: Perfis de acesso do sistema
/// Define diferentes níveis de permissão
/// </summary>
public class Role : Entity
{
    public string Name { get; private set; }
    public string DisplayName { get; private set; }
    public string Description { get; private set; }
    public bool IsSystemRole { get; private set; } // Não pode ser deletado
    public int Priority { get; private set; } // Para hierarquia

    // Relacionamentos
    private readonly List<RolePermission> _rolePermissions = new();
    public IReadOnlyList<RolePermission> RolePermissions => _rolePermissions.AsReadOnly();
}

// Roles padrão do sistema:
public static class SystemRoles
{
    public const string SuperAdmin = "SuperAdmin";        // Acesso total
    public const string CompanyAdmin = "CompanyAdmin";    // Admin da empresa
    public const string FleetManager = "FleetManager";   // Gestor de frota
    public const string HROperator = "HROperator";       // Operador RH
    public const string Supervisor = "Supervisor";       // Supervisor
    public const string Driver = "Driver";               // Motorista (app apenas)
}
```

### 3. **Permission (Permissão)**

```csharp
/// <summary>
/// Entidade: Permissões específicas do sistema
/// Define ações granulares que podem ser executadas
/// </summary>
public class Permission : Entity
{
    public string Name { get; private set; }         // Ex: "users.create"
    public string DisplayName { get; private set; }  // Ex: "Criar Usuários"
    public string Description { get; private set; }
    public string Module { get; private set; }       // Ex: "Users", "Drivers", "Reports"
    public PermissionType Type { get; private set; }

    public static Permission Create(string name, string displayName, string module, PermissionType type)
    {
        return new Permission(name, displayName, module, type);
    }
}

public enum PermissionType
{
    Read = 1,    // Visualizar
    Create = 2,  // Criar
    Update = 3,  // Editar
    Delete = 4,  // Excluir
    Execute = 5  // Executar ação especial
}
```

### 4. **UserRole (Relacionamento User-Role)**

```csharp
/// <summary>
/// Entidade: Relacionamento entre usuário e perfil
/// Permite que um usuário tenha múltiplos perfis
/// </summary>
public class UserRole : Entity
{
    public Guid UserId { get; private set; }
    public Guid RoleId { get; private set; }
    public DateTime AssignedAt { get; private set; }
    public Guid AssignedBy { get; private set; }
    public DateTime? ExpiresAt { get; private set; }

    // Relacionamentos
    public User User { get; private set; }
    public Role Role { get; private set; }
    public User AssignedByUser { get; private set; }

    // Propriedades calculadas
    public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
    public bool IsActive => !IsExpired;
}
```

### 5. **RolePermission (Relacionamento Role-Permission)**

```csharp
/// <summary>
/// Entidade: Relacionamento entre perfil e permissão
/// Define quais permissões cada perfil possui
/// </summary>
public class RolePermission : Entity
{
    public Guid RoleId { get; private set; }
    public Guid PermissionId { get; private set; }

    // Relacionamentos
    public Role Role { get; private set; }
    public Permission Permission { get; private set; }
}
```

### 6. **UserCompanyAccess (Acesso por Empresa)**

```csharp
/// <summary>
/// Entidade: Define quais empresas um usuário pode acessar
/// Necessário para isolamento de dados (multi-tenancy)
/// </summary>
public class UserCompanyAccess : Entity
{
    public Guid UserId { get; private set; }
    public Guid CompanyId { get; private set; }
    public DateTime GrantedAt { get; private set; }
    public Guid GrantedBy { get; private set; }
    public bool IsActive { get; private set; }

    // Relacionamentos
    public User User { get; private set; }
    public Company Company { get; private set; }
    public User GrantedByUser { get; private set; }
}
```

### 7. **UserPreferences (Preferências do Usuário)**

```csharp
/// <summary>
/// Value Object: Preferências e configurações do usuário
/// </summary>
public class UserPreferences
{
    public string Language { get; set; } = "pt-BR";
    public string TimeZone { get; set; } = "America/Sao_Paulo";
    public string Theme { get; set; } = "light"; // light, dark
    public bool EmailNotifications { get; set; } = true;
    public bool SmsNotifications { get; set; } = false;
    public int ItemsPerPage { get; set; } = 25;

    public static UserPreferences Default() => new UserPreferences();
}
```

---

## MATRIZ DE PERMISSÕES

### **Módulos e Permissões Padrão**

```csharp
public static class SystemPermissions
{
    // Módulo: Empresas
    public const string CompaniesRead = "companies.read";
    public const string CompaniesCreate = "companies.create";
    public const string CompaniesUpdate = "companies.update";
    public const string CompaniesDelete = "companies.delete";

    // Módulo: Usuários
    public const string UsersRead = "users.read";
    public const string UsersCreate = "users.create";
    public const string UsersUpdate = "users.update";
    public const string UsersDelete = "users.delete";
    public const string UsersResetPassword = "users.reset_password";

    // Módulo: Motoristas
    public const string DriversRead = "drivers.read";
    public const string DriversCreate = "drivers.create";
    public const string DriversUpdate = "drivers.update";
    public const string DriversDelete = "drivers.delete";
    public const string DriversViewEvents = "drivers.view_events";
    public const string DriversEditEvents = "drivers.edit_events";

    // Módulo: Veículos
    public const string VehiclesRead = "vehicles.read";
    public const string VehiclesCreate = "vehicles.create";
    public const string VehiclesUpdate = "vehicles.update";
    public const string VehiclesDelete = "vehicles.delete";

    // Módulo: Relatórios
    public const string ReportsView = "reports.view";
    public const string ReportsExport = "reports.export";
    public const string ReportsAdvanced = "reports.advanced";

    // Módulo: Sistema
    public const string SystemSettings = "system.settings";
    public const string SystemAudit = "system.audit";
    public const string SystemBackup = "system.backup";
}
```

### **Matriz por Perfil**

| Permissão | SuperAdmin | CompanyAdmin | FleetManager | HROperator | Supervisor |
|-----------|------------|--------------|--------------|------------|------------|
| **Empresas** |
| companies.* | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Usuários** |
| users.read | ✅ | ✅ | ❌ | ✅ | ❌ |
| users.create | ✅ | ✅ | ❌ | ❌ | ❌ |
| users.update | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Motoristas** |
| drivers.* | ✅ | ✅ | ✅ | ✅ | ✅ |
| drivers.edit_events | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Veículos** |
| vehicles.* | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Relatórios** |
| reports.view | ✅ | ✅ | ✅ | ✅ | ✅ |
| reports.export | ✅ | ✅ | ✅ | ✅ | ❌ |
| reports.advanced | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## RELACIONAMENTOS E DIAGRAMA

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │◄─────►│  UserRole   │◄─────►│    Role     │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                            │
       │              ┌─────────────┐               │
       └─────────────►│UserCompany  │               │
                      │   Access    │               │
                      └─────────────┘               │
                             │                      │
                             ▼                      ▼
                      ┌─────────────┐       ┌─────────────┐
                      │   Company   │       │RolePermiss. │
                      └─────────────┘       └─────────────┘
                             │                      │
                             │                      ▼
                      ┌─────────────┐       ┌─────────────┐
                      │   Driver    │       │ Permission  │
                      └─────────────┘       └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │   Vehicle   │
                      └─────────────┘
```

---

## CASOS DE USO ADMINISTRATIVOS

### **1. Criar Nova Empresa (SuperAdmin)**
```csharp
public class CreateCompanyCommand : IRequest<Result<Guid>>
{
    public string Name { get; set; }
    public string Cnpj { get; set; }
    public CompanySettings Settings { get; set; }
    public CreateCompanyAdminRequest AdminUser { get; set; }
}

public class CreateCompanyAdminRequest
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
}
```

### **2. Criar Usuário (CompanyAdmin)**
```csharp
public class CreateUserCommand : IRequest<Result<Guid>>
{
    public string Name { get; set; }
    public string Email { get; set; }
    public List<string> RoleNames { get; set; }
    public List<Guid> CompanyIds { get; set; }
}
```

### **3. Atribuir Permissões (Admin)**
```csharp
public class AssignRoleToUserCommand : IRequest<Result>
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
```

### **4. Verificar Permissões (Middleware)**
```csharp
public class PermissionService
{
    public async Task<bool> UserHasPermissionAsync(Guid userId, string permission, Guid? companyId = null)
    {
        // 1. Buscar roles do usuário
        // 2. Verificar se tem acesso à empresa (se especificada)
        // 3. Validar se algum role tem a permissão
    }
}
```

---

## FUNCIONALIDADES DO PORTAL ADMINISTRATIVO

### **Dashboard Principal**
- **Cartões de resumo**: Total empresas, usuários ativos, motoristas, veículos
- **Atividade recente**: Login de usuários, criação de registros
- **Alertas**: Usuários com acesso expirado, empresas inativas

### **Gestão de Empresas**
- ✅ **CRUD completo**: Criar, listar, editar, desativar empresas
- ✅ **Configurações**: Definir regras de jornada por empresa
- ✅ **Usuários da empresa**: Visualizar e gerenciar acesso

### **Gestão de Usuários**
- ✅ **CRUD completo**: Criar, listar, editar, desativar usuários
- ✅ **Atribuição de perfis**: Múltiplos roles por usuário
- ✅ **Controle de acesso**: Definir empresas acessíveis
- ✅ **Reset de senha**: Forçar troca de senha
- ✅ **Auditoria**: Log de ações do usuário

### **Gestão de Motoristas**
- ✅ **CRUD completo**: Criar, listar, editar, desativar motoristas
- ✅ **Vinculação**: Associar motorista à empresa e veículos
- ✅ **Credenciais**: Definir acesso ao app mobile
- ✅ **Histórico**: Visualizar eventos da jornada

### **Gestão de Veículos**
- ✅ **CRUD completo**: Criar, listar, editar, desativar veículos
- ✅ **Atribuições**: Histórico de motoristas por veículo
- ✅ **Manutenção**: Controle de status e disponibilidade

### **Gestão de Perfis e Permissões**
- ✅ **Visualizar perfis**: Lista de roles disponíveis
- ✅ **Editar permissões**: Customizar permissões por role
- ✅ **Auditoria**: Log de mudanças de permissão

---

## APIS ADMINISTRATIVAS

### **Endpoints Principais**

```
# Empresas
GET    /api/v1/admin/companies
POST   /api/v1/admin/companies
PUT    /api/v1/admin/companies/{id}
DELETE /api/v1/admin/companies/{id}

# Usuários
GET    /api/v1/admin/users
POST   /api/v1/admin/users
PUT    /api/v1/admin/users/{id}
POST   /api/v1/admin/users/{id}/roles
DELETE /api/v1/admin/users/{id}/roles/{roleId}
POST   /api/v1/admin/users/{id}/reset-password

# Motoristas
GET    /api/v1/admin/drivers
POST   /api/v1/admin/drivers
PUT    /api/v1/admin/drivers/{id}
GET    /api/v1/admin/drivers/{id}/events

# Veículos
GET    /api/v1/admin/vehicles
POST   /api/v1/admin/vehicles
PUT    /api/v1/admin/vehicles/{id}

# Perfis e Permissões
GET    /api/v1/admin/roles
GET    /api/v1/admin/permissions
PUT    /api/v1/admin/roles/{id}/permissions

# Auditoria
GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/user-activities
```

### **Exemplo de Response**
```json
// GET /api/v1/admin/users
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "João Admin",
      "email": "joao@empresa.com.br",
      "status": "Active",
      "roles": [
        {
          "id": "role-1",
          "name": "CompanyAdmin",
          "displayName": "Administrador da Empresa"
        }
      ],
      "companyAccess": [
        {
          "companyId": "company-1",
          "companyName": "Transportes ABC Ltda"
        }
      ],
      "lastLoginAt": "2025-09-16T08:30:00Z",
      "createdAt": "2025-09-01T10:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 25,
    "total": 156
  }
}
```

---

Este modelo fornece uma **base sólida para o portal administrativo**, com separação clara de responsabilidades, controle granular de permissões e suporte completo a **multi-tenancy** por empresa. 🎯