using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Categories
{
   
    // DỮ LIỆU LỊCH SỬ VỪA BỊ XÓA
    // ==================================================

    public class DeletedCategoryHistoryDto
    {
        public int Id { get; set; }

        public string? CategoryId { get; set; }

        public string ActionType { get; set; }
            = string.Empty;

        public string Description { get; set; }
            = string.Empty;

        public DateTime DeletedAt { get; set; }
    }

}
