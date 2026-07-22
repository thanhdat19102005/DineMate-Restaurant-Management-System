using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.RestaurantTables
{
    public class UpdateRestaurantTableDto
    {
        public string Id { get; set; } =
            string.Empty;

        public string TableName { get; set; } =
            string.Empty;

        public int Capacity { get; set; }

        public string TableType { get; set; } =
            string.Empty;

        public string? AreaName { get; set; }

        public string? QrCode { get; set; }

        public int Status { get; set; }

        public string StatusName { get; set; } =
            string.Empty;

        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
