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
        public int? Age { get; set; }
        public int FamilyId { get; set; }
        public required string FamilyName { get; set; }
    }

    public class CreateRelationshipDto
    {
        public int RelatedMemberId { get; set; }
        public required string RelationshipType { get; set; }
    }

    public class RelationshipDto
    {
        public int MemberId { get; set; }
        public required string MemberName { get; set; }
        public int RelatedMemberId { get; set; }
        public required string RelatedMemberName { get; set; }
        public required string RelationshipType { get; set; }
    }
}