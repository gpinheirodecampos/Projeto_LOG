using JornadaApp.Domain.Common;
using JornadaApp.Domain.Enums;
using JornadaApp.Domain.ValueObjects;
using JornadaApp.Domain.Events;
using JornadaApp.Domain.Exceptions;

namespace JornadaApp.Domain.Entities
{
    /// <summary>
    /// Aggregate Root: Empresa que contém motoristas e veículos
    /// </summary>
    public class Company : Entity
    {
        public string Name { get; private set; }
        public Cnpj Cnpj { get; private set; }
        public bool IsActive { get; private set; }
        public CompanySettings Settings { get; private set; }

        // Relacionamentos
        private readonly List<Driver> _drivers = new();
        private readonly List<Vehicle> _vehicles = new();
        
        public IReadOnlyList<Driver> Drivers => _drivers.AsReadOnly();
        public IReadOnlyList<Vehicle> Vehicles => _vehicles.AsReadOnly();

        // EF Core constructor
        protected Company() { }

        public Company(string name, Cnpj cnpj, CompanySettings? settings = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new DomainException("Company name cannot be empty");

            Name = name;
            Cnpj = cnpj ?? throw new ArgumentNullException(nameof(cnpj));
            IsActive = true;
            Settings = settings ?? CompanySettings.Default();
        }

        public void UpdateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new DomainException("Company name cannot be empty");

            Name = name;
            MarkAsUpdated();
        }

        public void UpdateSettings(CompanySettings settings)
        {
            Settings = settings ?? throw new ArgumentNullException(nameof(settings));
            MarkAsUpdated();
        }

        public void Activate()
        {
            IsActive = true;
            MarkAsUpdated();
        }

        public void Deactivate()
        {
            IsActive = false;
            MarkAsUpdated();
        }

        public void AddDriver(Driver driver)
        {
            if (driver == null)
                throw new ArgumentNullException(nameof(driver));
                
            if (_drivers.Any(d => d.Cpf == driver.Cpf))
                throw new DomainException($"Driver with CPF {driver.Cpf} already exists in company");

            _drivers.Add(driver);
            MarkAsUpdated();
        }

