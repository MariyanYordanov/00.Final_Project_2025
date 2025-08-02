using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WorldFamily.Api.Contracts;
using WorldFamily.Data.Models;

namespace WorldFamily.Api.Controllers.Mvc
{
    public class WebController : Controller
    {
        private readonly IFamilyService _familyService;
        private readonly IMemberService _memberService;
        private readonly IRelationshipService _relationshipService;
        private readonly ILogger<WebController> _logger;

        public WebController(
            IFamilyService familyService,
            IMemberService memberService,
            IRelationshipService relationshipService,
            ILogger<WebController> logger)
        {
            _familyService = familyService;
            _memberService = memberService;
            _relationshipService = relationshipService;
            _logger = logger;
        }

        // GET: /FamilyMvc
        public async Task<IActionResult> Index(string search = "", int page = 1)
        {
            ViewData["Title"] = "Семейства - World Family";
            
            try
            {
                var families = await _familyService.GetAllFamiliesAsync();
                
                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    families = families.Where(f => f.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                                                 f.Description.Contains(search, StringComparison.OrdinalIgnoreCase))
                                     .ToList();
                }
                
                // Pagination
                const int pageSize = 9;
                var totalCount = families.Count();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                
                var pagedFamilies = families.Skip((page - 1) * pageSize)
                                          .Take(pageSize)
                                          .ToList();
                
                ViewBag.Families = pagedFamilies;
                ViewBag.CurrentPage = page;
                ViewBag.TotalPages = totalPages;
                ViewBag.SearchTerm = search;
                ViewBag.TotalCount = totalCount;
                
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading families");
                TempData["ErrorMessage"] = "Възникна грешка при зареждането на семействата.";
                ViewBag.Families = new List<Family>();
                return View();
            }
        }

        // GET: /FamilyMvc/Details/5
        public async Task<IActionResult> Details(int id)
        {
            try
            {
                var family = await _familyService.GetFamilyByIdAsync(id);
                if (family == null)
                {
                    return NotFound();
                }
                
                ViewData["Title"] = $"{family.Name} - World Family";
                
                // Get family members
                var members = await _memberService.GetFamilyMembersAsync(id);
                ViewBag.Members = members;
                
                return View(family);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading family details for ID: {FamilyId}", id);
                TempData["ErrorMessage"] = "Възникна грешка при зареждането на семейството.";
                return RedirectToAction(nameof(Index));
            }
        }

        // GET: /FamilyMvc/Create
        [Authorize]
        public IActionResult Create()
        {
            ViewData["Title"] = "Създай семейство - World Family";
            return View();
        }

        // POST: /FamilyMvc/Create
        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Family family)
        {
            ViewData["Title"] = "Създай семейство - World Family";
            
            if (ModelState.IsValid)
            {
                try
                {
                    // Get current user ID
                    var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    
                    family.CreatedByUserId = userId;
                    family.CreatedAt = DateTime.UtcNow;
                    
                    var result = await _familyService.CreateFamilyAsync(family);
                    
                    if (result != null)
                    {
                        TempData["SuccessMessage"] = "Семейството беше създадено успешно!";
                        return RedirectToAction(nameof(Details), new { id = result.Id });
                    }
                    else
                    {
                        ModelState.AddModelError("", "Възникна грешка при създаването на семейството.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error creating family");
                    ModelState.AddModelError("", "Възникна грешка при създаването на семейството.");
                }
            }
            
            return View(family);
        }

        // GET: /FamilyMvc/Tree/5
        public async Task<IActionResult> Tree(int id)
        {
            try
            {
                var family = await _familyService.GetFamilyByIdAsync(id);
                if (family == null)
                {
                    return NotFound();
                }
                
                ViewData["Title"] = $"Родословно дърво - {family.Name}";
                
                // Get family members and relationships for tree visualization
                var members = await _memberService.GetFamilyMembersAsync(id);
                var relationships = await _relationshipService.GetRelationshipsByFamilyAsync(id);
                
                ViewBag.Members = members;
                ViewBag.Relationships = relationships;
                
                return View(family);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading family tree for ID: {FamilyId}", id);
                TempData["ErrorMessage"] = "Възникна грешка при зареждането на родословното дърво.";
                return RedirectToAction(nameof(Details), new { id });
            }
        }
    }
}