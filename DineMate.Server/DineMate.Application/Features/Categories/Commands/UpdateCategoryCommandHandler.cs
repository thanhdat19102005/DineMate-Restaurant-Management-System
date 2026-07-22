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
    public class UpdateCategoryCommandHandler
        : IRequestHandler<
            UpdateCategoryCommand,
            UpdateCategoryResponseDto
        >
    {
        /*
         * Get, Create và Update đều dùng chung:
         *
         * ICategoryRepository
         *      ->
         * CategoryRepository
         */
        private readonly ICategoryRepository
            _categoryRepository;

        public UpdateCategoryCommandHandler(
            ICategoryRepository categoryRepository
        )
        {
            _categoryRepository =
                categoryRepository;
        }

        public async Task<UpdateCategoryResponseDto>
            Handle(
                UpdateCategoryCommand request,
                CancellationToken cancellationToken
            )
        {
            // ==================================================
            // 1. CHUẨN HÓA DỮ LIỆU
            // ==================================================

            var normalizedCategoryId =
                (request.CategoryId ?? string.Empty)
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
            // 2. KIỂM TRA DOMAIN RULES
            // ==================================================

            var validationResult =
                CategoryRules.ValidateUpdate(
                    normalizedCategoryId,
                    normalizedName,
                    normalizedDescription,
                    request.Status
                );

            if (
                !validationResult.IsSuccess
            )
            {
                return new
                    UpdateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        validationResult.Message
                };
            }

            // ==================================================
            // 3. KIỂM TRA TÊN LOẠI CÓ TRÙNG
            // VỚI CATEGORY KHÁC HAY KHÔNG
            // ==================================================

            var nameExists =
                await _categoryRepository
                    .ExistsByNameExceptIdAsync(
                        normalizedName,
                        normalizedCategoryId,
                        cancellationToken
                    );

            if (
                nameExists
            )
            {
                return new
                    UpdateCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        $"Tên loại món \"{normalizedName}\" đã được sử dụng bởi loại món khác."
                };
            }

            // ==================================================
            // 4. GỌI INFRASTRUCTURE CẬP NHẬT DATABASE
            // ==================================================

            return await _categoryRepository
                .UpdateAsync(
                    normalizedCategoryId,
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
