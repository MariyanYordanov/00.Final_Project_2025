namespace WorldFamily.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        protected override void OnModelCreating()
        {
            base.OnModelCreating();
        }
        
    }
}