using DineMate.Domain.Common;
using System.Text.RegularExpressions;

namespace DineMate.Domain.Rules
{
    public static class CategoryRules
    {
        public const int HiddenStatus = 0;

        public const int ActiveStatus = 1;

        // ==================================================
        // LẤY TÊN TRẠNG THÁI
        // ==================================================

        public static string
            GetStatusName(
                int status
            )
        {
            return status switch
            {
                HiddenStatus =>
                    "Đang ẩn",

                ActiveStatus =>
                    "Đang hoạt động",

                _ =>
                    "Không xác định"
            };
        }

        // ==================================================
        // KIỂM TRA TRẠNG THÁI HỢP LỆ
        // ==================================================

        public static bool
            IsValidStatus(
                int status
            )
        {
            return status ==
                    HiddenStatus ||
                   status ==
                    ActiveStatus;
        }

        // ==================================================
        // KIỂM TRA DỮ LIỆU TẠO CATEGORY
        // ==================================================

        public static Result
            ValidateCreate(
                string id,
                string name,
                string? description,
                int status
            )
        {
            return ValidateCategoryData(
                id,
                name,
                description,
                status
            );
        }

        // ==================================================
        // KIỂM TRA DỮ LIỆU CẬP NHẬT CATEGORY
        //
        // Category Id vẫn được kiểm tra nhưng không được sửa.
        // Id được lấy từ route của API.
        // ==================================================

        public static Result
            ValidateUpdate(
                string id,
                string name,
                string? description,
                int status
            )
        {
            return ValidateCategoryData(
                id,
                name,
                description,
                status
            );
        }

        // ==================================================
        // THÊM MỚI:
        // KIỂM TRA DỮ LIỆU XÓA CATEGORY
        //
        // Delete chỉ cần kiểm tra Category Id.
        // Không kiểm tra Name, Description hoặc Status
        // vì Angular chỉ gửi Id trên URL.
        //
        // DELETE:
        // /api/categories/{categoryId}
        // ==================================================

        public static Result
            ValidateDelete(
                string? id
            )
        {
            // ==================================================
            // THÊM MỚI:
            // MÃ LOẠI KHÔNG ĐƯỢC ĐỂ TRỐNG
            // ==================================================

            if (
                string.IsNullOrWhiteSpace(
                    id
                )
            )
            {
                return Result.Failure(
                    "Mã loại món không được để trống."
                );
            }

            var normalizedId =
                id.Trim();

            // ==================================================
            // THÊM MỚI:
            // KIỂM TRA ĐỘ DÀI MÃ LOẠI
            //
            // Giữ cùng quy tắc với Create và Update.
            // ==================================================

            if (
                normalizedId.Length < 2 ||
                normalizedId.Length > 50
            )
            {
                return Result.Failure(
                    "Mã loại món phải có từ 2 đến 50 ký tự."
                );
            }

            // ==================================================
            // THÊM MỚI:
            // KIỂM TRA ĐỊNH DẠNG MÃ LOẠI
            //
            // Chỉ cho phép:
            // - Chữ in hoa A-Z.
            // - Chữ số 0-9.
            // - Dấu gạch ngang.
            // - Dấu gạch dưới.
            // ==================================================

            if (
                !Regex.IsMatch(
                    normalizedId,
                    "^[A-Z0-9_-]+$"
                )
            )
            {
                return Result.Failure(
                    "Mã loại món chỉ được chứa chữ in hoa, chữ số, dấu gạch ngang hoặc dấu gạch dưới."
                );
            }

            return Result.Success();
        }


        // ==================================================
        // THÊM MỚI DELETE CATEGORY HISTORY:
        // KIỂM TRA ID BẢN GHI LỊCH SỬ CẦN XÓA
        //
        // DELETE:
        // /api/categories/histories/{historyId}
        // ==================================================

        public static Result
            ValidateDeleteHistory(
                int historyId
            )
        {
            if (
                historyId <= 0
            )
            {
                return Result.Failure(
                    "ID lịch sử hoạt động không hợp lệ."
                );
            }

            return Result.Success();
        }

        // ==================================================
        // RULE DÙNG CHUNG CHO CREATE VÀ UPDATE
        // ==================================================

        private static Result
            ValidateCategoryData(
                string id,
                string name,
                string? description,
                int status
            )
        {
            // ==================================================
            // MÃ LOẠI
            // ==================================================

            if (
                string.IsNullOrWhiteSpace(
                    id
                )
            )
            {
                return Result.Failure(
                    "Vui lòng nhập mã loại món."
                );
            }

            if (
                id.Length < 2 ||
                id.Length > 50
            )
            {
                return Result.Failure(
                    "Mã loại món phải có từ 2 đến 50 ký tự."
                );
            }

            if (
                !Regex.IsMatch(
                    id,
                    "^[A-Z0-9_-]+$"
                )
            )
            {
                return Result.Failure(
                    "Mã loại món chỉ được chứa chữ in hoa, chữ số, dấu gạch ngang hoặc dấu gạch dưới."
                );
            }

            // ==================================================
            // TÊN LOẠI
            // ==================================================

            if (
                string.IsNullOrWhiteSpace(
                    name
                )
            )
            {
                return Result.Failure(
                    "Vui lòng nhập tên loại món."
                );
            }

            if (
                name.Length < 2 ||
                name.Length > 100
            )
            {
                return Result.Failure(
                    "Tên loại món phải có từ 2 đến 100 ký tự."
                );
            }

            // ==================================================
            // MÔ TẢ
            // ==================================================

            if (
                description?.Length > 255
            )
            {
                return Result.Failure(
                    "Mô tả loại món không được vượt quá 255 ký tự."
                );
            }

            // ==================================================
            // TRẠNG THÁI
            // ==================================================

            if (
                !IsValidStatus(
                    status
                )
            )
            {
                return Result.Failure(
                    "Trạng thái loại món không hợp lệ."
                );
            }

            return Result.Success();
        }
    }
}