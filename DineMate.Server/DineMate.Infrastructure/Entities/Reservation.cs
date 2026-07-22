using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class Reservation
    {
        [Key]
        public int Id { get; set; }
        // Id hệ thống tự tạo

        public string ReservationCode { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;

        public string CustomerPhone { get; set; } = string.Empty;

        public string? CustomerEmail { get; set; }

        public int NumberOfGuests { get; set; }

        public DateTime ReservationTime { get; set; }

        public string? TableId { get; set; }
        // Nối với RestaurantTable.Id
        // Ví dụ: A01, VIP01

        [ForeignKey(nameof(TableId))]
        public RestaurantTable? Table { get; set; }

        public string? SpecialRequest { get; set; }

        // 0 = Chờ xác nhận
        // 1 = Đã xác nhận
        // 2 = Đã hủy
        // 3 = Hoàn thành
        // 4 = Khách không đến
        public int Status { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public List<OrderModel> Orders { get; set; } = new();
    }

}
