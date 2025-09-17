# 🏗️ SYSTEM DESIGN - BACKEND .NET

## VISÃO GERAL DA ARQUITETURA

### Stack Tecnológica
- **.NET 8** - Framework base com performance e suporte LTS
- **ASP.NET Core Web API** - REST API com OpenAPI/Swagger
- **Entity Framework Core** - ORM para SQL Server com migrations
- **SQL Server** - Banco principal (dev: Docker, prod: Azure SQL/AWS RDS)
- **Redis** - Cache distribuído e filas de background jobs
- **JWT** - Autenticação stateless
- **Serilog** - Logging estruturado
- **FluentValidation** - Validação de inputs
- **MediatR** - CQRS pattern e handlers desacoplados

### Arquitetura em Camadas (Clean Architecture)

```
┌─────────────────────────────────────────┐
│           API Layer (Controllers)        │ ← HTTP Endpoints
├─────────────────────────────────────────┤
│        Application Layer (Handlers)      │ ← Business Logic
├─────────────────────────────────────────┤
│          Domain Layer (Entities)         │ ← Core Business
├─────────────────────────────────────────┤
│     Infrastructure Layer (Data/Cache)    │ ← External Dependencies
└─────────────────────────────────────────┘
```

---

## CAMADAS DETALHADAS

### 1. **Domain Layer** (Core)
**Responsabilidade**: Regras de negócio puras, entidades, enums, exceções

#### Entidades Principais
```csharp
// Enums
public enum EventType
{
    ShiftStart = 1,
    ShiftEnd = 2,
    MealStart = 3,
    MealEnd = 4,
    RestStart = 5,
    RestEnd = 6,
    DisposalStart = 7,
    DisposalEnd = 8,
    InspectionStart = 9,
    InspectionEnd = 10
}

public enum DriverStatus { Active, Inactive, Suspended }
public enum EventSource { MobileManual, MobileAuto, Portal }

// Entidade Company
public class Company
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Cnpj { get; set; }
    public bool IsActive { get; set; }
    public CompanySettings Settings { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Relacionamentos
    public ICollection<Driver> Drivers { get; set; }
    public ICollection<Vehicle> Vehicles { get; set; }
}

// Entidade Driver
public class Driver
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string Name { get; set; }
    public string Cpf { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public DriverStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Relacionamentos
    public Company Company { get; set; }
    public ICollection<Event> Events { get; set; }
    public ICollection<Assignment> Assignments { get; set; }
}

// Entidade Event (núcleo do sistema)
public class Event
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }
    public Guid CompanyId { get; set; }
    public Guid? VehicleId { get; set; }
    public EventType Type { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    
    // Geolocalização
    public double? LatitudeStart { get; set; }
    public double? LongitudeStart { get; set; }
    public double? LatitudeEnd { get; set; }
    public double? LongitudeEnd { get; set; }
    public int? AccuracyMeters { get; set; }
    
    // Auditoria e sincronização
    public EventSource Source { get; set; }
    public Guid? EditedBy { get; set; }
    public string? EditReason { get; set; }
    public int? DeviceTimeSkewMs { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Relacionamentos
    public Driver Driver { get; set; }
    public Company Company { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Driver? Editor { get; set; }
}

// Entidade WorkdaySummary (agregação diária)
public class WorkdaySummary
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan TotalWorked { get; set; }
    public TimeSpan TotalRest { get; set; }
    public TimeSpan TotalMeal { get; set; }
    public TimeSpan TotalDisposal { get; set; }
    public string[] Anomalies { get; set; } // JSON array
    public DateTime CalculatedAt { get; set; }
    
    public Driver Driver { get; set; }
}
```

#### Value Objects e Domain Services
```csharp
// Value Object para Localização
public record Location(double Latitude, double Longitude, int AccuracyMeters)
{
    public bool IsValid => Latitude >= -90 && Latitude <= 90 && 
                          Longitude >= -180 && Longitude <= 180;
}

// Domain Service para Validação de Estados
public class EventStateMachine
{
    public bool CanStartEvent(EventType eventType, IEnumerable<Event> activeEvents)
    {
        var currentState = GetCurrentState(activeEvents);
        
        return eventType switch
        {
            EventType.ShiftStart => currentState == DriverState.OffShift,
            EventType.ShiftEnd => currentState != DriverState.OffShift,
            EventType.MealStart => currentState == DriverState.Working,
            EventType.RestStart => currentState == DriverState.Working,
            _ => false
        };
    }
    
    private DriverState GetCurrentState(IEnumerable<Event> activeEvents) 
    {
        // Lógica de determinação do estado atual
        // Baseada nos eventos abertos do motorista
    }
}
```

