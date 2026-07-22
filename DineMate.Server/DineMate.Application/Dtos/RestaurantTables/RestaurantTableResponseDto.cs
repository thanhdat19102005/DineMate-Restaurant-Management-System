using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.RestaurantTables
{
    public class RestaurantTableResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public RestaurantTableManagementDto? Data
        {
            get;
            set;
        }
    }
}
