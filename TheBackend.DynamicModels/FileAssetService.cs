using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
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
        private readonly ModelHistoryDbContext _dbContext; // Inject the static DbContext
        private readonly string _uploadPath;

        public FileAssetService(IWebHostEnvironment env, IConfiguration config, ILogger<FileAssetService> logger, ModelHistoryDbContext dbContext)
        {
            _env = env;
            _config = config;
            _logger = logger;
            _dbContext = dbContext;
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
            var relativePath = uniqueName;  // Store without leading slash

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

            // Save to DB
            var fileAsset = new FileAsset
            {
                Id = Guid.NewGuid(),
                FileName = metadata.FileName,
                Path = metadata.Path,
                ContentType = metadata.ContentType,
                Size = metadata.Size,
                UploadedAt = metadata.UploadedAt
            };
            _dbContext.FileAssets.Add(fileAsset);
            await _dbContext.SaveChangesAsync();

            metadata.Id = fileAsset.Id;  // Add Id to returned metadata

            _logger.LogInformation("File uploaded: {Path}", metadata.Path);
            return metadata;
        }

        public void DeleteFile(Guid id)
        {
            var fileToDelete = _dbContext.FileAssets.FirstOrDefault(f => f.Id == id);
            if (fileToDelete == null)
            {
                _logger.LogWarning("File not found for deletion: {Id}", id);
                return;
            }

            var fullPath = Path.Combine(_uploadPath, fileToDelete.Path);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("File deleted from disk: {Path}", fileToDelete.Path);
            }

            _dbContext.FileAssets.Remove(fileToDelete);
            _dbContext.SaveChanges();
            _logger.LogInformation("File deleted from DB: {Id}", id);
        }

        public async Task<List<FileAssetMetadata>> GetAllFilesAsync()
        {
            var files = await _dbContext.FileAssets.ToListAsync();
            return files.Select(f => new FileAssetMetadata
            {
                Id = f.Id,
                FileName = f.FileName,
                Path = f.Path,
                ContentType = f.ContentType,
                Size = f.Size,
                UploadedAt = f.UploadedAt
            }).ToList();
        }

        // Updated: Return a model instead of tuple
        public FileDetails? GetFileDetails(Guid id)
        {
            var file = _dbContext.FileAssets.FirstOrDefault(f => f.Id == id);
            if (file == null)
                return null;

            var fullPath = Path.Combine(_uploadPath, file.Path);
            return new FileDetails
            {
                FullPath = fullPath,
                ContentType = file.ContentType,
                FileName = file.FileName
            };
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