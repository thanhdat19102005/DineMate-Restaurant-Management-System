using DineMate.Application.Dtos.Auth;
using DineMate.Application.Features.Auth.Commands;
using DineMate.Application.Interfaces;
using DineMate.Infrastructure.Identity;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DineMate.Server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private const string AccessTokenCookieName = "accessToken";

        private readonly IMediator _mediator;

        private readonly UserManager<AppUserModel> _userManager;

        private readonly IJwtTokenService _jwtTokenService;

        private readonly IConfiguration _configuration;

        public AuthController(
            IMediator mediator,
            UserManager<AppUserModel> userManager,
            IJwtTokenService jwtTokenService,
            IConfiguration configuration
        )
        {
            _mediator = mediator;
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
        }

        // ==================================================
        // REGISTER
        // GIỮ NGUYÊN LOGIC CŨ
        // POST: /api/auth/register
        // ==================================================

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(
            RegisterCommand command
        )
        {
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        // ==================================================
        // LOGIN
        // POST: /api/auth/login
        // ==================================================

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequest request
        )
        {
            if (string.IsNullOrWhiteSpace(request.EmailOrPhone))
            {
                return BadRequest(new
                {
                    message =
                        "Vui lòng nhập email hoặc số điện thoại."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Vui lòng nhập mật khẩu."
                });
            }

            var emailOrPhone =
                request.EmailOrPhone.Trim();

            AppUserModel? user;

            /*
             * Nếu có ký tự @ thì tìm theo Email.
             */
            if (emailOrPhone.Contains('@'))
            {
                user = await _userManager
                    .FindByEmailAsync(emailOrPhone);
            }
            else
            {
                /*
                 * Nếu không có @ thì tìm theo số điện thoại.
                 */
                user = await _userManager.Users
                    .FirstOrDefaultAsync(
                        item =>
                            item.PhoneNumber == emailOrPhone
                    );
            }

            /*
             * Không tìm thấy tài khoản.
             */
            if (user == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Email, số điện thoại hoặc mật khẩu không chính xác."
                });
            }

            /*
             * Kiểm tra mật khẩu bằng ASP.NET Identity.
             */
            var passwordIsValid =
                await _userManager.CheckPasswordAsync(
                    user,
                    request.Password
                );

            if (!passwordIsValid)
            {
                return Unauthorized(new
                {
                    message =
                        "Email, số điện thoại hoặc mật khẩu không chính xác."
                });
            }

            /*
             * Lấy tất cả Role của người dùng.
             */
            var roles =
                await _userManager.GetRolesAsync(user);

            /*
             * Thời gian sống mặc định của JWT.
             */
            var expireMinutes =
                int.TryParse(
                    _configuration["Jwt:ExpireMinutes"],
                    out var configuredMinutes
                )
                    ? configuredMinutes
                    : 120;

            /*
             * Nếu chọn Ghi nhớ đăng nhập:
             * Cookie sống trong 7 ngày.
             */
            if (request.RememberMe)
            {
                expireMinutes = 60 * 24 * 7;
            }

            var expiresAt =
                DateTime.UtcNow.AddMinutes(
                    expireMinutes
                );

            var fullName =
                user.FullName
                ?? user.UserName
                ?? string.Empty;

            var userName =
                user.UserName
                ?? string.Empty;

            var email =
                user.Email
                ?? string.Empty;

            /*
             * Tạo JWT.
             */
            var accessToken =
                _jwtTokenService.CreateToken(
                    user.Id,
                    fullName,
                    userName,
                    email,
                    roles,
                    expiresAt
                );

            /*
             * Lưu JWT vào HttpOnly Cookie.
             */
            Response.Cookies.Append(
                AccessTokenCookieName,
                accessToken,
                CreateAccessTokenCookieOptions(
                    expiresAt
                )
            );

            /*
             * Không trả JWT xuống Angular.
             * Angular chỉ nhận thông tin người dùng.
             */
            return Ok(new
            {
                message = "Đăng nhập thành công.",

                userId = user.Id,

                fullName,

                userName,

                email,

                phoneNumber = user.PhoneNumber,

                roles
            });
        }

        // ==================================================
        // PROFILE
        // JWT PHẢI HỢP LỆ MỚI TRUY CẬP ĐƯỢC
        // GET: /api/auth/profile
        // ==================================================

        [Authorize]
        [HttpGet("profile")]
        public IActionResult Profile()
        {
            /*
             * Lấy dữ liệu từ Claims trong JWT.
             */
            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            var fullName =
                User.FindFirstValue(
                    ClaimTypes.Name
                );

            var email =
                User.FindFirstValue(
                    ClaimTypes.Email
                );

            var userName =
                User.FindFirstValue(
                    "userName"
                );

            var roles =
                User.FindAll(
                        ClaimTypes.Role
                    )
                    .Select(
                        claim => claim.Value
                    )
                    .ToList();

            return Ok(new
            {
                message =
                    "Người dùng đã đăng nhập.",

                userId,

                fullName,

                userName,

                email,

                roles
            });
        }

        // ==================================================
        // LOGOUT
        // POST: /api/auth/logout
        // ==================================================

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            /*
             * Khi xóa cookie phải dùng cùng:
             * - Tên cookie
             * - Path
             * - SameSite
             * - Secure
             */
            Response.Cookies.Delete(
                AccessTokenCookieName,
                CreateDeleteCookieOptions()
            );

            return Ok(new
            {
                message = "Đăng xuất thành công."
            });
        }

        // ==================================================
        // CẤU HÌNH COOKIE KHI ĐĂNG NHẬP
        // ==================================================

        private static CookieOptions
            CreateAccessTokenCookieOptions(
                DateTime expiresAt
            )
        {
            return new CookieOptions
            {
                /*
                 * JavaScript không đọc được cookie.
                 */
                HttpOnly = true,

                /*
                 * Chỉ gửi qua HTTPS.
                 */
                Secure = true,

                /*
                 * Angular và backend khác origin,
                 * nên dùng SameSite=None.
                 */
                SameSite = SameSiteMode.None,

                /*
                 * Thời gian cookie hết hạn.
                 */
                Expires =
                    new DateTimeOffset(expiresAt),

                /*
                 * Cookie dùng cho toàn bộ API.
                 */
                Path = "/",

                IsEssential = true
            };
        }

        // ==================================================
        // CẤU HÌNH COOKIE KHI ĐĂNG XUẤT
        // ==================================================

        private static CookieOptions
            CreateDeleteCookieOptions()
        {
            return new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                IsEssential = true
            };
        }
    }

   
}
