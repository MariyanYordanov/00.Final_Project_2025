using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Diagnostics;
using System.Diagnostics;

namespace WorldFamily.Api.Controllers.Mvc
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
                
                // In production, don't expose detailed error information
                if (!_environment.IsDevelopment())
                {
                    ViewBag.ShowDetails = false;
                }
                else
                {
                    ViewBag.ShowDetails = true;
                    ViewBag.ExceptionMessage = exception.Message;
                    ViewBag.ExceptionType = exception.GetType().Name;
                    ViewBag.StackTrace = exception.StackTrace;
                }
                
                ViewBag.RequestId = requestId;
                ViewBag.Path = path;
            }

            return View("InternalServerError");
        }

        [Route("Error/404")]
        [Route("Error/NotFound")]
        public new IActionResult NotFound()
        {
            Response.StatusCode = 404;
            
            var requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            var originalPath = HttpContext.Request.Path.Value;
            var queryString = HttpContext.Request.QueryString.Value;
            
            // Log 404 errors for monitoring
            _logger.LogWarning(
                "404 Not Found. RequestId: {RequestId}, Path: {Path}, QueryString: {QueryString}, UserAgent: {UserAgent}",
                requestId, originalPath, queryString, HttpContext.Request.Headers.UserAgent);
            
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
            
            var requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            
            _logger.LogWarning(
                "403 Forbidden. RequestId: {RequestId}, Path: {Path}, User: {User}",
                requestId, HttpContext.Request.Path, User.Identity?.Name ?? "Anonymous");
            
            ViewBag.RequestId = requestId;
            
            return View();
        }

        [HttpPost]
        [Route("Error/Report")]
        public async Task<IActionResult> ReportError([FromBody] ErrorReportModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    // Log the user-reported error
                    _logger.LogInformation(
                        "User reported error. Email: {Email}, URL: {Url}, Description: {Description}, Type: {ErrorType}",
                        model.Email, model.Url, model.Description, model.ErrorType);
                    
                    // In a real application, you might:
                    // 1. Save to database
                    // 2. Send to external error tracking service (Sentry, Bugsnag, etc.)
                    // 3. Send notification email to support team
                    // 4. Add to support ticket system
                    
                    // For now, we'll just return success
                    return Json(new { success = true, message = "Error report submitted successfully." });
                }
                
                return Json(new { success = false, message = "Invalid error report data." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process error report");
                return Json(new { success = false, message = "Failed to submit error report." });
            }
        }

        [HttpPost]
        [Route("api/error-notifications")]
        public async Task<IActionResult> SubscribeToErrorNotifications([FromBody] ErrorNotificationModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, message = "Invalid email address." });
                }

                // Log the notification subscription
                _logger.LogInformation(
                    "User subscribed to error notifications. Email: {Email}, ErrorType: {ErrorType}, URL: {Url}",
                    model.Email, model.ErrorType, model.Url);

                // In a real application, you would:
                // 1. Store the email in a database table for notifications
                // 2. Send confirmation email
                // 3. Set up monitoring to notify when the error is resolved

                return Json(new { success = true, message = "Subscribed to notifications successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to subscribe to error notifications");
                return Json(new { success = false, message = "Failed to subscribe to notifications." });
            }
        }

        [Route("Error/Test404")]
        public IActionResult Test404()
        {
            // This is a test endpoint to trigger a 404 error for testing purposes
            // Only available in development
            if (!_environment.IsDevelopment())
            {
                return NotFound();
            }
            
            return NotFound();
        }

        [Route("Error/Test500")]
        public IActionResult Test500()
        {
            // This is a test endpoint to trigger a 500 error for testing purposes
            // Only available in development
            if (!_environment.IsDevelopment())
            {
                return NotFound();
            }
            
            throw new InvalidOperationException("This is a test exception for error handling.");
        }
    }

    // Models for error reporting
    public class ErrorReportModel
    {
        public string Email { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ErrorType { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ErrorNotificationModel
    {
        public string Email { get; set; } = string.Empty;
        public string ErrorType { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}