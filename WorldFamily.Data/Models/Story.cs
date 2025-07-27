using System.ComponentModel.DataAnnotations;

namespace WorldFamily.Data.Models
{
    public class Story
    {
        public int Id { get; set; }

        [Required]
        public int FamilyId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? CoverImageUrl { get; set; }

        public StoryType StoryType { get; set; } = StoryType.Memory;

        public int LikesCount { get; set; } = 0;

        public int CommentsCount { get; set; } = 0;

        public bool IsPublic { get; set; } = true;

        [Required]
        public string AuthorUserId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


        public virtual Family Family { get; set; } = null!;
        public virtual User Author { get; set; } = null!;
        public virtual ICollection<StoryLike> Likes { get; set; } = new List<StoryLike>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }

    public enum StoryType
    {
        Memory = 1,
        History = 2,
        Recipe = 3,
        Tradition = 4,
        Achievement = 5,
        Travel = 6,
        Other = 99
    }
}