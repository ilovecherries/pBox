using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Execution;
using Microsoft.EntityFrameworkCore;
using pBox.Backend;
using pBox.Backend.Models;

public class Query
{
    [UsePBoxDbContext]
    [UseFirstOrDefault]
    public IQueryable<Category> GetCategory([ScopedService] PBoxDbContext db, int id)
        => db.Categories.Where(c => c.Id == id);

    [UsePBoxDbContext]
    public IQueryable<Category> GetCategories([ScopedService] PBoxDbContext db)
        => db.Categories;

    [UsePBoxDbContext]
    [UseFirstOrDefault]
    public IQueryable<Post> GetPost([ScopedService] PBoxDbContext db, int id)
        => db.Posts.Where(p => p.Id == id);

    [UsePBoxDbContext]
    public IQueryable<Post> GetPosts([ScopedService] PBoxDbContext db)
        => db.Posts;

    [UsePBoxDbContext]
    [UseFirstOrDefault]
    public int GetScore([Parent] Post post)
        => post.Votes.Select(v => (int)v.Score).Sum();

    [UsePBoxDbContext]
    [UseFirstOrDefault]
    public IQueryable<User> GetUser([ScopedService] PBoxDbContext db, int id)
        => db.Users.Where(u => u.Id == id);

    [UsePBoxDbContext]
    public IQueryable<User> GetUser([ScopedService] PBoxDbContext db)
        => db.Users;

    [UsePBoxDbContext]
    [UseFirstOrDefault]
    public IQueryable<Tag> GetTag([ScopedService] PBoxDbContext db, int id)
        => db.Tags.Where(t => t.Id == id);

    [UsePBoxDbContext]
    public IQueryable<Tag> GetTag([ScopedService] PBoxDbContext db)
        => db.Tags;
}

public class Mutation
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
                    .SetCode("CATEGORY_DOES_NOT_EXIST")
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

    [UsePBoxDbContext]
    public async Task<Vote> SetVote([ScopedService] PBoxDbContext db, int score,
        int postId, int userId)
    {
        if (await db.Posts.FindAsync(postId) == null)
        {
            throw new QueryException(
                ErrorBuilder.New()
                    .SetMessage("Post with given postId does not exist.")
                    .SetCode("POST_DOES_NOT_EXIST")
                    .Build());
        }

        if (!Enum.IsDefined(typeof(Score), score))
        {
            throw new QueryException(
                ErrorBuilder.New()
                    .SetMessage("Invalid score given, must be either 1, 0 or -1.")
                    .SetCode("INVALID_SCORE")
                    .Build());
        }

        // User? user = await db.Users.FindAsync(postId);

        // if (user == null)
        // {
        //     throw new QueryException(
        //         ErrorBuilder.New()
        //             .SetMessage("User with given userId does not exist.")
        //             .SetCode("INVALID_RELATION")
        //             .Build());
        // }

        var vote = new Vote()
        {
            AuthorId = userId,
            PostId = postId,
            Score = (Score)score
        };

        await db.Votes
            .Upsert(vote)
            .On(v => new { v.AuthorId, v.PostId })
            .WhenMatched((v) => new Vote
            {
                Score = (Score)score
            })
            .RunAsync();

        return vote;
    }

    [UsePBoxDbContext]
    public async Task<User> AddUser([ScopedService] PBoxDbContext db, string authId)
    {
        var user = new User()
        {
            Auth0Id = authId
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }

    [UsePBoxDbContext]
    public async Task<Tag> AddTag([ScopedService] PBoxDbContext db, string name,
        string color)
    {
        var tag = new Tag()
        {
            Name = name,
            Color = color
        };

        db.Tags.Add(tag);
        await db.SaveChangesAsync();
        return tag;
    }

    [UsePBoxDbContext]
    public async Task<Post> AddPost([ScopedService] PBoxDbContext db, string title,
        string content, int categoryId, List<int>? tagIds, int authorId)
    {
        
    }
}
