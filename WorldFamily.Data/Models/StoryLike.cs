namespace WorldFamily.Data.Models
{
    public class StoryLike
    {
        public int Id { get; set; }

        public int StoryId { get; set; }

        public string UserId { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Story Story { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}