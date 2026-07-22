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
    // THÊM MỚI DELETE CATEGORY HISTORY:
    // HANDLER XÓA MỘT BẢN GHI CATEGORY HISTORY
    // ==================================================

    public class DeleteCategoryHistoryCommandHandler
         : IRequestHandler<
             DeleteCategoryHistoryCommand,
             DeleteCategoryHistoryResponseDto
         >
    {
        private readonly ICategoryRepository
            _categoryRepository;

        public DeleteCategoryHistoryCommandHandler(
            ICategoryRepository categoryRepository
        )
        {
            _categoryRepository =
                categoryRepository;
        }

        public async Task<DeleteCategoryHistoryResponseDto>
            Handle(
                DeleteCategoryHistoryCommand request,
                CancellationToken cancellationToken
            )
        {
            // ==================================================
            // THÊM MỚI DELETE CATEGORY HISTORY - BƯỚC 1:
            // KIỂM TRA HISTORY ID BẰNG DOMAIN RULE
            // ==================================================

            var validationResult =
                CategoryRules
                    .ValidateDeleteHistory(
                        request.HistoryId
                    );

            if (
                !validationResult.IsSuccess
            )
            {
                return new
                    DeleteCategoryHistoryResponseDto
                {
                    Success =
                        false,

                    Message =
                        validationResult.Message
                };
            }

            // ==================================================
            // THÊM MỚI DELETE CATEGORY HISTORY - BƯỚC 2:
            // GỌI REPOSITORY XÓA DỮ LIỆU
            // ==================================================

            return await _categoryRepository
                .DeleteHistoryAsync(
                    request.HistoryId,
                    request.UserId,
                    request.UserName,
                    request.IpAddress,
                    cancellationToken
                );
        }
    }
}
