using Microsoft.EntityFrameworkCore;
using WorldFamily.Api.Services;
using WorldFamily.Data;
using WorldFamily.Data.Models;
using Xunit;

namespace WorldFamily.Api.Tests.Services
{
    public class PhotoServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly PhotoService _photoService;

        public PhotoServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _photoService = new PhotoService(_context);
        }

        [Fact]
        public async Task GetPhotosAsync_ShouldReturnAllPhotos()
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

            var photos = new[]
            {
                new Photo
                {
                    ImageUrl = "/images/photo1.jpg",
                    Title = "Семейна снимка 1",
                    Description = "Описание 1",
                    FamilyId = family.Id,
                    UploadedByUserId = "user1",
                    UploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                },
                new Photo
                {
                    ImageUrl = "/images/photo2.jpg",
                    Title = "Семейна снимка 2",
                    Description = "Описание 2",
                    FamilyId = family.Id,
                    UploadedByUserId = "user1",
                    UploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.Photos.AddRange(photos);
            await _context.SaveChangesAsync();

            // Act
            var result = await _photoService.GetPhotosAsync();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, p => p.Title == "Семейна снимка 1");
            Assert.Contains(result, p => p.Title == "Семейна снимка 2");
        }

        [Fact]
        public async Task GetPhotosAsync_WithFamilyId_ShouldReturnOnlyFamilyPhotos()
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

            var photos = new[]
            {
                new Photo 
                { 
                    ImageUrl = "/images/family1_photo1.jpg", 
                    Title = "Family 1 Photo 1", 
                    FamilyId = family1.Id, 
                    UploadedByUserId = "user1",
                    UploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                },
                new Photo 
                { 
                    ImageUrl = "/images/family1_photo2.jpg", 
                    Title = "Family 1 Photo 2", 
                    FamilyId = family1.Id, 
                    UploadedByUserId = "user1",
                    UploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                },
                new Photo 
                { 
                    ImageUrl = "/images/family2_photo1.jpg", 
                    Title = "Family 2 Photo 1", 
                    FamilyId = family2.Id, 
                    UploadedByUserId = "user2",
                    UploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.Photos.AddRange(photos);
            await _context.SaveChangesAsync();

            // Act
            var result = await _photoService.GetPhotosAsync(family1.Id);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, p => Assert.Equal(family1.Id, p.FamilyId));
            Assert.Contains(result, p => p.Title == "Family 1 Photo 1");
            Assert.Contains(result, p => p.Title == "Family 1 Photo 2");
        }

        [Fact]
        public async Task GetPhotoByIdAsync_WithValidId_ShouldReturnPhoto()
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

            var photo = new Photo
            {
                ImageUrl = "/images/test.jpg",
                Title = "Тестова снимка",
                Description = "Тестово описание",
                FamilyId = family.Id,
                UploadedByUserId = "user1",
                UploadedAt = DateTime.UtcNow,
                DateTaken = new DateTime(2023, 12, 25),
                Location = "София, България",
                CreatedAt = DateTime.UtcNow
            };

            _context.Photos.Add(photo);
            await _context.SaveChangesAsync();

            // Act
            var result = await _photoService.GetPhotoByIdAsync(photo.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Тестова снимка", result.Title);
            Assert.Equal("Тестово описание", result.Description);
            Assert.Equal("София, България", result.Location);
            Assert.Equal(new DateTime(2023, 12, 25), result.DateTaken);
        }

        [Fact]
        public async Task GetPhotoByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Act
            var result = await _photoService.GetPhotoByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task UploadPhotoAsync_WithValidPhoto_ShouldCreateSuccessfully()
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

            var photo = new Photo
            {
                ImageUrl = "/images/new_photo.jpg",
                Title = "Нова снимка",
                Description = "Описание на нова снимка",
                FamilyId = family.Id,
                UploadedByUserId = "user1",
                DateTaken = new DateTime(2024, 1, 15),
                Location = "Пловдив",
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var result = await _photoService.UploadPhotoAsync(photo);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
            Assert.Equal("Нова снимка", result.Title);
            Assert.True(result.UploadedAt <= DateTime.UtcNow);

            // Verify in database
            var savedPhoto = await _context.Photos.FindAsync(result.Id);
            Assert.NotNull(savedPhoto);
            Assert.Equal("Нова снимка", savedPhoto.Title);
        }

        [Fact]
        public async Task UpdatePhotoAsync_WithValidData_ShouldUpdateSuccessfully()
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

            var originalPhoto = new Photo
            {
                ImageUrl = "/images/original.jpg",
                Title = "Оригинално заглавие",
                Description = "Оригинално описание",
                FamilyId = family.Id,
                UploadedByUserId = "user1",
                UploadedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Photos.Add(originalPhoto);
            await _context.SaveChangesAsync();

            var updatedPhoto = new Photo
            {
                ImageUrl = "/images/updated.jpg",
                Title = "Обновено заглавие",
                Description = "Обновено описание",
                FamilyId = family.Id,
                UploadedByUserId = "user1",
                Location = "Варна"
            };

            // Act
            var result = await _photoService.UpdatePhotoAsync(originalPhoto.Id, updatedPhoto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Обновено заглавие", result.Title);
            Assert.Equal("Обновено описание", result.Description);
            Assert.Equal("Варна", result.Location);
            Assert.True(result.CreatedAt >= originalPhoto.CreatedAt);
        }

        [Fact]
        public async Task DeletePhotoAsync_WithValidId_ShouldDeleteSuccessfully()
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

            var photo = new Photo
            {
                ImageUrl = "/images/to_delete.jpg",
                Title = "За изтриване",
                FamilyId = family.Id,
                UploadedByUserId = "user1",
                UploadedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Photos.Add(photo);
            await _context.SaveChangesAsync();

            // Act
            var result = await _photoService.DeletePhotoAsync(photo.Id);

            // Assert
            Assert.True(result);

            // Verify deletion
            var deletedPhoto = await _context.Photos.FindAsync(photo.Id);
            Assert.Null(deletedPhoto);
        }

        [Fact]
        public async Task DeletePhotoAsync_WithInvalidId_ShouldReturnFalse()
        {
            // Act
            var result = await _photoService.DeletePhotoAsync(999);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetPhotosAsync_ShouldReturnPhotosOrderedByUploadDate()
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

            var photos = new[]
            {
                new Photo 
                { 
                    ImageUrl = "/images/old.jpg", 
                    Title = "Стара снимка", 
                    FamilyId = family.Id, 
                    UploadedByUserId = "user1",
                    UploadedAt = DateTime.UtcNow.AddDays(-5),
                    CreatedAt = DateTime.UtcNow
                },
                new Photo 
                { 
                    ImageUrl = "/images/new.jpg", 
                    Title = "Нова снимка", 
                    FamilyId = family.Id, 
                    UploadedByUserId = "user1",
                    UploadedAt = DateTime.UtcNow.AddDays(-1),
                    CreatedAt = DateTime.UtcNow
                },
                new Photo 
                { 
                    ImageUrl = "/images/newest.jpg", 
                    Title = "Най-нова снимка", 
                    FamilyId = family.Id, 
                    UploadedByUserId = "user1",
                    UploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.Photos.AddRange(photos);
            await _context.SaveChangesAsync();

            // Act
            var result = await _photoService.GetPhotosAsync();
            var recentResult = result.Take(2);

            // Assert
            Assert.Equal(2, recentResult.Count());
            var photosList = recentResult.ToList();
            Assert.Equal("Най-нова снимка", photosList[0].Title); // Most recent first
            Assert.Equal("Нова снимка", photosList[1].Title);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}