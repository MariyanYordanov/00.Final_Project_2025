using System.ComponentModel.DataAnnotations;

namespace WorldFamily.Data.Models
{
    public class Family
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public string? FamilyTreeImageUrl { get; set; }

        public bool IsPublic { get; set; } = true;

        [Required]
        public string CreatedByUserId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual User CreatedBy { get; set; } = null!;
        public virtual ICollection<FamilyMember> FamilyMembers { get; set; } = new List<FamilyMember>();
        public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();
        public virtual ICollection<Story> Stories { get; set; } = new List<Story>();
        public virtual ICollection<FamilyInvitation> Invitations { get; set; } = new List<FamilyInvitation>();
    }
}