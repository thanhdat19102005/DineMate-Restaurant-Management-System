using DineMate.Application.Dtos.RestaurantTables;
using DineMate.Application.Interfaces;
using DineMate.Domain.Rules;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Features.RestaurantTables.Queries
{
    public class GetRestaurantTablesQueryHandler
      : IRequestHandler<
          GetRestaurantTablesQuery,
          RestaurantTableResponseDto
      >
    {
        private readonly IRestaurantTableRepository
            _restaurantTableRepository;

        public GetRestaurantTablesQueryHandler(
            IRestaurantTableRepository
                restaurantTableRepository
        )
        {
            _restaurantTableRepository =
                restaurantTableRepository;
        }

        public async Task<RestaurantTableResponseDto>
            Handle(
                GetRestaurantTablesQuery request,
                CancellationToken cancellationToken
            )
        {
            // ==================================================
            // 1. KIỂM TRA DỮ LIỆU BẰNG DOMAIN RULES
            // ==================================================

            var validationResult =
                RestaurantTableRules
                    .ValidateGetRestaurantTables(
                        request.Search,
                        request.AreaName,
                        request.Status,
                        request.Capacity,
                        request.PageNumber,
                        request.PageSize,
                        request.HistorySize
                    );

            if (!validationResult.IsSuccess)
            {
                return new RestaurantTableResponseDto
                {
                    Success = false,
                    Message =
                        validationResult.Message
                };
            }

            // ==================================================
            // 2. CHUẨN HÓA DỮ LIỆU
            // ==================================================

            var search =
                string.IsNullOrWhiteSpace(
                    request.Search
                )
                    ? null
                    : request.Search.Trim();

            var areaName =
                string.IsNullOrWhiteSpace(
                    request.AreaName
                )
                    ? null
                    : request.AreaName.Trim();

            var selectedTableId =
                string.IsNullOrWhiteSpace(
                    request.SelectedTableId
                )
                    ? null
                    : request.SelectedTableId
                        .Trim();

            // ==================================================
            // 3. GỌI REPOSITORY TẦNG INFRASTRUCTURE
            // ==================================================

            var data =
                await _restaurantTableRepository
                    .GetManagementDataAsync(
                        search,
                        areaName,
                        request.Status,
                        request.Capacity,
                        request.PageNumber,
                        request.PageSize,
                        selectedTableId,
                        request.HistorySize,
                        cancellationToken
                    );

            // ==================================================
            // 4. TRẢ DTO VỀ CONTROLLER
            // ==================================================

            return new RestaurantTableResponseDto
            {
                Success = true,
                Message =
                    "Lấy dữ liệu quản lý bàn thành công.",
                Data = data
            };
        }
    }
}
