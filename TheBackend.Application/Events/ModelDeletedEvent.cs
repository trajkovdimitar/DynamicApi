namespace TheBackend.Application.Events;

public record ModelDeletedEvent(string ModelName, object Id) : IEvent;
