namespace TheBackend.Application.Events;

public record ModelUpdatedEvent(string ModelName, object Entity) : IEvent;
