using System.Runtime.CompilerServices;
using pBox.Backend.Models;

namespace pBox.Backend;

public class UsePBoxDbContext : UseDbContextAttribute
{
    public UsePBoxDbContext([CallerLineNumber] int order = 0)
        : base(typeof(PBoxDbContext))
    {
        Order = order;
    }
}
