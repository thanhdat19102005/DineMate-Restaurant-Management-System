using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class EmployeeShift
    {
        [Key]
        public int Id { get; set; }
        // Id hệ thống tự tạo

        public string EmployeeId { get; set; } = string.Empty;

        [ForeignKey(nameof(EmployeeId))]
        public EmployeeInfo? Employee { get; set; }

        public string ShiftName { get; set; } = string.Empty;

        public DateTime WorkDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public DateTime? ConfirmedAt { get; set; }
        // Giờ quản lý xác nhận nhân viên có mặt

        public DateTime? CheckOutAt { get; set; }

        public decimal TotalHours { get; set; }

        // 0 = Chờ xác nhận
        // 1 = Đang làm
        // 2 = Đã hoàn thành
        // 3 = Vắng
        // 4 = Nghỉ phép
        public int Status { get; set; } = 0;

        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }

}
