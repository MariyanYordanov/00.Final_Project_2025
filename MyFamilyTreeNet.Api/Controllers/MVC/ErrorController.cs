using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Diagnostics;
using System.Diagnostics;

namespace MyFamilyTreeNet.Api.Controllers.Mvc
{
    public class ErrorController : Controller
    {
        private readonly ILogger<ErrorController> _logger;
        private readonly IWebHostEnvironment _environment;

        public ErrorController(ILogger<ErrorController> logger, IWebHostEnvironment environment)
        {
            _logger = logger;
            _environment = environment;
        }

        [Route("Error")]
        [Route("Error/Index")]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Index()
        {
            var requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            var exceptionFeature = HttpContext.Features.Get<IExceptionHandlerFeature>();
            
            if (exceptionFeature != null)
            {
                var exception = exceptionFeature.Error;
                var path = exceptionFeature.Path;
                
                // Log the error
                _logger.LogError(exception, 
                    "Unhandled exception occurred. RequestId: {RequestId}, Path: {Path}", 
                    requestId, path);
                
                ViewBag.RequestId = requestId;
                ViewBag.Path = path;
                ViewBag.ShowDetails = _environment.IsDevelopment();
                
                if (_environment.IsDevelopment())
                {
                    ViewBag.ExceptionMessage = exception.Message;
                    ViewBag.ExceptionType = exception.GetType().Name;
                    ViewBag.StackTrace = exception.StackTrace;
                }
            }

            return View("InternalServerError");
        }

        [Route("Error/404")]
        [Route("Error/NotFound")]
        public new IActionResult NotFound()
        {
            Response.StatusCode = 404;
            ViewData["Title"] = "Страницата не е намерена - World Family";
            
            var requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            var originalPath = HttpContext.Request.Path.Value;
            var queryString = HttpContext.Request.QueryString.Value;
            
            // Log 404 errors for monitoring
            _logger.LogWarning(
                "404 Not Found. RequestId: {RequestId}, Path: {Path}, QueryString: {QueryString}",
                requestId, originalPath, queryString);
            
            ViewBag.RequestId = requestId;
            ViewBag.OriginalPath = originalPath + queryString;
            ViewBag.Timestamp = DateTime.UtcNow;
            
            return View();
        }

        [Route("Error/500")]
        [Route("Error/InternalServerError")]
        public IActionResult InternalServerError()
        {
            Response.StatusCode = 500;
            ViewData["Title"] = "Възникна грешка - World Family";
            
            var requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            
            ViewBag.RequestId = requestId;
            ViewBag.Timestamp = DateTime.UtcNow;
            
            return View();
        }

        [Route("Error/403")]
        [Route("Error/Forbidden")]
        public IActionResult Forbidden()
        {
            Response.StatusCode = 403;
            ViewData["Title"] = "Достъпът е забранен - World Family";
            
            var requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            
            _logger.LogWarning(
                "403 Forbidden. RequestId: {RequestId}, Path: {Path}, User: {User}",
                requestId, HttpContext.Request.Path, User.Identity?.Name ?? "Anonymous");
            
            ViewBag.RequestId = requestId;
            
            return View();
        }
    }
}