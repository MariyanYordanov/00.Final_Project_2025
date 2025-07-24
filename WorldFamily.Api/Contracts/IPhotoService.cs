public interface IPhotoService
{
    Task<IEnumerable<Photo>> GetPhotosAsync(int? familyId = null);
    Task<Photo?> GetPhotoByIdAsync(int id);
    Task<Photo> UploadPhotoAsync(Photo photo);
    Task<bool> DeletePhotoAsync(int id);
}