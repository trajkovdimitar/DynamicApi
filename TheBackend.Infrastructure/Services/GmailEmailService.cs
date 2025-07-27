using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TheBackend.Application.Services;

namespace TheBackend.Infrastructure.Services;

public class GmailEmailService : IEmailService
{
    private readonly ILogger<GmailEmailService> _logger;
    private readonly IConfiguration _config;

    public GmailEmailService(ILogger<GmailEmailService> logger, IConfiguration config)
    {
        _logger = logger;
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var email = _config["Gmail:Email"];
        var password = _config["Gmail:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning("Gmail credentials not configured. Unable to send email.");
            return;
        }

        using var client = new SmtpClient("smtp.gmail.com", 587)
        {
            Credentials = new NetworkCredential(email, password),
            EnableSsl = true
        };

        using var message = new MailMessage(email, to, subject, body);
        await client.SendMailAsync(message);
        _logger.LogInformation("Email sent to {To} via Gmail", to);
    }
}

