namespace MyFamilyTreeNet.Api.DTOs
{
    public class AddRoleDto
    {
        public required string RoleName { get; set; }
    }

    public class LockUserDto
    {
        public int Days { get; set; }
    }

    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }
        public int TotalFamilies { get; set; }
        public int TotalMembers { get; set; }
        public int TotalPhotos { get; set; }
        public int TotalStories { get; set; }
        public int NewUsersThisMonth { get; set; }
        public int NewFamiliesToday { get; set; }
        public int ActiveUsers { get; set; }
    }
}