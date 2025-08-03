using Microsoft.AspNetCore.Mvc;
using MyFamilyTreeNet.Api.Contracts;
using MyFamilyTreeNet.Data.Models;
using Microsoft.AspNetCore.Authorization;

namespace MyFamilyTreeNet.Api.Controllers.Mvc
{
    public class HomeController : Controller
    {
        private readonly IFamilyService _familyService;
        private readonly ILogger<HomeController> _logger;

        public HomeController(IFamilyService familyService, ILogger<HomeController> logger)
        {
            _familyService = familyService;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            ViewData["Title"] = "Начало - World Family";
            
            try
            {
                // Get recent families for homepage
                var recentFamilies = await _familyService.GetAllFamiliesAsync();
                var featuredFamilies = recentFamilies.Take(6).ToList();
                
                ViewBag.FeaturedFamilies = featuredFamilies;
                ViewBag.TotalFamilies = recentFamilies.Count();
                
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading homepage data");
                ViewBag.FeaturedFamilies = new List<Family>();
                ViewBag.TotalFamilies = 0;
                return View();
            }
        }

        public IActionResult About()
        {
            ViewData["Title"] = "За нас - World Family";
            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Title"] = "Контакти - World Family";
            return View();
        }

        public IActionResult Privacy()
        {
            ViewData["Title"] = "Поверителност - World Family";
            return View();
        }

        public IActionResult Help()
        {
            ViewData["Title"] = "Помощ - World Family";
            return View();
        }

        [Authorize]
        public IActionResult Dashboard()
        {
            ViewData["Title"] = "Моят профил - World Family";
            return View();
        }
    }
}