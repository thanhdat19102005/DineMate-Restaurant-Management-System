using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Categories
{
    public class CategoryHistoryDto
    {
        public int Id { get; set; }

        public string? CategoryId { get; set; }

        public string? UserId { get; set; }

        public string UserName { get; set; }
            = string.Empty;

        public string ActionType { get; set; }
            = string.Empty;

        public string Description { get; set; }
            = string.Empty;

        public string? OldData { get; set; }

        public string? NewData { get; set; }

        public string? IpAddress { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
