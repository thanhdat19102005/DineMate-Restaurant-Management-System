using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DineMate.Infrastructure.Entities
{
    public class CategoryModel
    {
        // ==================================================
        // KHÓA CHÍNH
        // ==================================================

        /*
         * Id do người dùng tự tạo.
         *
         * Ví dụ:
         * LAU
         * NUONG
         * COMBO
         */
        [Key]
        public string Id { get; set; }
            = string.Empty;

        // ==================================================
        // TÊN LOẠI
        // ==================================================

        public string Name { get; set; }
            = string.Empty;

        // Ví dụ:
        // Lẩu, Nướng, Combo

        // ==================================================
        // MÔ TẢ
        // ==================================================

        public string? Description { get; set; }

        // ==================================================
        // HÌNH ẢNH
        // ==================================================

        public string? ImageUrl { get; set; }

        /// <summary>
        /// Dữ liệu file ảnh hoặc video vật lý
        /// được Angular gửi lên.
        ///
        /// Thuộc tính này chỉ dùng để xử lý,
        /// không được lưu vào bảng SQL.
        /// </summary>
        [NotMapped]
        public IFormFile? FileAttachments { get; set; }

        // ==================================================
        // TRẠNG THÁI
        // ==================================================

        /*
         * 0 = Ẩn
         * 1 = Đang hoạt động
         */
        public int Status { get; set; } = 1;

        // ==================================================
        // THỜI GIAN
        // ==================================================

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // ==================================================
        // DANH SÁCH SẢN PHẨM
        // ==================================================

        public List<ProductModel> Products { get; set; }
            = new();

        // ==================================================
        // DANH SÁCH LỊCH SỬ CATEGORY
        // ==================================================

        public List<CategoryHistory> Histories { get; set; }
            = new();
    }
}