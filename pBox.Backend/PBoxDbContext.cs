using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;
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

public class UsePBoxDbContext : UseDbContextAttribute
{
    public UsePBoxDbContext([CallerLineNumber] int order = 0)
        : base(typeof(PBoxDbContext))
    {
        Order = order;
    }
}

public class GraphQlErrorFilter : IErrorFilter
{
    public IError OnError(IError error)
    {
        return error.WithMessage(error.Exception != null ? error.Exception.Message : "Something went wrong... :(");
    }
}