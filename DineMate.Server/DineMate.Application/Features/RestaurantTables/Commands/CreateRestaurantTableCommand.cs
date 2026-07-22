using DineMate.Application.Dtos.RestaurantTables;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DineMate.Application.Features.RestaurantTables.Commands
{
    public class CreateRestaurantTableCommand
        : IRequest<
            CreateRestaurantTableResponseDto
        >
    {
        // ==================================================
        // FRONTEND GỬI LÊN
        // ==================================================

        public string Id { get; set; }
            = string.Empty;

        public string TableName { get; set; }
            = string.Empty;

        public int Capacity { get; set; }

        public string TableType { get; set; }
            = string.Empty;

        public string? AreaName { get; set; }

        public string? Note { get; set; }

        // ==================================================
        // CONTROLLER TỰ GÁN
        // Không cho frontend truyền qua JSON.
        // ==================================================

        [JsonIgnore]
        public string? UserId { get; set; }

        [JsonIgnore]
        public string? UserName { get; set; }

        [JsonIgnore]
        public string? IpAddress { get; set; }
    }
}
