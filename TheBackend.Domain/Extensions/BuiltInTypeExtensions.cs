namespace TheBackend.Domain.Models
{
    public static class BuiltInTypeExtensions
    {
        public static string ToCSharpType(this BuiltInType type)
        {
            return type switch
            {
                BuiltInType.Boolean => "bool",
                BuiltInType.Byte => "byte",
                BuiltInType.SByte => "sbyte",
                BuiltInType.Char => "char",
                BuiltInType.Decimal => "decimal",
                BuiltInType.Double => "double",
                BuiltInType.Float => "float",
                BuiltInType.Int32 => "int",
                BuiltInType.UInt32 => "uint",
                BuiltInType.Int64 => "long",
                BuiltInType.Int16 => "short",
                BuiltInType.UInt16 => "ushort",
                BuiltInType.String => "string",
                BuiltInType.DateTime => "DateTime",
                BuiltInType.Guid => "Guid",
                BuiltInType.ByteArray => "byte[]",
                BuiltInType.DateOnly => "DateOnly",
                BuiltInType.TimeOnly => "TimeOnly",
                BuiltInType.TimeSpan => "TimeSpan",
                BuiltInType.FileAsset => "string", 
                _ => throw new ArgumentOutOfRangeException(nameof(type), "Unsupported built-in type")
            };
        }
    }
}