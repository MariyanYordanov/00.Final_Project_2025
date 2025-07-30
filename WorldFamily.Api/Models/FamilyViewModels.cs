using System.ComponentModel.DataAnnotations;
using WorldFamily.Api.Validation;

namespace WorldFamily.Api.Models
{
    /// <summary>
    /// View model for family creation with validation
    /// </summary>
    public class CreateFamilyViewModel
    {
        [Required(ErrorMessage = "Family name is required.")]
        [ValidFamilyName]
        [Display(Name = "Family Name")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        [NoHtml]
        [Display(Name = "Family Description")]
        public string? Description { get; set; }

        [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
        [NoHtml]
        [Display(Name = "Family Location")]
        public string? Location { get; set; }

        [Display(Name = "Established Date")]
        [DataType(DataType.Date)]
        public DateTime? EstablishedDate { get; set; }

        [Display(Name = "Make this family public")]
        public bool IsPublic { get; set; } = false;

        [MaxFileSize(10 * 1024 * 1024)] // 10MB
        [AllowedExtensions(".jpg", ".jpeg", ".png", ".gif")]
        [Display(Name = "Family Photo")]
        public IFormFile? FamilyPhoto { get; set; }
    }

    /// <summary>
    /// View model for family member creation with validation
    /// </summary>
    public class CreateMemberViewModel
    {
        [Required(ErrorMessage = "First name is required.")]
        [ValidPersonName]
        [Display(Name = "First Name")]
        public string FirstName { get; set; } = string.Empty;

        [ValidPersonName]
        [Display(Name = "Middle Name")]
        public string? MiddleName { get; set; }

        [Required(ErrorMessage = "Last name is required.")]
        [ValidPersonName]
        [Display(Name = "Last Name")]
        public string LastName { get; set; } = string.Empty;

        [ValidBirthDate]
        [Display(Name = "Birth Date")]
        [DataType(DataType.Date)]
        public DateTime? BirthDate { get; set; }

        [ValidDeathDate("BirthDate")]
        [Display(Name = "Death Date")]
        [DataType(DataType.Date)]
        public DateTime? DeathDate { get; set; }

        [Required(ErrorMessage = "Gender is required.")]
        [ValidGender]
        [Display(Name = "Gender")]
        public string Gender { get; set; } = string.Empty;

        [StringLength(2000, ErrorMessage = "Biography cannot exceed 2000 characters.")]
        [NoHtml]
        [Display(Name = "Biography")]
        public string? Biography { get; set; }

        [StringLength(100, ErrorMessage = "Place of birth cannot exceed 100 characters.")]
        [NoHtml]
        [Display(Name = "Place of Birth")]
        public string? PlaceOfBirth { get; set; }

        [StringLength(100, ErrorMessage = "Place of death cannot exceed 100 characters.")]
        [NoHtml]
        [Display(Name = "Place of Death")]
        public string? PlaceOfDeath { get; set; }

        [Required(ErrorMessage = "Family selection is required.")]
        [Display(Name = "Family")]
        public int FamilyId { get; set; }

        [MaxFileSize(5 * 1024 * 1024)] // 5MB
        [AllowedExtensions(".jpg", ".jpeg", ".png")]
        [Display(Name = "Profile Photo")]
        public IFormFile? ProfilePhoto { get; set; }
    }

    /// <summary>
    /// View model for creating relationships with validation
    /// </summary>
    public class CreateRelationshipViewModel
    {
        [Required(ErrorMessage = "Primary member selection is required.")]
        [Display(Name = "Primary Member")]
        public int PrimaryMemberId { get; set; }

        [Required(ErrorMessage = "Related member selection is required.")]
        [Display(Name = "Related Member")]
        public int RelatedMemberId { get; set; }

        [Required(ErrorMessage = "Relationship type is required.")]
        [ValidRelationshipType]
        [Display(Name = "Relationship Type")]
        public string RelationshipType { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters.")]
        [NoHtml]
        [Display(Name = "Additional Notes")]
        public string? Notes { get; set; }

        [Display(Name = "Start Date")]
        [DataType(DataType.Date)]
        public DateTime? StartDate { get; set; }

        [Display(Name = "End Date")]
        [DataType(DataType.Date)]
        public DateTime? EndDate { get; set; }
    }
}