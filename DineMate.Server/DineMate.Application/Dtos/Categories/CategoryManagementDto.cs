using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Categories
{
    public class CategoryManagementDto
    {
        public CategoryStatisticsDto Statistics { get; set; }
            = new();

        public PagedCategoryDto Categories { get; set; }
            = new();

        public CategoryDetailDto? SelectedCategory { get; set; }

        public List<CategoryHistoryDto> Histories { get; set; }
            = new();

        public List<int> Statuses { get; set; }
            = new();
    }
}
