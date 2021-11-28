namespace pBox.Backend.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Color { get; set; }
    public List<Post> Posts { get; set; }
}