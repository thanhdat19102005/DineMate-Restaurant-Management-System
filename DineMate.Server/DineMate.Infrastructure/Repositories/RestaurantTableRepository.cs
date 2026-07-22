using DineMate.Application.Dtos.RestaurantTables;
using DineMate.Application.Interfaces;
using DineMate.Domain.Rules;
using DineMate.Infrastructure.Entities;
using DineMate.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Repositories
{
    public class RestaurantTableRepository
      : IRestaurantTableRepository
    {
        private readonly AppDbContext _dbContext;

        public RestaurantTableRepository(
            AppDbContext dbContext
        )
        {
            _dbContext = dbContext;
        }

        public async Task<RestaurantTableManagementDto>
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
            )
        {
            // ==================================================
            // 1. QUERY GỐC KHÔNG TRACKING
            // ==================================================

            var allTablesQuery =
                _dbContext.RestaurantTables
                    .AsNoTracking();

            // ==================================================
            // 2. THỐNG KÊ TRẠNG THÁI
            // ==================================================

            var statisticsData =
                await allTablesQuery
                    .GroupBy(table => 1)
                    .Select(group =>
                        new
                        {
                            Total =
                                group.Count(),

                            Empty =
                                group.Count(table =>
                                    table.Status == 0
                                ),

                            Serving =
                                group.Count(table =>
                                    table.Status == 1
                                ),

                            Maintenance =
                                group.Count(table =>
                                    table.Status == 2
                                ),

                            Reserved =
                                group.Count(table =>
                                    table.Status == 3
                                ),

                            Locked =
                                group.Count(table =>
                                    table.Status == 4
                                )
                        }
                    )
                    .FirstOrDefaultAsync(
                        cancellationToken
                    );

            var total =
                statisticsData?.Total ?? 0;

            var empty =
                statisticsData?.Empty ?? 0;

            var serving =
                statisticsData?.Serving ?? 0;

            var maintenance =
                statisticsData?.Maintenance ?? 0;

            var reserved =
                statisticsData?.Reserved ?? 0;

            var locked =
                statisticsData?.Locked ?? 0;

            var statistics =
                new RestaurantTableStatisticsDto
                {
                    Total = total,
                    Empty = empty,
                    Serving = serving,
                    Maintenance = maintenance,
                    Reserved = reserved,
                    Locked = locked,

                    EmptyPercentage =
                        CalculatePercentage(
                            empty,
                            total
                        ),

                    ServingPercentage =
                        CalculatePercentage(
                            serving,
                            total
                        ),

                    MaintenancePercentage =
                        CalculatePercentage(
                            maintenance,
                            total
                        ),

                    ReservedPercentage =
                        CalculatePercentage(
                            reserved,
                            total
                        ),

                    LockedPercentage =
                        CalculatePercentage(
                            locked,
                            total
                        )
                };

            // ==================================================
            // 3. ÁP DỤNG TÌM KIẾM VÀ BỘ LỌC
            // ==================================================

            var filteredQuery =
                allTablesQuery.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                filteredQuery =
                    filteredQuery.Where(table =>
                        table.Id.Contains(search) ||
                        table.TableName.Contains(search)
                    );
            }

            if (!string.IsNullOrWhiteSpace(areaName))
            {
                filteredQuery =
                    filteredQuery.Where(table =>
                        table.AreaName == areaName
                    );
            }

            if (status.HasValue)
            {
                filteredQuery =
                    filteredQuery.Where(table =>
                        table.Status ==
                        status.Value
                    );
            }

            if (capacity.HasValue)
            {
                filteredQuery =
                    filteredQuery.Where(table =>
                        table.Capacity ==
                        capacity.Value
                    );
            }

            // ==================================================
            // 4. TỔNG SỐ BẢN GHI VÀ SỐ TRANG
            // ==================================================

            var totalItems =
                await filteredQuery.CountAsync(
                    cancellationToken
                );

            var totalPages =
                totalItems == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalItems /
                        (double)pageSize
                    );

            if (
                totalPages > 0 &&
                pageNumber > totalPages
            )
            {
                pageNumber = totalPages;
            }

            // ==================================================
            // 5. LOAD DANH SÁCH BÀN
            // ==================================================

            var tableEntities =
                await filteredQuery
                    .OrderBy(table => table.Id)
                    .Skip(
                        (pageNumber - 1) *
                        pageSize
                    )
                    .Take(pageSize)
                    .ToListAsync(
                        cancellationToken
                    );

            var tableDtos =
                tableEntities
                    .Select(table =>
                        new RestaurantTableDto
                        {
                            Id = table.Id,

                            TableName =
                                table.TableName,

                            Capacity =
                                table.Capacity,

                            TableType =
                                table.TableType,

                            AreaName =
                                table.AreaName,

                            Status =
                                table.Status,

                            StatusName =
                                RestaurantTableRules
                                    .GetStatusName(
                                        table.Status
                                    ),

                            Note =
                                table.Note,

                            CreatedAt =
                                table.CreatedAt,

                            UpdatedAt =
                                table.UpdatedAt
                        }
                    )
                    .ToList();

            var pagedTables =
                new PagedRestaurantTableDto
                {
                    Items = tableDtos,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalItems = totalItems,
                    TotalPages = totalPages
                };

            // ==================================================
            // 6. XÁC ĐỊNH BÀN ĐANG CHỌN
            // ==================================================

            if (
                string.IsNullOrWhiteSpace(
                    selectedTableId
                )
            )
            {
                selectedTableId =
                    tableDtos.FirstOrDefault()?.Id;
            }

            RestaurantTableDetailDto?
                selectedTable = null;

            if (
                !string.IsNullOrWhiteSpace(
                    selectedTableId
                )
            )
            {
                var selectedEntity =
                    await _dbContext
                        .RestaurantTables
                        .AsNoTracking()
                        .FirstOrDefaultAsync(
                            table =>
                                table.Id ==
                                selectedTableId,
                            cancellationToken
                        );

                if (selectedEntity != null)
                {
                    selectedTable =
                        new RestaurantTableDetailDto
                        {
                            Id =
                                selectedEntity.Id,

                            TableName =
                                selectedEntity.TableName,

                            Capacity =
                                selectedEntity.Capacity,

                            TableType =
                                selectedEntity.TableType,

                            AreaName =
                                selectedEntity.AreaName,

                            QrCode =
                                selectedEntity.QrCode,

                            Status =
                                selectedEntity.Status,

                            StatusName =
                                RestaurantTableRules
                                    .GetStatusName(
                                        selectedEntity
                                            .Status
                                    ),

                            Note =
                                selectedEntity.Note,

                            CreatedAt =
                                selectedEntity.CreatedAt,

                            UpdatedAt =
                                selectedEntity.UpdatedAt
                        };
                }
            }

            // ==================================================
            // 7. LOAD LỊCH SỬ HOẠT ĐỘNG
            // ==================================================

            var histories =
                await _dbContext
                    .RestaurantTableHistories
                    .AsNoTracking()
                    .OrderByDescending(history =>
                        history.CreatedAt
                    )
                    .Take(historySize)
                    .Select(history =>
                        new RestaurantTableHistoryDto
                        {
                            Id =
                                history.Id,

                            RestaurantTableId =
                                history.RestaurantTableId,

                            UserId =
                                history.UserId,

                            UserName =
                                history.UserName ??
                                "Hệ thống",

                            ActionType =
                                history.ActionType,

                            Description =
                                history.Description,

                            OldData =
                                history.OldData,

                            NewData =
                                history.NewData,

                            IpAddress =
                                history.IpAddress,

                            // ==================================================
                            // ĐÃ SỬA MÚI GIỜ VIỆT NAM
                            //
                            // CreatedAt trong database đã được lưu
                            // theo giờ Việt Nam nên khi đọc dữ liệu
                            // tuyệt đối không cộng thêm 7 giờ lần nữa.
                            // ==================================================

                            CreatedAt =
                                history.CreatedAt
                        }
                    )
                    .ToListAsync(
                        cancellationToken
                    );

            // ==================================================
            // 8. LOAD DANH SÁCH KHU VỰC
            // ==================================================

            var areas =
                await allTablesQuery
                    .Where(table =>
                        table.AreaName != null &&
                        table.AreaName != ""
                    )
                    .Select(table =>
                        table.AreaName!
                    )
                    .Distinct()
                    .OrderBy(area => area)
                    .ToListAsync(
                        cancellationToken
                    );

            // ==================================================
            // 9. LOAD DANH SÁCH SỨC CHỨA
            // ==================================================

            var capacities =
                await allTablesQuery
                    .Select(table =>
                        table.Capacity
                    )
                    .Distinct()
                    .OrderBy(item => item)
                    .ToListAsync(
                        cancellationToken
                    );

            // ==================================================
            // 10. TRẢ DTO VỀ APPLICATION HANDLER
            // ==================================================

            return new RestaurantTableManagementDto
            {
                Statistics = statistics,
                Tables = pagedTables,
                SelectedTable = selectedTable,
                Histories = histories,
                Areas = areas,
                Capacities = capacities
            };
        }




        public async Task<
            DeleteRestaurantTableResponseDto
        > DeleteRestaurantTableAsync(
            string restaurantTableId,
            string? userId,
            string userName,
            string? ipAddress,
            CancellationToken
                cancellationToken = default
        )
        {
            // ==================================================
            // 1. TÌM BÀN CẦN XÓA
            // ==================================================

            var restaurantTable =
                await _dbContext
                    .RestaurantTables
                    .FirstOrDefaultAsync(
                        table =>
                            table.Id ==
                            restaurantTableId,
                        cancellationToken
                    );

            if (restaurantTable == null)
            {
                return new
                    DeleteRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        $"Không tìm thấy bàn " +
                        $"{restaurantTableId}."
                };
            }

            // ==================================================
            // 2. KIỂM TRA TRẠNG THÁI BÀN
            // ==================================================

            /*
             * Không cho xóa bàn đang phục vụ.
             *
             * Status:
             * 0 = Trống
             * 1 = Đang phục vụ
             * 2 = Đang bảo trì
             * 3 = Đã đặt trước
             * 4 = Tạm khóa
             */
            if (restaurantTable.Status == 1)
            {
                return new
                    DeleteRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        "Không thể xóa bàn đang phục vụ."
                };
            }

            // ==================================================
            // 3. LƯU DỮ LIỆU TRƯỚC KHI XÓA
            // ==================================================

            var oldData =
                JsonSerializer.Serialize(
                    new
                    {
                        id =
                            restaurantTable.Id,

                        tableName =
                            restaurantTable
                                .TableName,

                        capacity =
                            restaurantTable
                                .Capacity,

                        tableType =
                            restaurantTable
                                .TableType,

                        areaName =
                            restaurantTable
                                .AreaName,

                        qrCode =
                            restaurantTable
                                .QrCode,

                        status =
                            restaurantTable
                                .Status,

                        note =
                            restaurantTable
                                .Note,

                        createdAt =
                            restaurantTable
                                .CreatedAt,

                        updatedAt =
                            restaurantTable
                                .UpdatedAt
                    }
                );

            var deletedTableId =
                restaurantTable.Id;

            var deletedTableName =
                restaurantTable.TableName;

            // ==================================================
            // ĐÃ SỬA MÚI GIỜ VIỆT NAM
            //
            // Chỉ lấy thời gian một lần để:
            // - Lịch sử xóa bàn
            // - DTO kết quả xóa bàn
            //
            // luôn có cùng một thời điểm.
            // ==================================================

            var deletedAt =
                GetVietnamNow();

            // ==================================================
            // 4. BẮT ĐẦU TRANSACTION
            // ==================================================

            await using var transaction =
                await _dbContext
                    .Database
                    .BeginTransactionAsync(
                        cancellationToken
                    );

            try
            {
                // ==================================================
                // 5. XÓA DỮ LIỆU QR CỦA BÀN
                // ==================================================

                var qrRecords =
                    await _dbContext
                        .RestaurantTableQrs
                        .Where(qr =>
                            qr.RestaurantTableId ==
                            deletedTableId
                        )
                        .ToListAsync(
                            cancellationToken
                        );

                if (qrRecords.Count > 0)
                {
                    _dbContext
                        .RestaurantTableQrs
                        .RemoveRange(
                            qrRecords
                        );
                }

                // ==================================================
                // 6. TẠO LỊCH SỬ XÓA BÀN
                // ==================================================

                var history =
                    new RestaurantTableHistory
                    {
                        /*
                         * Phải để null vì sau khi xóa,
                         * bàn không còn tồn tại để làm
                         * khóa ngoại.
                         *
                         * Mã bàn vẫn được lưu trong:
                         * - Description
                         * - OldData
                         */
                        RestaurantTableId = null,

                        UserId = userId,

                        UserName =
                            userName,

                        ActionType =
                            "DELETE",

                        Description =
                            $"{userName} xóa bàn " +
                            $"{deletedTableId}",

                        OldData =
                            oldData,

                        NewData =
                            null,

                        IpAddress =
                            ipAddress,

                        // ==================================================
                        // ĐÃ SỬA MÚI GIỜ VIỆT NAM
                        //
                        // deletedAt đã là giờ Việt Nam,
                        // không cộng thêm 7 giờ lần nữa.
                        // ==================================================

                        CreatedAt =
                            deletedAt
                    };

                await _dbContext
                    .RestaurantTableHistories
                    .AddAsync(
                        history,
                        cancellationToken
                    );

                // ==================================================
                // 7. XÓA BÀN
                // ==================================================

                _dbContext
                    .RestaurantTables
                    .Remove(
                        restaurantTable
                    );

                // ==================================================
                // 8. LƯU DATABASE
                // ==================================================

                await _dbContext
                    .SaveChangesAsync(
                        cancellationToken
                    );

                // ==================================================
                // 9. COMMIT TRANSACTION
                // ==================================================

                await transaction
                    .CommitAsync(
                        cancellationToken
                    );

                // ==================================================
                // 10. TRẢ DTO VỀ APPLICATION
                // ==================================================

                return new
                    DeleteRestaurantTableResponseDto
                {
                    Success = true,

                    Message =
                        $"Xóa bàn " +
                        $"{deletedTableId} " +
                        $"thành công.",

                    Data =
                        new DeleteRestaurantTableDto
                        {
                            Id =
                                deletedTableId,

                            TableName =
                                deletedTableName,

                            DeletedAt =
                                deletedAt
                        }
                };
            }
            catch (DbUpdateException)
            {
                await transaction
                    .RollbackAsync(
                        cancellationToken
                    );

                return new
                    DeleteRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        "Không thể xóa bàn vì bàn " +
                        "đang có dữ liệu liên quan trong hệ thống."
                };
            }
            catch (Exception)
            {
                await transaction
                    .RollbackAsync(
                        cancellationToken
                    );

                return new
                    DeleteRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        "Đã xảy ra lỗi trong quá trình xóa bàn."
                };
            }
        }






        // ==================================================
        // LẤY THỜI GIAN HIỆN TẠI THEO MÚI GIỜ VIỆT NAM
        // ==================================================
        //
        // Việt Nam sử dụng UTC+7 và không áp dụng
        // Daylight Saving Time.
        //
        // DateTimeOffset được dùng để chuyển UTC sang UTC+7
        // theo cách ổn định trên cả Windows và Linux.
        //
        // Giá trị trả về là DateTime để tương thích với
        // các thuộc tính CreatedAt, UpdatedAt và DeletedAt
        // hiện tại trong hệ thống.
        // ==================================================

        private static DateTime
            GetVietnamNow()
        {
            return DateTimeOffset
                .UtcNow
                .ToOffset(
                    TimeSpan.FromHours(7)
                )
                .DateTime;
        }





        private static decimal
            CalculatePercentage(
                int count,
                int total
            )
        {
            if (total <= 0)
            {
                return 0;
            }

            return Math.Round(
                count * 100m / total,
                1
            );
        }





        public async Task<
    UpdateRestaurantTableResponseDto
