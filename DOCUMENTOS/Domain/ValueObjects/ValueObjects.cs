using JornadaApp.Domain.Exceptions;

namespace JornadaApp.Domain.ValueObjects
{
    /// <summary>
    /// Value Object para representar localização geográfica
    /// Garante que coordenadas sejam sempre válidas
    /// </summary>
    public record Location
    {
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public int AccuracyMeters { get; init; }

        public Location(double latitude, double longitude, int accuracyMeters = 0)
        {
            if (!IsValidLatitude(latitude))
                throw new DomainException($"Invalid latitude: {latitude}. Must be between -90 and 90.");
                
            if (!IsValidLongitude(longitude))
                throw new DomainException($"Invalid longitude: {longitude}. Must be between -180 and 180.");
                
            if (accuracyMeters < 0)
                throw new DomainException($"Accuracy cannot be negative: {accuracyMeters}");

            Latitude = latitude;
            Longitude = longitude;
            AccuracyMeters = accuracyMeters;
        }

        /// <summary>
        /// Verifica se as coordenadas são válidas geograficamente
        /// </summary>
        public bool IsValid => IsValidLatitude(Latitude) && IsValidLongitude(Longitude);

        /// <summary>
        /// Calcula distância aproximada entre duas localizações (em metros)
        /// Usando fórmula de Haversine simplificada
        /// </summary>
        public double DistanceToKm(Location other)
        {
            const double R = 6371; // Raio da Terra em km

            var lat1Rad = Latitude * Math.PI / 180;
            var lat2Rad = other.Latitude * Math.PI / 180;
            var deltaLatRad = (other.Latitude - Latitude) * Math.PI / 180;
            var deltaLngRad = (other.Longitude - Longitude) * Math.PI / 180;

            var a = Math.Sin(deltaLatRad / 2) * Math.Sin(deltaLatRad / 2) +
                   Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                   Math.Sin(deltaLngRad / 2) * Math.Sin(deltaLngRad / 2);
            
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        /// <summary>
        /// Representa a localização em formato legível
        /// </summary>
        public override string ToString()
        {
            return $"({Latitude:F6}, {Longitude:F6}) ±{AccuracyMeters}m";
        }

        private static bool IsValidLatitude(double lat) => lat >= -90.0 && lat <= 90.0;
        private static bool IsValidLongitude(double lng) => lng >= -180.0 && lng <= 180.0;
    }

    /// <summary>
    /// Value Object para representar documento CPF
    /// </summary>
    public record Cpf
    {
        public string Value { get; init; }

        public Cpf(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new DomainException("CPF cannot be empty");

            var cleanCpf = value.Replace(".", "").Replace("-", "").Trim();
            
            if (!IsValid(cleanCpf))
                throw new DomainException($"Invalid CPF: {value}");

            Value = cleanCpf;
        }

        /// <summary>
        /// Valida CPF usando algoritmo oficial
        /// </summary>
        private static bool IsValid(string cpf)
        {
            if (cpf.Length != 11 || !cpf.All(char.IsDigit))
                return false;

            // CPFs inválidos conhecidos
            if (cpf == "00000000000" || cpf == "11111111111" || 
                cpf == "22222222222" || cpf == "33333333333" ||
                cpf == "44444444444" || cpf == "55555555555" || 
                cpf == "66666666666" || cpf == "77777777777" ||
                cpf == "88888888888" || cpf == "99999999999")
                return false;

            // Validação do primeiro dígito
            var sum = 0;
            for (int i = 0; i < 9; i++)
                sum += int.Parse(cpf[i].ToString()) * (10 - i);
            
            var remainder = sum % 11;
            var firstDigit = remainder < 2 ? 0 : 11 - remainder;
            
            if (int.Parse(cpf[9].ToString()) != firstDigit)
                return false;

            // Validação do segundo dígito
            sum = 0;
            for (int i = 0; i < 10; i++)
                sum += int.Parse(cpf[i].ToString()) * (11 - i);
            
            remainder = sum % 11;
            var secondDigit = remainder < 2 ? 0 : 11 - remainder;
            
            return int.Parse(cpf[10].ToString()) == secondDigit;
        }

        /// <summary>
        /// Formata CPF para exibição
        /// </summary>
        public string Formatted => $"{Value[..3]}.{Value.Substring(3, 3)}.{Value.Substring(6, 3)}-{Value.Substring(9, 2)}";

        public override string ToString() => Formatted;

        public static implicit operator string(Cpf cpf) => cpf.Value;
        public static explicit operator Cpf(string value) => new(value);
    }

    /// <summary>
    /// Value Object para representar CNPJ da empresa
    /// </summary>
    public record Cnpj
    {
        public string Value { get; init; }

        public Cnpj(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new DomainException("CNPJ cannot be empty");

            var cleanCnpj = value.Replace(".", "").Replace("/", "").Replace("-", "").Trim();
            
            if (!IsValid(cleanCnpj))
                throw new DomainException($"Invalid CNPJ: {value}");

            Value = cleanCnpj;
        }

        /// <summary>
        /// Valida CNPJ usando algoritmo oficial
        /// </summary>
        private static bool IsValid(string cnpj)
        {
            if (cnpj.Length != 14 || !cnpj.All(char.IsDigit))
                return false;

            // Primeiro dígito verificador
            var sequence1 = new int[] { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
            var sum1 = 0;
            for (int i = 0; i < 12; i++)
                sum1 += int.Parse(cnpj[i].ToString()) * sequence1[i];

            var remainder1 = sum1 % 11;
            var digit1 = remainder1 < 2 ? 0 : 11 - remainder1;

            if (int.Parse(cnpj[12].ToString()) != digit1)
                return false;

            // Segundo dígito verificador
            var sequence2 = new int[] { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
            var sum2 = 0;
            for (int i = 0; i < 13; i++)
                sum2 += int.Parse(cnpj[i].ToString()) * sequence2[i];

            var remainder2 = sum2 % 11;
            var digit2 = remainder2 < 2 ? 0 : 11 - remainder2;

            return int.Parse(cnpj[13].ToString()) == digit2;
        }

        /// <summary>
        /// Formata CNPJ para exibição
        /// </summary>
        public string Formatted => $"{Value[..2]}.{Value.Substring(2, 3)}.{Value.Substring(5, 3)}/{Value.Substring(8, 4)}-{Value.Substring(12, 2)}";

        public override string ToString() => Formatted;

        public static implicit operator string(Cnpj cnpj) => cnpj.Value;
        public static explicit operator Cnpj(string value) => new(value);
    }
}