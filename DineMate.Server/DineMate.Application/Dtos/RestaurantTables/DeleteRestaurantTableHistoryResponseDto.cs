using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.RestaurantTables
{
    public class
        DeleteRestaurantTableHistoryResponseDto
    {
        // ==================================================
        // KẾT QUẢ XÓA
        // ==================================================

        public bool Success
        {
            get;
            set;
        }

        // ==================================================
        // THÔNG BÁO
        // ==================================================

        public string Message
        {
            get;
            set;
        } = string.Empty;

        // ==================================================
        // DỮ LIỆU LỊCH SỬ ĐÃ XÓA
        // ==================================================

        public DeletedRestaurantTableHistoryDto?
            Data
        {
            get;
            set;
        }
    }
}