### 2. **Application Layer** (Use Cases)
**Responsabilidade**: Orquestração, validação, transformação de dados

#### Commands e Queries (CQRS)
```csharp
// Commands (Escrita)
public record CreateEventCommand(
    Guid DriverId,
    EventType Type,
    DateTime StartedAt,
    Location? Location,
    EventSource Source,
    int? DeviceTimeSkewMs
) : IRequest<Result<Guid>>;

public record EndEventCommand(
    Guid EventId,
    DateTime EndedAt,
    Location? Location
) : IRequest<Result>;

// Queries (Leitura)
public record GetDriverEventsQuery(
    Guid DriverId,
    DateTime FromDate,
    DateTime ToDate
) : IRequest<Result<List<EventDto>>>;

public record GetWorkdaySummaryQuery(
    Guid DriverId,
    DateTime Date
) : IRequest<Result<WorkdaySummaryDto>>;
```

#### Handlers com Validação
```csharp
public class CreateEventHandler : IRequestHandler<CreateEventCommand, Result<Guid>>
{
    private readonly IEventRepository _eventRepository;
    private readonly IDriverRepository _driverRepository;
    private readonly EventStateMachine _stateMachine;
    private readonly ILogger<CreateEventHandler> _logger;

    public async Task<Result<Guid>> Handle(CreateEventCommand request, CancellationToken cancellationToken)
    {
        // 1. Validar se motorista existe e está ativo
        var driver = await _driverRepository.GetByIdAsync(request.DriverId);
        if (driver == null || driver.Status != DriverStatus.Active)
            return Result.Failure<Guid>("Driver not found or inactive");

        // 2. Buscar eventos ativos do motorista
        var activeEvents = await _eventRepository.GetActiveEventsAsync(request.DriverId);

        // 3. Validar transição de estado
        if (!_stateMachine.CanStartEvent(request.Type, activeEvents))
            return Result.Failure<Guid>("Invalid state transition");

        // 4. Fechar evento conflitante (se necessário)
        await CloseConflictingEventIfNeeded(activeEvents, request.Type);

        // 5. Criar novo evento
        var eventEntity = new Event
        {
            Id = Guid.NewGuid(),
            DriverId = request.DriverId,
            CompanyId = driver.CompanyId,
            Type = request.Type,
            StartedAt = request.StartedAt,
            LatitudeStart = request.Location?.Latitude,
            LongitudeStart = request.Location?.Longitude,
            AccuracyMeters = request.Location?.AccuracyMeters,
            Source = request.Source,
            DeviceTimeSkewMs = request.DeviceTimeSkewMs,
            CreatedAt = DateTime.UtcNow
        };

        await _eventRepository.CreateAsync(eventEntity);

        _logger.LogInformation("Event created: {EventId} for Driver {DriverId}", 
            eventEntity.Id, request.DriverId);

        return Result.Success(eventEntity.Id);
    }
}
```

#### DTOs e Mapeamento
```csharp
public record EventDto(
    Guid Id,
    EventType Type,
    DateTime StartedAt,
    DateTime? EndedAt,
    TimeSpan? Duration,
    LocationDto? LocationStart,
    LocationDto? LocationEnd,
    EventSource Source,
    string? EditReason
);

public record WorkdaySummaryDto(
    DateTime Date,
    TimeSpan TotalWorked,
    TimeSpan TotalRest,
    TimeSpan TotalMeal,
    TimeSpan TotalDisposal,
    List<EventDto> Events,
    string[] Anomalies
);

// AutoMapper profiles
public class EventMappingProfile : Profile
{
    public EventMappingProfile()
    {
        CreateMap<Event, EventDto>()
            .ForMember(d => d.Duration, opt => opt.MapFrom(src => 
                src.EndedAt.HasValue ? src.EndedAt.Value - src.StartedAt : null));
    }
}
```

### 3. **Infrastructure Layer**
**Responsabilidade**: Persistência, cache, integrações externas

