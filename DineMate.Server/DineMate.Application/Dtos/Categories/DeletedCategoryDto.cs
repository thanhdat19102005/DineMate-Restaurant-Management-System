using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Categories
{

    // ==================================================
    // DỮ LIỆU CATEGORY VỪA BỊ XÓA
    // ==================================================

    public class DeletedCategoryDto
    {
        public string Id { get; set; }
            = string.Empty;

        public string Name { get; set; }
            = string.Empty;

        public DateTime DeletedAt { get; set; }
    }


}
