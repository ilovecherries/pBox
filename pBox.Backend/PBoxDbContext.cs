using Microsoft.EntityFrameworkCore;
using pBox.Backend.Models;

namespace pBox.Backend;

public class PBoxDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<Vote> Votes { get; set; }
    public DbSet<Category> Categories { get; set; }

    public PBoxDbContext(DbContextOptions<PBoxDbContext> options) : base(options)
    {
        this.Database.EnsureCreated();
    }
}