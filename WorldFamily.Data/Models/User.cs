class User : IdentityUser<string>
{
    [Required]
    [MaxLength(50)]
    [Display(Name = "First Name")]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Display(Name = "Middle Name")]
    public string MiddleName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Display(Name = "Last Name")]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(500)]
    [Display(Name = "Biography")]
    public string? Bio { get; set; }

    public string? ProfilePictureUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public virtual ICollection<Family> CreatedFamilies { get; set; } = new List<Family>();
    public virtual ICollection<FamilyMember> FamilyMembers { get; set; } = new List<FamilyMember>();
    public virtual ICollection<Story> Stories { get; set; } = new List<Story>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<PhotoLike> PhotoLikes { get; set; } = new List<PhotoLike>();
    public virtual ICollection<StoryLike> StoryLikes { get; set; } = new List<StoryLike>();

}