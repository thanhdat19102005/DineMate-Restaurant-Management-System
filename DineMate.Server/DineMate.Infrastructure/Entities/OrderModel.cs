using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class OrderModel
    {
        [Key]
        public int Id { get; set; }
        // Id hệ thống tự tạo

        public string OrderCode { get; set; } = string.Empty;

        public string? UserName { get; set; }

        public DateTime CreateDate { get; set; } = DateTime.UtcNow;

        // 0 = Chưa thanh toán
        // 1 = Đã thanh toán
        public int Status { get; set; } = 0;

        public string? TableId { get; set; }
        // Mã bàn, nối với RestaurantTable.Id
        // Ví dụ: A01, A02, VIP01

        [ForeignKey(nameof(TableId))]
        public RestaurantTable? Table { get; set; }

        public int? ReservationId { get; set; }

        [ForeignKey(nameof(ReservationId))]
        public Reservation? Reservation { get; set; }

        public int? CustomerId { get; set; }

        [ForeignKey(nameof(CustomerId))]
        public ManageCustomer? Customer { get; set; }

        public decimal ShippingCost { get; set; }

        public decimal Discount { get; set; }

        public string? PaymentMethod { get; set; }
        // Cash, BankTransfer, Momo, VNPay

        public decimal SubTotal { get; set; }

        public decimal TotalAmount { get; set; }

        public DateTime? PaidAt { get; set; }

        public string? Note { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public List<OrderDetails> OrderDetails { get; set; } = new();
    }

}
