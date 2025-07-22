using Microsoft.EntityFrameworkCore;
using TheBackend.Application.Repositories;
using TheBackend.Application.Events;

namespace TheBackend.Infrastructure.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    private readonly DbContext _dbContext;
    private readonly DbSet<T> _dbSet;
    private readonly EventBus _eventBus;

    public GenericRepository(DbContext dbContext, EventBus eventBus)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<T>();
        _eventBus = eventBus;
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
        await _eventBus.PublishAsync(new ModelCreatedEvent(typeof(T).Name, entity));
    }

    public async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _dbContext.SaveChangesAsync();
        await _eventBus.PublishAsync(new ModelUpdatedEvent(typeof(T).Name, entity));
    }

    public async Task DeleteAsync(object id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _dbContext.SaveChangesAsync();
            await _eventBus.PublishAsync(new ModelDeletedEvent(typeof(T).Name, id));
        }
    }
}
