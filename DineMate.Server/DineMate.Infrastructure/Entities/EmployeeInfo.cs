using DineMate.Infrastructure.Identity;
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
    public class EmployeeInfo
    {
        [Key]
        public string EmployeeId { get; set; } = string.Empty;
        // Id do người dùng tự tạo: NV001, NV002

        public string UserId { get; set; } = string.Empty;
        // Khóa ngoại nối với AspNetUsers.Id

        [ForeignKey(nameof(UserId))]
        public AppUserModel? User { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; }

        /// <summary>
        /// Dữ liệu file ảnh/video vật lý gửi từ Angular lên (Chỉ dùng để xử lý, không lưu vào bảng SQL).
        /// </summary>
        [NotMapped]
        public IFormFile? FileAttachments { get; set; }

        public string? Gender { get; set; }

        public decimal HourlyWage { get; set; }

        public string? Address { get; set; }

        public DateTime? DateOfBirth { get; set; }

        // 0 = Đã nghỉ việc
        // 1 = Còn làm việc
        public int Status { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public List<EmployeeShift> EmployeeShifts { get; set; } = new();
    }

}
