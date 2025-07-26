using System;
using System.Linq;

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
}
