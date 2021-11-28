using HotChocolate.Execution;
namespace pBox.Backend.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<Post>? Posts { get; set; }
    public List<Category>? Children { get; set; }
    public Category? Parent { get; set; }
}

public class CategoryQuery
{
    [UsePBoxDbContext]
    [UseFirstOrDefault]
    public IQueryable<Category> GetCategory([ScopedService] PBoxDbContext db, int id)
        => db.Categories.Where(c => c.Id == id);

    [UsePBoxDbContext]
    public IQueryable<Category> GetCategories([ScopedService] PBoxDbContext db)
        => db.Categories;
}

public class CategoryMutation
{
    [UsePBoxDbContext]
    public async Task<Category> AddCategory([ScopedService] PBoxDbContext db,
        string name, int? parentId)
    {
        Category? parent = null;

        if (parentId != null &&
            (parent = await db.Categories.FindAsync(parentId)) == null)
        {
            throw new QueryException(
                ErrorBuilder.New()
                    .SetMessage("Category with given parentId does not exist.")
                    .SetCode("INVALID_RELATION")
                    .Build());
        }

        var category = new Category()
        {
            Name = name,
            Parent = parent
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return category;
    }
}