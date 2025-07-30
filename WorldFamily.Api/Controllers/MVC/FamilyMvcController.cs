using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorldFamily.Api.Contracts;
using WorldFamily.Data.Models;
using WorldFamily.Data;
using Microsoft.EntityFrameworkCore;

namespace WorldFamily.Api.Controllers.Mvc
{
    public class FamilyMvcController : Controller
    {
        private readonly IFamilyService _familyService;
        private readonly IMemberService _memberService;
        private readonly AppDbContext _context;
        private readonly ILogger<FamilyMvcController> _logger;

        public FamilyMvcController(
            IFamilyService familyService, 
            IMemberService memberService,
            AppDbContext context,
            ILogger<FamilyMvcController> logger)
        {
            _familyService = familyService;
            _memberService = memberService;
            _context = context;
            _logger = logger;
        }

        // GET: /FamilyMvc/Browse
        public async Task<IActionResult> Browse(int page = 1, string search = "", string sort = "name")
        {
            try
            {
                ViewData["Title"] = "Browse Families";
                
                const int pageSize = 12;
                // Get paginated families with direct query
                var query = _context.Families.Where(f => f.IsPublic);
                
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(f => f.Name.Contains(search) || f.Description.Contains(search));
                }
                
                query = sort switch
                {
                    "date" => query.OrderByDescending(f => f.CreatedAt),
                    "members" => query.OrderByDescending(f => f.FamilyMembers.Count),
                    _ => query.OrderBy(f => f.Name)
                };
                
                var totalFamilies = await query.CountAsync();
                var families = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                
                ViewBag.CurrentPage = page;
                ViewBag.TotalPages = (int)Math.Ceiling((double)totalFamilies / pageSize);
                ViewBag.SearchTerm = search;
                ViewBag.SortOrder = sort;
                
                return View(families);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error browsing families");
                TempData["ErrorMessage"] = "Unable to load families.";
                return View(new List<Family>());
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

                ViewData["Title"] = $"{family.Name} Family";
                
                // Get family members
                var members = await _memberService.GetFamilyMembersAsync(id);
                ViewBag.Members = members;
                
                // Get family statistics
                ViewBag.MemberCount = members.Count();
                // Simple generation count (could be improved with actual family tree logic)
                ViewBag.GenerationCount = Math.Max(1, members.Count() / 3);
                
                return View(family);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading family details for ID {FamilyId}", id);
                TempData["ErrorMessage"] = "Unable to load family details.";
                return RedirectToAction(nameof(Browse));
            }
        }

        // GET: /FamilyMvc/Gallery/5
        public async Task<IActionResult> Gallery(int id)
        {
            try
            {
                var family = await _familyService.GetFamilyByIdAsync(id);
                if (family == null)
                {
                    return NotFound();
                }

                ViewData["Title"] = $"{family.Name} - Photo Gallery";
                ViewBag.Family = family;
                
                // Get family photos (this would be implemented in PhotoService)
                // var photos = await _photoService.GetFamilyPhotosAsync(id);
                // ViewBag.Photos = photos;
                
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading family gallery for ID {FamilyId}", id);
                TempData["ErrorMessage"] = "Unable to load family gallery.";
                return RedirectToAction(nameof(Details), new { id });
            }
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

                ViewData["Title"] = $"{family.Name} - Family Tree";
                ViewBag.Family = family;
                
                // Get family tree data
                var members = await _memberService.GetFamilyMembersAsync(id);
                // Get relationships from database directly
                var relationships = await _context.Relationships
                    .Where(r => members.Any(m => m.Id == r.PrimaryMemberId) ||
                               members.Any(m => m.Id == r.RelatedMemberId))
                    .ToListAsync();
                
                ViewBag.Members = members;
                ViewBag.Relationships = relationships;
                
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading family tree for ID {FamilyId}", id);
                TempData["ErrorMessage"] = "Unable to load family tree.";
                return RedirectToAction(nameof(Details), new { id });
            }
        }

        // GET: /FamilyMvc/Create
        [Authorize]
        public IActionResult Create()
        {
            ViewData["Title"] = "Create New Family";
            return View();
        }

        // POST: /FamilyMvc/Create
        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Family family)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    family.CreatedByUserId = userId;
                    family.CreatedAt = DateTime.UtcNow;
                    
                    var createdFamily = await _familyService.CreateFamilyAsync(family);
                    TempData["SuccessMessage"] = "Family created successfully!";
                    return RedirectToAction(nameof(Details), new { id = createdFamily.Id });
                }
                
                return View(family);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating family");
                TempData["ErrorMessage"] = "Unable to create family. Please try again.";
                return View(family);
            }
        }
    }
}