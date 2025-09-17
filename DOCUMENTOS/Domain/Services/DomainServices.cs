using JornadaApp.Domain.Enums;
using JornadaApp.Domain.Exceptions;

namespace JornadaApp.Domain.Services
{
    /// <summary>
    /// Domain Service: Máquina de estados para validação de transições de eventos
    /// Implementa todas as regras de negócio para mudanças de estado do motorista
    /// </summary>
    public class EventStateMachine
    {
        // Mapa de transições válidas: (EstadoAtual, TipoEvento) -> NovoEstado
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
            
            // SHIFT_END força OffShift de qualquer estado dentro da jornada
            { (DriverState.Meal, EventType.ShiftEnd), DriverState.OffShift },
            { (DriverState.Rest, EventType.ShiftEnd), DriverState.OffShift },
            { (DriverState.Disposal, EventType.ShiftEnd), DriverState.OffShift },
            { (DriverState.Inspection, EventType.ShiftEnd), DriverState.OffShift },
        };

        /// <summary>
        /// Verifica se é possível iniciar um evento no estado atual
        /// </summary>
        public bool CanStartEvent(EventType eventType, DriverState currentState)
        {
            return ValidTransitions.ContainsKey((currentState, eventType));
        }

        /// <summary>
        /// Obtém o próximo estado após executar um evento
        /// </summary>
        public DriverState GetNextState(DriverState currentState, EventType eventType)
        {
            if (ValidTransitions.TryGetValue((currentState, eventType), out var nextState))
                return nextState;

            throw new InvalidStateTransitionException(currentState.ToString(), eventType.ToString());
        }

        /// <summary>
        /// Valida uma transição e retorna resultado com detalhes
        /// </summary>
        public ValidationResult ValidateTransition(DriverState currentState, EventType eventType)
        {
            if (ValidTransitions.ContainsKey((currentState, eventType)))
            {
                var nextState = ValidTransitions[(currentState, eventType)];
                return ValidationResult.Success($"Transition from {currentState} to {nextState} via {eventType}");
            }

            return ValidationResult.Failure(
                $"Invalid transition: Cannot execute {eventType} while in {currentState} state",
                GetSuggestedEvents(currentState));
        }

        /// <summary>
        /// Obtém eventos sugeridos para o estado atual
        /// </summary>
        public List<EventType> GetAllowedEvents(DriverState currentState)
        {
            return ValidTransitions
                .Where(kvp => kvp.Key.Item1 == currentState)
                .Select(kvp => kvp.Key.Item2)
                .ToList();
        }

        /// <summary>
        /// Verifica se um evento precisa fechar outro evento automaticamente
        /// </summary>
        public EventType? GetEventToAutoClose(EventType newEventType, List<Entities.Event> activeEvents)
        {
            // SHIFT_END fecha todos os subeventos
            if (newEventType == EventType.ShiftEnd)
            {
                var activeSubEvent = activeEvents.FirstOrDefault(e => 
                    e.Type != EventType.ShiftStart && e.EndedAt == null);
                return activeSubEvent?.Type;
            }

            // Eventos de início fecham outros subeventos conflitantes
            var conflictingTypes = newEventType switch
            {
                EventType.MealStart => new[] { EventType.RestStart, EventType.DisposalStart, EventType.InspectionStart },
                EventType.RestStart => new[] { EventType.MealStart, EventType.DisposalStart, EventType.InspectionStart },
                EventType.DisposalStart => new[] { EventType.MealStart, EventType.RestStart, EventType.InspectionStart },
                EventType.InspectionStart => new[] { EventType.MealStart, EventType.RestStart, EventType.DisposalStart },
                _ => Array.Empty<EventType>()
            };

            var conflictingEvent = activeEvents.FirstOrDefault(e => conflictingTypes.Contains(e.Type));
            return conflictingEvent?.Type;
        }

