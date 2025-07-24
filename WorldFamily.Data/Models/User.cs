using Microsoft.AspNetCore.Identity;

class User : IdentityUser<string>
{

    public string FirstName { get; set; } = "";
    public string MiddleName { get; set; } = "";
    public string LastName { get; set; } = "";

    // Navigation properties
    public virtual ICollection<Family> CreatedFamilies { get; set; } = new List<Family>();
    public virtual ICollection<Story> Stories { get; set; } = new List<Story>();

}