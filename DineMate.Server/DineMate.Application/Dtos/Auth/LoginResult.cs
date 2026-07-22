using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Auth
{
    public sealed class LoginResult
    {
        public bool IsSuccess { get; private set; }

        public string? ErrorMessage { get; private set; }

        public string? AccessToken { get; private set; }

        public AuthResponse? Data { get; private set; }

        public DateTime ExpiresAt { get; private set; }

        public static LoginResult Success(
            string accessToken,
            AuthResponse data,
            DateTime expiresAt
        )
        {
            return new LoginResult
            {
                IsSuccess = true,
                AccessToken = accessToken,
                Data = data,
                ExpiresAt = expiresAt
            };
        }

        public static LoginResult Failure(
            string errorMessage
        )
        {
            return new LoginResult
            {
                IsSuccess = false,
                ErrorMessage = errorMessage
            };
        }
    }
}
