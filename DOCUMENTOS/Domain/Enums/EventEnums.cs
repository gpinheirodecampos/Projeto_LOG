using System.ComponentModel.DataAnnotations;

namespace JornadaApp.Domain.Enums
{
    /// <summary>
    /// Tipos de eventos que podem ser registrados durante a jornada do motorista
    /// </summary>
    public enum EventType
    {
        /// <summary>Início da jornada de trabalho</summary>
        ShiftStart = 1,
        
        /// <summary>Fim da jornada de trabalho</summary>
        ShiftEnd = 2,
        
        /// <summary>Início da refeição</summary>
        MealStart = 3,
        
        /// <summary>Fim da refeição</summary>
        MealEnd = 4,
        
        /// <summary>Início do descanso obrigatório</summary>
        RestStart = 5,
        
        /// <summary>Fim do descanso obrigatório</summary>
        RestEnd = 6,
        
        /// <summary>Início do tempo à disposição da empresa</summary>
        DisposalStart = 7,
        
        /// <summary>Fim do tempo à disposição da empresa</summary>
        DisposalEnd = 8,
        
        /// <summary>Início de fiscalização/blitz</summary>
        InspectionStart = 9,
        
        /// <summary>Fim de fiscalização/blitz</summary>
        InspectionEnd = 10
    }

    /// <summary>
    /// Status atual do motorista na empresa
    /// </summary>
    public enum DriverStatus
    {
        /// <summary>Motorista ativo e pode trabalhar</summary>
        Active = 1,
        
        /// <summary>Motorista inativo temporariamente</summary>
        Inactive = 2,
        
        /// <summary>Motorista suspenso</summary>
        Suspended = 3,
        
        /// <summary>Motorista desligado da empresa</summary>
        Terminated = 4
    }

    /// <summary>
    /// Fonte de origem do evento registrado
    /// </summary>
    public enum EventSource
    {
        /// <summary>Registrado manualmente pelo motorista no app</summary>
        MobileManual = 1,
        
        /// <summary>Registrado automaticamente pelo app (GPS/sensores)</summary>
        MobileAuto = 2,
        
        /// <summary>Registrado pelo operador no portal web</summary>
        Portal = 3
    }

    /// <summary>
    /// Estados da máquina de estados do motorista
    /// </summary>
    public enum DriverState
    {
        /// <summary>Fora da jornada de trabalho</summary>
        OffShift = 1,
        
        /// <summary>Trabalhando (dentro da jornada)</summary>
        Working = 2,
        
        /// <summary>Em refeição</summary>
        Meal = 3,
        
        /// <summary>Em descanso</summary>
        Rest = 4,
        
        /// <summary>À disposição da empresa</summary>
        Disposal = 5,
        
        /// <summary>Em fiscalização</summary>
        Inspection = 6
    }
}