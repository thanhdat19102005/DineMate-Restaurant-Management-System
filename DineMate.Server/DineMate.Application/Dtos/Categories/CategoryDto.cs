using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Categories
{
    public class CategoryDto
    {
        public string Id { get; set; }
            = string.Empty;

        public string Name { get; set; }
            = string.Empty;

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public int Status { get; set; }

        public string StatusName { get; set; }
            = string.Empty;

        public int ProductCount { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
