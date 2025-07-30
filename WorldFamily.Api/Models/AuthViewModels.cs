using System.ComponentModel.DataAnnotations;
using WorldFamily.Api.Validation;

namespace WorldFamily.Api.Models
{
    /// <summary>
    /// View model for user registration with validation
    /// </summary>
    public class RegisterViewModel
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

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        [Display(Name = "Email Address")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [StrongPassword]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password confirmation is required.")]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [ValidBirthDate]
        [MinimumAge(13)] // GDPR compliance
        [Display(Name = "Date of Birth")]
        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        [Required(ErrorMessage = "You must accept the terms and conditions.")]
        [Display(Name = "I agree to the Terms and Conditions")]
        [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the terms and conditions.")]
        public bool AcceptTerms { get; set; }

        [Display(Name = "I want to receive email updates")]
        public bool SubscribeToNewsletter { get; set; } = false;
    }

    /// <summary>
    /// View model for login with validation
    /// </summary>
    public class LoginViewModel
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        [Display(Name = "Email")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = string.Empty;

        [Display(Name = "Remember me")]
        public bool RememberMe { get; set; }

        public string? ReturnUrl { get; set; }
    }
}