#### Repository Pattern com EF Core
```csharp
public interface IEventRepository
{
    Task<Event?> GetByIdAsync(Guid id);
    Task<List<Event>> GetActiveEventsAsync(Guid driverId);
    Task<List<Event>> GetEventsByPeriodAsync(Guid driverId, DateTime from, DateTime to);
    Task CreateAsync(Event eventEntity);
    Task UpdateAsync(Event eventEntity);
}

public class EventRepository : IEventRepository
{
    private readonly AppDbContext _context;

    public async Task<List<Event>> GetActiveEventsAsync(Guid driverId)
    {
        return await _context.Events
            .Where(e => e.DriverId == driverId && e.EndedAt == null)
            .OrderBy(e => e.StartedAt)
            .ToListAsync();
    }

    public async Task CreateAsync(Event eventEntity)
    {
        _context.Events.Add(eventEntity);
        await _context.SaveChangesAsync();
        
        // Invalidar cache
        await _cache.RemovePatternAsync($"driver:{eventEntity.DriverId}:*");
    }
}
```

#### DbContext com Configurações
```csharp
public class AppDbContext : DbContext
{
    public DbSet<Company> Companies { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<WorkdaySummary> WorkdaySummaries { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuração Event
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.Source).HasConversion<string>();
            
            // Índices para performance
            entity.HasIndex(e => new { e.DriverId, e.StartedAt });
            entity.HasIndex(e => new { e.CompanyId, e.StartedAt });
            entity.HasIndex(e => e.EndedAt);
            
            // Relacionamentos
            entity.HasOne(e => e.Driver)
                  .WithMany(d => d.Events)
                  .HasForeignKey(e => e.DriverId);
                  
            // Constraint de integridade
            entity.HasCheckConstraint("CK_Event_EndedAtAfterStartedAt", 
                "[EndedAt] IS NULL OR [EndedAt] > [StartedAt]");
        });

        // Configuração Driver
        modelBuilder.Entity<Driver>(entity =>
        {
            entity.Property(d => d.Cpf).HasMaxLength(11);
            entity.Property(d => d.Phone).HasMaxLength(15);
            entity.HasIndex(d => d.Cpf).IsUnique();
        });
    }
}
```

### 4. **API Layer** (Controllers)
**Responsabilidade**: HTTP endpoints, validação de entrada, serialização

#### Controllers RESTful
```csharp
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly IMediator _mediator;

    [HttpPost]
    [ProducesResponseType(typeof(CreateEventResponse), 201)]
    [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
    public async Task<IActionResult> CreateEvent(CreateEventRequest request)
    {
        var command = new CreateEventCommand(
            DriverId: GetCurrentDriverId(),
            Type: request.Type,
            StartedAt: request.StartedAt,
            Location: request.Location != null ? 
                new Location(request.Location.Latitude, request.Location.Longitude, request.Location.AccuracyMeters) : null,
            Source: EventSource.MobileManual,
            DeviceTimeSkewMs: request.DeviceTimeSkewMs
        );

        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetEvent), 
            new { id = result.Value }, 
            new CreateEventResponse(result.Value));
    }

    [HttpPatch("{id:guid}/end")]
    public async Task<IActionResult> EndEvent(Guid id, EndEventRequest request)
    {
        var command = new EndEventCommand(id, request.EndedAt, request.Location);
        var result = await _mediator.Send(command);
        
        return result.IsSuccess ? NoContent() : BadRequest(new { error = result.Error });
    }

    [HttpGet("driver/{driverId:guid}/workdays")]
    public async Task<IActionResult> GetWorkdays(
        Guid driverId, 
        [FromQuery] DateTime from, 
        [FromQuery] DateTime to)
    {
        var query = new GetDriverEventsQuery(driverId, from, to);
        var result = await _mediator.Send(query);
        
        return result.IsSuccess ? Ok(result.Value) : NotFound();
    }
}
```

---

## VALIDAÇÕES E REGRAS DE NEGÓCIO

### Validação com FluentValidation
```csharp
public class CreateEventRequestValidator : AbstractValidator<CreateEventRequest>
{
    public CreateEventRequestValidator()
    {
        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Invalid event type");

        RuleFor(x => x.StartedAt)
            .Must(BeRecentTimestamp)
            .WithMessage("Timestamp must be within 24 hours");

        When(x => x.Location != null, () => {
            RuleFor(x => x.Location.Latitude)
                .InclusiveBetween(-90, 90);
            RuleFor(x => x.Location.Longitude)
                .InclusiveBetween(-180, 180);
        });
    }

    private bool BeRecentTimestamp(DateTime timestamp)
    {
        var diff = Math.Abs((DateTime.UtcNow - timestamp).TotalHours);
        return diff <= 24; // Aceita até 24h de diferença
    }
}
```

