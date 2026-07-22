using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.RestaurantTables
{
    public class CreatedRestaurantTableDto
    {
        public string Id { get; set; }
            = string.Empty;

        public string TableName { get; set; }
            = string.Empty;

        public int Capacity { get; set; }

        public string TableType { get; set; }
            = string.Empty;

        public string? AreaName { get; set; }

        /*
         * Link được mã hóa thành QR.
         *
         * Ví dụ:
         * http://localhost:4200/order/A01
         */
        public string QrCode { get; set; }
            = string.Empty;

        public int Status { get; set; }

        public string StatusName { get; set; }
            = string.Empty;

        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
