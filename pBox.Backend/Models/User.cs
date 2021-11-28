using Microsoft.EntityFrameworkCore;

namespace pBox.Backend.Models;

[Index(nameof(Auth0Id), IsUnique = true)]
public class User
{
    public int Id { get; set; }
    public string Auth0Id { get; set; }
}