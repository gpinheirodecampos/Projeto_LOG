using JornadaApp.Domain.Common;
using JornadaApp.Domain.Enums;
using JornadaApp.Domain.ValueObjects;
using JornadaApp.Domain.Exceptions;

namespace JornadaApp.Domain.Events
{
    /// <summary>
    /// Domain Event: Evento foi criado
    /// </summary>
    public class EventCreated : DomainEvent
    {
        public Guid EventId { get; }
        public Guid DriverId { get; }
        public EventType Type { get; }
        public DateTime StartedAt { get; }

        public EventCreated(Guid eventId, Guid driverId, EventType type, DateTime startedAt)
        {
            EventId = eventId;
            DriverId = driverId;
            Type = type;
            StartedAt = startedAt;
        }
    }

    /// <summary>
    /// Domain Event: Evento foi finalizado
    /// </summary>
    public class EventEnded : DomainEvent
    {
        public Guid EventId { get; }
        public Guid DriverId { get; }
        public EventType Type { get; }
        public DateTime EndedAt { get; }
        public TimeSpan Duration { get; }

        public EventEnded(Guid eventId, Guid driverId, EventType type, DateTime endedAt, TimeSpan duration)
        {
            EventId = eventId;
            DriverId = driverId;
            Type = type;
            EndedAt = endedAt;
            Duration = duration;
        }
    }

    /// <summary>
    /// Domain Event: Motorista mudou de estado
    /// </summary>
    public class DriverStateChanged : DomainEvent
    {
        public Guid DriverId { get; }
        public DriverState PreviousState { get; }
        public DriverState NewState { get; }
        public string Reason { get; }

        public DriverStateChanged(Guid driverId, DriverState previousState, DriverState newState, string reason)
        {
            DriverId = driverId;
            PreviousState = previousState;
            NewState = newState;
            Reason = reason;
        }
    }

    /// <summary>
    /// Domain Event: Evento foi editado
    /// </summary>
    public class EventEdited : DomainEvent
    {
        public Guid EventId { get; }
        public Guid EditedBy { get; }
        public string Reason { get; }
        public Dictionary<string, object> Changes { get; }

        public EventEdited(Guid eventId, Guid editedBy, string reason, Dictionary<string, object> changes)
        {
            EventId = eventId;
            EditedBy = editedBy;
            Reason = reason;
            Changes = changes;
        }
    }
}