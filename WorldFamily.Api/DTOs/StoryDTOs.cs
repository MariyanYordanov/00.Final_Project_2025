namespace WorldFamily.Api.DTOs
{
    public class CreateStoryDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public int FamilyId { get; set; }
    }

    public class UpdateStoryDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
    }

    public class StoryDto
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public DateTime? DateOccurred { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int FamilyId { get; set; }
        public required string FamilyName { get; set; }
        public required string AuthorId { get; set; }
        public required string AuthorName { get; set; }
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
    }

    public class AddCommentDto
    {
        public required string Content { get; set; }
    }

    public class CommentDto
    {
        public int Id { get; set; }
        public required string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string UserId { get; set; }
        public required string UserName { get; set; }
        public required string UserEmail { get; set; }
        public int? StoryId { get; set; }
        public int? PhotoId { get; set; }
    }

    public class StoryLikeDto
    {
        public required string UserId { get; set; }
        public required string UserName { get; set; }
        public DateTime LikedAt { get; set; }
    }
}