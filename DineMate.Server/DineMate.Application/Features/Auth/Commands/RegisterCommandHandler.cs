using DineMate.Application.Dtos.Auth;
using DineMate.Application.Interfaces;
using DineMate.Domain.Rules;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Features.Auth.Commands
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
    {
        private readonly IAuthRepository _authRepository;

        public RegisterCommandHandler(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            var validationResult = AuthRules.ValidateRegister(
                request.FullName,
                request.Email,
                request.PhoneNumber,
                request.Password,
                request.ConfirmPassword
            );

            if (!validationResult.IsSuccess)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = validationResult.Message
                };
            }

            var result = await _authRepository.RegisterAsync(
                request.FullName,
                request.Email,
                request.PhoneNumber,
                request.Password
            );

            return result;
        }
    }
}
