using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DineMate.Infrastructure.Entities
{
    public class RestaurantTable
    {
        // ==================================================
        // MÃ BÀN (KHÓA CHÍNH)
        // ==================================================
        // Ví dụ:
        // A01
        // B004
        // VIP01
        //
        // THÊM MỚI:
        // MaxLength(50) để đồng bộ với
        // RestaurantTableHistory.RestaurantTableId
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = string.Empty;

        // ==================================================
        // TÊN BÀN
        // ==================================================
        // Ví dụ:
        // Bàn 01
        // Bàn VIP 01
        [Required]
        [MaxLength(200)]
        public string TableName { get; set; } = string.Empty;

        // ==================================================
        // SỨC CHỨA
        // ==================================================
        public int Capacity { get; set; }

        // ==================================================
        // LOẠI BÀN
        // ==================================================
        // Ví dụ:
        // Thường
        // VIP
        // Ngoài trời
        [Required]
        [MaxLength(100)]
        public string TableType { get; set; } = string.Empty;

        // ==================================================
        // KHU VỰC
        // ==================================================
        // Ví dụ:
        // Tầng 1 - Khu A
        // Tầng 2 - VIP
        [MaxLength(200)]
        public string? AreaName { get; set; }

        // ==================================================
        // QR CODE
        // ==================================================
        public string? QrCode { get; set; }

        // ==================================================
        // TRẠNG THÁI
        // ==================================================
        //
        // 0 = Trống
        // 1 = Đang phục vụ
        // 2 = Đang bảo trì
        // 3 = Đã đặt trước
        // 4 = Tạm khóa
        //
        public int Status { get; set; } = 0;

        // ==================================================
        // GHI CHÚ
        // ==================================================
        [MaxLength(1000)]
        public string? Note { get; set; }

        // ==================================================
        // THỜI GIAN
        // ==================================================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // ==================================================
        // DANH SÁCH ĐƠN HÀNG
        // ==================================================
        public List<OrderModel> Orders { get; set; } = new();

        // ==================================================
        // DANH SÁCH ĐẶT BÀN
        // ==================================================
        public List<Reservation> Reservations { get; set; } = new();

        // ==================================================
        // THÊM MỚI
        // LỊCH SỬ THAO TÁC CỦA BÀN
        // Một bàn có thể có nhiều lịch sử.
        // ==================================================
        public List<RestaurantTableHistory> Histories { get; set; } = new();



        /*
         * Một bàn có một bản ghi QR.
         */
        public RestaurantTableQr? TableQr
        {
            get;
            set;
        }


    }
}