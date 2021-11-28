using HotChocolate.Execution;
using pBox.Backend;

namespace pBox.Backend.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }

    public List<Post> Posts { get; set; }
    public List<Category> Children { get; set; }
    public Category? Parent { get; set; }
}

public class CategoryQuery
{
    [UsePBoxDbContext]
    public Category? GetCategory([ScopedService] PBoxDbContext db, int id)
        => db.Categories.Find(id);

    [UsePBoxDbContext]
    public IQueryable<Category> GetCategories([ScopedService] PBoxDbContext db)
        => db.Categories;
}

public class CategoryMutation
{
    [UsePBoxDbContext]
    public Category AddCategory([ScopedService] PBoxDbContext db,
        string name, int? parentId)
    {
        Category? parent = null;

        if (parentId != null)
        {
            if (db.Categories.Find(parentId) == null)
            {
                throw new QueryException(ErrorBuilder.New()
                    .SetMessage("Category with given parentId does not exist.")
                    .Build());
            }
        }

        var category = new Category()
        {
            Name = name,
            Parent = parent
        };

        db.Categories.Add(category);
        db.SaveChanges();
        return category;
    }
}