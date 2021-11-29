namespace pBox.Backend.Models;

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime CreateDate { get; set; }
    public DateTime EditDate { get; set; }
    public Category Category { get; set; }
    public int Score { get; set; }
    public List<Vote>? Votes { get; set; }
    public User Author { get; set; }
    public List<Tag>? Tags { get; set; }
}