namespace WorldFamily.Data.Models
{
    public class PhotoLike
    {
        public int Id { get; set; }

        public int PhotoId { get; set; }

        public string UserId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Photo Photo { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}