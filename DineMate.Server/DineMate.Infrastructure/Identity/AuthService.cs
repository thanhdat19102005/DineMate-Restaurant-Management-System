using DineMate.Application.Dtos.Auth;
using DineMate.Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Identity
{
    public sealed class AuthService : IAuthService
    {
        private readonly UserManager<AppUserModel> _userManager;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IConfiguration _configuration;

        public AuthService(
            UserManager<AppUserModel> userManager,
            IJwtTokenService jwtTokenService,
            IConfiguration configuration
        )
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
        }

        public async Task<LoginResult> LoginAsync(
            LoginRequest request,
            CancellationToken cancellationToken = default
        )
        {
            var loginValue =
                request.EmailOrPhone.Trim();

            if (string.IsNullOrWhiteSpace(loginValue))
            {
                return LoginResult.Failure(
                    "Vui lòng nhập email hoặc số điện thoại."
                );
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return LoginResult.Failure(
                    "Vui lòng nhập mật khẩu."
                );
            }

            AppUserModel? user;

            if (loginValue.Contains('@'))
            {
                user = await _userManager
                    .FindByEmailAsync(loginValue);
            }
            else
            {
                user = await _userManager.Users
                    .FirstOrDefaultAsync(
                        item =>
                            item.PhoneNumber == loginValue,
                        cancellationToken
                    );
            }

            if (user is null)
            {
                return LoginResult.Failure(
                    "Email, số điện thoại hoặc mật khẩu không chính xác."
                );
            }

            var passwordValid =
                await _userManager.CheckPasswordAsync(
                    user,
                    request.Password
                );

            if (!passwordValid)
            {
                return LoginResult.Failure(
                    "Email, số điện thoại hoặc mật khẩu không chính xác."
                );
            }

            var roles =
                await _userManager.GetRolesAsync(user);

            var configuredExpireMinutes =
                int.TryParse(
                    _configuration["Jwt:ExpireMinutes"],
                    out var minutes
                )
                    ? minutes
                    : 120;

            var expireMinutes =
                request.RememberMe
                    ? 60 * 24 * 7
                    : configuredExpireMinutes;

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

            var jwt =
                _jwtTokenService.CreateToken(
                    user.Id,
                    fullName,
                    userName,
                    email,
                    roles,
                    expiresAt
                );

            var response = new AuthResponse
            {
                Message = "Đăng nhập thành công.",
                UserId = user.Id,
                FullName = fullName,
                UserName = userName,
                Email = email,
                PhoneNumber = user.PhoneNumber,
                Roles = roles
            };

            return LoginResult.Success(
                jwt,
                response,
                expiresAt
            );
        }
    }
}