### Máquina de Estados Complexa
```csharp
public class EventStateMachine
{
    private static readonly Dictionary<(DriverState, EventType), DriverState> ValidTransitions = new()
    {
        // De OFF_SHIFT
        { (DriverState.OffShift, EventType.ShiftStart), DriverState.Working },
        
        // De WORKING
        { (DriverState.Working, EventType.MealStart), DriverState.Meal },
        { (DriverState.Working, EventType.RestStart), DriverState.Rest },
        { (DriverState.Working, EventType.DisposalStart), DriverState.Disposal },
        { (DriverState.Working, EventType.InspectionStart), DriverState.Inspection },
        { (DriverState.Working, EventType.ShiftEnd), DriverState.OffShift },
        
        // De subestados para WORKING
        { (DriverState.Meal, EventType.MealEnd), DriverState.Working },
        { (DriverState.Rest, EventType.RestEnd), DriverState.Working },
        { (DriverState.Disposal, EventType.DisposalEnd), DriverState.Working },
        { (DriverState.Inspection, EventType.InspectionEnd), DriverState.Working },
        
        // SHIFT_END força OffShift de qualquer estado
        { (DriverState.Meal, EventType.ShiftEnd), DriverState.OffShift },
        { (DriverState.Rest, EventType.ShiftEnd), DriverState.OffShift },
        { (DriverState.Disposal, EventType.ShiftEnd), DriverState.OffShift },
        { (DriverState.Inspection, EventType.ShiftEnd), DriverState.OffShift },
    };

    public ValidationResult ValidateTransition(DriverState currentState, EventType eventType)
    {
        if (ValidTransitions.ContainsKey((currentState, eventType)))
            return ValidationResult.Success();
            
        return ValidationResult.Failure($"Cannot {eventType} while in {currentState} state");
    }
}
```

---

## SINCRONIZAÇÃO OFFLINE

### Idempotência e Conflict Resolution
```csharp
public class EventSyncService
{
    public async Task<SyncResult> SyncEventsAsync(List<EventSyncDto> clientEvents)
    {
        var results = new List<EventSyncResult>();

        foreach (var clientEvent in clientEvents)
        {
            try
            {
                // 1. Verificar se já existe (idempotência)
                var existing = await _eventRepository.GetByClientIdAsync(clientEvent.ClientId);
                if (existing != null)
                {
                    results.Add(new EventSyncResult(clientEvent.ClientId, SyncStatus.AlreadyExists, existing.Id));
                    continue;
                }

                // 2. Validar timestamp com tolerância de clock skew
                var adjustedTimestamp = AdjustForClockSkew(clientEvent.StartedAt, clientEvent.DeviceTimeSkewMs);

                // 3. Verificar conflitos com eventos existentes
                var conflicts = await CheckForConflicts(clientEvent.DriverId, adjustedTimestamp);
                if (conflicts.Any())
                {
                    results.Add(new EventSyncResult(clientEvent.ClientId, SyncStatus.Conflict, null, conflicts));
                    continue;
                }

                // 4. Criar evento
                var eventEntity = MapToEntity(clientEvent, adjustedTimestamp);
                await _eventRepository.CreateAsync(eventEntity);

                results.Add(new EventSyncResult(clientEvent.ClientId, SyncStatus.Created, eventEntity.Id));

            }
            catch (Exception ex)
            {
                results.Add(new EventSyncResult(clientEvent.ClientId, SyncStatus.Error, null, null, ex.Message));
            }
        }

        return new SyncResult(results);
    }

    private DateTime AdjustForClockSkew(DateTime clientTime, int? skewMs)
    {
        if (skewMs.HasValue)
        {
            return clientTime.AddMilliseconds(-skewMs.Value); // Compensar diferença
        }
        return clientTime;
    }
}
```

---

## PERFORMANCE E CACHING

