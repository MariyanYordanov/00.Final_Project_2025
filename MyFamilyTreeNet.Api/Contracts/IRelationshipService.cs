using MyFamilyTreeNet.Api.DTOs;
using MyFamilyTreeNet.Data.Models;

namespace MyFamilyTreeNet.Api.Contracts
{
    public interface IRelationshipService
    {
        Task<List<RelationshipDto>> GetAllRelationshipsAsync();
        Task<List<RelationshipDto>> GetRelationshipsByMemberAsync(int memberId);
        Task<List<RelationshipDto>> GetRelationshipsByFamilyAsync(int familyId);
        Task<RelationshipDto?> GetRelationshipByIdAsync(int id);
        Task<RelationshipDto> CreateRelationshipAsync(CreateRelationshipDto dto, string userId);
        Task<RelationshipDto> UpdateRelationshipAsync(int id, UpdateRelationshipDto dto);
        Task<bool> DeleteRelationshipAsync(int id);
        Task<bool> RelationshipExistsAsync(int primaryMemberId, int relatedMemberId);
        Task<MemberRelationshipsDto> GetMemberRelationshipsTreeAsync(int memberId);
    }
}