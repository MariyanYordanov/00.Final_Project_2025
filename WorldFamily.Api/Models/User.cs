using Microsoft.AspNetCore.Identity;

class User : IdentityUser<string>
{
    public string UserId { get; set; } = Guid.NewGuid().ToString();
    public string FirstName { get; set; } = "";

    public string MiddleName { get; set;} = "";

    public string LastName { get; set; } = "";
    
}