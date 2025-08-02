using Microsoft.EntityFrameworkCore;
using WorldFamily.Api.Services;
using WorldFamily.Data;
using WorldFamily.Data.Models;
using Xunit;

namespace WorldFamily.Api.Tests.Services
{
    public class FamilyServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly FamilyService _familyService;

        public FamilyServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _familyService = new FamilyService(_context);
        }

        [Fact]
        public async Task GetAllFamiliesAsync_ShouldReturnAllFamilies()
        {
            // Arrange
            var family1 = new Family
            {
                Name = "Семейство Петрови",
                Description = "Описание 1",
                CreatedByUserId = "user1",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var family2 = new Family
            {
                Name = "Семейство Георгиеви",
                Description = "Описание 2",
                CreatedByUserId = "user2",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Families.AddRange(family1, family2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _familyService.GetAllFamiliesAsync();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, f => f.Name == "Семейство Петрови");
            Assert.Contains(result, f => f.Name == "Семейство Георгиеви");
        }

        [Fact]
        public async Task GetFamilyByIdAsync_WithValidId_ShouldReturnFamily()
        {
            // Arrange
            var family = new Family
            {
                Name = "Test Family",
                Description = "Test Description",
                CreatedByUserId = "user1",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            // Act
            var result = await _familyService.GetFamilyByIdAsync(family.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Family", result.Name);
            Assert.Equal("Test Description", result.Description);
        }

        [Fact]
        public async Task GetFamilyByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Act
            var result = await _familyService.GetFamilyByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateFamilyAsync_WithValidFamily_ShouldCreateSuccessfully()
        {
            // Arrange
            var family = new Family
            {
                Name = "New Family",
                Description = "New Description",
                CreatedByUserId = "user1",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Act
            var result = await _familyService.CreateFamilyAsync(family);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
            Assert.Equal("New Family", result.Name);

            // Verify in database
            var savedFamily = await _context.Families.FindAsync(result.Id);
            Assert.NotNull(savedFamily);
            Assert.Equal("New Family", savedFamily.Name);
        }

        [Fact]
        public async Task UpdateFamilyAsync_WithValidData_ShouldUpdateSuccessfully()
        {
            // Arrange
            var family = new Family
            {
                Name = "Original Name",
                Description = "Original Description",
                CreatedByUserId = "user1",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            var updatedFamily = new Family
            {
                Name = "Updated Name",
                Description = "Updated Description",
                CreatedByUserId = "user1"
            };

            // Act
            var result = await _familyService.UpdateFamilyAsync(family.Id, updatedFamily);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Name", result.Name);
            Assert.Equal("Updated Description", result.Description);
            Assert.True(result.UpdatedAt >= family.UpdatedAt);
        }

        [Fact]
        public async Task UpdateFamilyAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var updatedFamily = new Family
            {
                Name = "Updated Name",
                Description = "Updated Description",
                CreatedByUserId = "user1"
            };

            // Act
            var result = await _familyService.UpdateFamilyAsync(999, updatedFamily);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteFamilyAsync_WithValidId_ShouldDeleteSuccessfully()
        {
            // Arrange
            var family = new Family
            {
                Name = "Family to Delete",
                Description = "Will be deleted",
                CreatedByUserId = "user1",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            // Act
            var result = await _familyService.DeleteFamilyAsync(family.Id);

            // Assert
            Assert.True(result);

            // Verify deletion
            var deletedFamily = await _context.Families.FindAsync(family.Id);
            Assert.Null(deletedFamily);
        }

        [Fact]
        public async Task DeleteFamilyAsync_WithInvalidId_ShouldReturnFalse()
        {
            // Act
            var result = await _familyService.DeleteFamilyAsync(999);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetAllFamiliesAsync_WithMultipleFamilies_ShouldReturnFilteredResults()
        {
            // Arrange
            var user1Families = new[]
            {
                new Family { Name = "User1 Family 1", CreatedByUserId = "user1", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Family { Name = "User1 Family 2", CreatedByUserId = "user1", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };

            var user2Family = new Family 
            { 
                Name = "User2 Family", 
                CreatedByUserId = "user2", 
                CreatedAt = DateTime.UtcNow, 
                UpdatedAt = DateTime.UtcNow 
            };

            _context.Families.AddRange(user1Families);
            _context.Families.Add(user2Family);
            await _context.SaveChangesAsync();

            // Act
            var result = await _familyService.GetAllFamiliesAsync();
            var user1Results = result.Where(f => f.CreatedByUserId == "user1");

            // Assert
            Assert.Equal(2, user1Results.Count());
            Assert.All(user1Results, f => Assert.Equal("user1", f.CreatedByUserId));
        }

        [Fact]
        public async Task GetAllFamiliesAsync_WithSearchCriteria_ShouldReturnMatchingFamilies()
        {
            // Arrange
            var families = new[]
            {
                new Family { Name = "Семейство Петрови", Description = "Българско семейство", CreatedByUserId = "user1", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Family { Name = "Семейство Георгиеви", Description = "Друго семейство", CreatedByUserId = "user2", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Family { Name = "Smith Family", Description = "English family", CreatedByUserId = "user3", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };

            _context.Families.AddRange(families);
            await _context.SaveChangesAsync();

            // Act
            var result = await _familyService.GetAllFamiliesAsync();
            var searchResult = result.Where(f => f.Name.Contains("Петрови"));

            // Assert
            Assert.Single(searchResult);
            Assert.Equal("Семейство Петрови", searchResult.First().Name);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}