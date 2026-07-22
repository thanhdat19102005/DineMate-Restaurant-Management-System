using DineMate.Application.Dtos.RestaurantTables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Interfaces
{
    public interface IRestaurantTableRepository
    {

        // ==================================================
        // LOAD DỮ LIỆU QUẢN LÝ BÀN
        // ==================================================
        Task<RestaurantTableManagementDto>
            GetManagementDataAsync(
                string? search,
                string? areaName,
                int? status,
                int? capacity,
                int pageNumber,
                int pageSize,
                string? selectedTableId,
                int historySize,
                CancellationToken cancellationToken = default
            );


        // ==================================================
        // XÓA BÀN
        // ==================================================
        Task<DeleteRestaurantTableResponseDto>
            DeleteRestaurantTableAsync(
                string restaurantTableId,
                string? userId,
                string userName,
                string? ipAddress,
                CancellationToken
                    cancellationToken = default
            );


       
        // CẬP NHẬT THÔNG TIN BÀN
        // ==================================================

        Task<UpdateRestaurantTableResponseDto>
            UpdateRestaurantTableAsync(
                string restaurantTableId,
                string tableName,
                int capacity,
                string tableType,
                string? areaName,
                int status,
                string? note,
                string? userId,
                string userName,
                string? ipAddress,
                CancellationToken
                    cancellationToken = default
            );



        // ==================================================
        // XÓA MỘT BẢN GHI LỊCH SỬ HOẠT ĐỘNG
        // ==================================================

        Task<DeleteRestaurantTableHistoryResponseDto>
            DeleteRestaurantTableHistoryAsync(
                int historyId,
                string? userId,
                string userName,
                string? ipAddress,
                CancellationToken
                    cancellationToken = default
            );




    }
}
