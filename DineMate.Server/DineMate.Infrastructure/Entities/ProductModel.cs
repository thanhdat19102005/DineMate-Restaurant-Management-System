using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class ProductModel
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        // Id do người dùng tự tạo: SP001, COMTAM01, LAUTHAI01

        public string Name { get; set; } = string.Empty;
        // Cơm tấm, Vịt quay Bắc Kinh

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }


        /// <summary>
        /// Dữ liệu file ảnh/video vật lý gửi từ Angular lên (Chỉ dùng để xử lý, không lưu vào bảng SQL).
        /// </summary>
        [NotMapped]
        public IFormFile? FileAttachments { get; set; }


        public string CategoryId { get; set; } = string.Empty;
        // Khóa ngoại nối với CategoryModel.Id

        [ForeignKey(nameof(CategoryId))]
        public CategoryModel? Category { get; set; }

        public string Unit { get; set; } = "phần";

        // 0 = Hết hàng
        // 1 = Còn hàng
        public int Status { get; set; } = 1;

        public bool IsFeatured { get; set; } = false;

        public bool IsBestSeller { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public List<OrderDetails> OrderDetails { get; set; } = new();
    }

}
