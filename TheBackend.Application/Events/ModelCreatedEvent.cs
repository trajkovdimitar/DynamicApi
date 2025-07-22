namespace TheBackend.Application.Events;

public record ModelCreatedEvent(string ModelName, object Entity) : IEvent;
