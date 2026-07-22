using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Categories
{
    public class CategoryStatisticsDto
    {
        public int Total { get; set; }

        public int Active { get; set; }

        public int Hidden { get; set; }

        public decimal ActivePercentage { get; set; }

        public decimal HiddenPercentage { get; set; }

        public int TotalProducts { get; set; }
    }
}
