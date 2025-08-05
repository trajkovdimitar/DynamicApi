using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TheBackend.Domain.Models
{
    public class FileUploadRequest
    {
        public IFormFile File { get; set; } = null!;
        public string? ModelName { get; set; }
        public string? EntityId { get; set; }
        public List<string>? AllowedExtensions { get; set; }
    }
}
