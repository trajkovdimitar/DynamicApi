using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TheBackend.DynamicModels.Workflows;

public class ParameterListJsonConverter : JsonConverter<List<Parameter>>
{
    public override List<Parameter> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.StartArray)
        {
            return JsonSerializer.Deserialize<List<Parameter>>(ref reader, options) ?? new();
        }

        if (reader.TokenType == JsonTokenType.StartObject)
        {
            using var doc = JsonDocument.ParseValue(ref reader);
            var list = new List<Parameter>();
            foreach (var prop in doc.RootElement.EnumerateObject())
            {
                switch (prop.Value.ValueKind)
                {
                    case JsonValueKind.Number:
                        list.Add(new Parameter { Key = prop.Name, ValueType = "int", Value = prop.Value.GetRawText() });
                        break;
                    case JsonValueKind.True:
                    case JsonValueKind.False:
                        list.Add(new Parameter { Key = prop.Name, ValueType = "bool", Value = prop.Value.GetBoolean().ToString() });
                        break;
                    case JsonValueKind.String:
                        list.Add(new Parameter { Key = prop.Name, ValueType = "string", Value = prop.Value.GetString() ?? string.Empty });
                        break;
                    default:
                        list.Add(new Parameter { Key = prop.Name, ValueType = "json", Value = prop.Value.GetRawText() });
                        break;
                }
            }
            return list;
        }

        return new List<Parameter>();
    }

    public override void Write(Utf8JsonWriter writer, List<Parameter> value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, value, options);
    }
}
