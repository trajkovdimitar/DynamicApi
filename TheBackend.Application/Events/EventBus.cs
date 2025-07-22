using System.Collections.Concurrent;

namespace TheBackend.Application.Events;

public class EventBus
{
    private readonly ConcurrentDictionary<Type, List<Func<IEvent, Task>>> _handlers = new();

    public void RegisterHandler<TEvent>(Func<TEvent, Task> handler) where TEvent : IEvent
    {
        var handlers = _handlers.GetOrAdd(typeof(TEvent), _ => new List<Func<IEvent, Task>>());
        lock (handlers)
        {
            handlers.Add(evt => handler((TEvent)evt));
        }
    }

    public async Task PublishAsync<TEvent>(TEvent @event) where TEvent : IEvent
    {
        if (_handlers.TryGetValue(typeof(TEvent), out var handlers))
        {
            List<Func<IEvent, Task>> copy;
            lock (handlers)
            {
                copy = handlers.ToList();
            }
            foreach (var handler in copy)
            {
                await handler(@event);
            }
        }
    }
}
