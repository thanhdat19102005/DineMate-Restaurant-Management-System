using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class OrderDetails
    {
        [Key]
        public int Id { get; set; }
        // Id hệ thống tự tạo

        public string? UserName { get; set; }

        public string OrderCode { get; set; } = string.Empty;

        public int OrderId { get; set; }

        [ForeignKey(nameof(OrderId))]
        [ValidateNever]
        public OrderModel? Order { get; set; }

        public string ProductId { get; set; } = string.Empty;

        [ForeignKey(nameof(ProductId))]
        [ValidateNever]
        public ProductModel? Product { get; set; }

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public string? Note { get; set; }

        // 0 = Chờ làm
        // 1 = Đang làm
        // 2 = Đã phục vụ
        // 3 = Đã hủy
        public int Status { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
