namespace WorldFamily.Data.Models
{
    public class PhotoTag
    {
        public int Id { get; set; }

        public int PhotoId { get; set; }

        public int FamilyMemberId { get; set; }

        public int PositionX { get; set; } // For tagging people in photos

        public int PositionY { get; set; }

        public string TaggedByUserId { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Photo Photo { get; set; } = null!;
        public virtual FamilyMember FamilyMember { get; set; } = null!;
        public virtual User TaggedBy { get; set; } = null!;
    }
}