using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.RestaurantTables
{
    public class RestaurantTableStatisticsDto
    {
        public int Total { get; set; }

        public int Empty { get; set; }

        public int Serving { get; set; }

        public int Maintenance { get; set; }

        public int Reserved { get; set; }

        public int Locked { get; set; }

        public decimal EmptyPercentage { get; set; }

        public decimal ServingPercentage { get; set; }

        public decimal MaintenancePercentage { get; set; }

        public decimal ReservedPercentage { get; set; }

        public decimal LockedPercentage { get; set; }
    }
}