        /// <summary>
        /// Determina o estado atual baseado nos eventos ativos
        /// </summary>
        public DriverState DetermineCurrentState(List<Entities.Event> activeEvents)
        {
            if (!activeEvents.Any())
                return DriverState.OffShift;

            // Se não há SHIFT_START ativo, está fora da jornada
            var shiftEvent = activeEvents.FirstOrDefault(e => e.Type == EventType.ShiftStart);
            if (shiftEvent == null)
                return DriverState.OffShift;

            // Verificar subestados dentro da jornada (o mais recente tem precedência)
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

        /// <summary>
        /// Obtém eventos sugeridos quando uma transição é inválida
        /// </summary>
        private List<EventType> GetSuggestedEvents(DriverState currentState)
        {
            return GetAllowedEvents(currentState);
        }
    }

    /// <summary>
    /// Resultado de validação de transições
    /// </summary>
    public class ValidationResult
    {
        public bool IsValid { get; }
        public string Message { get; }
        public List<EventType> SuggestedEvents { get; }

        private ValidationResult(bool isValid, string message, List<EventType>? suggestedEvents = null)
        {
            IsValid = isValid;
            Message = message;
            SuggestedEvents = suggestedEvents ?? new List<EventType>();
        }

        public static ValidationResult Success(string message = "")
            => new(true, message);

        public static ValidationResult Failure(string message, List<EventType>? suggestedEvents = null)
            => new(false, message, suggestedEvents);
    }

    /// <summary>
    /// Domain Service: Calculadora de totais de jornada
    /// Implementa regras de negócio para cálculo de horas trabalhadas
    /// </summary>
    public class WorkdayCalculator
    {
        private readonly CompanySettings _settings;

        public WorkdayCalculator(CompanySettings? settings = null)
        {
            _settings = settings ?? CompanySettings.Default();
        }

        /// <summary>
        /// Calcula resumo do dia baseado nos eventos
        /// </summary>
        public WorkdaySummary Calculate(Guid driverId, DateTime date, List<Entities.Event> events)
        {
            var dayEvents = events
                .Where(e => e.StartedAt.Date == date.Date)
                .OrderBy(e => e.StartedAt)
                .ToList();

            var totals = CalculateTotals(dayEvents);
            var anomalies = DetectAnomalies(dayEvents, totals);

            return new Entities.WorkdaySummary(
                driverId,
                date,
                totals.TotalWorked,
                totals.TotalRest,
                totals.TotalMeal,
                totals.TotalDisposal,
                anomalies.ToArray());
        }

        /// <summary>
        /// Calcula totais por tipo de evento
        /// </summary>
        private WorkdayTotals CalculateTotals(List<Entities.Event> events)
        {
            var totals = new WorkdayTotals();

            // Processar pares de eventos (início/fim)
            var pairs = CreateEventPairs(events);

            foreach (var pair in pairs)
            {
                if (!pair.Duration.HasValue) continue;

                switch (pair.Type)
                {
                    case EventType.ShiftStart:
                        // Total da jornada já está calculado pela duração do shift
                        break;
                    case EventType.MealStart:
                        totals.TotalMeal = totals.TotalMeal.Add(pair.Duration.Value);
                        break;
                    case EventType.RestStart:
                        totals.TotalRest = totals.TotalRest.Add(pair.Duration.Value);
                        break;
                    case EventType.DisposalStart:
                        totals.TotalDisposal = totals.TotalDisposal.Add(pair.Duration.Value);
                        break;
                }
            }

            // Calcular tempo trabalhado (jornada - pausas)
            var shiftPair = pairs.FirstOrDefault(p => p.Type == EventType.ShiftStart);
            if (shiftPair?.Duration.HasValue == true)
            {
                totals.TotalWorked = shiftPair.Duration.Value
                    .Subtract(totals.TotalMeal)
                    .Subtract(totals.TotalRest)
                    .Subtract(totals.TotalDisposal);
            }

            return totals;
        }

