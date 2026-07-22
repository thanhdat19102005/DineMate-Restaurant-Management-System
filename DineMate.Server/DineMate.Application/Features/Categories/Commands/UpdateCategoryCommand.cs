using DineMate.Application.Dtos.Categories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DineMate.Application.Features.Categories.Commands
{
    public class UpdateCategoryCommand
       : IRequest<UpdateCategoryResponseDto>
    {
        // ==================================================
        // DỮ LIỆU ANGULAR GỬI TRONG BODY
        // ==================================================

        public string Name { get; set; }
            = string.Empty;

        public string? Description { get; set; }

        /*
         * 0 = Đã ẩn.
         * 1 = Đang hoạt động.
         */
        public int Status { get; set; }

        // ==================================================
        // CATEGORY ID DO CONTROLLER GÁN TỪ ROUTE
        //
        // PUT /api/categories/{categoryId}
        // ==================================================

        [JsonIgnore]
        public string CategoryId { get; set; }
            = string.Empty;

        // ==================================================
        // THÔNG TIN DO API TỰ GÁN
        //
        // Angular không được gửi các trường này.
        // ==================================================

        [JsonIgnore]
        public string? UserId { get; set; }

        [JsonIgnore]
        public string? UserName { get; set; }

        [JsonIgnore]
        public string? IpAddress { get; set; }
    }
}
