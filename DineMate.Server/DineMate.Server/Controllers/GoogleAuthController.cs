using Azure;
using DineMate.Application.Dtos.Auth;
using DineMate.Application.Interfaces;
using DineMate.Infrastructure.Identity;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DineMate.Server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class GoogleAuthController : ControllerBase
    {
        private const string AccessTokenCookieName =
            "accessToken";

        private readonly UserManager<AppUserModel>
            _userManager;

        private readonly IJwtTokenService
            _jwtTokenService;

        private readonly IConfiguration
            _configuration;

        public GoogleAuthController(
            UserManager<AppUserModel> userManager,
            IJwtTokenService jwtTokenService,
            IConfiguration configuration
        )
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
        }

        // POST: /api/auth/google-login
        [AllowAnonymous]
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin(
            [FromBody] GoogleLoginRequest request
        )
        {
            if (string.IsNullOrWhiteSpace(request.IdToken))
            {
                return BadRequest(new
                {
                    message =
                        "Không nhận được Google ID Token."
                });
            }

            var googleClientId =
                _configuration["GoogleAuth:ClientId"];

            if (string.IsNullOrWhiteSpace(googleClientId))
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Backend chưa cấu hình Google Client ID."
                    }
                );
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                /*
                 * Xác minh token do Google phát hành.
                 *
                 * Kiểm tra:
                 * - Chữ ký
                 * - Thời gian hết hạn
                 * - Audience
                 */
                payload =
                    await GoogleJsonWebSignature.ValidateAsync(
                        request.IdToken,
                        new GoogleJsonWebSignature.ValidationSettings
                        {
                            Audience = new[]
                            {
                                googleClientId
                            }
                        }
                    );
            }
            catch (InvalidJwtException)
            {
                return Unauthorized(new
                {
                    message =
                        "Google ID Token không hợp lệ hoặc đã hết hạn."
                });
            }

            var email = payload.Email?.Trim();

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new
                {
                    message =
                        "Google không cung cấp email người dùng."
                });
            }

            /*
             * Tìm tài khoản theo email.
             */
            var user =
                await _userManager.FindByEmailAsync(email);

            /*
             * Nếu chưa tồn tại thì tạo AspNetUser.
             */
            if (user == null)
            {
                var baseUserName =
                    email.Contains('@')
                        ? email.Split('@')[0]
                        : email;

                var userName = baseUserName;

                /*
                 * Tránh trùng UserName.
                 */
                var existingUserName =
                    await _userManager.FindByNameAsync(
                        userName
                    );

                if (existingUserName != null)
                {
                    userName =
                        $"{baseUserName}_{Guid.NewGuid():N}";

                    if (userName.Length > 50)
                    {
                        userName =
                            userName.Substring(0, 50);
                    }
                }

                user = new AppUserModel
                {
                    UserName = userName,
                    Email = email,

                    FullName =
                        payload.Name
                        ?? userName,

                    EmailConfirmed =
                        payload.EmailVerified
                };

                /*
                 * Google User không cần mật khẩu.
                 */
                var createResult =
                    await _userManager.CreateAsync(user);

                if (!createResult.Succeeded)
                {
                    return BadRequest(new
                    {
                        message =
                            "Không thể tạo tài khoản Google.",

                        errors =
                            createResult.Errors.Select(
                                error =>
                                    error.Description
                            )
                    });
                }

                /*
                 * Không gán Role mặc định.
                 *
                 * Theo logic của bạn:
                 * roles = [] → người mua hàng.
                 */
            }

            /*
             * Lấy Role hiện có trong AspNetUserRoles.
             */
            var roles =
                await _userManager.GetRolesAsync(user);

            var expireMinutes =
                int.TryParse(
                    _configuration["Jwt:ExpireMinutes"],
                    out var configuredMinutes
                )
                    ? configuredMinutes
                    : 120;

            var expiresAt =
                DateTime.UtcNow.AddMinutes(
                    expireMinutes
                );

            var fullName =
                user.FullName
                ?? payload.Name
                ?? user.UserName
                ?? string.Empty;

            var userNameValue =
                user.UserName
                ?? string.Empty;

            /*
             * Tạo JWT DineMate giống login thường.
             */
            var accessToken =
                _jwtTokenService.CreateToken(
                    user.Id,
                    fullName,
                    userNameValue,
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
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,

                    Expires =
                        new DateTimeOffset(expiresAt),

                    Path = "/",
                    IsEssential = true
                }
            );

            return Ok(new
            {
                message =
                    "Đăng nhập Google thành công.",

                userId = user.Id,
                fullName,
                userName = userNameValue,
                email,
                phoneNumber = user.PhoneNumber,
                picture = payload.Picture,
                roles
            });
        }
    }
}
