using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.RestaurantTables
{
    public class DeletedRestaurantTableHistoryDto
    {
        // ==================================================
        // ID BẢN GHI LỊCH SỬ ĐÃ XÓA
        // ==================================================

        public int Id { get; set; }

        // ==================================================
        // MÃ BÀN LIÊN QUAN
        // ==================================================

        /*
         * Có thể null vì khi bàn bị xóa,
         * RestaurantTableId được SetNull.
         */
        public string? RestaurantTableId
        {
            get;
            set;
        }

        // ==================================================
        // LOẠI THAO TÁC CỦA LỊCH SỬ
        // ==================================================

        public string ActionType
        {
            get;
            set;
        } = string.Empty;

        // ==================================================
        // NỘI DUNG LỊCH SỬ
        // ==================================================

        public string Description
        {
            get;
            set;
        } = string.Empty;

        // ==================================================
        // THỜI GIAN XÓA BẢN GHI
        // ==================================================

        public DateTime DeletedAt
        {
            get;
            set;
        }
    }
}
