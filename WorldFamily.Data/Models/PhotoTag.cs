namespace WorldFamily.Data.Models
{
    public class PhotoTag
    {
        public int Id { get; set; }

        public int PhotoId { get; set; }

        public int FamilyMemberId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Photo Photo { get; set; } = null!;
        public virtual FamilyMember FamilyMember { get; set; } = null!;
    }
}