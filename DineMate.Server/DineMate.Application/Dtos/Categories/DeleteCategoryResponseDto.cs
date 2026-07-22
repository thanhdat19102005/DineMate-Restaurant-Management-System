using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Categories
{

   
    // RESPONSE CỦA API DELETE CATEGORY
    // ==================================================

    public class DeleteCategoryResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; }
            = string.Empty;

        public DeletedCategoryDto? Data { get; set; }
    }
}
