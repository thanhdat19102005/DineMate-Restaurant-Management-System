using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Categories
{
    // ==================================================
    // RESPONSE CẬP NHẬT CATEGORY
    // ==================================================

    public class UpdateCategoryResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; }
            = string.Empty;

        public UpdatedCategoryDto? Data { get; set; }
    }
}
