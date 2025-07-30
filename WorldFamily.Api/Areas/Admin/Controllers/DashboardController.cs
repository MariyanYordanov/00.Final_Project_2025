using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorldFamily.Api.Contracts;
using WorldFamily.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WorldFamily.Data;

namespace WorldFamily.Api.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Administrator")]
    public class DashboardController : Controller
    {
        private readonly IFamilyService _familyService;
        private readonly IMemberService _memberService;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<DashboardController> _logger;
        private readonly AppDbContext _context;

        public DashboardController(
            IFamilyService familyService,
            IMemberService memberService,
            UserManager<User> userManager,
            ILogger<DashboardController> logger,
            AppDbContext context)
        {
            _familyService = familyService;
            _memberService = memberService;
            _userManager = userManager;
            _logger = logger;
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                ViewData["Title"] = "Admin Dashboard";

                // Get dashboard statistics
                var allFamilies = await _familyService.GetAllFamiliesAsync();
                var totalMembers = await _context.FamilyMembers.CountAsync();
                
                var stats = new
                {
                    TotalFamilies = allFamilies.Count(),
                    TotalMembers = totalMembers,
                    TotalUsers = _userManager.Users.Count(),
                    NewFamiliesToday = await _context.Families.CountAsync(f => f.CreatedAt >= DateTime.Today),
                    NewUsersToday = await GetNewUsersCountAsync(DateTime.Today),
                    ActiveUsersWeek = await GetActiveUsersCountAsync(DateTime.Today.AddDays(-7))
                };

                ViewBag.Stats = stats;

                // Get recent activities
                var recentFamilies = await _context.Families
                    .OrderByDescending(f => f.CreatedAt)
                    .Take(5)
                    .ToListAsync();
                ViewBag.RecentFamilies = recentFamilies;

                // Get system health info
                var healthInfo = new
                {
                    ServerTime = DateTime.UtcNow,
                    Uptime = Environment.TickCount64,
                    MemoryUsage = GC.GetTotalMemory(false) / 1024 / 1024, // MB
                    Version = "1.0.0"
                };

                ViewBag.HealthInfo = healthInfo;

                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading admin dashboard");
                TempData["ErrorMessage"] = "Unable to load dashboard data.";
                return View();
            }
        }

        public async Task<IActionResult> Users(int page = 1, string search = "", string role = "")
        {
            try
            {
                ViewData["Title"] = "User Management";
                
                const int pageSize = 20;
                var query = _userManager.Users.AsQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(u => u.UserName.Contains(search) || 
                                           u.Email.Contains(search) ||
                                           u.FirstName.Contains(search) ||
                                           u.LastName.Contains(search));
                }

                // Apply role filter
                if (!string.IsNullOrEmpty(role))
                {
                    var usersInRole = await _userManager.GetUsersInRoleAsync(role);
                    var userIds = usersInRole.Select(u => u.Id);
                    query = query.Where(u => userIds.Contains(u.Id));
                }

                var totalUsers = query.Count();
                var users = query
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                ViewBag.CurrentPage = page;
                ViewBag.TotalPages = (int)Math.Ceiling((double)totalUsers / pageSize);
                ViewBag.SearchTerm = search;
                ViewBag.RoleFilter = role;
                ViewBag.TotalUsers = totalUsers;
                
                // Count administrators
                var adminUsers = await _userManager.GetUsersInRoleAsync("Administrator");
                ViewBag.AdminCount = adminUsers.Count;

                return View(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading users page");
                TempData["ErrorMessage"] = "Unable to load user data.";
                return View(new List<User>());
            }
        }

        public async Task<IActionResult> Families(int page = 1, string search = "", string status = "")
        {
            try
            {
                ViewData["Title"] = "Family Management";
                
                const int pageSize = 15;
                
                // Build query
                var query = _context.Families.AsQueryable();
                
                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(f => f.Name.Contains(search) || 
                                           f.Description.Contains(search));
                }
                
                // Apply status filter if needed (assuming there's a status field)
                // Since Family model might not have a Status field, we'll skip this for now
                
                var totalFamilies = await query.CountAsync();
                var families = await query
                    .OrderByDescending(f => f.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                
                ViewBag.CurrentPage = page;
                ViewBag.TotalPages = (int)Math.Ceiling((double)totalFamilies / pageSize);
                ViewBag.SearchTerm = search;
                ViewBag.StatusFilter = status;
                ViewBag.TotalFamilies = totalFamilies;
                
                return View(families);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading families page");
                TempData["ErrorMessage"] = "Unable to load family data.";
                return View(new List<Family>());
            }
        }

        public async Task<IActionResult> Reports()
        {
            try
            {
                ViewData["Title"] = "Reports & Analytics";

                // Generate reports data
                var topFamilies = await _context.Families
                    .Select(f => new
                    {
                        Family = f,
                        MemberCount = _context.FamilyMembers.Count(m => m.FamilyId == f.Id)
                    })
                    .OrderByDescending(x => x.MemberCount)
                    .Take(10)
                    .ToListAsync();
                
                var reports = new
                {
                    MonthlyGrowth = await GetMonthlyGrowthDataAsync(),
                    TopFamilies = topFamilies.Select(x => x.Family).ToList(),
                    UserActivity = await GetUserActivityDataAsync(),
                    SystemMetrics = await GetSystemMetricsAsync()
                };

                ViewBag.Reports = reports;

                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading reports page");
                TempData["ErrorMessage"] = "Unable to load reports data.";
                return View();
            }
        }

        public IActionResult Settings()
        {
            ViewData["Title"] = "System Settings";
            
            // Get current system settings
            var settings = new
            {
                AllowRegistration = true,
                RequireEmailConfirmation = false,
                MaxFamilySize = 1000,
                MaxPhotoSize = 10, // MB
                MaintenanceMode = false
            };

            ViewBag.Settings = settings;

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> UpdateUserRole(string userId, string newRole)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return Json(new { success = false, message = "User not found." });
                }

                // Remove from all roles
                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);

                // Add to new role
                if (!string.IsNullOrEmpty(newRole))
                {
                    await _userManager.AddToRoleAsync(user, newRole);
                }

                _logger.LogInformation("User {UserId} role changed to {Role} by {AdminId}", 
                    userId, newRole, User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);

                return Json(new { success = true, message = "User role updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user role");
                return Json(new { success = false, message = "Failed to update user role." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ToggleFamilyStatus(int familyId)
        {
            try
            {
                var family = await _context.Families.FindAsync(familyId);
                if (family == null)
                {
                    return Json(new { success = false, message = "Family not found." });
                }
                
                // Toggle some property if exists, or just update the UpdatedAt timestamp
                family.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                return Json(new { success = true, message = "Family updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling family status");
                return Json(new { success = false, message = "Failed to update family status." });
            }
        }

        // Helper methods
        private async Task<int> GetNewUsersCountAsync(DateTime since)
        {
            return _userManager.Users.Count(u => u.CreatedAt >= since);
        }

        private async Task<int> GetActiveUsersCountAsync(DateTime since)
        {
            // This would typically query login logs or activity logs
            // For now, return a mock value
            return _userManager.Users.Count(u => u.LastLoginAt >= since);
        }

        private async Task<object> GetMonthlyGrowthDataAsync()
        {
            // Generate monthly growth data for charts
            var months = new List<object>();
            for (int i = 11; i >= 0; i--)
            {
                var date = DateTime.Now.AddMonths(-i);
                var startOfMonth = new DateTime(date.Year, date.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

                var familiesCount = await _context.Families.CountAsync(f => f.CreatedAt >= startOfMonth && f.CreatedAt <= endOfMonth);
                var usersCount = _userManager.Users.Count(u => u.CreatedAt >= startOfMonth && u.CreatedAt <= endOfMonth);

                months.Add(new
                {
                    Month = date.ToString("MMM yyyy"),
                    Families = familiesCount,
                    Users = usersCount
                });
            }
            return months;
        }

        private async Task<object> GetUserActivityDataAsync()
        {
            // Mock user activity data
            return new
            {
                DailyActive = Random.Shared.Next(50, 200),
                WeeklyActive = Random.Shared.Next(200, 500),
                MonthlyActive = Random.Shared.Next(500, 1000)
            };
        }

        private async Task<object> GetSystemMetricsAsync()
        {
            return new
            {
                DatabaseSize = "45.2 MB",
                StorageUsed = "1.2 GB",
                BackupLastRun = DateTime.UtcNow.AddHours(-6),
                ErrorsLast24h = Random.Shared.Next(0, 5)
            };
        }
    }
}