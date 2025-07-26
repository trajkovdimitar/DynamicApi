using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace TheBackend.DynamicModels.Workflows;

public class QueryEntityExecutor<TInput, TOutput> : IWorkflowStepExecutor<TInput, IEnumerable<TOutput>>
    where TOutput : class
{
    public string SupportedType => "QueryEntity";

    public async Task<IEnumerable<TOutput>?> ExecuteAsync(
        TInput? input,
        WorkflowStep step,
        DynamicDbContextService dbContextService,
        IServiceProvider serviceProvider,
        Dictionary<string, object> variables)
    {
        var modelName = step.GetParameterValue<string>("ModelName");
        if (string.IsNullOrWhiteSpace(modelName))
            throw new InvalidOperationException("ModelName parameter missing");

        var filter = step.GetParameterValue<string>("Filter");
        var db = dbContextService.GetDbContext();
        var set = db.Set<TOutput>();
        IQueryable<TOutput> query = set;
        if (!string.IsNullOrWhiteSpace(filter))
            query = query.Where(filter);
        return await query.ToListAsync();
    }
}
