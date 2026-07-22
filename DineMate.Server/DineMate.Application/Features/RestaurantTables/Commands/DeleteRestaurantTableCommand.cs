using DineMate.Application.Dtos.RestaurantTables;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Features.RestaurantTables.Commands
{
    public class DeleteRestaurantTableCommand
      : IRequest<
          DeleteRestaurantTableResponseDto
      >
    {
        // Mã bàn cần xóa.
        public string Id { get; set; }
            = string.Empty;

        // Những thuộc tính bên dưới
        // không nhận từ frontend.
        //
        // Controller lấy từ JWT và HTTP request.

        public string? UserId { get; set; }

        public string UserName { get; set; }
            = "Hệ thống";

        public string? IpAddress { get; set; }
    }
}
