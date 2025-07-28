using Microsoft.AspNetCore.Identity;
using WorldFamily.Data;
using WorldFamily.Data.Models;

namespace WorldFamily.Data;

public static class SeedData
{
    public static async Task Initialize(AppDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
    {
        // Seed roles
        var roles = new[] { "Admin", "User" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Seed admin user
        const string adminEmail = "admin@worldfamily.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FirstName = "Admin",
                MiddleName = "System",
                LastName = "User",
                DateOfBirth = new DateTime(1990, 1, 1),
                JoinedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Seed demo users
        var demoUsers = new List<User>();
        var demoUserData = new[]
        {
            ("john@demo.com", "John", "Demo", "Doe", new DateTime(1975, 5, 15)),
            ("jane@demo.com", "Jane", "Marie", "Doe", new DateTime(1978, 8, 22)),
            ("mike@demo.com", "Michael", "James", "Doe", new DateTime(2000, 3, 10)),
            ("sarah@demo.com", "Sarah", "Elizabeth", "Doe", new DateTime(2002, 11, 5)),
            ("bob@demo.com", "Robert", "William", "Smith", new DateTime(1950, 2, 28)),
            ("mary@demo.com", "Mary", "Ann", "Smith", new DateTime(1952, 7, 14))
        };

        foreach (var (email, firstName, middleName, lastName, dateOfBirth) in demoUserData)
        {
            if (await userManager.FindByEmailAsync(email) == null)
            {
                var user = new User
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    FirstName = firstName,
                    MiddleName = middleName,
                    LastName = lastName,
                    DateOfBirth = dateOfBirth,
                    JoinedAt = DateTime.UtcNow,
                    Bio = $"{firstName} is a member of the {lastName} family."
                };

                var result = await userManager.CreateAsync(user, "Demo123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "User");
                    demoUsers.Add(user);
                }
            }
            else
            {
                demoUsers.Add(await userManager.FindByEmailAsync(email));
            }
        }

        // Seed sample families if none exists
        if (!context.Families.Any())
        {
            var adminId = (await userManager.FindByEmailAsync(adminEmail))?.Id ?? "";
            
            // Doe Family
            var doeFamily = new Family
            {
                Name = "The Doe Family",
                Description = "Welcome to the Doe family tree! We're a loving family spanning three generations.",
                CreatedByUserId = demoUsers[0]?.Id ?? adminId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Smith Family
            var smithFamily = new Family
            {
                Name = "The Smith Family",
                Description = "The Smith family legacy - preserving our heritage and memories.",
                CreatedByUserId = demoUsers[4]?.Id ?? adminId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Families.AddRange(doeFamily, smithFamily);
            await context.SaveChangesAsync();

            // Add family members
            var familyMembers = new List<FamilyMember>
            {
                // Doe family members
                new FamilyMember { FamilyId = doeFamily.Id, LinkedUserId = demoUsers[0].Id, FirstName = "John", MiddleName = "Demo", LastName = "Doe", DateOfBirth = new DateTime(1975, 5, 15), Gender = Gender.Male, Role = "Father", AddedByUserId = adminId, JoinedAt = DateTime.UtcNow },
                new FamilyMember { FamilyId = doeFamily.Id, LinkedUserId = demoUsers[1].Id, FirstName = "Jane", MiddleName = "Marie", LastName = "Doe", DateOfBirth = new DateTime(1978, 8, 22), Gender = Gender.Female, Role = "Mother", AddedByUserId = adminId, JoinedAt = DateTime.UtcNow },
                new FamilyMember { FamilyId = doeFamily.Id, LinkedUserId = demoUsers[2].Id, FirstName = "Michael", MiddleName = "James", LastName = "Doe", DateOfBirth = new DateTime(2000, 3, 10), Gender = Gender.Male, Role = "Son", AddedByUserId = adminId, JoinedAt = DateTime.UtcNow },
                new FamilyMember { FamilyId = doeFamily.Id, LinkedUserId = demoUsers[3].Id, FirstName = "Sarah", MiddleName = "Elizabeth", LastName = "Doe", DateOfBirth = new DateTime(2002, 11, 5), Gender = Gender.Female, Role = "Daughter", AddedByUserId = adminId, JoinedAt = DateTime.UtcNow },
                
                // Smith family members
                new FamilyMember { FamilyId = smithFamily.Id, LinkedUserId = demoUsers[4].Id, FirstName = "Robert", MiddleName = "William", LastName = "Smith", DateOfBirth = new DateTime(1950, 2, 28), Gender = Gender.Male, Role = "Grandfather", AddedByUserId = adminId, JoinedAt = DateTime.UtcNow },
                new FamilyMember { FamilyId = smithFamily.Id, LinkedUserId = demoUsers[5].Id, FirstName = "Mary", MiddleName = "Ann", LastName = "Smith", DateOfBirth = new DateTime(1952, 7, 14), Gender = Gender.Female, Role = "Grandmother", AddedByUserId = adminId, JoinedAt = DateTime.UtcNow }
            };

            context.FamilyMembers.AddRange(familyMembers);
            await context.SaveChangesAsync();

            // Add relationships
            var relationships = new List<Relationship>
            {
                // Doe family relationships
                new Relationship { PrimaryMemberId = familyMembers[0].Id, RelatedMemberId = familyMembers[1].Id, RelationshipType = RelationshipType.Spouse, CreatedByUserId = demoUsers[0].Id },
                new Relationship { PrimaryMemberId = familyMembers[0].Id, RelatedMemberId = familyMembers[2].Id, RelationshipType = RelationshipType.Parent, CreatedByUserId = demoUsers[0].Id },
                new Relationship { PrimaryMemberId = familyMembers[0].Id, RelatedMemberId = familyMembers[3].Id, RelationshipType = RelationshipType.Parent, CreatedByUserId = demoUsers[0].Id },
                new Relationship { PrimaryMemberId = familyMembers[1].Id, RelatedMemberId = familyMembers[2].Id, RelationshipType = RelationshipType.Parent, CreatedByUserId = demoUsers[1].Id },
                new Relationship { PrimaryMemberId = familyMembers[1].Id, RelatedMemberId = familyMembers[3].Id, RelationshipType = RelationshipType.Parent, CreatedByUserId = demoUsers[1].Id },
                new Relationship { PrimaryMemberId = familyMembers[2].Id, RelatedMemberId = familyMembers[3].Id, RelationshipType = RelationshipType.Sibling, CreatedByUserId = demoUsers[2].Id },
                
                // Smith family relationships
                new Relationship { PrimaryMemberId = familyMembers[4].Id, RelatedMemberId = familyMembers[5].Id, RelationshipType = RelationshipType.Spouse, CreatedByUserId = demoUsers[4].Id }
            };

            context.Relationships.AddRange(relationships);
            await context.SaveChangesAsync();

            // Add sample stories
            var stories = new List<Story>
            {
                new Story
                {
                    FamilyId = doeFamily.Id,
                    AuthorUserId = demoUsers[0].Id,
                    Title = "Our Wedding Day",
                    Content = "It was a beautiful summer day when Jane and I tied the knot. Friends and family gathered to celebrate our love...",
                    CreatedAt = DateTime.UtcNow.AddDays(-365),
                    UpdatedAt = DateTime.UtcNow.AddDays(-365)
                },
                new Story
                {
                    FamilyId = doeFamily.Id,
                    AuthorUserId = demoUsers[2].Id,
                    Title = "My First Day at College",
                    Content = "I still remember the excitement and nervousness I felt stepping onto campus for the first time...",
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    UpdatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new Story
                {
                    FamilyId = smithFamily.Id,
                    AuthorUserId = demoUsers[4].Id,
                    Title = "50 Years Together",
                    Content = "Mary and I celebrated our golden anniversary surrounded by our children and grandchildren. What a journey it has been...",
                    CreatedAt = DateTime.UtcNow.AddDays(-7),
                    UpdatedAt = DateTime.UtcNow.AddDays(-7)
                }
            };

            context.Stories.AddRange(stories);
            await context.SaveChangesAsync();

            // Add sample photos
            var photos = new List<Photo>
            {
                new Photo
                {
                    FamilyId = doeFamily.Id,
                    UploadedByUserId = demoUsers[1].Id,
                    Title = "Family Christmas 2023",
                    Description = "Our annual family gathering around the Christmas tree",
                    ImageUrl = "/uploads/christmas2023.jpg",
                    UploadedAt = DateTime.UtcNow.AddDays(-40),
                    DateTaken = new DateTime(2023, 12, 25)
                },
                new Photo
                {
                    FamilyId = doeFamily.Id,
                    UploadedByUserId = demoUsers[3].Id,
                    Title = "Sarah's Graduation",
                    Description = "So proud of our daughter!",
                    ImageUrl = "/uploads/graduation2024.jpg",
                    UploadedAt = DateTime.UtcNow.AddDays(-60),
                    DateTaken = new DateTime(2024, 5, 15)
                },
                new Photo
                {
                    FamilyId = smithFamily.Id,
                    UploadedByUserId = demoUsers[5].Id,
                    Title = "Golden Anniversary",
                    Description = "50 wonderful years together",
                    ImageUrl = "/uploads/anniversary50.jpg",
                    UploadedAt = DateTime.UtcNow.AddDays(-10),
                    DateTaken = DateTime.UtcNow.AddDays(-10)
                }
            };

            context.Photos.AddRange(photos);
            await context.SaveChangesAsync();
        }
    }
}