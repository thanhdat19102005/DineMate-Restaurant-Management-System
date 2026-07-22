using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class RestaurantTableQr
    {
        // ==================================================
        // KHÓA CHÍNH TỰ TĂNG
        // ==================================================

        [Key]
        [DatabaseGenerated(
            DatabaseGeneratedOption.Identity
        )]
        public int Id { get; set; }

        // ==================================================
        // MÃ BÀN
        // ==================================================

        /*
         * Khóa ngoại đến:
         * RestaurantTables.Id
         */
        [Required]
        [MaxLength(50)]
        public string RestaurantTableId
        {
            get;
            set;
        } = string.Empty;

        // ==================================================
        // NỘI DUNG QR
        // ==================================================

        /*
         * Ví dụ:
         * http://localhost:4200/order/A010
         */
        [Required]
        [MaxLength(1000)]
        public string QrContent { get; set; }
            = string.Empty;

        // ==================================================
        // TRẠNG THÁI QR
        // ==================================================

        /*
         * true:
         * QR đang được sử dụng.
         *
         * false:
         * QR đã bị vô hiệu hóa.
         */
        public bool IsActive { get; set; }
            = true;

        // ==================================================
        // THỜI GIAN
        // ==================================================

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // ==================================================
        // NAVIGATION
        // ==================================================

        [ForeignKey(
            nameof(RestaurantTableId)
        )]
        public RestaurantTable? RestaurantTable
        {
            get;
            set;
        }
    
}
}
