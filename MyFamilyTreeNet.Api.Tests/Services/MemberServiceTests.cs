using Microsoft.EntityFrameworkCore;
using MyFamilyTreeNet.Api.Services;
using MyFamilyTreeNet.Data;
using MyFamilyTreeNet.Data.Models;
using Xunit;

namespace MyFamilyTreeNet.Api.Tests.Services
{
    public class MemberServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly MemberService _memberService;

        public MemberServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _memberService = new MemberService(_context);
        }

        [Fact]
        public async Task GetFamilyMembersAsync_ShouldReturnMembersOfSpecificFamily()
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

            var members = new[]
            {
                new FamilyMember 
                { 
                    FirstName = "Иван", 
                    MiddleName = "Петров", 
                    LastName = "Георгиев", 
                    FamilyId = family1.Id, 
                    Gender = Gender.Male,
                    CreatedAt = DateTime.UtcNow
                },
                new FamilyMember 
                { 
                    FirstName = "Мария", 
                    MiddleName = "Стоянова", 
                    LastName = "Георгиева", 
                    FamilyId = family1.Id, 
                    Gender = Gender.Female,
                    CreatedAt = DateTime.UtcNow
                },
                new FamilyMember 
                { 
                    FirstName = "Петър", 
                    MiddleName = "Иванов", 
                    LastName = "Петров", 
                    FamilyId = family2.Id, 
                    Gender = Gender.Male,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.FamilyMembers.AddRange(members);
            await _context.SaveChangesAsync();

            // Act
            var result = await _memberService.GetFamilyMembersAsync(family1.Id);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, m => Assert.Equal(family1.Id, m.FamilyId));
            Assert.Contains(result, m => m.FirstName == "Иван");
            Assert.Contains(result, m => m.FirstName == "Мария");
        }

        [Fact]
        public async Task GetMemberByIdAsync_WithValidId_ShouldReturnMember()
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

            var member = new FamilyMember
            {
                FirstName = "Тест",
                MiddleName = "Тестов",
                LastName = "Тестински",
                FamilyId = family.Id,
                Gender = Gender.Male,
                DateOfBirth = new DateTime(1980, 5, 15),
                Biography = "Тестова биография",
                CreatedAt = DateTime.UtcNow
            };

            _context.FamilyMembers.Add(member);
            await _context.SaveChangesAsync();

            // Act
            var result = await _memberService.GetMemberByIdAsync(member.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Тест", result.FirstName);
            Assert.Equal("Тестов", result.MiddleName);
            Assert.Equal("Тестински", result.LastName);
            Assert.Equal(Gender.Male, result.Gender);
        }

        [Fact]
        public async Task GetMemberByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Act
            var result = await _memberService.GetMemberByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateMemberAsync_WithValidMember_ShouldCreateSuccessfully()
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

            var member = new FamilyMember
            {
                FirstName = "Нов",
                MiddleName = "Нов",
                LastName = "Член",
                FamilyId = family.Id,
                Gender = Gender.Female,
                DateOfBirth = new DateTime(1995, 8, 20),
                Biography = "Нова биография",
                PlaceOfBirth = "София",
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var result = await _memberService.CreateMemberAsync(member);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Id > 0);
            Assert.Equal("Нов", result.FirstName);
            Assert.True(result.CreatedAt <= DateTime.UtcNow);

            // Verify in database
            var savedMember = await _context.FamilyMembers.FindAsync(result.Id);
            Assert.NotNull(savedMember);
            Assert.Equal("Нов", savedMember.FirstName);
        }

        [Fact]
        public async Task UpdateMemberAsync_WithValidData_ShouldUpdateSuccessfully()
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

            var originalMember = new FamilyMember
            {
                FirstName = "Старо",
                MiddleName = "Старо",
                LastName = "Име",
                FamilyId = family.Id,
                Gender = Gender.Male,
                Biography = "Стара биография",
                CreatedAt = DateTime.UtcNow
            };

            _context.FamilyMembers.Add(originalMember);
            await _context.SaveChangesAsync();

            var updatedMember = new FamilyMember
            {
                FirstName = "Ново",
                MiddleName = "Ново",
                LastName = "Име",
                FamilyId = family.Id,
                Gender = Gender.Male,
                Biography = "Нова биография",
                PlaceOfBirth = "Пловдив"
            };

            // Act
            var result = await _memberService.UpdateMemberAsync(originalMember.Id, updatedMember);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Ново", result.FirstName);
            Assert.Equal("Нова биография", result.Biography);
            Assert.Equal("Пловдив", result.PlaceOfBirth);
            Assert.True(result.CreatedAt >= originalMember.CreatedAt);
        }

        [Fact]
        public async Task UpdateMemberAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var updatedMember = new FamilyMember
            {
                FirstName = "Ново",
                MiddleName = "Ново",
                LastName = "Име",
                FamilyId = 1,
                Gender = Gender.Male
            };

            // Act
            var result = await _memberService.UpdateMemberAsync(999, updatedMember);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteMemberAsync_WithValidId_ShouldDeleteSuccessfully()
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

            var member = new FamilyMember
            {
                FirstName = "За",
                MiddleName = "Да",
                LastName = "Изтрия",
                FamilyId = family.Id,
                Gender = Gender.Male,
                CreatedAt = DateTime.UtcNow
            };

            _context.FamilyMembers.Add(member);
            await _context.SaveChangesAsync();

            // Act
            var result = await _memberService.DeleteMemberAsync(member.Id);

            // Assert
            Assert.True(result);

            // Verify deletion
            var deletedMember = await _context.FamilyMembers.FindAsync(member.Id);
            Assert.Null(deletedMember);
        }

        [Fact]
        public async Task DeleteMemberAsync_WithInvalidId_ShouldReturnFalse()
        {
            // Act
            var result = await _memberService.DeleteMemberAsync(999);

            // Assert
            Assert.False(result);
        }

        [Theory]
        [InlineData(Gender.Male)]
        [InlineData(Gender.Female)]
        public async Task CreateMemberAsync_WithDifferentGenders_ShouldWorkCorrectly(Gender gender)
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

            var member = new FamilyMember
            {
                FirstName = "Тест",
                MiddleName = "Тест",
                LastName = "Член",
                FamilyId = family.Id,
                Gender = gender,
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var result = await _memberService.CreateMemberAsync(member);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(gender, result.Gender);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}