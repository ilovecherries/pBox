using Microsoft.EntityFrameworkCore;

namespace pBox.Backend.Models;

[Index(nameof(AuthorId), nameof(PostId), IsUnique = true)]
public class Vote
{
    public int Id { get; set; }
    public int AuthorId { get; set; }
    public User Author { get; set; }
    public int PostId { get; set; }
    public Post Post { get; set; }
}