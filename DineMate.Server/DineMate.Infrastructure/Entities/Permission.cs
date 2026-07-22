using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class Permission
    {
        [Key]
        public int Id { get; set; }

        public string Code { get; set; } = string.Empty;
        // table.menu, table.view, table.update

        public string Name { get; set; } = string.Empty;
        // Menu Quản lý bàn, Xem bàn

        public string Module { get; set; } = string.Empty;
        // Quản lý bàn, Quản lý món ăn, Nhân viên

        public string Description { get; set; } = string.Empty;

        public bool IsMenu { get; set; }

        public int SortOrder { get; set; }

        // 0 = Ẩn
        // 1 = Đang hoạt động
        public int Status { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public List<RolePermission> RolePermissions { get; set; } = new();
    }

}
