using Microsoft.EntityFrameworkCore;
using WorldFamily.Api.Contracts;
using WorldFamily.Data;
using WorldFamily.Data.Models;

namespace WorldFamily.Api.Services;

public class PhotoService : IPhotoService
{
    private readonly AppDbContext _context;

    public PhotoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Photo>> GetPhotosAsync(int? familyId = null)
    {
        var query = _context.Photos.AsQueryable();

        if (familyId.HasValue)
        {
            query = query.Where(p => p.FamilyId == familyId);
        }

        return await query.OrderByDescending(p => p.UploadedAt).ToListAsync();
    }

    public async Task<Photo?> GetPhotoByIdAsync(int id)
    {
        return await _context.Photos
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Photo> UploadPhotoAsync(Photo photo)
    {
        photo.UploadedAt = DateTime.UtcNow;
        _context.Photos.Add(photo);
        await _context.SaveChangesAsync();
        return photo;
    }

    public async Task<bool> DeletePhotoAsync(int id)
    {
        var photo = await _context.Photos.FindAsync(id);
        if (photo == null)
            return false;

        _context.Photos.Remove(photo);
        await _context.SaveChangesAsync();
        return true;
    }
}