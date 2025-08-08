using System.Text.Json.Serialization;
namespace TheBackend.Domain.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))] 
    public enum BuiltInType
    {
        Boolean, // bool / System.Boolean -> bit (SQL Server), boolean (PostgreSQL)
        Byte, // byte / System.Byte -> tinyint (SQL Server), smallint (PostgreSQL)
        SByte, // sbyte / System.SByte -> smallint (SQL Server), smallint (PostgreSQL)
        Char, // char / System.Char -> nchar(1) (SQL Server), character(1) (PostgreSQL)
        Decimal, // decimal / System.Decimal -> decimal(p,s) (SQL Server), numeric (PostgreSQL)
        Double, // double / System.Double -> float (SQL Server), double precision (PostgreSQL)
        Float, // float / System.Single -> real (SQL Server), real (PostgreSQL)
        Int32, // int / System.Int32 -> int (SQL Server), integer (PostgreSQL)
        UInt32, // uint / System.UInt32 -> bigint (SQL Server), bigint (PostgreSQL)
        Int64, // long / System.Int64 -> bigint (SQL Server), bigint (PostgreSQL)
        Int16, // short / System.Int16 -> smallint (SQL Server), smallint (PostgreSQL)
        UInt16, // ushort / System.UInt16 -> int (SQL Server), integer (PostgreSQL)
        String, // string / System.String -> nvarchar(max) (SQL Server), text (PostgreSQL)
        DateTime, // DateTime / System.DateTime -> datetime2 (SQL Server), timestamp (PostgreSQL)
        Guid, // Guid / System.Guid -> uniqueidentifier (SQL Server), uuid (PostgreSQL)
        ByteArray, // byte[] -> varbinary(max) (SQL Server), bytea (PostgreSQL)
        DateOnly, // DateOnly / System.DateOnly -> date (SQL Server), date (PostgreSQL)
        TimeOnly, // TimeOnly / System.TimeOnly -> time (SQL Server), time (PostgreSQL)
        TimeSpan, // TimeSpan / System.TimeSpan -> bigint (SQL Server), interval (PostgreSQL)
        FileAsset // string (file path/URL) -> nvarchar (SQL Server/PostgreSQL); actual file stored in app file system or cloud, not DB
    }
}