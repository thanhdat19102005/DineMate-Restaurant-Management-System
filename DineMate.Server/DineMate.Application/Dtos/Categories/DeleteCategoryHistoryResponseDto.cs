using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Categories
{
    
    // RESPONSE API XÓA CATEGORY HISTORY
    // ==================================================

    public class DeleteCategoryHistoryResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; }
            = string.Empty;

        public DeletedCategoryHistoryDto? Data { get; set; }
    }
}
