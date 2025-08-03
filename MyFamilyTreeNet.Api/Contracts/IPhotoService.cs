using MyFamilyTreeNet.Data.Models;

namespace MyFamilyTreeNet.Api.Contracts;

public interface IPhotoService
{
    Task<IEnumerable<Photo>> GetPhotosAsync(int? familyId = null);
    Task<Photo?> GetPhotoByIdAsync(int id);
    Task<Photo> UploadPhotoAsync(Photo photo);
    Task<Photo?> UpdatePhotoAsync(int id, Photo photo);
    Task<bool> DeletePhotoAsync(int id);
}