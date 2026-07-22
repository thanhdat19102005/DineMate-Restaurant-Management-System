using DineMate.Application.Features.Auth.Commands;
using DineMate.Application.Interfaces;
using DineMate.Infrastructure.Identity;
using DineMate.Infrastructure.Persistence;
using DineMate.Infrastructure.Repositories;
using DineMate.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ================= 1. CONTROLLERS =================
builder.Services.AddControllers();


// ================= 2. SWAGGER =================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// ================= 3. DATABASE =================
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnectionString"
        )
    );
});


// ================= 4. IDENTITY =================
builder.Services
    .AddIdentity<AppUserModel, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    /*
     * GIỮ NGUYÊN CẤU HÌNH MẬT KHẨU CŨ.
     */
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;

    options.User.RequireUniqueEmail = true;
});


// ================= 5. JWT AUTHENTICATION =================

var jwtKey =
    builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Chưa cấu hình Jwt:Key trong appsettings.json."
    );

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException(
        "Chưa cấu hình Jwt:Issuer trong appsettings.json."
    );

var jwtAudience =
    builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException(
        "Chưa cấu hình Jwt:Audience trong appsettings.json."
    );

builder.Services
    .AddAuthentication(options =>
    {
        /*
         * Dùng JWT Bearer làm cơ chế xác thực mặc định.
         */
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                /*
                 * Kiểm tra đơn vị phát hành JWT.
                 */
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                /*
                 * Kiểm tra đối tượng sử dụng JWT.
                 */
                ValidateAudience = true,
                ValidAudience = jwtAudience,

                /*
                 * Kiểm tra JWT hết hạn.
                 */
                ValidateLifetime = true,

                /*
                 * Kiểm tra chữ ký JWT.
                 */
                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtKey
                        )
                    ),

                /*
                 * Không cộng thêm thời gian dung sai.
                 */
                ClockSkew = TimeSpan.Zero,

                /*
                 * Khai báo Claim dùng làm Name và Role.
                 */
                NameClaimType =
                    ClaimTypes.Name,

                RoleClaimType =
                    ClaimTypes.Role
            };

        options.Events =
            new JwtBearerEvents
            {
                /*
                 * Thay vì đọc JWT từ Authorization Header,
                 * hệ thống đọc JWT trong Cookie accessToken.
                 */
                OnMessageReceived = context =>
                {
                    context.Token =
                        context.Request.Cookies[
                            "accessToken"
                        ];

                    return Task.CompletedTask;
                },

                /*
                 * JWT không có hoặc không hợp lệ.
                 */
                OnChallenge = context =>
                {
                    context.HandleResponse();

                    context.Response.StatusCode =
                        StatusCodes
                            .Status401Unauthorized;

                    context.Response.ContentType =
                        "application/json";

                    return context.Response
                        .WriteAsJsonAsync(
                            new
                            {
                                message =
                                    "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."
                            }
                        );
                },

                /*
                 * Đã đăng nhập nhưng không có quyền.
                 */
                OnForbidden = context =>
                {
                    context.Response.StatusCode =
                        StatusCodes
                            .Status403Forbidden;

                    context.Response.ContentType =
                        "application/json";

                    return context.Response
                        .WriteAsJsonAsync(
                            new
                            {
                                message =
                                    "Bạn không có quyền truy cập chức năng này."
                            }
                        );
                }
            };
    });

builder.Services.AddAuthorization();


// ================= 6. CORS =================
builder.Services.AddCors(options =>
{
    options.AddPolicy("MyPolicy", policy =>
    {
        /*
         * GIỮ NGUYÊN CẤU HÌNH CORS CŨ.
         */
        policy
            .WithOrigins(
                "http://localhost:4200"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


// ================= 7. MEDIATR =================
builder.Services.AddMediatR(cfg =>
{
    /*
     * GIỮ NGUYÊN ĐĂNG KÝ MEDIATR CŨ.
     */
    cfg.RegisterServicesFromAssembly(
        typeof(RegisterCommand).Assembly
    );
});


// ================= 8. DEPENDENCY INJECTION =================

/*
 * GIỮ NGUYÊN REPOSITORY CŨ.
 */
builder.Services.AddScoped<
    IAuthRepository,
    AuthRepository
>();

builder.Services.AddScoped<
    IRestaurantTableRepository,
    RestaurantTableRepository
>();



builder.Services.AddScoped<
    ICreateRestaurantTableRepository,
    CreateRestaurantTableRepository
>();

builder.Services.AddScoped<
    IRestaurantTableQrUrlService,
    RestaurantTableQrUrlService
>();


builder.Services.AddScoped<
    ICategoryRepository,
    CategoryRepository
>();










/*
 * BỔ SUNG SERVICE TẠO JWT.
 */
builder.Services.AddScoped<
    IJwtTokenService,
    JwtTokenService
>();


// ================= 9. BUILD APP =================
var app = builder.Build();



// ================= 9. SEED DATA =================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        /*
         * 1. Chạy Migration.
         * 2. Tạo role SuperAdmin.
         * 3. Tạo tài khoản SuperAdmin.
         * 4. Gán tài khoản vào role SuperAdmin.
         */
        await SeedData.InitializeAsync(services);
    }
    catch (Exception exception)
    {
        /*
         * Ghi lỗi seed data ra Console.
         */
        var logger =
            services.GetRequiredService<
                ILogger<Program>
            >();

        logger.LogError(
            exception,
            "Đã xảy ra lỗi trong quá trình seed dữ liệu."
        );

        /*
         * Dừng ứng dụng nếu dữ liệu quản trị
         * không thể được tạo đúng.
         */
        throw;
    }
}




// ================= 10. HTTP PIPELINE =================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

/*
 * CORS phải chạy trước Authentication
 * và Authorization.
 */
app.UseCors("MyPolicy");

/*
 * Đọc JWT từ Cookie và tạo User Claims.
 */
app.UseAuthentication();

/*
 * Kiểm tra [Authorize] và Role.
 */
app.UseAuthorization();

app.MapControllers();

app.Run();