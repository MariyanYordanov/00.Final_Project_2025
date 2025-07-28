using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorldFamily.Data;
using WorldFamily.Data.Models;
using WorldFamily.Api.DTOs;

namespace WorldFamily.Api.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Route("api/[area]/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrator")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(
            AppDbContext context,
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = new
            {
                TotalUsers = await _userManager.Users.CountAsync(),
                TotalFamilies = await _context.Families.CountAsync(),
                TotalMembers = await _context.FamilyMembers.CountAsync(),
                TotalPhotos = await _context.Photos.CountAsync(),
                TotalStories = await _context.Stories.CountAsync(),
                TotalComments = await _context.Comments.CountAsync(),
                RecentUsers = await _userManager.Users
                    .OrderByDescending(u => u.CreatedAt)
                    .Take(5)
                    .Select(u => new { u.Id, u.Email, u.FirstName, u.LastName, u.CreatedAt })
                    .ToListAsync(),
                RecentFamilies = await _context.Families
                    .OrderByDescending(f => f.CreatedAt)
                    .Take(5)
                    .Select(f => new { f.Id, f.Name, f.CreatedAt, MemberCount = f.FamilyMembers.Count })
                    .ToListAsync()
            };

            return Ok(stats);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var users = await _userManager.Users
                .OrderBy(u => u.Email)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.CreatedAt,
                    u.EmailConfirmed,
                    u.LockoutEnd
                })
                .ToListAsync();

            var totalUsers = await _userManager.Users.CountAsync();

            var result = new
            {
                users,
                totalCount = totalUsers,
                totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize),
                currentPage = page
            };

            return Ok(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var roles = await _userManager.GetRolesAsync(user);
            var families = await _context.Families
                .Where(f => f.CreatedByUserId == id)
                .Select(f => new { f.Id, f.Name })
                .ToListAsync();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.CreatedAt,
                user.EmailConfirmed,
                user.LockoutEnd,
                roles,
                families
            });
        }

        [HttpPost("users/{id}/roles")]
        public async Task<IActionResult> AddUserToRole(string id, [FromBody] AddRoleDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            if (!await _roleManager.RoleExistsAsync(model.RoleName))
                return BadRequest($"Role '{model.RoleName}' does not exist");

            var result = await _userManager.AddToRoleAsync(user, model.RoleName);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpDelete("users/{id}/roles/{roleName}")]
        public async Task<IActionResult> RemoveUserFromRole(string id, string roleName)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var result = await _userManager.RemoveFromRoleAsync(user, roleName);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpPost("users/{id}/lock")]
        public async Task<IActionResult> LockUser(string id, [FromBody] LockUserDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var lockoutEnd = DateTimeOffset.UtcNow.AddDays(model.Days);
            var result = await _userManager.SetLockoutEndDateAsync(user, lockoutEnd);
            
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpPost("users/{id}/unlock")]
        public async Task<IActionResult> UnlockUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var result = await _userManager.SetLockoutEndDateAsync(user, null);
            
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            // Check if user is the last admin
            if (await _userManager.IsInRoleAsync(user, "Administrator"))
            {
                var adminCount = (await _userManager.GetUsersInRoleAsync("Administrator")).Count;
                if (adminCount <= 1)
                    return BadRequest("Cannot delete the last administrator");
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }

        [HttpGet("families")]
        public async Task<IActionResult> GetFamilies([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var families = await _context.Families
                .Include(f => f.FamilyMembers)
                .OrderByDescending(f => f.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.Description,
                    f.CreatedAt,
                    MemberCount = f.FamilyMembers.Count,
                    PhotoCount = _context.Photos.Count(p => p.FamilyId == f.Id),
                    StoryCount = _context.Stories.Count(s => s.FamilyId == f.Id),
                    CreatedBy = f.CreatedBy.Email
                })
                .ToListAsync();

            var totalFamilies = await _context.Families.CountAsync();

            return Ok(new
            {
                families,
                totalCount = totalFamilies,
                totalPages = (int)Math.Ceiling(totalFamilies / (double)pageSize),
                currentPage = page
            });
        }

        [HttpDelete("families/{id}")]
        public async Task<IActionResult> DeleteFamily(int id)
        {
            var family = await _context.Families.FindAsync(id);
            if (family == null)
                return NotFound();

            _context.Families.Remove(family);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("content/inappropriate")]
        public async Task<IActionResult> GetInappropriateContent()
        {
            // This would typically include reported content
            // For now, we'll return recent stories as a placeholder
            var recentContent = await _context.Stories
                .OrderByDescending(s => s.CreatedAt)
                .Take(20)
                .Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.Content,
                    s.CreatedAt,
                    Type = "Story"
                })
                .ToListAsync();

            return Ok(recentContent);
        }


        [HttpDelete("photos/{id}")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            var photo = await _context.Photos.FindAsync(id);
            if (photo == null)
                return NotFound();

            _context.Photos.Remove(photo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("stories/{id}")]
        public async Task<IActionResult> DeleteStory(int id)
        {
            var story = await _context.Stories.FindAsync(id);
            if (story == null)
                return NotFound();

            _context.Stories.Remove(story);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetActivityLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            // This would typically include actual activity logs
            // For now, we'll return recent created entities
            var recentActivity = new List<object>();

            var recentUsers = await _userManager.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(10)
                .Select(u => new
                {
                    Type = "UserRegistration",
                    Message = $"User {u.Email} registered",
                    Timestamp = u.CreatedAt,
                    UserId = u.Id
                })
                .ToListAsync();

            var recentFamilies = await _context.Families
                .OrderByDescending(f => f.CreatedAt)
                .Take(10)
                .Select(f => new
                {
                    Type = "FamilyCreated",
                    Message = $"Family '{f.Name}' created",
                    Timestamp = f.CreatedAt,
                    UserId = f.CreatedByUserId
                })
                .ToListAsync();

            recentActivity.AddRange(recentUsers);
            recentActivity.AddRange(recentFamilies);

            var sortedActivity = recentActivity
                .OrderByDescending(a => ((dynamic)a).Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            return Ok(new
            {
                logs = sortedActivity,
                totalCount = recentActivity.Count,
                currentPage = page
            });
        }
    }

}