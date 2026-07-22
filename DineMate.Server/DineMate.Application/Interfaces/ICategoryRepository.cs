using DineMate.Application.Dtos.Categories;

namespace DineMate.Application.Interfaces
{
    public interface ICategoryRepository
    {
        // ==================================================
        // LOAD DỮ LIỆU QUẢN LÝ CATEGORY
        // ==================================================

        Task<CategoryManagementDto>
            GetManagementDataAsync(
                string? search,
                int? status,
                int pageNumber,
                int pageSize,
                string? selectedCategoryId,
                int historySize,
                CancellationToken cancellationToken = default
            );

        // ==================================================
        // KIỂM TRA MÃ CATEGORY ĐÃ TỒN TẠI
        // ==================================================

        Task<bool>
            ExistsByIdAsync(
                string id,
                CancellationToken cancellationToken = default
            );

        // ==================================================
        // KIỂM TRA TÊN CATEGORY ĐÃ TỒN TẠI
        // ==================================================

        Task<bool>
            ExistsByNameAsync(
                string name,
                CancellationToken cancellationToken = default
            );

        // ==================================================
        // KIỂM TRA TÊN CATEGORY KHI UPDATE
        //
        // Bỏ qua chính Category đang được cập nhật.
        // ==================================================

        Task<bool>
            ExistsByNameExceptIdAsync(
                string name,
                string categoryId,
                CancellationToken cancellationToken = default
            );

        // ==================================================
        // TẠO CATEGORY + LỊCH SỬ
        // ==================================================

        Task<CreateCategoryResponseDto>
            CreateAsync(
                string id,
                string name,
                string? description,
                int status,
                string? userId,
                string? userName,
                string? ipAddress,
                CancellationToken cancellationToken = default
            );

        // ==================================================
        // CẬP NHẬT CATEGORY + LỊCH SỬ
        // ==================================================

        Task<UpdateCategoryResponseDto>
            UpdateAsync(
                string categoryId,
                string name,
                string? description,
                int status,
                string? userId,
                string? userName,
                string? ipAddress,
                CancellationToken cancellationToken = default
            );

        // ==================================================
        // THÊM MỚI: XÓA CATEGORY + LƯU LỊCH SỬ
        // ==================================================

        Task<DeleteCategoryResponseDto>
            DeleteAsync(
                string categoryId,
                string? userId,
                string? userName,
                string? ipAddress,
                CancellationToken cancellationToken = default
            );


        // ==================================================
        // THÊM MỚI DELETE CATEGORY HISTORY:
        // XÓA MỘT BẢN GHI CATEGORY HISTORY
        // ==================================================

        Task<DeleteCategoryHistoryResponseDto>
            DeleteHistoryAsync(
                int historyId,
                string? userId,
                string? userName,
                string? ipAddress,
                CancellationToken cancellationToken = default
            );

    }
}