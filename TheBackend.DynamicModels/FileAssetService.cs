using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using TheBackend.Application.Services;
using TheBackend.Domain.Models;
using TheBackend.DynamicModels;

namespace TheBackend.Services
{
    public class FileAssetService : IFileAssetService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;
        private readonly ILogger<FileAssetService> _logger;
        private readonly DynamicDbContextService _dbContextService;
        private readonly string _uploadPath;

        public FileAssetService(IWebHostEnvironment env, IConfiguration config, ILogger<FileAssetService> logger, DynamicDbContextService dbContextService)
        {
            _env = env;
            _config = config;
            _logger = logger;
            _dbContextService = dbContextService;
            var basePath = _env.WebRootPath ?? _env.ContentRootPath;
            _uploadPath = _config["UploadPath"] ?? Path.Combine(basePath, "uploads");
            Directory.CreateDirectory(_uploadPath);
        }

        public async Task<FileAssetMetadata> UploadFileAsync(FileUploadRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                throw new ArgumentException("No file uploaded");

            if (request.AllowedExtensions?.Count > 0)
            {
                var ext = Path.GetExtension(request.File.FileName).ToLowerInvariant();
                if (!request.AllowedExtensions.Contains(ext))
                    throw new InvalidOperationException($"Invalid file extension: {ext}");
            }

            var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(request.File.FileName)}";
            var filePath = Path.Combine(_uploadPath, uniqueName);
            var relativePath = $"/uploads/{uniqueName}";

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            if (IsImage(request.File.ContentType))
            {
                await OptimizeImageAsync(filePath);
            }

            var metadata = new FileAssetMetadata
            {
                FileName = request.File.FileName,
                Path = relativePath,
                ContentType = request.File.ContentType,
                Size = request.File.Length,
                UploadedAt = DateTime.UtcNow
            };

            using var db = _dbContextService.GetDbContext();
            var fileEntityType = _dbContextService.GetModelType("FileAsset");
            if (fileEntityType != null)
            {
                var fileEntity = Activator.CreateInstance(fileEntityType);
                fileEntityType.GetProperty("Id")?.SetValue(fileEntity, Guid.NewGuid());
                fileEntityType.GetProperty("FileName")?.SetValue(fileEntity, metadata.FileName);
                fileEntityType.GetProperty("Path")?.SetValue(fileEntity, metadata.Path);
                fileEntityType.GetProperty("ContentType")?.SetValue(fileEntity, metadata.ContentType);
                fileEntityType.GetProperty("Size")?.SetValue(fileEntity, metadata.Size);
                fileEntityType.GetProperty("UploadedAt")?.SetValue(fileEntity, metadata.UploadedAt);
                fileEntityType.GetProperty("AssociatedModel")?.SetValue(fileEntity, request.ModelName);
                fileEntityType.GetProperty("AssociatedEntityId")?.SetValue(fileEntity, request.EntityId);

                db.Add(fileEntity);
                await db.SaveChangesAsync();
            }

            _logger.LogInformation("File uploaded: {Path}", metadata.Path);
            return metadata;
        }

        public void DeleteFile(string relativePath)
        {
            var fullPath = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, relativePath.TrimStart('/'));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("File deleted: {Path}", relativePath);
            }

            using var db = _dbContextService.GetDbContext();
            var fileEntityType = _dbContextService.GetModelType("FileAsset");
            if (fileEntityType != null)
            {
                // Implement dynamic query to find entity by Path and remove
                // Example using reflection or EF dynamic LINQ (add NuGet: System.Linq.Dynamic.Core if needed)
                // For simplicity, assume a method to handle dynamic delete
            }
        }

        private bool IsImage(string contentType) => contentType?.StartsWith("image/") ?? false;

        private async Task OptimizeImageAsync(string filePath)
        {
            using var image = await Image.LoadAsync(filePath);
            image.Mutate(x => x.Resize(new ResizeOptions { Size = new Size(1024, 0), Mode = ResizeMode.Max }));
            await image.SaveAsync(filePath);
        }
    }
}