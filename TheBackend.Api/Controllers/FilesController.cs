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

        public FilesController(IFileAssetService fileService)
        {
            _fileService = fileService;
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

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            try
            {
                _fileService.DeleteFile(id);
                return Ok(ApiResponse<string>.Ok("File deleted"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // Updated: Serve the file by ID (e.g., GET /api/files/0380ed1e-33fa-4674-b348-6f363188117e)
        [HttpGet("{id}")]
        public IActionResult GetFile(Guid id)
        {
            var details = _fileService.GetFileDetails(id);
            if (details == null)
                return NotFound(ApiResponse<string>.Fail("File not found"));

            return PhysicalFile(details.FullPath, details.ContentType, details.FileName);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFiles()
        {
            try
            {
                var files = await _fileService.GetAllFilesAsync();
                return Ok(ApiResponse<List<FileAssetMetadata>>.Ok(files));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}