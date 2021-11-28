using Microsoft.EntityFrameworkCore;
using pBox.Backend;
using pBox.Backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddGraphQLServer()
    .AddQueryType<CategoryQuery>()
    .AddMutationType<CategoryMutation>()
    .AddErrorFilter<GraphQlErrorFilter>();
builder.Services.AddPooledDbContextFactory<PBoxDbContext>(options =>
    options.UseSqlite("Data Source=mydatabase.db"));

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseRouting()
    .UseEndpoints(endpoints =>
    {
        endpoints.MapGraphQL();
    });

app.Run();
