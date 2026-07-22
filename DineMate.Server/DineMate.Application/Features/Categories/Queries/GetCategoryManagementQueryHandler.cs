using DineMate.Application.Dtos.Categories;
using DineMate.Application.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Features.Categories.Queries
{
    public class GetCategoryManagementQueryHandler
      : IRequestHandler<
          GetCategoryManagementQuery,
          CategoryManagementDto
      >
    {
        private readonly ICategoryRepository
            _categoryRepository;

        public GetCategoryManagementQueryHandler(
            ICategoryRepository categoryRepository
        )
        {
            _categoryRepository =
                categoryRepository;
        }

        public async Task<CategoryManagementDto> Handle(
            GetCategoryManagementQuery request,
            CancellationToken cancellationToken
        )
        {
            // ==================================================
            // 1. CHUẨN HÓA PHÂN TRANG
            // ==================================================

            var pageNumber =
                request.PageNumber <= 0
                    ? 1
                    : request.PageNumber;

            var pageSize =
                request.PageSize <= 0
                    ? 10
                    : request.PageSize;

            if (pageSize > 100)
            {
                pageSize = 100;
            }

            var historySize =
                request.HistorySize <= 0
                    ? 10
                    : request.HistorySize;

            if (historySize > 100)
            {
                historySize = 100;
            }

            // ==================================================
            // 2. CHUẨN HÓA SEARCH
            // ==================================================

            var normalizedSearch =
                string.IsNullOrWhiteSpace(
                    request.Search
                )
                    ? null
                    : request.Search.Trim();

            var selectedCategoryId =
                string.IsNullOrWhiteSpace(
                    request.SelectedCategoryId
                )
                    ? null
                    : request
                        .SelectedCategoryId
                        .Trim()
                        .ToUpperInvariant();

            // ==================================================
            // 3. GỌI REPOSITORY
            // ==================================================

            return await _categoryRepository
                .GetManagementDataAsync(
                    normalizedSearch,
                    request.Status,
                    pageNumber,
                    pageSize,
                    selectedCategoryId,
                    historySize,
                    cancellationToken
                );
        }
    }
}
