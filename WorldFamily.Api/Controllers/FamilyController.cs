using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorldFamily.Api.Contracts;
using WorldFamily.Api.DTOs;
using WorldFamily.Data.Models;

namespace WorldFamily.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FamilyController : ControllerBase
    {
        private readonly IFamilyService _familyService;
        private readonly IMapper _mapper;

        public FamilyController(IFamilyService familyService, IMapper mapper)
        {
            _familyService = familyService;
            _mapper = mapper;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllFamilies()
        {
            var families = await _familyService.GetAllFamiliesAsync();
            var familyDtos = families.Select(f => new FamilyDto
            {
                Id = f.Id,
                Name = f.Name,
                Description = f.Description,
                CreatedAt = f.CreatedAt,
                CreatedByUserId = f.CreatedByUserId,
                MemberCount = 0, // Will be loaded separately
                PhotoCount = 0,
                StoryCount = 0
            });
            return Ok(familyDtos);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFamily(int id)
        {
            var family = await _familyService.GetFamilyByIdAsync(id);
            if (family == null)
                return NotFound();

            var familyDto = new FamilyDto
            {
                Id = family.Id,
                Name = family.Name,
                Description = family.Description,
                CreatedAt = family.CreatedAt,
                CreatedByUserId = family.CreatedByUserId,
                MemberCount = 0, // Will be loaded separately if needed
                PhotoCount = 0,
                StoryCount = 0
            };
            return Ok(familyDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFamily([FromBody] CreateFamilyDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var family = new Family
            {
                Name = model.Name,
                Description = model.Description,
                CreatedByUserId = userId ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            var createdFamily = await _familyService.CreateFamilyAsync(family);
            var familyDto = new FamilyDto
            {
                Id = createdFamily.Id,
                Name = createdFamily.Name,
                Description = createdFamily.Description,
                CreatedAt = createdFamily.CreatedAt,
                CreatedByUserId = createdFamily.CreatedByUserId,
                MemberCount = 0,
                PhotoCount = 0,
                StoryCount = 0
            };
            return CreatedAtAction(nameof(GetFamily), new { id = createdFamily.Id }, familyDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFamily(int id, [FromBody] UpdateFamilyDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var family = new Family
            {
                Id = id,
                Name = model.Name,
                Description = model.Description
            };

            var updatedFamily = await _familyService.UpdateFamilyAsync(id, family);
            if (updatedFamily == null)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFamily(int id)
        {
            var success = await _familyService.DeleteFamilyAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}