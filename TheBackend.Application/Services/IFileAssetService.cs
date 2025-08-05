using TheBackend.Domain.Models;

namespace TheBackend.Application.Services
{
    public interface IFileAssetService
    {
        Task<FileAssetMetadata> UploadFileAsync(FileUploadRequest request);
        void DeleteFile(Guid id);
        Task<List<FileAssetMetadata>> GetAllFilesAsync();
        FileDetails? GetFileDetails(Guid id);  // Updated to return model
    }
}
