using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Execution;
using Microsoft.EntityFrameworkCore;
using pBox.Backend;
using pBox.Backend.Models;
using System.Security.Claims;
using System.Text.Json;

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
    [UseProjection]
    [UseFirstOrDefault]
    public IQueryable<Vote> GetVote([ScopedService] PBoxDbContext db, int id)
        => db.Votes.Where(v => v.Id == id);

    [UsePBoxDbContext]
    [UseProjection]
    public IQueryable<Vote> GetVotes([ScopedService] PBoxDbContext db)
        => db.Votes;

    [UsePBoxDbContext]
    [UseProjection]
    [UseFirstOrDefault]
    public IQueryable<Post> GetPost([ScopedService] PBoxDbContext db, int id)
        => db.Posts.Where(p => p.Id == id);

    [UsePBoxDbContext]
    [UseProjection]
    public IQueryable<Post> GetPosts([ScopedService] PBoxDbContext db)
        => db.Posts;

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
    public IQueryable<Tag> GetTags([ScopedService] PBoxDbContext db)
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
        Vote? oldVote = null;
        if ((oldVote = await db.Votes
                .Include(v => v.Author)
                .Include(v => v.Post)
                .Where(v => v.AuthorId == userId && v.PostId == postId)
                .FirstOrDefaultAsync()) != null)
        {
            System.Console.WriteLine("HEARTS AS STRONG AS HORSES");
            oldVote.Score = (Score)score;
            await db.SaveChangesAsync();
            return oldVote;
        }

        Post? post = await db.Posts.FindAsync(postId);
        if (post == null)
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

        User? author = await db.Users.FindAsync(postId);
        if (author == null)
        {
            throw new QueryException(
                ErrorBuilder.New()
                    .SetMessage("User with given userId does not exist.")
                    .SetCode("INVALID_RELATION")
                    .Build());
        }

        var vote = new Vote()
        {
            Post = post,
            Author = author,
            Score = (Score)score
        };

        await db.Votes.AddAsync(vote);
        await db.SaveChangesAsync();
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
        Category? category = await db.Categories.FindAsync(categoryId);
        if (category == null)
        {
            throw new QueryException(
                ErrorBuilder.New()
                    .SetMessage("Category with given categoryId does not exist.")
                    .SetCode("CATEGORY_DOES_NOT_EXIST")
                    .Build());
        }

        User? user = await db.Users.FindAsync(authorId);
        if (user == null)
        {
            throw new QueryException(
                ErrorBuilder.New()
                    .SetMessage("User with given userId does not exist.")
                    .SetCode("USER_DOES_NOT_EXIST")
                    .Build());
        }

        List<Tag>? tags = null;
        if ((tagIds != null) &&
            (tags = db.Tags.Where(t => tagIds.Contains(t.Id)).ToList()).Capacity != tagIds.Capacity)
        {
            throw new QueryException(
                ErrorBuilder.New()
                    .SetMessage("One or more of the tags in tagIds does not exist.")
                    .SetCode("TAG_DOES_NOT_EXIST")
                    .Build());
        }

        var post = new Post()
        {
            Title = title,
            Content = content,
            Category = category,
            Author = user
        };

        await db.Posts.AddAsync(post);
        await db.SaveChangesAsync();
        return post;
    }
}

[ExtendObjectType(typeof(Post))]
public class PostExtensions
{
    [UsePBoxDbContext]
    public int GetScore([ScopedService] PBoxDbContext db, [Parent] Post post)
        => db.Votes
            .Where(v => v.PostId == post.Id)
            .Select(v => (int)v.Score)
            .Sum();

    [UsePBoxDbContext]
    [Authorize]
    public int GetMyScore([ScopedService] PBoxDbContext db, [Parent] Post post,
        ClaimsPrincipal claimsPrincipal)
    {
        System.Console.WriteLine("BALLS");
        var userId = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
        System.Console.WriteLine(userId);
        System.Console.WriteLine("BALLED");
        return 99999;
        // return db.Votes
        //     .Where(v => v.PostId == post.Id)
        //     .Select(v => (int)v.Score)
        //     .FirstOrDefault(0);
    }
}