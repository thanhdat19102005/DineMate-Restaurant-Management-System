using DineMate.Infrastructure.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DineMate.Infrastructure.Entities
{
    public class CategoryHistory
    {
        // ==================================================
        // KHÓA CHÍNH
        // ==================================================

        [Key]
        [DatabaseGenerated(
            DatabaseGeneratedOption.Identity
        )]
        public int Id { get; set; }

        // ==================================================
        // CATEGORY BỊ THAO TÁC
        // ==================================================

        /*
         * Khóa ngoại đến Categories.Id.
         *
         * Cho phép null để khi Category bị xóa,
         * lịch sử vẫn được giữ lại.
         */
        public string? CategoryId { get; set; }

        // ==================================================
        // NGƯỜI THỰC HIỆN
        // ==================================================

        /*
         * Khóa ngoại đến AspNetUsers.Id.
         *
         * MaxLength(450) ở đây nên giữ nguyên
         * vì khóa chính Identity mặc định có độ dài 450.
         */
        [MaxLength(450)]
        public string? UserId { get; set; }

        /*
         * Tên người thực hiện tại thời điểm thao tác.
         */
        [MaxLength(200)]
        public string? UserName { get; set; }

        // ==================================================
        // LOẠI THAO TÁC
        // ==================================================

        /*
         * CREATE
         * UPDATE
         * DELETE
         * STATUS_CHANGE
         * HIDE
         * SHOW
         */
        [Required]
        [MaxLength(50)]
        public string ActionType { get; set; }
            = string.Empty;

        // ==================================================
        // NỘI DUNG LỊCH SỬ
        // ==================================================

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; }
            = string.Empty;

        // ==================================================
        // DỮ LIỆU CŨ VÀ MỚI
        // ==================================================

        public string? OldData { get; set; }

        public string? NewData { get; set; }

        // ==================================================
        // ĐỊA CHỈ IP
        // ==================================================

        [MaxLength(100)]
        public string? IpAddress { get; set; }

        // ==================================================
        // THỜI GIAN
        // ==================================================

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        // ==================================================
        // NAVIGATION ĐẾN CATEGORY
        // ==================================================

        [ForeignKey(nameof(CategoryId))]
        public CategoryModel? Category { get; set; }

        // ==================================================
        // NAVIGATION ĐẾN ASPNETUSERS
        // ==================================================

        [ForeignKey(nameof(UserId))]
        public AppUserModel? User { get; set; }
    }
}