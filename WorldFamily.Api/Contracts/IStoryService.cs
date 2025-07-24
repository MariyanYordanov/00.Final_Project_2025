using WorldFamily.Data.Models;

public interface IStoryService
{
    Task<IEnumerable<Story>> GetStoriesAsync(int? familyId = null);
    Task<Story?> GetStoryByIdAsync(int id);
    Task<Story> CreateStoryAsync(Story story);
    Task<Story?> UpdateStoryAsync(int id, Story story);
    Task<bool> DeleteStoryAsync(int id);
}