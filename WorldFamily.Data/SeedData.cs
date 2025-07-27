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

        // Seed sample family if none exists
        if (!context.Families.Any())
        {
            var sampleFamily = new Family
            {
                Name = "Sample Family",
                Description = "Welcome to our family network!",
                CreatedByUserId = (await userManager.FindByEmailAsync(adminEmail))?.Id ?? "",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Families.Add(sampleFamily);
            await context.SaveChangesAsync();
        }
    }
}