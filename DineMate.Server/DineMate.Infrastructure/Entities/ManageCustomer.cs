using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class ManageCustomer
    {
        [Key]
        public int Id { get; set; }
        // Id hệ thống tự tạo

        public string CustomerCode { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string? Email { get; set; }

        public int Points { get; set; }

        public string? VoucherCode { get; set; }

        public string? MembershipLevel { get; set; }

        public DateTime? LastVisitDate { get; set; }

        public string? CareNote { get; set; }

        // 0 = Ngưng chăm sóc
        // 1 = Đang hoạt động
        // 2 = Khóa
        public int Status { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public List<OrderModel> Orders { get; set; } = new();
    }

}
