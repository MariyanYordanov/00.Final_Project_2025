using System.ComponentModel.DataAnnotations;

namespace WorldFamily.Api.DTOs
{
    public class CreateMemberDto
    {
        [Required]
        [MaxLength(50)]
        public required string FirstName { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string MiddleName { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public string? Gender { get; set; }
        public string? Biography { get; set; }
        public string? PlaceOfBirth { get; set; }
        public string? PlaceOfDeath { get; set; }
        public int FamilyId { get; set; }
    }

    public class UpdateMemberDto
    {
        [Required]
        [MaxLength(50)]
        public required string FirstName { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string MiddleName { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public string? Gender { get; set; }
        public string? Biography { get; set; }
        public string? PlaceOfBirth { get; set; }
        public string? PlaceOfDeath { get; set; }
    }

    public class FamilyMemberDto
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string MiddleName { get; set; }
        public required string LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public string? Gender { get; set; }
        public string? Biography { get; set; }
        public string? PlaceOfBirth { get; set; }
        public string? PlaceOfDeath { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int? Age { get; set; }
        public int FamilyId { get; set; }
        public required string FamilyName { get; set; }
    }

    public class CreateRelationshipDto
    {
        [Required]
        public int PrimaryMemberId { get; set; }

        [Required]
        public int RelatedMemberId { get; set; }

        [Required]
        public WorldFamily.Data.Models.RelationshipType RelationshipType { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    public class RelationshipDto
    {
        public int Id { get; set; }
        public int PrimaryMemberId { get; set; }
        public int RelatedMemberId { get; set; }
        public WorldFamily.Data.Models.RelationshipType RelationshipType { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Additional fields for display
        public string? PrimaryMemberName { get; set; }
        public string? RelatedMemberName { get; set; }
        public string? RelationshipTypeName { get; set; }
    }

    public class UpdateRelationshipDto
    {
        [Required]
        public WorldFamily.Data.Models.RelationshipType RelationshipType { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    public class MemberRelationshipsDto
    {
        public int MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public List<RelationshipDto> Relationships { get; set; } = new();
    }
}