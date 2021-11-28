using Microsoft.EntityFrameworkCore;

namespace pBox.Backend.Models;

public enum Score
{
    Neutral = 0,
    Upvote = 1,
    Downvote = -1
}

[Index(nameof(AuthorId), nameof(PostId), IsUnique = true)]
public class Vote
{
    public int Id { get; set; }
    public int AuthorId { get; set; }
    public User Author { get; set; }
    public int PostId { get; set; }
    public Post Post { get; set; }
    public Score Score { get; set; }
}

public class VoteResult
{
    public int Score { get; set; }
    public Score MyScore { get; set; }
}

public class VoteMutation
{
    [UsePBoxDbContext]
    public async Task<VoteResult>
}