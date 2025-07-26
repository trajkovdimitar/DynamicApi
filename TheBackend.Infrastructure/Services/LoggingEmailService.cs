using Microsoft.Extensions.Logging;
using TheBackend.Application.Services;

namespace TheBackend.Infrastructure.Services;

public class LoggingEmailService : IEmailService
{
    private readonly ILogger<LoggingEmailService> _logger;

    public LoggingEmailService(ILogger<LoggingEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body)
    {
        _logger.LogInformation("Sending email to {To} with subject {Subject}", to, subject);
        // In real implementation, send email via SMTP or API
        return Task.CompletedTask;
    }
}
