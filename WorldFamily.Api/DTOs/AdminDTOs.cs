namespace WorldFamily.Api.DTOs
{
    public class AddRoleDto
    {
        public required string RoleName { get; set; }
    }

    public class LockUserDto
    {
        public int Days { get; set; }
    }
}