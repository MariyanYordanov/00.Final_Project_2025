using System.ComponentModel.DataAnnotations;
using WorldFamily.Api.Validation;

namespace WorldFamily.Api.Models
{
    /// <summary>
    /// View model for admin user management with validation
    /// </summary>
    public class AdminUserViewModel
    {
        public string Id { get; set; } = string.Empty;

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

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        [Display(Name = "Email Address")]
        public string Email { get; set; } = string.Empty;

        [Display(Name = "Email Confirmed")]
        public bool EmailConfirmed { get; set; }

        [Display(Name = "Account Locked")]
        public bool IsLocked { get; set; }

        [Display(Name = "User Role")]
        public string Role { get; set; } = "User";

        [Display(Name = "Last Login")]
        public DateTime? LastLoginAt { get; set; }

        [Display(Name = "Registration Date")]
        public DateTime CreatedAt { get; set; }

        [Display(Name = "Families Created")]
        public int FamiliesCount { get; set; }
    }
}