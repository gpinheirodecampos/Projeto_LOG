namespace JornadaApp.Domain.Exceptions
{
    /// <summary>
    /// Exceção base para violações de regras de domínio
    /// </summary>
    public class DomainException : Exception
    {
        public DomainException(string message) : base(message) { }
        
        public DomainException(string message, Exception innerException) 
            : base(message, innerException) { }
    }

    /// <summary>
    /// Exceção para transições inválidas na máquina de estados
    /// </summary>
    public class InvalidStateTransitionException : DomainException
    {
        public InvalidStateTransitionException(string currentState, string targetEvent)
            : base($"Cannot execute '{targetEvent}' while in '{currentState}' state") { }
    }

    /// <summary>
    /// Exceção para eventos conflitantes (sobreposição de horários)
    /// </summary>
    public class EventConflictException : DomainException
    {
        public EventConflictException(string message) : base(message) { }
    }

    /// <summary>
    /// Exceção para violações de regras de negócio específicas
    /// </summary>
    public class BusinessRuleViolationException : DomainException
    {
        public string RuleName { get; }
        
        public BusinessRuleViolationException(string ruleName, string message) 
            : base(message)
        {
            RuleName = ruleName;
        }
    }
}

namespace JornadaApp.Domain.Common
{
    /// <summary>
    /// Classe base para todas as entidades do domínio
    /// </summary>
    public abstract class Entity
    {
        public Guid Id { get; protected set; }
        public DateTime CreatedAt { get; protected set; }
        public DateTime? UpdatedAt { get; protected set; }

        // Domain Events (para Event-Driven interno)
        private readonly List<IDomainEvent> _domainEvents = new();
        public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

        protected Entity()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
        }

        protected Entity(Guid id)
        {
            Id = id;
            CreatedAt = DateTime.UtcNow;
        }

        protected void AddDomainEvent(IDomainEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }

        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }

        protected void MarkAsUpdated()
        {
            UpdatedAt = DateTime.UtcNow;
        }

        public override bool Equals(object? obj)
        {
            if (obj is not Entity other)
                return false;

            if (ReferenceEquals(this, other))
                return true;

            if (GetType() != other.GetType())
                return false;

            return Id == other.Id;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }

        public static bool operator ==(Entity? left, Entity? right)
        {
            return left?.Equals(right) ?? right is null;
        }

        public static bool operator !=(Entity? left, Entity? right)
        {
            return !(left == right);
        }
    }

    /// <summary>
    /// Interface para Domain Events
    /// </summary>
    public interface IDomainEvent
    {
        DateTime OccurredOn { get; }
        Guid EventId { get; }
    }

    /// <summary>
    /// Classe base para Domain Events
    /// </summary>
    public abstract class DomainEvent : IDomainEvent
    {
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
        public Guid EventId { get; } = Guid.NewGuid();
    }

    /// <summary>
    /// Classe para representar resultado de operações
    /// </summary>
    public class Result
    {
        public bool IsSuccess { get; }
        public bool IsFailure => !IsSuccess;
        public string Error { get; }

        protected Result(bool isSuccess, string error)
        {
            if (isSuccess && !string.IsNullOrEmpty(error))
                throw new ArgumentException("Success result cannot have error message");
            
            if (!isSuccess && string.IsNullOrEmpty(error))
                throw new ArgumentException("Failure result must have error message");

            IsSuccess = isSuccess;
            Error = error;
        }

        public static Result Success() => new(true, string.Empty);
        public static Result Failure(string error) => new(false, error);

        public static Result<T> Success<T>(T value) => new(value, true, string.Empty);
        public static Result<T> Failure<T>(string error) => new(default(T), false, error);
    }

    /// <summary>
    /// Classe para representar resultado de operações com valor de retorno
    /// </summary>
    public class Result<T> : Result
    {
        public T Value { get; }

        protected internal Result(T value, bool isSuccess, string error) 
            : base(isSuccess, error)
        {
            Value = value;
        }
    }
}