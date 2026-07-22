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
       UpdateRestaurantTableCommandHandler
       : IRequestHandler<
           UpdateRestaurantTableCommand,
           UpdateRestaurantTableResponseDto
       >
    {
        private readonly
            IRestaurantTableRepository
            _restaurantTableRepository;

        public
            UpdateRestaurantTableCommandHandler(
                IRestaurantTableRepository
                    restaurantTableRepository
            )
        {
            _restaurantTableRepository =
                restaurantTableRepository;
        }

        public async Task<
            UpdateRestaurantTableResponseDto
        > Handle(
            UpdateRestaurantTableCommand request,
            CancellationToken cancellationToken
        )
        {
            // ==================================================
            // 1. DOMAIN KIỂM TRA DỮ LIỆU
            // ==================================================

            var validationResult =
                UpdateRestaurantTableValidationRules
                    .Validate(
                        request.Id,
                        request.TableName,
                        request.Capacity,
                        request.TableType,
                        request.AreaName,
                        request.Status,
                        request.Note
                    );

            if (
                !validationResult.IsSuccess
            )
            {
                return new
                    UpdateRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        validationResult.Message
                };
            }

            // ==================================================
            // 2. CHUẨN HÓA MÃ BÀN
            // ==================================================

            var normalizedId =
                request.Id
                    .Trim()
                    .ToUpperInvariant();

            // ==================================================
            // 3. CHUẨN HÓA TÊN BÀN
            // ==================================================

            var normalizedTableName =
                request.TableName.Trim();

            // ==================================================
            // 4. CHUẨN HÓA LOẠI BÀN
            // ==================================================

            var normalizedTableType =
                UpdateRestaurantTableValidationRules
                    .NormalizeTableType(
                        request.TableType
                    );

            // ==================================================
            // 5. CHUẨN HÓA KHU VỰC
            // ==================================================

            var normalizedAreaName =
                string.IsNullOrWhiteSpace(
                    request.AreaName
                )
                    ? null
                    : request.AreaName.Trim();

            // ==================================================
            // 6. CHUẨN HÓA GHI CHÚ
            // ==================================================

            var normalizedNote =
                string.IsNullOrWhiteSpace(
                    request.Note
                )
                    ? null
                    : request.Note.Trim();

            // ==================================================
            // 7. GỬI XUỐNG INFRASTRUCTURE
            // ==================================================

            return await
                _restaurantTableRepository
                    .UpdateRestaurantTableAsync(
                        normalizedId,
                        normalizedTableName,
                        request.Capacity,
                        normalizedTableType,
                        normalizedAreaName,
                        request.Status,
                        normalizedNote,
                        request.UserId,
                        request.UserName,
                        request.IpAddress,
                        cancellationToken
                    );
        }
    }
}
