using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class ManageIngredient
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        // Id do người dùng tự tạo: NL001, THITBO01

        public string Ingredient { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        public string Unit { get; set; } = "kg";

        public string? Supplier { get; set; }

        public DateTime? ManufacturingDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        // 0 = Hết hàng
        // 1 = Còn hàng
        public int Status { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }

}
