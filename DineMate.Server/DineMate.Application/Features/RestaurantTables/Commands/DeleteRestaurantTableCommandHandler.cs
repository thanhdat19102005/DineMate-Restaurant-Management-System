using DineMate.Application.Dtos.RestaurantTables;
using DineMate.Application.Interfaces;
using DineMate.Domain.Rules;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Features.RestaurantTables.Commands
{
    public class
        DeleteRestaurantTableCommandHandler
        : IRequestHandler<
            DeleteRestaurantTableCommand,
            DeleteRestaurantTableResponseDto
        >
    {
        private readonly
            IRestaurantTableRepository
            _restaurantTableRepository;

        public
            DeleteRestaurantTableCommandHandler(
                IRestaurantTableRepository
                    restaurantTableRepository
            )
        {
            _restaurantTableRepository =
                restaurantTableRepository;
        }

        public async Task<
            DeleteRestaurantTableResponseDto
        > Handle(
            DeleteRestaurantTableCommand request,
            CancellationToken cancellationToken
        )
        {
            // ==================================================
            // 1. GỬI QUA DOMAIN KIỂM TRA
            // ==================================================

            var validationResult =
                DeleteRestaurantTableRules
                    .Validate(
                        request.Id
                    );

            if (
                !validationResult.IsSuccess
            )
            {
                return new
                    DeleteRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        validationResult.Message
                };
            }

            // ==================================================
            // 2. CHUẨN HÓA DỮ LIỆU
            // ==================================================

            var normalizedId =
                request.Id
                    .Trim()
                    .ToUpperInvariant();

            var normalizedUserName =
                string.IsNullOrWhiteSpace(
                    request.UserName
                )
                    ? "Hệ thống"
                    : request.UserName.Trim();

            // ==================================================
            // 3. GỬI XUỐNG INFRASTRUCTURE
            // ==================================================

            return await
                _restaurantTableRepository
                    .DeleteRestaurantTableAsync(
                        normalizedId,
                        request.UserId,
                        normalizedUserName,
                        request.IpAddress,
                        cancellationToken
                    );
        }
    }
}
