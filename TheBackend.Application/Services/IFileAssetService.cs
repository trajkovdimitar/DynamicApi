using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TheBackend.Domain.Models;

namespace TheBackend.Application.Services
{
    public interface IFileAssetService
    {
        Task<FileAssetMetadata> UploadFileAsync(FileUploadRequest request);
        void DeleteFile(string relativePath);
    }
}
