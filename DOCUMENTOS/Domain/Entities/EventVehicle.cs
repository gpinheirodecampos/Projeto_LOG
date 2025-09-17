using JornadaApp.Domain.Common;
using JornadaApp.Domain.Enums;
using JornadaApp.Domain.ValueObjects;
using JornadaApp.Domain.Exceptions;

namespace JornadaApp.Domain.Entities
{
    /// <summary>
    /// Entidade: Evento da jornada do motorista
    /// Núcleo do sistema - representa cada ação registrada
    /// </summary>
    public class Event : Entity
    {
        public Guid DriverId { get; private set; }
        public Guid CompanyId { get; private set; }
        public Guid? VehicleId { get; private set; }
        public EventType Type { get; private set; }
        public DateTime StartedAt { get; private set; }
        public DateTime? EndedAt { get; private set; }

        // Geolocalização
        public Location? LocationStart { get; private set; }
        public Location? LocationEnd { get; private set; }

        // Auditoria e sincronização
        public EventSource Source { get; private set; }
        public Guid? EditedBy { get; private set; }
        public string? EditReason { get; private set; }
        public int? DeviceTimeSkewMs { get; private set; }

        // Relacionamentos
        public Driver Driver { get; private set; }
        public Company Company { get; private set; }
        public Vehicle? Vehicle { get; private set; }
        public Driver? Editor { get; private set; }

        // Propriedades calculadas
        public TimeSpan? Duration => EndedAt?.Subtract(StartedAt);
        public bool IsActive => EndedAt == null;
        public bool IsCompleted => EndedAt != null;

        // EF Core constructor
        protected Event() { }

        public Event(
            Guid driverId, 
            Guid companyId, 
            EventType type, 
            DateTime startedAt, 
            Location? locationStart = null, 
            EventSource source = EventSource.MobileManual,
            Guid? vehicleId = null,
            int? deviceTimeSkewMs = null)
        {
            if (driverId == Guid.Empty)
                throw new DomainException("DriverId cannot be empty");
                
            if (companyId == Guid.Empty)
                throw new DomainException("CompanyId cannot be empty");

            // Validar timestamp (não pode ser muito no futuro ou passado)
            var now = DateTime.UtcNow;
            var timeDiff = Math.Abs((startedAt - now).TotalHours);
            if (timeDiff > 24)
                throw new DomainException($"Event timestamp is too far from current time: {timeDiff:F1} hours");

            DriverId = driverId;
            CompanyId = companyId;
            VehicleId = vehicleId;
            Type = type;
            StartedAt = startedAt;
            LocationStart = locationStart;
            Source = source;
            DeviceTimeSkewMs = deviceTimeSkewMs;
        }

        /// <summary>
        /// Finaliza o evento com timestamp de fim
        /// </summary>
        public void End(DateTime endedAt, Location? locationEnd = null)
        {
            if (IsCompleted)
                throw new DomainException("Event is already completed");

            if (endedAt <= StartedAt)
                throw new DomainException("End time must be after start time");

            EndedAt = endedAt;
            LocationEnd = locationEnd;
            MarkAsUpdated();
        }

        /// <summary>
        /// Edita o evento com justificativa e rastreamento
        /// </summary>
        public void Edit(
            Guid editedBy, 
            string reason, 
            DateTime? newStartedAt = null, 
            DateTime? newEndedAt = null,
            Location? newLocationStart = null,
            Location? newLocationEnd = null)
        {
            if (string.IsNullOrWhiteSpace(reason))
                throw new DomainException("Edit reason is required");

            var changes = new Dictionary<string, object>();

            if (newStartedAt.HasValue && newStartedAt.Value != StartedAt)
            {
                if (newEndedAt.HasValue && newStartedAt.Value >= newEndedAt.Value)
                    throw new DomainException("Start time must be before end time");

                changes["StartedAt"] = new { Old = StartedAt, New = newStartedAt.Value };
                StartedAt = newStartedAt.Value;
            }

            if (newEndedAt.HasValue && newEndedAt.Value != EndedAt)
            {
                if (newEndedAt.Value <= StartedAt)
                    throw new DomainException("End time must be after start time");

                changes["EndedAt"] = new { Old = EndedAt, New = newEndedAt.Value };
                EndedAt = newEndedAt.Value;
            }

            if (newLocationStart != null && !newLocationStart.Equals(LocationStart))
            {
                changes["LocationStart"] = new { Old = LocationStart?.ToString(), New = newLocationStart.ToString() };
                LocationStart = newLocationStart;
            }

            if (newLocationEnd != null && !newLocationEnd.Equals(LocationEnd))
            {
                changes["LocationEnd"] = new { Old = LocationEnd?.ToString(), New = newLocationEnd.ToString() };
                LocationEnd = newLocationEnd;
            }

            if (changes.Any())
            {
                EditedBy = editedBy;
                EditReason = reason;
                MarkAsUpdated();

                // Domain Event para auditoria
                AddDomainEvent(new Events.EventEdited(Id, editedBy, reason, changes));
            }
        }

