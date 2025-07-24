using System.ComponentModel.DataAnnotations;

namespace WorldFamily.Data.Models
{
    public class Comment
    {
        public int Id { get; set; }

        [Required]
        public string Content { get; set; } = "";

        public int? PhotoId { get; set; }

        public int? StoryId { get; set; }

        public int? ParentCommentId { get; set; }

        [Required]
        public string AuthorUserId { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Photo? Photo { get; set; }
        public virtual Story? Story { get; set; }
        public virtual Comment? ParentComment { get; set; }
        public virtual User Author { get; set; } = null!;
        public virtual ICollection<Comment> Replies { get; set; } = new List<Comment>();
    }
}