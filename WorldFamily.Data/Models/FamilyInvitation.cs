using System.ComponentModel.DataAnnotations;

namespace WorldFamily.Data.Models
{
    public class FamilyInvitation
    {
        public int Id { get; set; }

        [Required]
        public int FamilyId { get; set; }

        [Required]
        [EmailAddress]
        public string InvitedEmail { get; set; } = "";

        public string? InvitedUserId { get; set; }

        [Required]
        public string InvitedByUserId { get; set; } = "";

        public InvitationRole Role { get; set; } = InvitationRole.Member;

        public InvitationStatus Status { get; set; } = InvitationStatus.Pending;

        public string? Message { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? RespondedAt { get; set; }

        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(7);

        // Navigation Properties
        public virtual Family Family { get; set; } = null!;
        public virtual User? InvitedUser { get; set; }
        public virtual User InvitedBy { get; set; } = null!;
    }

    public enum InvitationRole
    {
        Member = 1,
        Editor = 2,
        Admin = 3
    }

    public enum InvitationStatus
    {
        Pending = 1,
        Accepted = 2,
        Declined = 3,
        Expired = 4
    }
}