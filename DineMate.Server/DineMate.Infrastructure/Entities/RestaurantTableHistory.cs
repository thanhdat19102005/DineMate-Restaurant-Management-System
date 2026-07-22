using DineMate.Infrastructure.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DineMate.Infrastructure.Entities
{
    public class RestaurantTableHistory
    {
        // ==================================================
        // KHÓA CHÍNH
        // ==================================================

        // Khóa chính kiểu int tự tăng.
        //
        // SQL Server sẽ tự sinh:
        // 1, 2, 3, 4, 5...
        //
        // Khi thêm dữ liệu mới, không cần tự gán Id.
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // ==================================================
        // BÀN BỊ THAO TÁC
        // ==================================================

        // Mã bàn bị thao tác.
        //
        // Ví dụ:
        // A01
        // B004
        // VIP01
        //
        // Cho phép null vì AppDbContext đang cấu hình:
        //
        // DeleteBehavior.SetNull
        //
        // Khi bàn bị xóa, bản ghi lịch sử vẫn được giữ
        // và RestaurantTableId sẽ chuyển thành null.
        //
        // MaxLength(50) phải giống với:
        // RestaurantTable.Id
        [MaxLength(50)]
        public string? RestaurantTableId { get; set; }

        // ==================================================
        // NGƯỜI THỰC HIỆN
        // ==================================================

        // Khóa ngoại đến bảng AspNetUsers.
        //
        // AppUserModel kế thừa IdentityUser nên
        // khóa chính Id có kiểu string.
        //
        // Cho phép null vì:
        // - Tài khoản có thể bị xóa.
        // - Một số thao tác có thể do hệ thống thực hiện.
        //
        // AppDbContext cấu hình DeleteBehavior.SetNull,
        // nên khi xóa user thì UserId sẽ được đặt thành null.
        [MaxLength(450)]
        public string? UserId { get; set; }

        // Lưu tên người thực hiện tại thời điểm thao tác.
        //
        // Ví dụ:
        // Nguyễn Văn A
        // Nhân viên B
        // Admin
        //
        // Việc lưu tên riêng giúp lịch sử vẫn hiển thị đúng
        // dù người dùng đổi tên hoặc tài khoản bị xóa.
        [MaxLength(200)]
        public string? UserName { get; set; }

        // ==================================================
        // LOẠI THAO TÁC
        // ==================================================

        // Các giá trị có thể dùng:
        //
        // CREATE
        // UPDATE
        // DELETE
        // STATUS_CHANGE
        // LOCK
        // UNLOCK
        [Required]
        [MaxLength(50)]
        public string ActionType { get; set; } = string.Empty;

        // ==================================================
        // NỘI DUNG LỊCH SỬ
        // ==================================================

        // Nội dung dùng để hiển thị trên giao diện.
        //
        // Ví dụ:
        //
        // "Nhân viên A cập nhật thông tin bàn B004"
        //
        // "Nhân viên B đổi trạng thái bàn B003
        // từ Trống sang Đang phục vụ"
        //
        // "Admin xóa bàn B010"
        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        // ==================================================
        // DỮ LIỆU TRƯỚC VÀ SAU KHI THAY ĐỔI
        // ==================================================

        // Dữ liệu trước khi chỉnh sửa dưới dạng JSON.
        //
        // Ví dụ:
        //
        // {
        //   "tableName": "Bàn 04",
        //   "capacity": 4,
        //   "status": 0
        // }
        public string? OldData { get; set; }

        // Dữ liệu sau khi chỉnh sửa dưới dạng JSON.
        //
        // Ví dụ:
        //
        // {
        //   "tableName": "Bàn VIP 04",
        //   "capacity": 6,
        //   "status": 1
        // }
        public string? NewData { get; set; }

        // ==================================================
        // ĐỊA CHỈ IP
        // ==================================================

        // Lưu IP của thiết bị thực hiện thao tác.
        //
        // Ví dụ:
        // 127.0.0.1
        // ::1
        // 192.168.1.10
        [MaxLength(100)]
        public string? IpAddress { get; set; }

        // ==================================================
        // THỜI GIAN THAO TÁC
        // ==================================================

        // Lưu thời gian UTC trong database.
        //
        // Khi trả dữ liệu về frontend có thể hiển thị
        // theo múi giờ Việt Nam.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ==================================================
        // NAVIGATION ĐẾN RESTAURANT TABLE
        // ==================================================

        // Navigation property đến bàn.
        //
        // RestaurantTableId là khóa ngoại đến:
        // RestaurantTables.Id
        //
        // Cho phép null vì khi bàn bị xóa,
        // khóa ngoại sẽ được SetNull.
        [ForeignKey(nameof(RestaurantTableId))]
        public RestaurantTable? RestaurantTable { get; set; }

        // ==================================================
        // NAVIGATION ĐẾN ASP.NET USER
        // ==================================================

        // AppDbContext đang dùng:
        // IdentityDbContext<AppUserModel>
        //
        // Vì vậy navigation phải là AppUserModel.
        [ForeignKey(nameof(UserId))]
        public AppUserModel? User { get; set; }
    }
}