        /// <summary>
        /// Cria pares de eventos (início/fim) para cálculo de duração
        /// </summary>
        private List<EventPair> CreateEventPairs(List<Entities.Event> events)
        {
            var pairs = new List<EventPair>();
            var startEvents = events.Where(e => e.IsStartEvent).ToList();

            foreach (var startEvent in startEvents)
            {
                var endEventType = startEvent.GetPairEventType();
                var endEvent = events
                    .Where(e => e.Type == endEventType && e.StartedAt > startEvent.StartedAt)
                    .OrderBy(e => e.StartedAt)
                    .FirstOrDefault();

                var duration = endEvent?.StartedAt.Subtract(startEvent.StartedAt);
                pairs.Add(new EventPair(startEvent.Type, startEvent.StartedAt, endEvent?.StartedAt, duration));
            }

            return pairs;
        }

        /// <summary>
        /// Detecta anomalias no dia de trabalho
        /// </summary>
        private List<string> DetectAnomalies(List<Entities.Event> events, WorkdayTotals totals)
        {
            var anomalies = new List<string>();

            // Verificar jornada muito longa
            if (totals.TotalWorked > _settings.MaxDailyWork)
            {
                anomalies.Add($"Jornada excede limite diário: {totals.TotalWorked:hh\\:mm} > {_settings.MaxDailyWork:hh\\:mm}");
            }

            // Verificar trabalho contínuo sem pausa
            var continuousWork = GetLongestContinuousWork(events);
            if (continuousWork > _settings.MaxContinuousWork)
            {
                anomalies.Add($"Trabalho contínuo excede limite: {continuousWork:hh\\:mm} > {_settings.MaxContinuousWork:hh\\:mm}");
            }

            // Verificar eventos sem localização (se obrigatório)
            if (_settings.RequireLocationOnEvents)
            {
                var eventsWithoutLocation = events.Count(e => e.LocationStart == null);
                if (eventsWithoutLocation > 0)
                {
                    anomalies.Add($"{eventsWithoutLocation} eventos sem localização");
                }
            }

            // Verificar eventos não finalizados
            var openEvents = events.Where(e => e.IsStartEvent && e.IsActive).ToList();
            if (openEvents.Any())
            {
                anomalies.Add($"{openEvents.Count} eventos não finalizados: {string.Join(", ", openEvents.Select(e => e.Type))}");
            }

            return anomalies;
        }

        /// <summary>
        /// Calcula o maior período de trabalho contínuo (sem pausas)
        /// </summary>
        private TimeSpan GetLongestContinuousWork(List<Entities.Event> events)
        {
            var workPeriods = new List<TimeSpan>();
            var currentWorkStart = (DateTime?)null;

            foreach (var evt in events.OrderBy(e => e.StartedAt))
            {
                switch (evt.Type)
                {
                    case EventType.ShiftStart:
                        currentWorkStart = evt.StartedAt;
                        break;

                    case EventType.MealStart:
                    case EventType.RestStart:
                        if (currentWorkStart.HasValue)
                        {
                            workPeriods.Add(evt.StartedAt - currentWorkStart.Value);
                            currentWorkStart = null;
                        }
                        break;

                    case EventType.MealEnd:
                    case EventType.RestEnd:
                        currentWorkStart = evt.StartedAt;
                        break;

                    case EventType.ShiftEnd:
                        if (currentWorkStart.HasValue)
                        {
                            workPeriods.Add(evt.StartedAt - currentWorkStart.Value);
                        }
                        break;
                }
            }

            return workPeriods.Any() ? workPeriods.Max() : TimeSpan.Zero;
        }
    }

    // Classes auxiliares para cálculos
    internal class WorkdayTotals
    {
        public TimeSpan TotalWorked { get; set; } = TimeSpan.Zero;
        public TimeSpan TotalRest { get; set; } = TimeSpan.Zero;
        public TimeSpan TotalMeal { get; set; } = TimeSpan.Zero;
        public TimeSpan TotalDisposal { get; set; } = TimeSpan.Zero;
    }

    internal class EventPair
    {
        public EventType Type { get; }
        public DateTime StartedAt { get; }
        public DateTime? EndedAt { get; }
        public TimeSpan? Duration { get; }

        public EventPair(EventType type, DateTime startedAt, DateTime? endedAt, TimeSpan? duration)
        {
            Type = type;
            StartedAt = startedAt;
            EndedAt = endedAt;
            Duration = duration;
        }
    }
}