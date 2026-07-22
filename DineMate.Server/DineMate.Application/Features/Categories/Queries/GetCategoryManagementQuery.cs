using DineMate.Application.Dtos.Categories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Features.Categories.Queries
{
    public class GetCategoryManagementQuery
         : IRequest<CategoryManagementDto>
    {
        public string? Search { get; set; }

        public int? Status { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        public string? SelectedCategoryId { get; set; }

        public int HistorySize { get; set; } = 10;
    }
}
