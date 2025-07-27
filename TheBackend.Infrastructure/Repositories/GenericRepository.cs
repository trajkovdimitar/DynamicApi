using Microsoft.EntityFrameworkCore;
using TheBackend.Application.Repositories;
using System.Collections.Generic;
using System.Linq;

namespace TheBackend.Infrastructure.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    private readonly DbContext _dbContext;
    private readonly DbSet<T> _dbSet;

    public GenericRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

    public async Task<T> GetByIdAsync(object id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _dbContext.SaveChangesAsync();
        await _dbContext.Entry(entity).ReloadAsync();
    }

    public async Task UpdateAsync(T entity)
    {
        var entry = _dbContext.Entry(entity);
        var key = entry.Metadata.FindPrimaryKey();
        var keyValues = key.Properties
            .Select(p => entry.Property(p.Name).CurrentValue)
            .ToArray();

        var existing = await _dbSet.FindAsync(keyValues);
        if (existing == null)
        {
            throw new KeyNotFoundException("Entity not found for update");
        }

        _dbContext.Entry(existing).CurrentValues.SetValues(entity);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(object id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _dbContext.SaveChangesAsync();
        }
    }
}
