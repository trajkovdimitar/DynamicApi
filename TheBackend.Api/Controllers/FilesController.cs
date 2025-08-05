using Microsoft.AspNetCore.Mvc;
using TheBackend.Application.Services;
using TheBackend.Domain.Models;

namespace TheBackend.Api.Controllers
{
    [ApiController]
    [Route("api/files")]
    public class FilesController : ControllerBase
    {
        private readonly IFileAssetService _fileService;
        private readonly string _uploadPath;  // Inject or resolve path

        public FilesController(IFileAssetService fileService)
        {
            _fileService = fileService;
            // Assume _uploadPath is injected or from config; for simplicity, hardcode or resolve here
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");  // Adjust as per your setup
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] FileUploadRequest request)
        {
            try
            {
                var metadata = await _fileService.UploadFileAsync(request);
                return Ok(ApiResponse<FileAssetMetadata>.Ok(metadata));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpDelete("{path}")]
        public IActionResult Delete(string path)
        {
            try
            {
                _fileService.DeleteFile(path);
                return Ok(ApiResponse<string>.Ok("File deleted"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // New: Serve the image (e.g., GET /api/files/0380ed1e-33fa-4674-b348-6f363188117e.png)
        [HttpGet("{fileName}")]
        public IActionResult GetFile(string fileName)
        {
            var fullPath = Path.Combine(_uploadPath, fileName);
            if (!System.IO.File.Exists(fullPath)) 
                return NotFound(ApiResponse<string>.Fail("File not found"));

            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            var contentType = extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                _ => "application/octet-stream"  // Fallback for other files
            };

            return PhysicalFile(fullPath, contentType, fileName);
        }
    }
}