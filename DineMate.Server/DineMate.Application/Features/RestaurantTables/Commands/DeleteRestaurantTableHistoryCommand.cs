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
    public class
       DeleteRestaurantTableHistoryCommand
       : IRequest<
           DeleteRestaurantTableHistoryResponseDto
       >
    {
        // ==================================================
        // ID LỊCH SỬ LẤY TỪ URL
        // ==================================================

        [JsonIgnore]
        public int HistoryId
        {
            get;
            set;
        }

        // ==================================================
        // THÔNG TIN NGƯỜI THỰC HIỆN
        //
        // Controller tự gán.
        // Frontend không được gửi qua JSON.
        // ==================================================

        [JsonIgnore]
        public string? UserId
        {
            get;
            set;
        }

        [JsonIgnore]
        public string? UserName
        {
            get;
            set;
        }

        [JsonIgnore]
        public string? IpAddress
        {
            get;
            set;
        }
    }
}
