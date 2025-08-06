using Microsoft.AspNetCore.Mvc;
using TheBackend.Application.Services;

namespace TheBackend.Api.Controllers
{
    [ApiController]
    [Route("files")]
    public class PublicFilesController : ControllerBase
    {
        private readonly IFileAssetService _fileService;

        public PublicFilesController(IFileAssetService fileService)
        {
            _fileService = fileService;
        }

        // GET /files/{id}
        [HttpGet("{id:guid}")]
        public IActionResult GetFileById(Guid id)
        {
            var details = _fileService.GetFileDetails(id);
            if (details == null)
                return NotFound("File not found");

            return PhysicalFile(details.FullPath, details.ContentType, details.FileName);
        }
    }
}
