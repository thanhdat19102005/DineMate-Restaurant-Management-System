using DineMate.Application.Dtos.RestaurantTables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Interfaces
{
    public interface
          ICreateRestaurantTableRepository
    {
        /*
         * Kiểm tra mã bàn đã tồn tại.
         */
        Task<bool> ExistsByIdAsync(
            string id,
            CancellationToken cancellationToken =
                default
        );

        /*
         * Lưu đồng thời:
         *
         * - RestaurantTables.
         * - RestaurantTableQrs.
         * - RestaurantTableHistories.
         */
        Task<CreateRestaurantTableResponseDto>
            CreateAsync(
                string id,
                string tableName,
                int capacity,
                string tableType,
                string? areaName,
                string? note,
                string qrContent,
                string? userId,
                string? userName,
                string? ipAddress,
                CancellationToken cancellationToken =
                    default
            );
    }
}
