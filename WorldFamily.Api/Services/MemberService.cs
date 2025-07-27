using Microsoft.EntityFrameworkCore;
using WorldFamily.Api.Contracts;
using WorldFamily.Data;
using WorldFamily.Data.Models;

namespace WorldFamily.Api.Services;

public class MemberService : IMemberService
{
    private readonly AppDbContext _context;

    public MemberService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FamilyMember>> GetFamilyMembersAsync(int familyId)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Family)
            .Where(m => m.FamilyId == familyId)
            .ToListAsync();
    }

    public async Task<FamilyMember?> GetMemberByIdAsync(int id)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Family)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<FamilyMember> CreateMemberAsync(FamilyMember member)
    {
        member.JoinedAt = DateTime.UtcNow;
        _context.FamilyMembers.Add(member);
        await _context.SaveChangesAsync();
        return member;
    }

    public async Task<FamilyMember?> UpdateMemberAsync(int id, FamilyMember member)
    {
        var existingMember = await _context.FamilyMembers.FindAsync(id);
        if (existingMember == null)
            return null;

        existingMember.Role = member.Role;
        existingMember.CanPost = member.CanPost;
        existingMember.CanComment = member.CanComment;
        existingMember.CanInvite = member.CanInvite;

        await _context.SaveChangesAsync();
        return existingMember;
    }

    public async Task<bool> DeleteMemberAsync(int id)
    {
        var member = await _context.FamilyMembers.FindAsync(id);
        if (member == null)
            return false;

        _context.FamilyMembers.Remove(member);
        await _context.SaveChangesAsync();
        return true;
    }
}