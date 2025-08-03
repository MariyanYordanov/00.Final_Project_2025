using Microsoft.EntityFrameworkCore;
using MyFamilyTreeNet.Api.Services;
using MyFamilyTreeNet.Data;
using MyFamilyTreeNet.Data.Models;
using Xunit;

namespace MyFamilyTreeNet.Api.Tests.Services
{
    public class StoryServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly StoryService _storyService;

        public StoryServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _storyService = new StoryService(_context);
        }

        [Fact]
        public async Task GetStoriesAsync_ShouldReturnAllStories()
        {
            // Arrange
            var family = new Family 
            { 
                Name = "Test Family", 
                CreatedByUserId = "user1", 
                CreatedAt = DateTime.UtcNow 
            };
            
            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            var stories = new[]
            {
                new Story
                {
                    Title = "Семейна история 1",
                    Content = "Съдържание 1",
                    FamilyId = family.Id,
                    AuthorUserId = "user1",
                    CreatedAt = DateTime.UtcNow
                },
                new Story
                {
                    Title = "Семейна история 2",
                    Content = "Съдържание 2",
                    FamilyId = family.Id,
                    AuthorUserId = "user1",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.Stories.AddRange(stories);
            await _context.SaveChangesAsync();

            // Act
            var result = await _storyService.GetStoriesAsync();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, s => s.Title == "Семейна история 1");
            Assert.Contains(result, s => s.Title == "Семейна история 2");
        }

        [Fact]
        public async Task GetStoriesAsync_WithFamilyId_ShouldReturnOnlyFamilyStories()
        {
            // Arrange
            var family1 = new Family 
            { 
                Name = "Family 1", 
                CreatedByUserId = "user1", 
                CreatedAt = DateTime.UtcNow 
            };
            
            var family2 = new Family 
            { 
                Name = "Family 2", 
                CreatedByUserId = "user2", 
                CreatedAt = DateTime.UtcNow 
            };

            _context.Families.AddRange(family1, family2);
            await _context.SaveChangesAsync();

            var stories = new[]
            {
                new Story 
                { 
                    Title = "Family 1 Story 1", 
                    Content = "Content 1",
                    FamilyId = family1.Id, 
                    AuthorUserId = "user1",
                    CreatedAt = DateTime.UtcNow
                },
                new Story 
                { 
                    Title = "Family 1 Story 2", 
                    Content = "Content 2",
                    FamilyId = family1.Id, 
                    AuthorUserId = "user1",
                    CreatedAt = DateTime.UtcNow
                },
                new Story 
                { 
                    Title = "Family 2 Story 1", 
                    Content = "Content 3",
                    FamilyId = family2.Id, 
                    AuthorUserId = "user2",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.Stories.AddRange(stories);
            await _context.SaveChangesAsync();

            // Act
            var result = await _storyService.GetStoriesAsync(family1.Id);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, s => Assert.Equal(family1.Id, s.FamilyId));
            Assert.Contains(result, s => s.Title == "Family 1 Story 1");
            Assert.Contains(result, s => s.Title == "Family 1 Story 2");
        }

        [Fact]
        public async Task GetStoryByIdAsync_WithValidId_ShouldReturnStory()
        {
            // Arrange
            var family = new Family 
            { 
                Name = "Test Family", 
                CreatedByUserId = "user1", 
                CreatedAt = DateTime.UtcNow 
            };
            
            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            var story = new Story
            {
                Title = "Тестова история",
                Content = "Тестово съдържание на историята",
                FamilyId = family.Id,
                AuthorUserId = "user1",
                CreatedAt = DateTime.UtcNow
            };

            _context.Stories.Add(story);
            await _context.SaveChangesAsync();

            // Act
            var result = await _storyService.GetStoryByIdAsync(story.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Тестова история", result.Title);
            Assert.Equal("Тестово съдържание на историята", result.Content);
        }

        [Fact]
        public async Task GetStoryByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Act
            var result = await _storyService.GetStoryByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateStoryAsync_WithValidStory_ShouldCreateSuccessfully()
        {
            // Arrange
            var family = new Family 
            { 
                Name = "Test Family", 
                CreatedByUserId = "user1", 
                CreatedAt = DateTime.UtcNow 
            };
            
            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            var story = new Story
            {
                Title = "Нова история",
                Content = "Съдържание на новата история",
                FamilyId = family.Id,
                AuthorUserId = "user1",
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var result = await _storyService.CreateStoryAsync(story);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
            Assert.Equal("Нова история", result.Title);
            Assert.True(result.CreatedAt <= DateTime.UtcNow);

            // Verify in database
            var savedStory = await _context.Stories.FindAsync(result.Id);
            Assert.NotNull(savedStory);
            Assert.Equal("Нова история", savedStory.Title);
        }

        [Fact]
        public async Task UpdateStoryAsync_WithValidData_ShouldUpdateSuccessfully()
        {
            // Arrange
            var family = new Family 
            { 
                Name = "Test Family", 
                CreatedByUserId = "user1", 
                CreatedAt = DateTime.UtcNow 
            };
            
            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            var originalStory = new Story
            {
                Title = "Оригинално заглавие",
                Content = "Оригинално съдържание",
                FamilyId = family.Id,
                AuthorUserId = "user1",
                CreatedAt = DateTime.UtcNow
            };

            _context.Stories.Add(originalStory);
            await _context.SaveChangesAsync();

            var updatedStory = new Story
            {
                Title = "Обновено заглавие",
                Content = "Обновено съдържание",
                FamilyId = family.Id,
                AuthorUserId = "user1"
            };

            // Act
            var result = await _storyService.UpdateStoryAsync(originalStory.Id, updatedStory);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Обновено заглавие", result.Title);
            Assert.Equal("Обновено съдържание", result.Content);
        }

        [Fact]
        public async Task UpdateStoryAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var updatedStory = new Story
            {
                Title = "Обновено заглавие",
                Content = "Обновено съдържание",
                FamilyId = 1,
                AuthorUserId = "user1"
            };

            // Act
            var result = await _storyService.UpdateStoryAsync(999, updatedStory);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteStoryAsync_WithValidId_ShouldDeleteSuccessfully()
        {
            // Arrange
            var family = new Family 
            { 
                Name = "Test Family", 
                CreatedByUserId = "user1", 
                CreatedAt = DateTime.UtcNow 
            };
            
            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            var story = new Story
            {
                Title = "За изтриване",
                Content = "Съдържание за изтриване",
                FamilyId = family.Id,
                AuthorUserId = "user1",
                CreatedAt = DateTime.UtcNow
            };

            _context.Stories.Add(story);
            await _context.SaveChangesAsync();

            // Act
            var result = await _storyService.DeleteStoryAsync(story.Id);

            // Assert
            Assert.True(result);

            // Verify deletion
            var deletedStory = await _context.Stories.FindAsync(story.Id);
            Assert.Null(deletedStory);
        }

        [Fact]
        public async Task DeleteStoryAsync_WithInvalidId_ShouldReturnFalse()
        {
            // Act
            var result = await _storyService.DeleteStoryAsync(999);

            // Assert
            Assert.False(result);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}