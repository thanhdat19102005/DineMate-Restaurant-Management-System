using DineMate.Application.Dtos.RestaurantTables;
using DineMate.Application.Interfaces;
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
    public class
       CreateRestaurantTableRepository
       : ICreateRestaurantTableRepository
    {
        private readonly AppDbContext
            _dbContext;

        public
            CreateRestaurantTableRepository(
                AppDbContext dbContext
            )
        {
            _dbContext = dbContext;
        }

        // ==================================================
        // KIỂM TRA MÃ BÀN ĐÃ TỒN TẠI
        // ==================================================

        public async Task<bool>
            ExistsByIdAsync(
                string id,
                CancellationToken cancellationToken =
                    default
            )
        {
            return await _dbContext
                .RestaurantTables
                .AsNoTracking()
                .AnyAsync(
                    table =>
                        table.Id == id,
                    cancellationToken
                );
        }

        // ==================================================
        // TẠO BÀN + QR + LỊCH SỬ
        // ==================================================

        public async Task<
            CreateRestaurantTableResponseDto
        > CreateAsync(
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
        )
        {
            /*
             * Transaction đảm bảo ba bảng:
             *
             * - RestaurantTables.
             * - RestaurantTableQrs.
             * - RestaurantTableHistories.
             *
             * cùng thành công hoặc cùng rollback.
             */
            await using var transaction =
                await _dbContext
                    .Database
                    .BeginTransactionAsync(
                        cancellationToken
                    );

            try
            {
                // ==================================================
                // ĐÃ SỬA MÚI GIỜ VIỆT NAM
                //
                // Chỉ lấy thời gian một lần.
                //
                // Biến createdAt này được dùng chung cho:
                // - RestaurantTable.CreatedAt
                // - RestaurantTableQr.CreatedAt
                // - RestaurantTableHistory.CreatedAt
                //
                // Nhờ đó ba bản ghi luôn có cùng thời điểm
                // và không bị cộng thêm 7 giờ nhiều lần.
                // ==================================================

                var createdAt =
                    GetVietnamNow();

                // ==================================================
                // 1. TẠO BÀN
                // ==================================================

                var table =
                    new RestaurantTable
                    {
                        Id =
                            id,

                        TableName =
                            tableName,

                        Capacity =
                            capacity,

                        TableType =
                            tableType,

                        AreaName =
                            areaName,

                        /*
                         * Lưu link tại bảng bàn để
                         * API management hiện tại vẫn đọc được.
                         */
                        QrCode =
                            qrContent,

                        /*
                         * Bàn mới luôn ở trạng thái Trống.
                         */
                        Status =
                            0,

                        Note =
                            note,

                        /*
                         * createdAt đã là giờ Việt Nam.
                         */
                        CreatedAt =
                            createdAt,

                        UpdatedAt =
                            null
                    };

                await _dbContext
                    .RestaurantTables
                    .AddAsync(
                        table,
                        cancellationToken
                    );

                // ==================================================
                // 2. TẠO BẢN GHI QR
                // ==================================================

                var tableQr =
                    new RestaurantTableQr
                    {
                        RestaurantTableId =
                            id,

                        QrContent =
                            qrContent,

                        IsActive =
                            true,

                        /*
                         * Dùng cùng thời gian với bàn.
                         */
                        CreatedAt =
                            createdAt,

                        UpdatedAt =
                            null
                    };

                await _dbContext
                    .RestaurantTableQrs
                    .AddAsync(
                        tableQr,
                        cancellationToken
                    );

                // ==================================================
                // 3. XÁC ĐỊNH NGƯỜI TẠO
                // ==================================================

                var displayUserName =
                    string.IsNullOrWhiteSpace(
                        userName
                    )
                        ? "Hệ thống"
                        : userName.Trim();

                // ==================================================
                // 4. TẠO JSON LỊCH SỬ
                // ==================================================

                var newData =
                    JsonSerializer.Serialize(
                        new
                        {
                            id,

                            tableName,

                            capacity,

                            tableType,

                            areaName,

                            qrCode =
                                qrContent,

                            status =
                                0,

                            statusName =
                                "Trống",

                            note
                        }
                    );

                // ==================================================
                // 5. TẠO LỊCH SỬ
                // ==================================================

                var history =
                    new RestaurantTableHistory
                    {
                        RestaurantTableId =
                            id,

                        UserId =
                            userId,

                        UserName =
                            displayUserName,

                        ActionType =
                            "CREATE",

                        Description =
                            $"{displayUserName} tạo mới bàn {id}",

                        OldData =
                            null,

                        NewData =
                            newData,

                        IpAddress =
                            ipAddress,

                        // ==================================================
                        // ĐÃ SỬA MÚI GIỜ VIỆT NAM
                        //
                        // Sai trước đây:
                        //
                        // createdAt đã được cộng UTC+7,
                        // nhưng lại tiếp tục AddHours(7),
                        // làm lịch sử thành UTC+14.
                        //
                        // Bây giờ dùng nguyên createdAt.
                        // ==================================================

                        CreatedAt =
                            createdAt
                    };

                await _dbContext
                    .RestaurantTableHistories
                    .AddAsync(
                        history,
                        cancellationToken
                    );

                // ==================================================
                // 6. LƯU DATABASE
                // ==================================================

                await _dbContext
                    .SaveChangesAsync(
                        cancellationToken
                    );

                await transaction
                    .CommitAsync(
                        cancellationToken
                    );

                // ==================================================
                // 7. TRẢ DTO
                // ==================================================

                return new
                    CreateRestaurantTableResponseDto
                {
                    Success =
                        true,

                    Message =
                        "Tạo bàn mới thành công.",

                    Data =
                        new CreatedRestaurantTableDto
                        {
                            Id =
                                table.Id,

                            TableName =
                                table.TableName,

                            Capacity =
                                table.Capacity,

                            TableType =
                                table.TableType,

                            AreaName =
                                table.AreaName,

                            QrCode =
                                tableQr.QrContent,

                            Status =
                                table.Status,

                            StatusName =
                                "Trống",

                            Note =
                                table.Note,

                            CreatedAt =
                                table.CreatedAt,

                            UpdatedAt =
                                table.UpdatedAt
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
                    CreateRestaurantTableResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Không thể tạo bàn. Mã bàn hoặc dữ liệu QR có thể đã tồn tại."
                };
            }
            catch (Exception)
            {
                await transaction
                    .RollbackAsync(
                        cancellationToken
                    );

                return new
                    CreateRestaurantTableResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Đã xảy ra lỗi khi tạo bàn mới."
                };
            }
        }

        // ==================================================
        // LẤY THỜI GIAN HIỆN TẠI THEO MÚI GIỜ VIỆT NAM
        // ==================================================
        //
        // Việt Nam sử dụng UTC+7.
        //
        // Dùng DateTimeOffset giúp hoạt động ổn định
        // trên cả Windows và Linux.
        //
        // Trả về DateTime để tương thích với
        // các property CreatedAt hiện tại.
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
    }
}