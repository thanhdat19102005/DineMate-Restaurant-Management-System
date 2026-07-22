using DineMate.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Domain.Rules
{
    public static class
        UpdateRestaurantTableValidationRules
    {
        public static Result Validate(
            string id,
            string tableName,
            int capacity,
            string tableType,
            string? areaName,
            int status,
            string? note
        )
        {
            // ==================================================
            // MÃ BÀN
            // ==================================================

            if (
                string.IsNullOrWhiteSpace(
                    id
                )
            )
            {
                return Result.Failure(
                    "Mã bàn không được để trống."
                );
            }

            if (
                id.Trim().Length > 50
            )
            {
                return Result.Failure(
                    "Mã bàn không được vượt quá 50 ký tự."
                );
            }

            // ==================================================
            // TÊN BÀN
            // ==================================================

            if (
                string.IsNullOrWhiteSpace(
                    tableName
                )
            )
            {
                return Result.Failure(
                    "Tên bàn không được để trống."
                );
            }

            if (
                tableName.Trim().Length > 200
            )
            {
                return Result.Failure(
                    "Tên bàn không được vượt quá 200 ký tự."
                );
            }

            // ==================================================
            // SỨC CHỨA
            // ==================================================

            if (
                capacity <= 0
            )
            {
                return Result.Failure(
                    "Sức chứa phải lớn hơn 0."
                );
            }

            if (
                capacity > 100
            )
            {
                return Result.Failure(
                    "Sức chứa không được vượt quá 100 người."
                );
            }

            // ==================================================
            // LOẠI BÀN
            // ==================================================

            if (
                string.IsNullOrWhiteSpace(
                    tableType
                )
            )
            {
                return Result.Failure(
                    "Loại bàn không được để trống."
                );
            }

            var validTableTypes =
                new[]
                {
                    "Thường",
                    "VIP",
                    "Ngoài trời"
                };

            var tableTypeIsValid =
                validTableTypes.Any(
                    validType =>
                        string.Equals(
                            validType,
                            tableType.Trim(),
                            StringComparison
                                .OrdinalIgnoreCase
                        )
                );

            if (
                !tableTypeIsValid
            )
            {
                return Result.Failure(
                    "Loại bàn chỉ chấp nhận: Thường, VIP hoặc Ngoài trời."
                );
            }

            // ==================================================
            // KHU VỰC
            // ==================================================

            if (
                !string.IsNullOrWhiteSpace(
                    areaName
                ) &&
                areaName.Trim().Length > 200
            )
            {
                return Result.Failure(
                    "Tên khu vực không được vượt quá 200 ký tự."
                );
            }

            // ==================================================
            // TRẠNG THÁI
            // ==================================================
            //
            // 0 = Trống
            // 1 = Đang phục vụ
            // 2 = Đang bảo trì
            // 3 = Đã đặt trước
            // 4 = Tạm khóa
            // ==================================================

            if (
                status < 0 ||
                status > 4
            )
            {
                return Result.Failure(
                    "Trạng thái bàn không hợp lệ."
                );
            }

            // ==================================================
            // GHI CHÚ
            // ==================================================

            if (
                !string.IsNullOrWhiteSpace(
                    note
                ) &&
                note.Trim().Length > 1000
            )
            {
                return Result.Failure(
                    "Ghi chú không được vượt quá 1000 ký tự."
                );
            }

            return Result.Success();
        }

        // ==================================================
        // CHUẨN HÓA LOẠI BÀN
        // ==================================================

        public static string NormalizeTableType(
            string tableType
        )
        {
            var normalized =
                tableType
                    .Trim()
                    .ToLowerInvariant();

            return normalized switch
            {
                "vip" =>
                    "VIP",

                "ngoài trời" =>
                    "Ngoài trời",

                _ =>
                    "Thường"
            };
        }
    }
}
