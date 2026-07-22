using DineMate.Application.Dtos.Categories;
using DineMate.Application.Interfaces;
using DineMate.Domain.Rules;
using DineMate.Infrastructure.Entities;
using DineMate.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace DineMate.Infrastructure.Repositories
{
    public class CategoryRepository
         : ICategoryRepository
    {
        private readonly AppDbContext
            _dbContext;

        public CategoryRepository(
            AppDbContext dbContext
        )
        {
            _dbContext =
                dbContext;
        }

        // ==================================================
        // LOAD DỮ LIỆU QUẢN LÝ CATEGORY
        // ==================================================

        public async Task<CategoryManagementDto>
            GetManagementDataAsync(
                string? search,
                int? status,
                int pageNumber,
                int pageSize,
                string? selectedCategoryId,
                int historySize,
                CancellationToken cancellationToken = default
            )
        {
            // ==================================================
            // 1. QUERY GỐC KHÔNG TRACKING
            // ==================================================

            var allCategoriesQuery =
                _dbContext
                    .Categories
                    .AsNoTracking();

            // ==================================================
            // 2. THỐNG KÊ CATEGORY
            // ==================================================

            var statisticsData =
                await allCategoriesQuery
                    .GroupBy(category => 1)
                    .Select(group =>
                        new
                        {
                            Total =
                                group.Count(),

                            Active =
                                group.Count(category =>
                                    category.Status ==
                                    CategoryRules.ActiveStatus
                                ),

                            Hidden =
                                group.Count(category =>
                                    category.Status ==
                                    CategoryRules.HiddenStatus
                                )
                        }
                    )
                    .FirstOrDefaultAsync(
                        cancellationToken
                    );

            var total =
                statisticsData?.Total ?? 0;

            var active =
                statisticsData?.Active ?? 0;

            var hidden =
                statisticsData?.Hidden ?? 0;

            var totalProducts =
                await _dbContext
                    .Products
                    .AsNoTracking()
                    .CountAsync(
                        cancellationToken
                    );

            var statistics =
                new CategoryStatisticsDto
                {
                    Total =
                        total,

                    Active =
                        active,

                    Hidden =
                        hidden,

                    ActivePercentage =
                        CalculatePercentage(
                            active,
                            total
                        ),

                    HiddenPercentage =
                        CalculatePercentage(
                            hidden,
                            total
                        ),

                    TotalProducts =
                        totalProducts
                };

            // ==================================================
            // 3. ÁP DỤNG TÌM KIẾM
            // ==================================================

            var filteredQuery =
                allCategoriesQuery
                    .AsQueryable();

            if (
                !string.IsNullOrWhiteSpace(
                    search
                )
            )
            {
                filteredQuery =
                    filteredQuery.Where(category =>
                        category.Id.Contains(search) ||
                        category.Name.Contains(search) ||
                        (
                            category.Description != null &&
                            category.Description.Contains(search)
                        )
                    );
            }

            // ==================================================
            // 4. LỌC TRẠNG THÁI
            // ==================================================

            if (
                status.HasValue &&
                CategoryRules.IsValidStatus(
                    status.Value
                )
            )
            {
                filteredQuery =
                    filteredQuery.Where(category =>
                        category.Status ==
                        status.Value
                    );
            }

            // ==================================================
            // 5. ĐẾM CATEGORY SAU KHI LỌC
            // ==================================================

            var totalItems =
                await filteredQuery
                    .CountAsync(
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
                pageNumber =
                    totalPages;
            }

            // ==================================================
            // 6. LOAD DANH SÁCH CATEGORY
            // ==================================================

            var categoryDtos =
                await filteredQuery
                    .OrderBy(category =>
                        category.Id
                    )
                    .Skip(
                        (pageNumber - 1) *
                        pageSize
                    )
                    .Take(pageSize)
                    .Select(category =>
                        new CategoryDto
                        {
                            Id =
                                category.Id,

                            Name =
                                category.Name,

                            Description =
                                category.Description,

                            ImageUrl =
                                category.ImageUrl,

                            Status =
                                category.Status,

                            StatusName =
                                CategoryRules
                                    .GetStatusName(
                                        category.Status
                                    ),

                            ProductCount =
                                category.Products.Count(),

                            CreatedAt =
                                category.CreatedAt,

                            UpdatedAt =
                                category.UpdatedAt
                        }
                    )
                    .ToListAsync(
                        cancellationToken
                    );

            var pagedCategories =
                new PagedCategoryDto
                {
                    Items =
                        categoryDtos,

                    PageNumber =
                        pageNumber,

                    PageSize =
                        pageSize,

                    TotalItems =
                        totalItems,

                    TotalPages =
                        totalPages
                };

            // ==================================================
            // 7. XÁC ĐỊNH CATEGORY ĐƯỢC CHỌN
            // ==================================================

            if (
                string.IsNullOrWhiteSpace(
                    selectedCategoryId
                )
            )
            {
                selectedCategoryId =
                    categoryDtos
                        .FirstOrDefault()?
                        .Id;
            }

            CategoryDetailDto?
                selectedCategory = null;

            if (
                !string.IsNullOrWhiteSpace(
                    selectedCategoryId
                )
            )
            {
                selectedCategory =
                    await _dbContext
                        .Categories
                        .AsNoTracking()
                        .Where(category =>
                            category.Id ==
                            selectedCategoryId
                        )
                        .Select(category =>
                            new CategoryDetailDto
                            {
                                Id =
                                    category.Id,

                                Name =
                                    category.Name,

                                Description =
                                    category.Description,

                                ImageUrl =
                                    category.ImageUrl,

                                Status =
                                    category.Status,

                                StatusName =
                                    CategoryRules
                                        .GetStatusName(
                                            category.Status
                                        ),

                                ProductCount =
                                    category.Products.Count(),

                                CreatedAt =
                                    category.CreatedAt,

                                UpdatedAt =
                                    category.UpdatedAt
                            }
                        )
                        .FirstOrDefaultAsync(
                            cancellationToken
                        );
            }

            // ==================================================
            // 8. LOAD LỊCH SỬ CATEGORY
            // ==================================================

            var histories =
                await _dbContext
                    .CategoryHistories
                    .AsNoTracking()
                    .OrderByDescending(history =>
                        history.CreatedAt
                    )
                    .Take(historySize)
                    .Select(history =>
                        new CategoryHistoryDto
                        {
                            Id =
                                history.Id,

                            CategoryId =
                                history.CategoryId,

                            UserId =
                                history.UserId,

                            /*
                             * Ưu tiên FullName hiện tại
                             * trong bảng AspNetUsers.
                             *
                             * Nếu User đã bị xóa hoặc FullName null,
                             * dùng lại UserName đã lưu trong History.
                             */
                            UserName =
                                history.User != null &&
                                history.User.FullName != null
                                    ? history.User.FullName
                                    : history.UserName ??
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

                            CreatedAt =
                                history.CreatedAt
                        }
                    )
                    .ToListAsync(
                        cancellationToken
                    );

            // ==================================================
            // 9. DANH SÁCH TRẠNG THÁI
            // ==================================================

            var statuses =
                new List<int>
                {
                    CategoryRules.HiddenStatus,
                    CategoryRules.ActiveStatus
                };

            // ==================================================
            // 10. TRẢ KẾT QUẢ VỀ APPLICATION
            // ==================================================

            return new CategoryManagementDto
            {
                Statistics =
                    statistics,

                Categories =
                    pagedCategories,

                SelectedCategory =
                    selectedCategory,

                Histories =
                    histories,

                Statuses =
                    statuses
            };
        }

        // ==================================================
        // KIỂM TRA MÃ CATEGORY ĐÃ TỒN TẠI
        // ==================================================

        public async Task<bool>
            ExistsByIdAsync(
                string id,
                CancellationToken cancellationToken = default
            )
        {
            return await _dbContext
                .Categories
                .AsNoTracking()
                .AnyAsync(
                    category =>
                        category.Id == id,
                    cancellationToken
                );
        }

        // ==================================================
        // KIỂM TRA TÊN CATEGORY ĐÃ TỒN TẠI
        // ==================================================

        public async Task<bool>
            ExistsByNameAsync(
                string name,
                CancellationToken cancellationToken = default
            )
        {
            var normalizedName =
                name
                    .Trim()
                    .ToLower();

            return await _dbContext
                .Categories
                .AsNoTracking()
                .AnyAsync(
                    category =>
                        category.Name
                            .ToLower() ==
                        normalizedName,
                    cancellationToken
                );
        }

        // ==================================================
        // KIỂM TRA TÊN CATEGORY KHI UPDATE
        //
        // Bỏ qua chính Category đang được cập nhật.
        // ==================================================

        public async Task<bool>
            ExistsByNameExceptIdAsync(
                string name,
                string categoryId,
                CancellationToken cancellationToken = default
            )
        {
            var normalizedName =
                name
                    .Trim()
                    .ToLower();

            return await _dbContext
                .Categories
                .AsNoTracking()
                .AnyAsync(
                    category =>
                        category.Id !=
                            categoryId &&

                        category.Name
                            .ToLower() ==
                        normalizedName,

                    cancellationToken
                );
        }

        // ==================================================
        // TẠO CATEGORY + LỊCH SỬ
        // ==================================================

        public async Task<CreateCategoryResponseDto>
            CreateAsync(
                string id,
                string name,
                string? description,
                int status,
                string? userId,
                string? userName,
                string? ipAddress,
                CancellationToken cancellationToken = default
            )
        {
            /*
             * Transaction đảm bảo hai bảng:
             *
             * - Categories.
             * - CategoryHistories.
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
                // THỜI GIAN VIỆT NAM
                //
                // Chỉ lấy một lần và dùng chung cho:
                //
                // - Category.CreatedAt.
                // - CategoryHistory.CreatedAt.
                // ==================================================

                var createdAt =
                    GetVietnamNow();

                // ==================================================
                // 1. TẠO CATEGORY
                // ==================================================

                var category =
                    new CategoryModel
                    {
                        Id =
                            id,

                        Name =
                            name,

                        Description =
                            description,

                        /*
                         * Frontend hiện tại không upload ảnh.
                         */
                        ImageUrl =
                            null,

                        Status =
                            status,

                        CreatedAt =
                            createdAt,

                        UpdatedAt =
                            null
                    };

                await _dbContext
                    .Categories
                    .AddAsync(
                        category,
                        cancellationToken
                    );

                // ==================================================
                // 2. XÁC ĐỊNH NGƯỜI TẠO
                //
                // Ưu tiên FullName trong AspNetUsers.
                // Nếu không có thì dùng tên từ Claim.
                // ==================================================

                var displayUserName =
                    string.IsNullOrWhiteSpace(
                        userName
                    )
                        ? "Hệ thống"
                        : userName.Trim();

                if (
                    !string.IsNullOrWhiteSpace(
                        userId
                    )
                )
                {
                    var fullName =
                        await _dbContext
                            .Users
                            .AsNoTracking()
                            .Where(user =>
                                user.Id ==
                                userId
                            )
                            .Select(user =>
                                user.FullName
                            )
                            .FirstOrDefaultAsync(
                                cancellationToken
                            );

                    if (
                        !string.IsNullOrWhiteSpace(
                            fullName
                        )
                    )
                    {
                        displayUserName =
                            fullName.Trim();
                    }
                }

                // ==================================================
                // 3. TẠO JSON DỮ LIỆU MỚI
                // ==================================================

                var statusName =
                    CategoryRules.GetStatusName(
                        status
                    );

                var newData =
                    JsonSerializer.Serialize(
                        new
                        {
                            id,

                            name,

                            description,

                            imageUrl =
                                (string?)null,

                            status,

                            statusName,

                            productCount =
                                0
                        }
                    );

                // ==================================================
                // 4. TẠO LỊCH SỬ CATEGORY
                // ==================================================

                var history =
                    new CategoryHistory
                    {
                        CategoryId =
                            id,

                        UserId =
                            userId,

                        UserName =
                            displayUserName,

                        ActionType =
                            "CREATE",

                        Description =
                            $"{displayUserName} tạo mới loại món {id} - {name}",

                        OldData =
                            null,

                        NewData =
                            newData,

                        IpAddress =
                            ipAddress,

                        CreatedAt =
                            createdAt
                    };

                await _dbContext
                    .CategoryHistories
                    .AddAsync(
                        history,
                        cancellationToken
                    );

                // ==================================================
                // 5. LƯU DATABASE
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
                // 6. TRẢ DTO
                // ==================================================

                return new
                    CreateCategoryResponseDto
                {
                    Success =
                        true,

                    Message =
                        "Tạo loại món mới thành công.",

                    Data =
                        new CreatedCategoryDto
                        {
                            Id =
                                category.Id,

                            Name =
                                category.Name,

                            Description =
                                category.Description,

                            ImageUrl =
                                category.ImageUrl,

                            Status =
                                category.Status,

                            StatusName =
                                statusName,

                            ProductCount =
                                0,

                            CreatedAt =
                                category.CreatedAt,

                            UpdatedAt =
                                category.UpdatedAt
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
                    CreateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Không thể tạo loại món. Mã loại hoặc tên loại có thể đã tồn tại."
                };
            }
            catch (Exception)
            {
                await transaction
                    .RollbackAsync(
                        cancellationToken
                    );

                return new
                    CreateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Đã xảy ra lỗi khi tạo loại món mới."
                };
            }
        }

        // ==================================================
        // CẬP NHẬT CATEGORY + LỊCH SỬ
        // ==================================================

        public async Task<UpdateCategoryResponseDto>
            UpdateAsync(
                string categoryId,
                string name,
                string? description,
                int status,
                string? userId,
                string? userName,
                string? ipAddress,
                CancellationToken cancellationToken = default
            )
        {
            // ==================================================
            // 1. TÌM CATEGORY CẦN CẬP NHẬT
            //
            // Không dùng AsNoTracking vì entity cần được EF Core
            // theo dõi để cập nhật.
            // ==================================================

            var category =
                await _dbContext
                    .Categories
                    .FirstOrDefaultAsync(
                        item =>
                            item.Id ==
                            categoryId,

                        cancellationToken
                    );

            if (
                category is null
            )
            {
                return new
                    UpdateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        $"Không tìm thấy loại món {categoryId}."
                };
            }

            // ==================================================
            // 2. ĐẾM SỐ MÓN HIỆN TẠI
            // ==================================================

            var productCount =
                await _dbContext
                    .Products
                    .AsNoTracking()
                    .CountAsync(
                        product =>
                            product.CategoryId ==
                            category.Id,

                        cancellationToken
                    );

            // ==================================================
            // 3. LƯU DỮ LIỆU CŨ
            // ==================================================

            var oldStatus =
                category.Status;

            var oldData =
                JsonSerializer.Serialize(
                    new
                    {
                        id =
                            category.Id,

                        name =
                            category.Name,

                        description =
                            category.Description,

                        imageUrl =
                            category.ImageUrl,

                        status =
                            category.Status,

                        statusName =
                            CategoryRules
                                .GetStatusName(
                                    category.Status
                                ),

                        productCount,

                        createdAt =
                            category.CreatedAt,

                        updatedAt =
                            category.UpdatedAt
                    }
                );

            // ==================================================
            // 4. KIỂM TRA DỮ LIỆU CÓ THAY ĐỔI KHÔNG
            // ==================================================

            var dataHasChanged =
                category.Name !=
                    name ||

                category.Description !=
                    description ||

                category.Status !=
                    status;

            if (
                !dataHasChanged
            )
            {
                return new
                    UpdateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Thông tin loại món không có thay đổi."
                };
            }

            // ==================================================
            // 5. BẮT ĐẦU TRANSACTION
            //
            // Category và CategoryHistory phải cùng thành công
            // hoặc cùng rollback.
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
                // 6. CẬP NHẬT CATEGORY
                //
                // KHÔNG THAY ĐỔI:
                //
                // - Category.Id.
                // - Category.ImageUrl.
                // - Category.CreatedAt.
                // ==================================================

                category.Name =
                    name;

                category.Description =
                    description;

                category.Status =
                    status;

                /*
                 * Chỉ lấy thời gian một lần để:
                 *
                 * - Category.UpdatedAt.
                 * - CategoryHistory.CreatedAt.
                 *
                 * giống nhau tuyệt đối.
                 */
                var updatedAt =
                    GetVietnamNow();

                category.UpdatedAt =
                    updatedAt;

                // ==================================================
                // 7. XÁC ĐỊNH NGƯỜI CẬP NHẬT
                //
                // Ưu tiên FullName trong AspNetUsers.
                // ==================================================

                var displayUserName =
                    string.IsNullOrWhiteSpace(
                        userName
                    )
                        ? "Hệ thống"
                        : userName.Trim();

                if (
                    !string.IsNullOrWhiteSpace(
                        userId
                    )
                )
                {
                    var fullName =
                        await _dbContext
                            .Users
                            .AsNoTracking()
                            .Where(user =>
                                user.Id ==
                                userId
                            )
                            .Select(user =>
                                user.FullName
                            )
                            .FirstOrDefaultAsync(
                                cancellationToken
                            );

                    if (
                        !string.IsNullOrWhiteSpace(
                            fullName
                        )
                    )
                    {
                        displayUserName =
                            fullName.Trim();
                    }
                }

                // ==================================================
                // 8. LƯU DỮ LIỆU MỚI DẠNG JSON
                // ==================================================

                var statusName =
                    CategoryRules.GetStatusName(
                        category.Status
                    );

                var newData =
                    JsonSerializer.Serialize(
                        new
                        {
                            id =
                                category.Id,

                            name =
                                category.Name,

                            description =
                                category.Description,

                            imageUrl =
                                category.ImageUrl,

                            status =
                                category.Status,

                            statusName,

                            productCount,

                            createdAt =
                                category.CreatedAt,

                            updatedAt =
                                category.UpdatedAt
                        }
                    );

                // ==================================================
                // 9. XÁC ĐỊNH LOẠI LỊCH SỬ
                //
                // Nếu trạng thái thay đổi:
                // STATUS_CHANGE
                //
                // Nếu trạng thái không thay đổi:
                // UPDATE
                // ==================================================

                var actionType =
                    oldStatus != status
                        ? "STATUS_CHANGE"
                        : "UPDATE";

                var historyDescription =
                    oldStatus != status
                        ? $"{displayUserName} đổi trạng thái loại món " +
                          $"{category.Id} từ " +
                          $"{CategoryRules.GetStatusName(oldStatus)} sang " +
                          $"{CategoryRules.GetStatusName(status)}"

                        : $"{displayUserName} cập nhật thông tin loại món " +
                          $"{category.Id} - {category.Name}";

                // ==================================================
                // 10. TẠO LỊCH SỬ CẬP NHẬT
                // ==================================================

                var history =
                    new CategoryHistory
                    {
                        CategoryId =
                            category.Id,

                        UserId =
                            userId,

                        UserName =
                            displayUserName,

                        ActionType =
                            actionType,

                        Description =
                            historyDescription,

                        OldData =
                            oldData,

                        NewData =
                            newData,

                        IpAddress =
                            ipAddress,

                        CreatedAt =
                            updatedAt
                    };

                await _dbContext
                    .CategoryHistories
                    .AddAsync(
                        history,
                        cancellationToken
                    );

                // ==================================================
                // 11. LƯU DATABASE
                // ==================================================

                await _dbContext
                    .SaveChangesAsync(
                        cancellationToken
                    );

                // ==================================================
                // 12. COMMIT TRANSACTION
                // ==================================================

                await transaction
                    .CommitAsync(
                        cancellationToken
                    );

                // ==================================================
                // 13. TRẢ DTO
                // ==================================================

                return new
                    UpdateCategoryResponseDto
                {
                    Success =
                        true,

                    Message =
                        $"Cập nhật loại món {category.Id} thành công.",

                    Data =
                        new UpdatedCategoryDto
                        {
                            Id =
                                category.Id,

                            Name =
                                category.Name,

                            Description =
                                category.Description,

                            ImageUrl =
                                category.ImageUrl,

                            Status =
                                category.Status,

                            StatusName =
                                statusName,

                            ProductCount =
                                productCount,

                            CreatedAt =
                                category.CreatedAt,

                            UpdatedAt =
                                category.UpdatedAt
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
                    UpdateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Không thể cập nhật loại món vì dữ liệu không hợp lệ hoặc đang có xung đột trong hệ thống."
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
                    UpdateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Đã xảy ra lỗi trong quá trình cập nhật loại món."
                };
            }
        }



        // ==================================================
        // THÊM MỚI: XÓA CATEGORY + LƯU LỊCH SỬ
        //
        // QUY TẮC:
        //
        // - Không xóa Category đang có Product.
        // - Giữ lại toàn bộ lịch sử cũ.
        // - Lịch sử DELETE có CategoryId = null.
        // - OldData lưu toàn bộ dữ liệu trước khi xóa.
        // - Dùng transaction để Category và History
        //   cùng thành công hoặc cùng rollback.
        // ==================================================

        public async Task<DeleteCategoryResponseDto>
            DeleteAsync(
                string categoryId,
                string? userId,
                string? userName,
                string? ipAddress,
                CancellationToken cancellationToken = default
            )
        {
            // ==================================================
            // THÊM MỚI - BƯỚC 1:
            // TÌM CATEGORY CẦN XÓA
            //
            // Không dùng AsNoTracking vì entity sẽ bị xóa.
            // ==================================================

            var category =
                await _dbContext
                    .Categories
                    .FirstOrDefaultAsync(
                        item =>
                            item.Id ==
                            categoryId,

                        cancellationToken
                    );

            if (
                category is null
            )
            {
                return new
                    DeleteCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        $"Không tìm thấy loại món {categoryId}."
                };
            }

            // ==================================================
            // THÊM MỚI - BƯỚC 2:
            // KIỂM TRA CATEGORY CÓ PRODUCT HAY KHÔNG
            //
            // Quan hệ Category -> Product đang dùng Restrict,
            // nên Category có món sẽ không được phép xóa.
            // ==================================================

            var productCount =
                await _dbContext
                    .Products
                    .AsNoTracking()
                    .CountAsync(
                        product =>
                            product.CategoryId ==
                            category.Id,

                        cancellationToken
                    );

            if (
                productCount > 0
            )
            {
                return new
                    DeleteCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        $"Không thể xóa loại món {category.Id} vì đang có {productCount} món thuộc loại này."
                };
            }

            // ==================================================
            // THÊM MỚI - BƯỚC 3:
            // LƯU THÔNG TIN TRƯỚC KHI XÓA
            // ==================================================

            var deletedCategoryId =
                category.Id;

            var deletedCategoryName =
                category.Name;

            var deletedAt =
                GetVietnamNow();

            var oldData =
                JsonSerializer.Serialize(
                    new
                    {
                        id =
                            category.Id,

                        name =
                            category.Name,

                        description =
                            category.Description,

                        imageUrl =
                            category.ImageUrl,

                        status =
                            category.Status,

                        statusName =
                            CategoryRules
                                .GetStatusName(
                                    category.Status
                                ),

                        productCount,

                        createdAt =
                            category.CreatedAt,

                        updatedAt =
                            category.UpdatedAt
                    }
                );

            // ==================================================
            // THÊM MỚI - BƯỚC 4:
            // XÁC ĐỊNH NGƯỜI XÓA
            //
            // Ưu tiên FullName trong AspNetUsers.
            // Nếu không có thì dùng tên trong Claim.
            // ==================================================

            var displayUserName =
                string.IsNullOrWhiteSpace(
                    userName
                )
                    ? "Hệ thống"
                    : userName.Trim();

            if (
                !string.IsNullOrWhiteSpace(
                    userId
                )
            )
            {
                var fullName =
                    await _dbContext
                        .Users
                        .AsNoTracking()
                        .Where(user =>
                            user.Id ==
                            userId
                        )
                        .Select(user =>
                            user.FullName
                        )
                        .FirstOrDefaultAsync(
                            cancellationToken
                        );

                if (
                    !string.IsNullOrWhiteSpace(
                        fullName
                    )
                )
                {
                    displayUserName =
                        fullName.Trim();
                }
            }

            // ==================================================
            // THÊM MỚI - BƯỚC 5:
            // BẮT ĐẦU TRANSACTION
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
                // THÊM MỚI - BƯỚC 6:
                // GỠ CATEGORY ID KHỎI CÁC LỊCH SỬ CŨ
                //
                // CategoryHistory.CategoryId cho phép null.
                // Việc gán null giúp giữ lại lịch sử sau khi
                // Category bị xóa và không phụ thuộc hoàn toàn
                // vào hành vi cascade của database.
                // ==================================================

                var existingHistories =
                    await _dbContext
                        .CategoryHistories
                        .Where(history =>
                            history.CategoryId ==
                            deletedCategoryId
                        )
                        .ToListAsync(
                            cancellationToken
                        );

                foreach (
                    var existingHistory
                    in existingHistories
                )
                {
                    existingHistory.CategoryId =
                        null;
                }

                // ==================================================
                // THÊM MỚI - BƯỚC 7:
                // TẠO LỊCH SỬ DELETE
                //
                // CategoryId phải là null vì sau khi SaveChanges,
                // Category không còn tồn tại để làm khóa ngoại.
                // Mã loại vẫn được giữ trong Description và OldData.
                // ==================================================

                var deleteHistory =
                    new CategoryHistory
                    {
                        CategoryId =
                            null,

                        UserId =
                            userId,

                        UserName =
                            displayUserName,

                        ActionType =
                            "DELETE",

                        Description =
                            $"{displayUserName} xóa loại món " +
                            $"{deletedCategoryId} - {deletedCategoryName}",

                        OldData =
                            oldData,

                        NewData =
                            null,

                        IpAddress =
                            ipAddress,

                        CreatedAt =
                            deletedAt
                    };

                await _dbContext
                    .CategoryHistories
                    .AddAsync(
                        deleteHistory,
                        cancellationToken
                    );

                // ==================================================
                // THÊM MỚI - BƯỚC 8:
                // XÓA CATEGORY
                // ==================================================

                _dbContext
                    .Categories
                    .Remove(
                        category
                    );

                // ==================================================
                // THÊM MỚI - BƯỚC 9:
                // LƯU DATABASE
                // ==================================================

                await _dbContext
                    .SaveChangesAsync(
                        cancellationToken
                    );

                // ==================================================
                // THÊM MỚI - BƯỚC 10:
                // COMMIT TRANSACTION
                // ==================================================

                await transaction
                    .CommitAsync(
                        cancellationToken
                    );

                // ==================================================
                // THÊM MỚI - BƯỚC 11:
                // TRẢ DTO VỀ APPLICATION
                // ==================================================

                return new
                    DeleteCategoryResponseDto
                {
                    Success =
                        true,

                    Message =
                        $"Xóa loại món {deletedCategoryId} thành công.",

                    Data =
                        new DeletedCategoryDto
                        {
                            Id =
                                deletedCategoryId,

                            Name =
                                deletedCategoryName,

                            DeletedAt =
                                deletedAt
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
                    DeleteCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Không thể xóa loại món vì loại món đang có dữ liệu liên quan trong hệ thống."
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
                    DeleteCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Đã xảy ra lỗi trong quá trình xóa loại món."
                };
            }
        }


        // ==================================================
        // THÊM MỚI DELETE CATEGORY HISTORY:
        // XÓA MỘT BẢN GHI LỊCH SỬ CATEGORY
        //
        // Workflow được giữ giống chức năng
        // DeleteRestaurantTableHistoryAsync:
        //
        // 1. Tìm lịch sử.
        // 2. Kiểm tra tồn tại.
        // 3. Lưu dữ liệu trả về trước khi Remove.
        // 4. Xóa entity.
        // 5. SaveChanges.
        // 6. Trả response.
        // ==================================================

        public async Task<DeleteCategoryHistoryResponseDto>
            DeleteHistoryAsync(
                int historyId,
                string? userId,
                string? userName,
                string? ipAddress,
                CancellationToken cancellationToken = default
            )
        {
            // ==================================================
            // THÊM MỚI DELETE CATEGORY HISTORY:
            // Các thông tin người thực hiện được Controller
            // lấy từ server theo đúng workflow hiện tại.
            //
            // Việc xóa lịch sử không tạo thêm một lịch sử mới
            // để tránh phát sinh vòng lặp lịch sử xóa lịch sử.
            // ==================================================

            _ =
                userId;

            _ =
                userName;

            _ =
                ipAddress;

            // ==================================================
            // 1. TÌM BẢN GHI LỊCH SỬ
            // ==================================================

            /*
             * Không dùng AsNoTracking vì entity này
             * cần được EF Core theo dõi để thực hiện Remove.
             */
            var historyEntity =
                await _dbContext
                    .CategoryHistories
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
                historyEntity is null
            )
            {
                return new
                    DeleteCategoryHistoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        $"Không tìm thấy lịch sử loại món có ID {historyId}."
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
                new DeletedCategoryHistoryDto
                {
                    Id =
                        historyEntity.Id,

                    CategoryId =
                        historyEntity.CategoryId,

                    ActionType =
                        historyEntity.ActionType,

                    Description =
                        historyEntity.Description,

                    DeletedAt =
                        GetVietnamNow()
                };

            // ==================================================
            // 4. XÓA BẢN GHI LỊCH SỬ
            // ==================================================

            _dbContext
                .CategoryHistories
                .Remove(
                    historyEntity
                );

            try
            {
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
                    DeleteCategoryHistoryResponseDto
                {
                    Success =
                        true,

                    Message =
                        $"Xóa lịch sử loại món ID {historyId} thành công.",

                    Data =
                        deletedHistory
                };
            }
            catch (
                DbUpdateException
            )
            {
                return new
                    DeleteCategoryHistoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Không thể xóa lịch sử loại món vì dữ liệu đang có xung đột trong hệ thống."
                };
            }
            catch (
                Exception
            )
            {
                return new
                    DeleteCategoryHistoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        "Đã xảy ra lỗi trong quá trình xóa lịch sử loại món."
                };
            }
        }

        // ==================================================
        // TÍNH PHẦN TRĂM
        // ==================================================

        private static decimal CalculatePercentage(
            int count,
            int total
        )
        {
            if (
                total <= 0
            )
            {
                return 0;
            }

            return Math.Round(
                count * 100m / total,
                1
            );
        }

        // ==================================================
        // LẤY THỜI GIAN THEO MÚI GIỜ VIỆT NAM
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