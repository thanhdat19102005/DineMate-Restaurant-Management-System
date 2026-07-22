using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.RestaurantTables
{
    public class DeleteRestaurantTableDto
    {
        public string Id { get; set; }
            = string.Empty;

        public string TableName { get; set; }
            = string.Empty;

        public DateTime DeletedAt { get; set; }
    }
}
