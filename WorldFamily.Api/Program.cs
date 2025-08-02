using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WorldFamily.Data;
using WorldFamily.Data.Models;
using WorldFamily.Api.Contracts;
using WorldFamily.Api.Services;
using WorldFamily.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddControllersWithViews();

// Configure Entity Framework with SQLite (Development) or PostgreSQL (Production)
var databaseProvider = builder.Configuration.GetValue<string>("DatabaseProvider");
var isDevelopment = builder.Environment.IsDevelopment();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (isDevelopment && databaseProvider == "SQLite")
    {
        // Development - SQLite
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
    else
    {
        // Production - PostgreSQL
        var connectionString = builder.Configuration.GetConnectionString("PostgreSQLConnection") 
            ?? Environment.GetEnvironmentVariable("DATABASE_URL");
        
        if (!string.IsNullOrEmpty(connectionString) && connectionString.StartsWith("postgres://"))
        {
            // Parse Render.com DATABASE_URL format
            connectionString = ConvertRenderDatabaseUrl(connectionString);
        }
        
        options.UseNpgsql(connectionString);
    }
    
    options.ConfigureWarnings(warnings =>
        warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// Configure Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;

    // User settings
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey ?? "ThisIsAVerySecretKeyForWorldFamilyAppMinimum32Characters"))
    };
});

// Configure CORS for Angular app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Development - Allow localhost
            policy.WithOrigins("http://localhost:4200", "http://localhost:4201")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            // Production - Allow configured origins and Render.com domains
            var allowedOrigins = builder.Configuration.GetSection("CORS:AllowedOrigins").Get<string[]>() 
                ?? new[] { "https://your-frontend-domain.onrender.com" };
            
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

// Add OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "World Family API",
        Version = "v1",
        Description = "Family Social Network & Genealogy Tree API"
    });

    // Configure JWT in Swagger
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Register application services
builder.Services.AddScoped<IFamilyService, FamilyService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<IRelationshipService, RelationshipService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddScoped<IStoryService, StoryService>();

// Register security services
builder.Services.AddScoped<WorldFamily.Api.Security.ISecurityService, WorldFamily.Api.Security.SecurityService>();

var app = builder.Build();

// Helper function to convert Render.com DATABASE_URL to connection string
static string ConvertRenderDatabaseUrl(string databaseUrl)
{
    var uri = new Uri(databaseUrl);
    var host = uri.Host;
    var port = uri.Port;
    var database = uri.LocalPath.TrimStart('/');
    var userInfo = uri.UserInfo.Split(':');
    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : "";
    
    return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    
    // Add test error endpoints for development
    app.MapGet("/test-404", () => Results.NotFound());
    app.MapGet("/test-500", () => { throw new Exception("Test 500 error"); });
}
else
{
    // Custom error handling for production
    app.UseExceptionHandler("/Error");
    app.UseStatusCodePagesWithReExecute("/Error/{0}");
    
    // Add security headers
    app.UseHsts();
}

// API-only status code handling
app.UseStatusCodePages(async context =>
{
    var statusCode = context.HttpContext.Response.StatusCode;
    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
    var path = context.HttpContext.Request.Path;
    
    // Return JSON error response for all requests
    context.HttpContext.Response.ContentType = "application/json";
    var error = new
    {
        type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
        title = statusCode switch
        {
            404 => "Not Found",
            403 => "Forbidden", 
            401 => "Unauthorized",
            500 => "Internal Server Error",
            _ => "Error"
        },
        status = statusCode,
        detail = statusCode switch
        {
            404 => "The requested API endpoint was not found.",
            403 => "You do not have permission to access this API resource.",
            401 => "Authentication is required to access this API resource.",
            500 => "An internal server error occurred.",
            _ => "An error occurred processing your API request."
        },
        traceId = context.HttpContext.TraceIdentifier
    };
    
    // Log the error
    logger.LogWarning("API Error {StatusCode}: {Path} - User: {User}", 
        statusCode, path, context.HttpContext.User.Identity?.Name ?? "Anonymous");
    
    await context.HttpContext.Response.WriteAsJsonAsync(error);
});


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "World Family API V1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();

// Use static files for MVC pages (CSS, JS, images)
app.UseStaticFiles();

// Use CORS
app.UseCors("AllowAngularApp");

// Use Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers with areas (for Admin)
app.MapControllerRoute(
    name: "areas",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

// Map MVC controllers
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Map error routes
app.MapControllerRoute(
    name: "errors",
    pattern: "Error/{action=Index}",
    defaults: new { controller = "Error" });
    
// Map API controllers
app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => new
{
    Status = "Healthy",
    Timestamp = DateTime.UtcNow,
    Application = "World Family API",
    Version = "1.0.0"
})
.WithName("HealthCheck")
.WithTags("Health");

// Seed database on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    // Apply migrations
    await context.Database.MigrateAsync();

    // Seed data
    await SeedData.Initialize(context, userManager, roleManager);
}

app.Run();
