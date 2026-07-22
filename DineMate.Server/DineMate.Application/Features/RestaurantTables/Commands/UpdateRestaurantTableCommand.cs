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
    public class UpdateRestaurantTableCommand
        : IRequest<
            UpdateRestaurantTableResponseDto
        >
    {
        // ==================================================
        // ID ĐƯỢC LẤY TỪ ROUTE
        // PUT /api/restaurant-tables/A44
        // ==================================================

        [JsonIgnore]
        public string Id { get; set; } =
            string.Empty;

        // ==================================================
        // DỮ LIỆU FRONTEND ĐƯỢC PHÉP CẬP NHẬT
        // ==================================================

        public string TableName { get; set; } =
            string.Empty;

        public int Capacity { get; set; }

        public string TableType { get; set; } =
            string.Empty;

        public string? AreaName { get; set; }

        public int Status { get; set; }

        public string? Note { get; set; }

        // ==================================================
        // DỮ LIỆU AUDIT DO CONTROLLER GÁN
        // KHÔNG NHẬN TỪ FRONTEND
        // ==================================================

        [JsonIgnore]
        public string? UserId { get; set; }

        [JsonIgnore]
        public string UserName { get; set; } =
            "Hệ thống";

        [JsonIgnore]
        public string? IpAddress { get; set; }
    }
}
