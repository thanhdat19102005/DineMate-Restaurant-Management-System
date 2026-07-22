using DineMate.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Identity
{
    public sealed class JwtTokenService
      : IJwtTokenService
    {
        private readonly IConfiguration
            _configuration;

        public JwtTokenService(
            IConfiguration configuration
        )
        {
            _configuration = configuration;
        }

        public string CreateToken(
            string userId,
            string fullName,
            string userName,
            string email,
            IList<string> roles,
            DateTime expiresAt
        )
        {
            var jwtKey =
                _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException(
                    "Jwt:Key chưa được cấu hình."
                );

            var jwtIssuer =
                _configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException(
                    "Jwt:Issuer chưa được cấu hình."
                );

            var jwtAudience =
                _configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException(
                    "Jwt:Audience chưa được cấu hình."
                );

            var claims =
                new List<Claim>
                {
                    new Claim(
                        JwtRegisteredClaimNames.Jti,
                        Guid.NewGuid().ToString()
                    ),

                    new Claim(
                        ClaimTypes.NameIdentifier,
                        userId
                    ),

                    new Claim(
                        ClaimTypes.Name,
                        fullName
                    ),

                    new Claim(
                        ClaimTypes.Email,
                        email
                    ),

                    new Claim(
                        "userName",
                        userName
                    )
                };

            foreach (var role in roles)
            {
                claims.Add(
                    new Claim(
                        ClaimTypes.Role,
                        role
                    )
                );
            }

            var securityKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        jwtKey
                    )
                );

            var signingCredentials =
                new SigningCredentials(
                    securityKey,
                    SecurityAlgorithms.HmacSha256
                );

            var token =
                new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    notBefore: DateTime.UtcNow,
                    expires: expiresAt,
                    signingCredentials:
                        signingCredentials
                );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}
