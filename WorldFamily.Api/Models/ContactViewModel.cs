using System.ComponentModel.DataAnnotations;
using WorldFamily.Api.Validation;

namespace WorldFamily.Api.Models
{
    /// <summary>
    /// View model for contact form with validation
    /// </summary>
    public class ContactViewModel
    {
        [Required(ErrorMessage = "First name is required.")]
        [ValidPersonName]
        [Display(Name = "First Name")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required.")]
        [ValidPersonName]
        [Display(Name = "Last Name")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        [Display(Name = "Email Address")]
        public string Email { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Please enter a valid phone number.")]
        [Display(Name = "Phone Number")]
        public string? Phone { get; set; }

        [Required(ErrorMessage = "Subject is required.")]
        [StringLength(100, ErrorMessage = "Subject cannot exceed 100 characters.")]
        [NoHtml]
        [Display(Name = "Subject")]
        public string Subject { get; set; } = string.Empty;

        [Required(ErrorMessage = "Message is required.")]
        [StringLength(1000, MinimumLength = 10, ErrorMessage = "Message must be between 10 and 1,000 characters.")]
        [NoHtml]
        [Display(Name = "Message")]
        public string Message { get; set; } = string.Empty;

        [Display(Name = "Subscribe to newsletter")]
        public bool SubscribeNewsletter { get; set; } = false;

        [Required(ErrorMessage = "You must accept the privacy policy.")]
        [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the privacy policy.")]
        [Display(Name = "I agree to the Privacy Policy")]
        public bool AcceptPrivacy { get; set; }
    }
}