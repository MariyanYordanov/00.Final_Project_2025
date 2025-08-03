using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace WorldFamily.Data.Models
{
    public class User : IdentityUser<string>
    {
        public User()
        {
            Id = Guid.NewGuid().ToString();
            CreatedAt = DateTime.UtcNow;
        }

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = "";

        [Required]
        [MaxLength(50)]
        public string MiddleName { get; set; } = "";

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = "";

        public string? ProfilePictureUrl { get; set; }

        public DateTime? DateOfBirth { get; set; }
        
        [MaxLength(1000)]
        public string? Bio { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? LastLoginAt { get; set; }

        public virtual ICollection<Family> CreatedFamilies { get; set; } = new List<Family>();
        public virtual ICollection<FamilyMember> FamilyMembers { get; set; } = new List<FamilyMember>();
        public virtual ICollection<Story> Stories { get; set; } = new List<Story>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<PhotoLike> PhotoLikes { get; set; } = new List<PhotoLike>();
        public virtual ICollection<StoryLike> StoryLikes { get; set; } = new List<StoryLike>();
    }
}