### Estratégia de Cache com Redis
```csharp
public class CachedEventService
{
    private readonly IEventRepository _repository;
    private readonly IDistributedCache _cache;
    
    public async Task<List<EventDto>> GetDriverEventsAsync(Guid driverId, DateTime date)
    {
        var cacheKey = $"driver:{driverId}:events:{date:yyyy-MM-dd}";
        
        var cached = await _cache.GetStringAsync(cacheKey);
        if (cached != null)
        {
            return JsonSerializer.Deserialize<List<EventDto>>(cached);
        }

        var events = await _repository.GetEventsByDateAsync(driverId, date);
        var dtos = _mapper.Map<List<EventDto>>(events);

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(dtos), 
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15),
                SlidingExpiration = TimeSpan.FromMinutes(5)
            });

        return dtos;
    }
}
```

### Background Jobs para Agregação
```csharp
public class WorkdaySummaryJob : IHostedService
{
    public async Task ProcessDailySummaries()
    {
        var yesterday = DateTime.Today.AddDays(-1);
        var driversWithEvents = await _eventRepository.GetDriversWithEventsByDateAsync(yesterday);

        foreach (var driverId in driversWithEvents)
        {
            await CalculateWorkdaySummary(driverId, yesterday);
        }
    }

    private async Task CalculateWorkdaySummary(Guid driverId, DateTime date)
    {
        var events = await _eventRepository.GetEventsByDateAsync(driverId, date);
        
        var calculator = new WorkdayCalculator();
        var summary = calculator.Calculate(events);

        await _summaryRepository.UpsertAsync(summary);
    }
}
```

---

## SEGURANÇA E AUDITORIA

### JWT Authentication
```csharp
public class JwtService
{
    public string GenerateToken(Driver driver)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, driver.Id.ToString()),
            new Claim(ClaimTypes.Name, driver.Name),
            new Claim("company_id", driver.CompanyId.ToString()),
            new Claim("role", "driver")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8), // 8h para turno de trabalho
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### Audit Log Automático
```csharp
public class AuditInterceptor : IInterceptor
{
    public async Task InterceptAsync(IInvocation invocation)
    {
        var method = invocation.Method;
        var isWriteOperation = method.Name.StartsWith("Create") || 
                              method.Name.StartsWith("Update") || 
                              method.Name.StartsWith("Delete");

        if (isWriteOperation)
        {
            var before = await CaptureStateBefore(invocation);
            await invocation.ProceedAsync();
            var after = await CaptureStateAfter(invocation);

            await _auditRepository.CreateAsync(new AuditLog
            {
                UserId = _currentUser.Id,
                Action = method.Name,
                EntityType = GetEntityType(invocation),
                Changes = JsonSerializer.Serialize(new { Before = before, After = after }),
                Timestamp = DateTime.UtcNow
            });
        }
        else
        {
            await invocation.ProceedAsync();
        }
    }
}
```

---

## APIS PRINCIPAIS

### Endpoints Core
```
POST   /api/v1/auth/login                    # Autenticação
POST   /api/v1/events                        # Criar evento
PATCH  /api/v1/events/{id}/end               # Encerrar evento
GET    /api/v1/events/driver/{id}/current    # Eventos ativos
GET    /api/v1/events/driver/{id}/history    # Histórico por período
POST   /api/v1/events/sync                   # Sincronização batch

GET    /api/v1/drivers/{id}/workdays         # Resumos diários
GET    /api/v1/drivers/{id}/summary          # Totais por período

GET    /api/v1/reports/hours                 # Relatório de horas
GET    /api/v1/reports/export/csv            # Export CSV
```

### Exemplo de Response
```json
// GET /api/v1/events/driver/{id}/current
{
  "driverId": "123e4567-e89b-12d3-a456-426614174000",
  "currentState": "WORKING",
  "activeEvents": [
    {
      "id": "987fcdeb-51a2-43d1-9f4c-123456789abc",
      "type": "SHIFT_START",
      "startedAt": "2025-09-16T07:30:00Z",
      "duration": "04:23:15",
      "location": {
        "latitude": -23.5505,
        "longitude": -46.6333,
        "accuracy": 15
      }
    }
  ],
  "suggestions": [
    {
      "type": "MEAL_START",
      "reason": "Working for more than 4 hours",
      "priority": "medium"
    }
  ]
}
```

Este system design fornece uma base sólida para implementação do backend, cobrindo todos os aspectos desde arquitetura até APIs específicas. Está alinhado com as melhores práticas .NET e prepared para os requisitos do seu projeto de diário de bordo digital.