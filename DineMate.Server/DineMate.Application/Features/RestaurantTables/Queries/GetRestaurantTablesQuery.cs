using DineMate.Application.Dtos.RestaurantTables;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Features.RestaurantTables.Queries
{
    public class GetRestaurantTablesQuery
       : IRequest<RestaurantTableResponseDto>
    {
        public string? Search { get; set; }

        public string? AreaName { get; set; }

        public int? Status { get; set; }

        public int? Capacity { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 8;

        public string? SelectedTableId { get; set; }

        public int HistorySize { get; set; } = 10;
    }
}