        /// <summary>
        /// Verifica se há conflito temporal com outro evento
        /// </summary>
        public bool ConflictsWith(Event other)
        {
            if (other == null || other.DriverId != DriverId)
                return false;

            // Eventos do mesmo tipo não conflitam
            if (other.Type == Type)
                return false;

            var thisStart = StartedAt;
            var thisEnd = EndedAt ?? DateTime.MaxValue;
            var otherStart = other.StartedAt;
            var otherEnd = other.EndedAt ?? DateTime.MaxValue;

            // Verifica sobreposição de intervalos
            return thisStart < otherEnd && otherStart < thisEnd;
        }

        /// <summary>
        /// Calcula distância percorrida (se houver localização início e fim)
        /// </summary>
        public double? GetDistanceKm()
        {
            if (LocationStart == null || LocationEnd == null)
                return null;

            return LocationStart.DistanceToKm(LocationEnd);
        }

        /// <summary>
        /// Verifica se o evento é do tipo "início" (start)
        /// </summary>
        public bool IsStartEvent => Type.ToString().EndsWith("Start");

        /// <summary>
        /// Verifica se o evento é do tipo "fim" (end)  
        /// </summary>
        public bool IsEndEvent => Type.ToString().EndsWith("End");

        /// <summary>
        /// Obtém o tipo de evento correspondente (par start/end)
        /// </summary>
        public EventType GetPairEventType()
        {
            return Type switch
            {
                EventType.ShiftStart => EventType.ShiftEnd,
                EventType.ShiftEnd => EventType.ShiftStart,
                EventType.MealStart => EventType.MealEnd,
                EventType.MealEnd => EventType.MealStart,
                EventType.RestStart => EventType.RestEnd,
                EventType.RestEnd => EventType.RestStart,
                EventType.DisposalStart => EventType.DisposalEnd,
                EventType.DisposalEnd => EventType.DisposalStart,
                EventType.InspectionStart => EventType.InspectionEnd,
                EventType.InspectionEnd => EventType.InspectionStart,
                _ => throw new DomainException($"No pair event type for {Type}")
            };
        }
    }

    /// <summary>
    /// Entidade: Veículo da empresa
    /// </summary>
    public class Vehicle : Entity
    {
        public Guid CompanyId { get; private set; }
        public string Plate { get; private set; }
        public string Model { get; private set; }
        public string Brand { get; private set; }
        public int Year { get; private set; }
        public bool IsActive { get; private set; }

        // Relacionamentos
        public Company Company { get; private set; }
        private readonly List<Assignment> _assignments = new();
        public IReadOnlyList<Assignment> Assignments => _assignments.AsReadOnly();

        // EF Core constructor
        protected Vehicle() { }

        public Vehicle(Guid companyId, string plate, string model, string brand, int year)
        {
            if (string.IsNullOrWhiteSpace(plate))
                throw new DomainException("Vehicle plate cannot be empty");
                
            if (string.IsNullOrWhiteSpace(model))
                throw new DomainException("Vehicle model cannot be empty");
                
            if (string.IsNullOrWhiteSpace(brand))
                throw new DomainException("Vehicle brand cannot be empty");
                
            if (year < 1900 || year > DateTime.Now.Year + 1)
                throw new DomainException($"Invalid vehicle year: {year}");

            CompanyId = companyId;
            Plate = plate.ToUpper().Replace("-", "").Replace(" ", "");
            Model = model;
            Brand = brand;
            Year = year;
            IsActive = true;
        }

        public void UpdateInfo(string model, string brand, int year)
        {
            if (string.IsNullOrWhiteSpace(model))
                throw new DomainException("Vehicle model cannot be empty");
                
            if (string.IsNullOrWhiteSpace(brand))
                throw new DomainException("Vehicle brand cannot be empty");
                
            if (year < 1900 || year > DateTime.Now.Year + 1)
                throw new DomainException($"Invalid vehicle year: {year}");

            Model = model;
            Brand = brand;
            Year = year;
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

        public Assignment? GetCurrentAssignment()
        {
            return _assignments
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.StartAt)
                .FirstOrDefault();
        }
    }

