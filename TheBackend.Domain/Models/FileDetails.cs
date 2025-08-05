using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TheBackend.Domain.Models
{
    public class FileDetails
    {
        public string FullPath { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
    }
}
