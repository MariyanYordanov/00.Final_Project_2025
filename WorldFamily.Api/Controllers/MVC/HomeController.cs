using Microsoft.AspNetCore.Mvc;
using WorldFamily.Api.Contracts;
using WorldFamily.Data.Models;
using WorldFamily.Data;
using Microsoft.EntityFrameworkCore;

namespace WorldFamily.Api.Controllers.Mvc
{
    public class HomeController : Controller
    {
        private readonly IFamilyService _familyService;
        private readonly AppDbContext _context;
        private readonly ILogger<HomeController> _logger;

        public HomeController(IFamilyService familyService, AppDbContext context, ILogger<HomeController> logger)
        {
            _familyService = familyService;
            _context = context;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                // Get featured families for homepage (recent public families)
                var featuredFamilies = await _context.Families
                    .Where(f => f.IsPublic)
                    .OrderByDescending(f => f.CreatedAt)
                    .Take(6)
                    .ToListAsync();
                ViewBag.FeaturedFamilies = featuredFamilies;
                
                // Get stats for homepage
                ViewBag.TotalFamilies = await _context.Families.CountAsync();
                ViewBag.TotalMembers = await _context.FamilyMembers.CountAsync();
                
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading homepage");
                ViewBag.ErrorMessage = "Unable to load homepage content.";
                return View();
            }
        }

        public IActionResult About()
        {
            ViewData["Title"] = "About World Family";
            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Title"] = "Contact Us";
            return View();
        }

        public IActionResult Privacy()
        {
            ViewData["Title"] = "Privacy Policy";
            return View();
        }

        public IActionResult Help()
        {
            ViewData["Title"] = "Help & FAQ";
            return View();
        }

        public IActionResult Features()
        {
            ViewData["Title"] = "Features";
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            ViewData["Title"] = "Error";
            return View();
        }
    }
}