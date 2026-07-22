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
    // ==================================================
    // THÊM MỚI:
    // HANDLER XÓA CATEGORY
    // ==================================================

    public class DeleteCategoryCommandHandler
         : IRequestHandler<
             DeleteCategoryCommand,
             DeleteCategoryResponseDto
         >
    {
        private readonly ICategoryRepository
            _categoryRepository;

        public DeleteCategoryCommandHandler(
            ICategoryRepository categoryRepository
        )
        {
            _categoryRepository =
                categoryRepository;
        }

        public async Task<DeleteCategoryResponseDto>
            Handle(
                DeleteCategoryCommand request,
                CancellationToken cancellationToken
            )
        {
            // ==================================================
            // THÊM MỚI - BƯỚC 1:
            // CHUẨN HÓA CATEGORY ID
            // ==================================================

            var normalizedCategoryId =
                (request.CategoryId ?? string.Empty)
                    .Trim()
                    .ToUpperInvariant();

            // ==================================================
            // THÊM MỚI - BƯỚC 2:
            // KIỂM TRA DOMAIN RULES
            // ==================================================

            // ==================================================
            // THAY ĐỔI:
            // Rule Delete đã được gộp vào CategoryRules.cs.
            // Không còn sử dụng DeleteCategoryRules.cs riêng.
            // ==================================================

            var validationResult =
                CategoryRules.ValidateDelete(
                    normalizedCategoryId
                );

            if (
                !validationResult.IsSuccess
            )
            {
                return new
                    DeleteCategoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        validationResult.Message
                };
            }

            // ==================================================
            // THÊM MỚI - BƯỚC 3:
            // GỌI INFRASTRUCTURE XÓA CATEGORY
            // ==================================================

            return await _categoryRepository
                .DeleteAsync(
                    normalizedCategoryId,
                    request.UserId,
                    request.UserName,
                    request.IpAddress,
                    cancellationToken
                );
        }
    }
}
