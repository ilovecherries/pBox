namespace pBox.Backend.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<Post>? Posts { get; set; }
    public List<Category>? Children { get; set; }
    public Category? Parent { get; set; }
}
