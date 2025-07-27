using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace TheBackend.DynamicModels.Workflows;

public static class WorkflowStepExtensions
{
    public static T? GetParameterValue<T>(this WorkflowStep step, string key)
    {
        var param = step.Parameters.FirstOrDefault(p =>
            p.Key.Equals(key, StringComparison.OrdinalIgnoreCase));
        var value = param?.GetTypedValue();
        if (value is T t) return t;
        if (value == null) return default;
        return (T)Convert.ChangeType(value, typeof(T));
    }

    public static string? GetResolvedString(
        this WorkflowStep step,
        string key,
        object? input,
        Dictionary<string, object> variables)
    {
        var raw = step.GetParameterValue<string>(key);
        return raw == null ? null : ResolvePlaceholders(raw, input, variables);
    }

    private static string ResolvePlaceholders(
        string template,
        object? input,
        Dictionary<string, object> variables)
    {
        return Regex.Replace(
            template,
            "\\{\\{(Global|Input)\\.([^\\}]+)\\}\\}",
            m =>
            {
                var type = m.Groups[1].Value;
                var name = m.Groups[2].Value;
                if (type.Equals("Global", StringComparison.OrdinalIgnoreCase) &&
                    variables.TryGetValue(name, out var val))
                    return val?.ToString() ?? string.Empty;
                if (type.Equals("Input", StringComparison.OrdinalIgnoreCase))
                    return GetInputValue(input, name)?.ToString() ?? string.Empty;
                return m.Value;
            });
    }

    private static object? GetInputValue(object? input, string propertyPath)
    {
        if (input == null) return null;
        var current = input;
        foreach (var part in propertyPath.Split('.'))
        {
            var prop = current.GetType().GetProperty(part);
            if (prop == null) return null;
            current = prop.GetValue(current);
            if (current == null) return null;
        }

        return current;
    }
}
