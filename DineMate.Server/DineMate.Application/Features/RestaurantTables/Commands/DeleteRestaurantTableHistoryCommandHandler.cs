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
       DeleteRestaurantTableHistoryCommandHandler
       : IRequestHandler<
           DeleteRestaurantTableHistoryCommand,
           DeleteRestaurantTableHistoryResponseDto
       >
    {
        private readonly
            IRestaurantTableRepository
            _restaurantTableRepository;

        public
            DeleteRestaurantTableHistoryCommandHandler(
                IRestaurantTableRepository
                    restaurantTableRepository
            )
        {
            _restaurantTableRepository =
                restaurantTableRepository;
        }

        public async Task<
            DeleteRestaurantTableHistoryResponseDto
        > Handle(
            DeleteRestaurantTableHistoryCommand
                request,

            CancellationToken
                cancellationToken
        )
        {
            // ==================================================
            // 1. DOMAIN KIỂM TRA DỮ LIỆU
            // ==================================================

            var validationResult =
                DeleteRestaurantTableHistoryRules
                    .Validate(
                        request.HistoryId
                    );

            if (
                !validationResult.IsSuccess
            )
            {
                return new
                    DeleteRestaurantTableHistoryResponseDto
                {
                    Success = false,

                    Message =
                        validationResult.Message
                };
            }

            // ==================================================
            // 2. GỬI XUỐNG INFRASTRUCTURE ĐỂ XÓA
            // ==================================================

            return await
                _restaurantTableRepository
                    .DeleteRestaurantTableHistoryAsync(
                        request.HistoryId,
                        request.UserId,
                        request.UserName ??
                        "Hệ thống",
                        request.IpAddress,
                        cancellationToken
                    );
        }
    }
}
