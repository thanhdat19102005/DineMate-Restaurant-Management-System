using DineMate.Application.Dtos.Categories;
using DineMate.Application.Interfaces;
using DineMate.Domain.Rules;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Features.Categories.Commands
{
    public class CreateCategoryCommandHandler
         : IRequestHandler<
             CreateCategoryCommand,
             CreateCategoryResponseDto
         >
    {
        /*
         * Sử dụng chung ICategoryRepository
         * với chức năng Get Management.
         *
         * Không tạo thêm ICreateCategoryRepository.
         */
        private readonly ICategoryRepository
            _categoryRepository;

        public CreateCategoryCommandHandler(
            ICategoryRepository categoryRepository
        )
        {
            _categoryRepository =
                categoryRepository;
        }

        public async Task<CreateCategoryResponseDto>
            Handle(
                CreateCategoryCommand request,
                CancellationToken cancellationToken
            )
        {
            // ==================================================
            // 1. CHUẨN HÓA DỮ LIỆU
            // ==================================================

            var normalizedId =
                (request.Id ?? string.Empty)
                    .Trim()
                    .ToUpperInvariant();

            var normalizedName =
                (request.Name ?? string.Empty)
                    .Trim();

            var normalizedDescription =
                string.IsNullOrWhiteSpace(
                    request.Description
                )
                    ? null
                    : request
                        .Description
                        .Trim();

            // ==================================================
            // 2. GỬI QUA DOMAIN KIỂM TRA DỮ LIỆU
            // ==================================================

            var validationResult =
                CategoryRules.ValidateCreate(
                    normalizedId,
                    normalizedName,
                    normalizedDescription,
                    request.Status
                );

            if (
                !validationResult.IsSuccess
            )
            {
                return new
                    CreateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        validationResult.Message
                };
            }

            // ==================================================
            // 3. KIỂM TRA MÃ CATEGORY ĐÃ TỒN TẠI
            // ==================================================

            var idExists =
                await _categoryRepository
                    .ExistsByIdAsync(
                        normalizedId,
                        cancellationToken
                    );

            if (
                idExists
            )
            {
                return new
                    CreateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        $"Mã loại món {normalizedId} đã tồn tại."
                };
            }

            // ==================================================
            // 4. KIỂM TRA TÊN CATEGORY ĐÃ TỒN TẠI
            // ==================================================

            var nameExists =
                await _categoryRepository
                    .ExistsByNameAsync(
                        normalizedName,
                        cancellationToken
                    );

            if (
                nameExists
            )
            {
                return new
                    CreateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        $"Tên loại món \"{normalizedName}\" đã tồn tại."
                };
            }

            // ==================================================
            // 5. GỬI XUỐNG INFRASTRUCTURE ĐỂ LƯU
            // ==================================================

            return await _categoryRepository
                .CreateAsync(
                    normalizedId,
                    normalizedName,
                    normalizedDescription,
                    request.Status,
                    request.UserId,
                    request.UserName,
                    request.IpAddress,
                    cancellationToken
                );
        }
    }
}
