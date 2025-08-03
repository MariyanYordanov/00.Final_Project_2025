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
    [IgnoreAntiforgeryToken]
    [Authorize]
    public class PhotoController : ControllerBase
    {
        private readonly IPhotoService _photoService;
        private readonly IMapper _mapper;

        public PhotoController(IPhotoService photoService, IMapper mapper)
        {
            _photoService = photoService;
            _mapper = mapper;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllPhotos([FromQuery] int? familyId = null)
        {
            var photos = await _photoService.GetPhotosAsync(familyId);
            var photoDtos = photos.Select(p => new PhotoDto
            {
                Id = p.Id,
                PhotoUrl = p.ImageUrl,
                Title = p.Title,
                Description = p.Description,
                DateTaken = p.DateTaken,
                Location = p.Location,
                UploadedAt = p.UploadedAt,
                FamilyId = p.FamilyId,
                FamilyName = "",
                UploadedByUserId = p.UploadedByUserId,
                UploadedByName = "",
                LikeCount = 0,
                TaggedMembers = new List<TaggedMemberDto>()
            });
            return Ok(photoDtos);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photo = await _photoService.GetPhotoByIdAsync(id);
            if (photo == null)
                return NotFound();

            var photoDto = new PhotoDto
            {
                Id = photo.Id,
                PhotoUrl = photo.ImageUrl,
                Title = photo.Title,
                Description = photo.Description,
                DateTaken = photo.DateTaken,
                Location = photo.Location,
                UploadedAt = photo.UploadedAt,
                FamilyId = photo.FamilyId,
                FamilyName = "",
                UploadedByUserId = photo.UploadedByUserId,
                UploadedByName = "",
                LikeCount = 0,
                TaggedMembers = new List<TaggedMemberDto>()
            };
            return Ok(photoDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePhoto([FromBody] CreatePhotoDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var photo = new Photo
            {
                ImageUrl = model.ImageUrl,
                Title = model.Title ?? string.Empty,
                Description = model.Description,
                DateTaken = model.DateTaken,
                Location = model.Location,
                FamilyId = model.FamilyId,
                UploadedByUserId = userId ?? string.Empty,
                UploadedAt = DateTime.UtcNow
            };

            var createdPhoto = await _photoService.UploadPhotoAsync(photo);
            var photoDto = new PhotoDto
            {
                Id = createdPhoto.Id,
                PhotoUrl = createdPhoto.ImageUrl,
                Title = createdPhoto.Title,
                Description = createdPhoto.Description,
                DateTaken = createdPhoto.DateTaken,
                Location = createdPhoto.Location,
                UploadedAt = createdPhoto.UploadedAt,
                FamilyId = createdPhoto.FamilyId,
                FamilyName = "",
                UploadedByUserId = createdPhoto.UploadedByUserId,
                UploadedByName = "",
                LikeCount = 0,
                TaggedMembers = new List<TaggedMemberDto>()
            };
            return CreatedAtAction(nameof(GetPhoto), new { id = createdPhoto.Id }, photoDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePhoto(int id, [FromBody] UpdatePhotoDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var photo = new Photo
            {
                Title = model.Title ?? string.Empty,
                Description = model.Description,
                DateTaken = model.DateTaken,
                Location = model.Location
            };

            var updatedPhoto = await _photoService.UpdatePhotoAsync(id, photo);
            if (updatedPhoto == null)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            var success = await _photoService.DeletePhotoAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}