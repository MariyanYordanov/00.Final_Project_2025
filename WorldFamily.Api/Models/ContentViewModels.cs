using System.ComponentModel.DataAnnotations;
using WorldFamily.Api.Validation;

namespace WorldFamily.Api.Models
{
    /// <summary>
    /// View model for photo upload with validation
    /// </summary>
    public class UploadPhotoViewModel
    {
        [Required(ErrorMessage = "Photo file is required.")]
        [MaxFileSize(10 * 1024 * 1024)] // 10MB
        [AllowedExtensions(".jpg", ".jpeg", ".png", ".gif")]
        [Display(Name = "Photo File")]
        public IFormFile PhotoFile { get; set; } = null!;

        [Required(ErrorMessage = "Photo title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        [NoHtml]
        [Display(Name = "Photo Title")]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        [NoHtml]
        [Display(Name = "Photo Description")]
        public string? Description { get; set; }

        [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
        [NoHtml]
        [Display(Name = "Location")]
        public string? Location { get; set; }

        [Display(Name = "Date Taken")]
        [DataType(DataType.Date)]
        public DateTime? DateTaken { get; set; }

        [Required(ErrorMessage = "Family selection is required.")]
        [Display(Name = "Family")]
        public int FamilyId { get; set; }

        [Display(Name = "Tagged Members")]
        public List<int> TaggedMemberIds { get; set; } = new();
    }

    /// <summary>
    /// View model for story creation with validation
    /// </summary>
    public class CreateStoryViewModel
    {
        [Required(ErrorMessage = "Story title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        [NoHtml]
        [Display(Name = "Story Title")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Story content is required.")]
        [StringLength(10000, MinimumLength = 10, ErrorMessage = "Content must be between 10 and 10,000 characters.")]
        [NoHtml]
        [Display(Name = "Story Content")]
        public string Content { get; set; } = string.Empty;

        [Required(ErrorMessage = "Family selection is required.")]
        [Display(Name = "Family")]
        public int FamilyId { get; set; }

        [Display(Name = "Related Family Members")]
        public List<int> RelatedMemberIds { get; set; } = new();

        [Display(Name = "Story Date")]
        [DataType(DataType.Date)]
        public DateTime? StoryDate { get; set; }

        [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
        [NoHtml]
        [Display(Name = "Location")]
        public string? Location { get; set; }

        [Display(Name = "Make this story public")]
        public bool IsPublic { get; set; } = false;
    }
}