using DineMate.Application.Dtos.Auth;
using DineMate.Application.Interfaces;
using DineMate.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly UserManager<AppUserModel> _userManager;

        public AuthRepository(UserManager<AppUserModel> userManager)
        {
            _userManager = userManager;
        }

        public async Task<AuthResponseDto> RegisterAsync(
            string fullName,
            string email,
            string phoneNumber,
            string password)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);

            if (existingUser != null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email đã được sử dụng."
                };
            }

            var user = new AppUserModel
            {
                FullName = fullName.Trim(),
                UserName = email.Trim().Split('@')[0],
                Email = email.Trim(),
                PhoneNumber = phoneNumber.Trim(),
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(x => x.Description));

                return new AuthResponseDto
                {
                    Success = false,
                    Message = errors
                };
            }

            return new AuthResponseDto
            {
                Success = true,
                Message = "Đăng ký tài khoản thành công."
            };
        }
    }
}
