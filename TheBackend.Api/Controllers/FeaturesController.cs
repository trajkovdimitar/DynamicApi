using Microsoft.AspNetCore.Mvc;

namespace TheBackend.Api.Controllers
{
    [ApiController]
    [Route("elsa/api/v1/features")]
    public class FeaturesController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            // Return an empty feature list so Elsa Studio loads without errors.
            return Ok(new { features = new string[0] });
        }
    }
}
