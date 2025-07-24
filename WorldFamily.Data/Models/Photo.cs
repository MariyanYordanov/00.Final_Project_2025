using System.ComponentModel.DataAnnotations;

namespace WorldFamily.Data.Models
{
    public class Photo
    {
        public int Id { get; set; }

        [Required]
        public int FamilyId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = "";

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public string ImageUrl { get; set; } = "";

        public string? ThumbnailUrl { get; set; }

        public DateTime? DateTaken { get; set; }

        [MaxLength(100)]
        public string? Location { get; set; }

        public int LikesCount { get; set; } = 0;

        public int CommentsCount { get; set; } = 0;

        [Required]
        public string UploadedByUserId { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Family Family { get; set; } = null!;
        public virtual User UploadedBy { get; set; } = null!;
        public virtual ICollection<PhotoLike> Likes { get; set; } = new List<PhotoLike>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<PhotoTag> PhotoTags { get; set; } = new List<PhotoTag>();
    }
}