using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using pBox.Backend;

var builder = WebApplication.CreateBuilder(args);

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      builder =>
                      {
                          builder.WithOrigins("http://localhost:3000")
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                      });
});

var domain = $"https://{builder.Configuration["Auth0:Domain"]}/";
var audience = builder.Configuration["Auth0:Audience"];

var opts = new JwtBearerOptions()
{
    Authority = domain,
    TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = domain,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true
    }
};
builder.Services.AddSingleton(opts);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = domain;
        options.Audience = audience;
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();

builder.Services.AddHttpContextAccessor();
// builder.Services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();

builder.Services.AddGraphQLServer()
    .AddAuthorization()
    .AddProjections()
    .AddQueryType<Query>()
    .AddTypeExtension<PostExtensions>()
    .AddMutationType<Mutation>()
    .AddErrorFilter<GraphQlErrorFilter>();
builder.Services.AddPooledDbContextFactory<PBoxDbContext>(options =>
    options.UseSqlite("Data Source=mydatabase.db"));

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins);

app.MapControllers();

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.UseEndpoints(endpoints =>
    {
        endpoints.MapGraphQL();
    });

app.Run();

// public class HasScopeHandler : AuthorizationHandler<HasScopeRequirement>
// {
//     protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, HasScopeRequirement requirement)
//     {
//         // If user does not have the scope claim, get out of here
//         if (!context.User.HasClaim(c => c.Type == "scope" && c.Issuer == requirement.Issuer))
//             return Task.CompletedTask;

//         // Split the scopes string into an array
//         var scopes = context.User?.FindFirst(c => c.Type == "scope" && c.Issuer == requirement.Issuer).Value.Split(' ');

//         // Succeed if the scope array contains the required scope
//         if (scopes.Any(s => s == requirement.Scope))
//             context.Succeed(requirement);

//         return Task.CompletedTask;
//     }
// }

// public class HasScopeRequirement : IAuthorizationRequirement
// {
//     public string Issuer { get; }
//     public string Scope { get; }

//     public HasScopeRequirement(string scope, string issuer)
//     {
//         Scope = scope ?? throw new ArgumentNullException(nameof(scope));
//         Issuer = issuer ?? throw new ArgumentNullException(nameof(issuer));
//     }
// }