        public void AddVehicle(Vehicle vehicle)
        {
            if (vehicle == null)
                throw new ArgumentNullException(nameof(vehicle));
                
            if (_vehicles.Any(v => v.Plate == vehicle.Plate))
                throw new DomainException($"Vehicle with plate {vehicle.Plate} already exists in company");

            _vehicles.Add(vehicle);
            MarkAsUpdated();
        }
    }

    /// <summary>
    /// Configurações específicas da empresa para cálculo de horas
    /// </summary>
    public class CompanySettings
    {
        public TimeSpan MaxDailyWork { get; set; }
        public TimeSpan MinRestBetweenShifts { get; set; }
        public TimeSpan MaxContinuousWork { get; set; }
        public bool RequireLocationOnEvents { get; set; }
        public int ClockSkewToleranceMinutes { get; set; }

        public static CompanySettings Default() => new()
        {
            MaxDailyWork = TimeSpan.FromHours(8),
            MinRestBetweenShifts = TimeSpan.FromHours(11),
            MaxContinuousWork = TimeSpan.FromHours(4),
            RequireLocationOnEvents = true,
            ClockSkewToleranceMinutes = 5
        };
    }

    /// <summary>
    /// Aggregate Root: Motorista que registra eventos da jornada
    /// </summary>
    public class Driver : Entity
    {
        public Guid CompanyId { get; private set; }
        public string Name { get; private set; }
        public Cpf Cpf { get; private set; }
        public string Phone { get; private set; }
        public string Email { get; private set; }
        public string PasswordHash { get; private set; }
        public DriverStatus Status { get; private set; }

        // Relacionamentos
        public Company Company { get; private set; }
        private readonly List<Event> _events = new();
        public IReadOnlyList<Event> Events => _events.AsReadOnly();

        // EF Core constructor
        protected Driver() { }

        public Driver(Guid companyId, string name, Cpf cpf, string phone, string email)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new DomainException("Driver name cannot be empty");
            
            if (string.IsNullOrWhiteSpace(phone))
                throw new DomainException("Driver phone cannot be empty");
            
            if (string.IsNullOrWhiteSpace(email))
                throw new DomainException("Driver email cannot be empty");

            CompanyId = companyId;
            Name = name;
            Cpf = cpf ?? throw new ArgumentNullException(nameof(cpf));
            Phone = phone;
            Email = email;
            Status = DriverStatus.Active;
        }

        /// <summary>
        /// Inicia um novo evento da jornada
        /// Valida regras de negócio e máquina de estados
        /// </summary>
        public Result<Event> StartEvent(
            EventType type, 
            DateTime startedAt, 
            Location? location = null, 
            EventSource source = EventSource.MobileManual,
            Guid? vehicleId = null,
            int? deviceTimeSkewMs = null)
        {
            // Validar se motorista está ativo
            if (Status != DriverStatus.Active)
                return Result.Failure<Event>("Driver is not active");

            // Buscar eventos ativos
            var activeEvents = GetActiveEvents();
            var currentState = DetermineCurrentState(activeEvents);

            // Validar transição de estado
            var stateMachine = new EventStateMachine();
            if (!stateMachine.CanStartEvent(type, currentState))
                return Result.Failure<Event>($"Cannot start {type} while in {currentState} state");

            // Fechar evento conflitante se necessário
            var conflictingEvent = GetConflictingEvent(type, activeEvents);
            if (conflictingEvent != null)
            {
                conflictingEvent.End(startedAt, location);
                AddDomainEvent(new EventEnded(
                    conflictingEvent.Id, 
                    Id, 
                    conflictingEvent.Type, 
                    startedAt, 
                    startedAt - conflictingEvent.StartedAt));
            }

            // Criar novo evento
            var newEvent = new Event(
                Id, 
                CompanyId, 
                type, 
                startedAt, 
                location, 
                source, 
                vehicleId, 
                deviceTimeSkewMs);

            _events.Add(newEvent);
            MarkAsUpdated();

            // Domain Events
            AddDomainEvent(new EventCreated(newEvent.Id, Id, type, startedAt));
            
            var newState = stateMachine.GetNextState(currentState, type);
            if (newState != currentState)
            {
                AddDomainEvent(new DriverStateChanged(Id, currentState, newState, $"Started {type}"));
            }

            return Result.Success(newEvent);
        }

        /// <summary>
        /// Finaliza um evento em andamento
        /// </summary>
        public Result EndEvent(EventType type, DateTime endedAt, Location? location = null)
        {
            var activeEvent = _events
                .Where(e => e.Type == type && e.EndedAt == null)
                .OrderByDescending(e => e.StartedAt)
                .FirstOrDefault();

            if (activeEvent == null)
                return Result.Failure($"No active {type} event to end");

            if (endedAt <= activeEvent.StartedAt)
                return Result.Failure("End time must be after start time");

            activeEvent.End(endedAt, location);
            MarkAsUpdated();

            var duration = endedAt - activeEvent.StartedAt;
            AddDomainEvent(new EventEnded(activeEvent.Id, Id, type, endedAt, duration));

            return Result.Success();
        }

        /// <summary>
        /// Determina o estado atual do motorista baseado nos eventos ativos
        /// </summary>
        public DriverState DetermineCurrentState(List<Event>? activeEvents = null)
        {
            activeEvents ??= GetActiveEvents();

            if (!activeEvents.Any())
                return DriverState.OffShift;

            // Se não há SHIFT_START ativo, está fora da jornada
            var shiftEvent = activeEvents.FirstOrDefault(e => e.Type == EventType.ShiftStart);
            if (shiftEvent == null)
                return DriverState.OffShift;

            // Verificar subestados dentro da jornada
            var latestSubEvent = activeEvents
                .Where(e => e.Type != EventType.ShiftStart)
                .OrderByDescending(e => e.StartedAt)
                .FirstOrDefault();

            if (latestSubEvent == null)
                return DriverState.Working;

            return latestSubEvent.Type switch
            {
                EventType.MealStart => DriverState.Meal,
                EventType.RestStart => DriverState.Rest,
                EventType.DisposalStart => DriverState.Disposal,
                EventType.InspectionStart => DriverState.Inspection,
                _ => DriverState.Working
            };
        }

        public List<Event> GetActiveEvents()
        {
            return _events.Where(e => e.EndedAt == null).ToList();
        }

        public void UpdateStatus(DriverStatus status)
        {
            Status = status;
            MarkAsUpdated();
        }

        public void UpdateContactInfo(string phone, string email)
        {
            if (string.IsNullOrWhiteSpace(phone))
                throw new DomainException("Phone cannot be empty");
                
            if (string.IsNullOrWhiteSpace(email))
                throw new DomainException("Email cannot be empty");

            Phone = phone;
            Email = email;
            MarkAsUpdated();
        }

        public void SetPassword(string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(passwordHash))
                throw new DomainException("Password hash cannot be empty");

            PasswordHash = passwordHash;
            MarkAsUpdated();
        }

        private Event? GetConflictingEvent(EventType newEventType, List<Event> activeEvents)
        {
            // SHIFT_END fecha todos os outros eventos
            if (newEventType == EventType.ShiftEnd)
            {
                return activeEvents.FirstOrDefault(e => e.Type != EventType.ShiftStart);
            }

            // Eventos de início fecham seus pares
            return newEventType switch
            {
                EventType.MealStart => activeEvents.FirstOrDefault(e => 
                    e.Type == EventType.RestStart || 
                    e.Type == EventType.DisposalStart || 
                    e.Type == EventType.InspectionStart),
                EventType.RestStart => activeEvents.FirstOrDefault(e => 
                    e.Type == EventType.MealStart || 
                    e.Type == EventType.DisposalStart || 
                    e.Type == EventType.InspectionStart),
                EventType.DisposalStart => activeEvents.FirstOrDefault(e => 
                    e.Type == EventType.MealStart || 
                    e.Type == EventType.RestStart || 
                    e.Type == EventType.InspectionStart),
                EventType.InspectionStart => activeEvents.FirstOrDefault(e => 
                    e.Type == EventType.MealStart || 
                    e.Type == EventType.RestStart || 
                    e.Type == EventType.DisposalStart),
                _ => null
            };
        }
    }
}