    /// <summary>
    /// Entidade: Atribuição de motorista a veículo
    /// </summary>
    public class Assignment : Entity
    {
        public Guid DriverId { get; private set; }
        public Guid VehicleId { get; private set; }
        public DateTime StartAt { get; private set; }
        public DateTime? EndAt { get; private set; }

        // Relacionamentos
        public Driver Driver { get; private set; }
        public Vehicle Vehicle { get; private set; }

        // Propriedades calculadas
        public bool IsActive => EndAt == null;
        public TimeSpan? Duration => EndAt?.Subtract(StartAt);

        // EF Core constructor
        protected Assignment() { }

        public Assignment(Guid driverId, Guid vehicleId, DateTime startAt)
        {
            if (driverId == Guid.Empty)
                throw new DomainException("DriverId cannot be empty");
                
            if (vehicleId == Guid.Empty)
                throw new DomainException("VehicleId cannot be empty");

            DriverId = driverId;
            VehicleId = vehicleId;
            StartAt = startAt;
        }

        public void End(DateTime endAt)
        {
            if (IsActive == false)
                throw new DomainException("Assignment is already ended");
                
            if (endAt <= StartAt)
                throw new DomainException("End time must be after start time");

            EndAt = endAt;
            MarkAsUpdated();
        }
    }

    /// <summary>
    /// Entidade: Resumo diário da jornada (agregação)
    /// </summary>
    public class WorkdaySummary : Entity
    {
        public Guid DriverId { get; private set; }
        public DateTime Date { get; private set; }
        public TimeSpan TotalWorked { get; private set; }
        public TimeSpan TotalRest { get; private set; }
        public TimeSpan TotalMeal { get; private set; }
        public TimeSpan TotalDisposal { get; private set; }
        public string[] Anomalies { get; private set; }
        public DateTime CalculatedAt { get; private set; }

        // Relacionamentos
        public Driver Driver { get; private set; }

        // EF Core constructor
        protected WorkdaySummary() { }

        public WorkdaySummary(
            Guid driverId, 
            DateTime date, 
            TimeSpan totalWorked, 
            TimeSpan totalRest, 
            TimeSpan totalMeal, 
            TimeSpan totalDisposal,
            string[] anomalies = null)
        {
            DriverId = driverId;
            Date = date.Date; // Apenas a data, sem hora
            TotalWorked = totalWorked;
            TotalRest = totalRest;
            TotalMeal = totalMeal;
            TotalDisposal = totalDisposal;
            Anomalies = anomalies ?? Array.Empty<string>();
            CalculatedAt = DateTime.UtcNow;
        }

        public void Update(
            TimeSpan totalWorked, 
            TimeSpan totalRest, 
            TimeSpan totalMeal, 
            TimeSpan totalDisposal,
            string[] anomalies = null)
        {
            TotalWorked = totalWorked;
            TotalRest = totalRest;
            TotalMeal = totalMeal;
            TotalDisposal = totalDisposal;
            Anomalies = anomalies ?? Array.Empty<string>();
            CalculatedAt = DateTime.UtcNow;
            MarkAsUpdated();
        }

        /// <summary>
        /// Tempo total da jornada (início até fim)
        /// </summary>
        public TimeSpan TotalShift => TotalWorked + TotalRest + TotalMeal + TotalDisposal;

        /// <summary>
        /// Verifica se há anomalias no dia
        /// </summary>
        public bool HasAnomalies => Anomalies.Length > 0;
    }

    /// <summary>
    /// Entidade: Log de auditoria para todas as alterações
    /// </summary>
    public class AuditLog : Entity
    {
        public Guid? ActorId { get; private set; }
        public string Action { get; private set; }
        public string EntityType { get; private set; }
        public Guid EntityId { get; private set; }
        public string Changes { get; private set; } // JSON
        public string? IpAddress { get; private set; }
        public string? UserAgent { get; private set; }

        // EF Core constructor
        protected AuditLog() { }

        public AuditLog(
            Guid? actorId,
            string action,
            string entityType,
            Guid entityId,
            string changes,
            string? ipAddress = null,
            string? userAgent = null)
        {
            ActorId = actorId;
            Action = action ?? throw new ArgumentNullException(nameof(action));
            EntityType = entityType ?? throw new ArgumentNullException(nameof(entityType));
            EntityId = entityId;
            Changes = changes ?? throw new ArgumentNullException(nameof(changes));
            IpAddress = ipAddress;
            UserAgent = userAgent;
        }
    }
}