> UpdateRestaurantTableAsync(
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
)
        {
            // ==================================================
            // 1. TÌM BÀN CẦN CẬP NHẬT
            // ==================================================

            var restaurantTable =
                await _dbContext
                    .RestaurantTables
                    .FirstOrDefaultAsync(
                        table =>
                            table.Id ==
                            restaurantTableId,
                        cancellationToken
                    );

            if (
                restaurantTable == null
            )
            {
                return new
                    UpdateRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        $"Không tìm thấy bàn " +
                        $"{restaurantTableId}."
                };
            }

            // ==================================================
            // 2. LƯU DỮ LIỆU CŨ
            // ==================================================

            var oldStatus =
                restaurantTable.Status;

            var oldData =
                JsonSerializer.Serialize(
                    new
                    {
                        id =
                            restaurantTable.Id,

                        tableName =
                            restaurantTable
                                .TableName,

                        capacity =
                            restaurantTable
                                .Capacity,

                        tableType =
                            restaurantTable
                                .TableType,

                        areaName =
                            restaurantTable
                                .AreaName,

                        qrCode =
                            restaurantTable
                                .QrCode,

                        status =
                            restaurantTable
                                .Status,

                        note =
                            restaurantTable
                                .Note,

                        createdAt =
                            restaurantTable
                                .CreatedAt,

                        updatedAt =
                            restaurantTable
                                .UpdatedAt
                    }
                );

            // ==================================================
            // 3. KIỂM TRA DỮ LIỆU CÓ THAY ĐỔI KHÔNG
            // ==================================================

            var dataHasChanged =
                restaurantTable.TableName !=
                    tableName ||

                restaurantTable.Capacity !=
                    capacity ||

                restaurantTable.TableType !=
                    tableType ||

                restaurantTable.AreaName !=
                    areaName ||

                restaurantTable.Status !=
                    status ||

                restaurantTable.Note !=
                    note;

            if (
                !dataHasChanged
            )
            {
                return new
                    UpdateRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        "Thông tin bàn không có thay đổi."
                };
            }

            // ==================================================
            // 4. BẮT ĐẦU TRANSACTION
            // ==================================================

            await using var transaction =
                await _dbContext
                    .Database
                    .BeginTransactionAsync(
                        cancellationToken
                    );

            try
            {
                // ==================================================
                // 5. CẬP NHẬT THÔNG TIN BÀN
                // ==================================================

                restaurantTable.TableName =
                    tableName;

                restaurantTable.Capacity =
                    capacity;

                restaurantTable.TableType =
                    tableType;

                restaurantTable.AreaName =
                    areaName;

                restaurantTable.Status =
                    status;

                restaurantTable.Note =
                    note;

                // ==================================================
                // ĐÃ SỬA MÚI GIỜ VIỆT NAM
                //
                // Chỉ lấy thời gian cập nhật một lần để:
                // - RestaurantTable.UpdatedAt
                // - RestaurantTableHistory.CreatedAt
                //
                // luôn giống nhau tuyệt đối.
                // ==================================================

                var updatedAt =
                    GetVietnamNow();

                restaurantTable.UpdatedAt =
                    updatedAt;

                // ==================================================
                // 6. QR CODE ĐƯỢC GIỮ NGUYÊN
                // ==================================================
                //
                // Không thay đổi:
                // restaurantTable.QrCode
                //
                // Vì mã bàn Id không được phép sửa,
                // đường dẫn QR hiện tại vẫn hợp lệ.
                // ==================================================

                // ==================================================
                // 7. LƯU DỮ LIỆU MỚI DẠNG JSON
                // ==================================================

                var newData =
                    JsonSerializer.Serialize(
                        new
                        {
                            id =
                                restaurantTable.Id,

                            tableName =
                                restaurantTable
                                    .TableName,

                            capacity =
                                restaurantTable
                                    .Capacity,

                            tableType =
                                restaurantTable
                                    .TableType,

                            areaName =
                                restaurantTable
                                    .AreaName,

                            qrCode =
                                restaurantTable
                                    .QrCode,

                            status =
                                restaurantTable
                                    .Status,

                            note =
                                restaurantTable
                                    .Note,

                            createdAt =
                                restaurantTable
                                    .CreatedAt,

                            updatedAt =
                                restaurantTable
                                    .UpdatedAt
                        }
                    );

                // ==================================================
                // 8. XÁC ĐỊNH LOẠI LỊCH SỬ
                // ==================================================
                //
                // Nếu trạng thái thay đổi:
                // STATUS_CHANGE
                //
                // Nếu chỉ thay đổi thông tin khác:
                // UPDATE
                // ==================================================

                var actionType =
                    oldStatus != status
                        ? "STATUS_CHANGE"
                        : "UPDATE";

                var description =
                    oldStatus != status
                        ? $"{userName} đổi trạng thái " +
                          $"bàn {restaurantTable.Id} " +
                          $"từ " +
                          $"{RestaurantTableRules.GetStatusName(oldStatus)} " +
                          $"sang " +
                          $"{RestaurantTableRules.GetStatusName(status)}"

                        : $"{userName} cập nhật thông tin " +
                          $"bàn {restaurantTable.Id}";

                // ==================================================
                // 9. TẠO LỊCH SỬ CẬP NHẬT
                // ==================================================

                var history =
                    new RestaurantTableHistory
                    {
                        RestaurantTableId =
                            restaurantTable.Id,

                        UserId =
                            userId,

                        UserName =
                            userName,

                        ActionType =
                            actionType,

                        Description =
                            description,

                        OldData =
                            oldData,

                        NewData =
                            newData,

                        IpAddress =
                            ipAddress,

                        // ==================================================
                        // ĐÃ SỬA MÚI GIỜ VIỆT NAM
                        //
                        // Dùng cùng biến updatedAt với bàn,
                        // không gọi thời gian lần thứ hai.
                        // ==================================================

                        CreatedAt =
                            updatedAt
                    };

                await _dbContext
                    .RestaurantTableHistories
                    .AddAsync(
                        history,
                        cancellationToken
                    );

                // ==================================================
                // 10. LƯU DATABASE
                // ==================================================

                await _dbContext
                    .SaveChangesAsync(
                        cancellationToken
                    );

                // ==================================================
                // 11. COMMIT TRANSACTION
                // ==================================================

                await transaction
                    .CommitAsync(
                        cancellationToken
                    );

                // ==================================================
                // 12. TRẢ DTO VỀ APPLICATION
                // ==================================================

                return new
                    UpdateRestaurantTableResponseDto
                {
                    Success = true,

                    Message =
                        $"Cập nhật bàn " +
                        $"{restaurantTable.Id} " +
                        $"thành công.",

                    Data =
                        new UpdateRestaurantTableDto
                        {
                            Id =
                                restaurantTable.Id,

                            TableName =
                                restaurantTable
                                    .TableName,

                            Capacity =
                                restaurantTable
                                    .Capacity,

                            TableType =
                                restaurantTable
                                    .TableType,

                            AreaName =
                                restaurantTable
                                    .AreaName,

                            QrCode =
                                restaurantTable
                                    .QrCode,

                            Status =
                                restaurantTable
                                    .Status,

                            StatusName =
                                RestaurantTableRules
                                    .GetStatusName(
                                        restaurantTable
                                            .Status
                                    ),

                            Note =
                                restaurantTable
                                    .Note,

                            CreatedAt =
                                restaurantTable
                                    .CreatedAt,

                            UpdatedAt =
                                restaurantTable
                                    .UpdatedAt
                        }
                };
            }
            catch (
                DbUpdateException
            )
            {
                await transaction
                    .RollbackAsync(
                        cancellationToken
                    );

                return new
                    UpdateRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        "Không thể cập nhật bàn vì dữ liệu không hợp lệ hoặc đang có xung đột trong hệ thống."
                };
            }
            catch (
                Exception
            )
            {
                await transaction
                    .RollbackAsync(
                        cancellationToken
                    );

                return new
                    UpdateRestaurantTableResponseDto
                {
                    Success = false,

                    Message =
                        "Đã xảy ra lỗi trong quá trình cập nhật bàn."
                };
            }
        }



        // ==================================================
        // XÓA MỘT BẢN GHI LỊCH SỬ HOẠT ĐỘNG
        // ==================================================

        public async Task<
            DeleteRestaurantTableHistoryResponseDto
        > DeleteRestaurantTableHistoryAsync(
            int historyId,
            string? userId,
            string userName,
            string? ipAddress,
            CancellationToken
                cancellationToken = default
        )
        {
            // ==================================================
            // 1. TÌM BẢN GHI LỊCH SỬ
            // ==================================================

            /*
             * Không dùng AsNoTracking vì entity này
             * cần được EF Core theo dõi để thực hiện Remove.
             */
            var historyEntity =
                await _dbContext
                    .RestaurantTableHistories
                    .FirstOrDefaultAsync(
                        history =>
                            history.Id ==
                            historyId,

                        cancellationToken
                    );

            // ==================================================
            // 2. KIỂM TRA LỊCH SỬ CÓ TỒN TẠI KHÔNG
            // ==================================================

            if (
                historyEntity == null
            )
            {
                return new
                    DeleteRestaurantTableHistoryResponseDto
                {
                    Success = false,

                    Message =
                        $"Không tìm thấy lịch sử hoạt động có ID {historyId}."
                };
            }

            // ==================================================
            // 3. LƯU THÔNG TIN TRƯỚC KHI XÓA
            // ==================================================

            /*
             * Sau khi Remove và SaveChanges,
             * entity không còn trong database.
             *
             * Vì vậy cần lưu dữ liệu cần trả về trước.
             */
            var deletedHistory =
                new DeletedRestaurantTableHistoryDto
                {
                    Id =
                        historyEntity.Id,

                    RestaurantTableId =
                        historyEntity
                            .RestaurantTableId,

                    ActionType =
                        historyEntity.ActionType,

                    Description =
                        historyEntity.Description,

                    // ==================================================
                    // ĐÃ SỬA MÚI GIỜ VIỆT NAM
                    // ==================================================

                    DeletedAt =
                        GetVietnamNow()
                };

            // ==================================================
            // 4. XÓA BẢN GHI LỊCH SỬ
            // ==================================================

            _dbContext
                .RestaurantTableHistories
                .Remove(
                    historyEntity
                );

            // ==================================================
            // 5. LƯU THAY ĐỔI XUỐNG DATABASE
            // ==================================================

            await _dbContext
                .SaveChangesAsync(
                    cancellationToken
                );

            // ==================================================
            // 6. TRẢ KẾT QUẢ VỀ APPLICATION
            // ==================================================

            return new
                DeleteRestaurantTableHistoryResponseDto
            {
                Success = true,

                Message =
                    $"Xóa lịch sử hoạt động ID {historyId} thành công.",

                Data =
                    deletedHistory
            };
        }









    }
}