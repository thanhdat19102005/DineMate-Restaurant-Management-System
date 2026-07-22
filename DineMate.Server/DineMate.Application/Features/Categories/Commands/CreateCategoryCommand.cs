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
    public class CreateCategoryCommand
       : IRequest<CreateCategoryResponseDto>
    {
        // ==================================================
        // DỮ LIỆU ANGULAR GỬI LÊN
        // ==================================================

        public string Id { get; set; }
            = string.Empty;

        public string Name { get; set; }
            = string.Empty;

        public string? Description { get; set; }

        /*
         * 0 = Đã ẩn.
         * 1 = Đang hoạt động.
         */
        public int Status { get; set; } = 1;

        // ==================================================
        // DỮ LIỆU DO API TỰ GÁN
        //
        // JsonIgnore ngăn Angular gửi các trường này
        // để giả mạo người thực hiện thao tác.
        // ==================================================

        [JsonIgnore]
        public string? UserId { get; set; }

        [JsonIgnore]
        public string? UserName { get; set; }

        [JsonIgnore]
        public string? IpAddress { get; set; }
    }
}
