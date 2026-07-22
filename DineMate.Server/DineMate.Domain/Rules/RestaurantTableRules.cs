using DineMate.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Domain.Rules
{
    public static class RestaurantTableRules
    {
        public static Result ValidateGetRestaurantTables(
            string? search,
            string? areaName,
            int? status,
            int? capacity,
            int pageNumber,
            int pageSize,
            int historySize
        )
        {
            if (pageNumber < 1)
            {
                return Result.Failure(
                    "Số trang phải lớn hơn hoặc bằng 1."
                );
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return Result.Failure(
                    "Số bản ghi mỗi trang phải từ 1 đến 100."
                );
            }

            if (historySize < 1 || historySize > 100)
            {
                return Result.Failure(
                    "Số lịch sử phải từ 1 đến 100."
                );
            }

            if (
                status.HasValue &&
                (
                    status.Value < 0 ||
                    status.Value > 4
                )
            )
            {
                return Result.Failure(
                    "Trạng thái bàn không hợp lệ."
                );
            }

            if (
                capacity.HasValue &&
                capacity.Value <= 0
            )
            {
                return Result.Failure(
                    "Sức chứa phải lớn hơn 0."
                );
            }

            if (
                !string.IsNullOrWhiteSpace(search) &&
                search.Trim().Length > 200
            )
            {
                return Result.Failure(
                    "Từ khóa tìm kiếm không được vượt quá 200 ký tự."
                );
            }

            if (
                !string.IsNullOrWhiteSpace(areaName) &&
                areaName.Trim().Length > 200
            )
            {
                return Result.Failure(
                    "Tên khu vực không được vượt quá 200 ký tự."
                );
            }

            return Result.Success();
        }

        public static string GetStatusName(
            int status
        )
        {
            return status switch
            {
                0 => "Trống",
                1 => "Đang phục vụ",
                2 => "Đang bảo trì",
                3 => "Đã đặt trước",
                4 => "Tạm khóa",
                _ => "Không xác định"
            };
        }
    }
}
