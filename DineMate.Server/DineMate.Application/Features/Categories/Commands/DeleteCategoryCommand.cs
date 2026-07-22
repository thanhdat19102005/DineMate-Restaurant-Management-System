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

  
    // COMMAND XÓA CATEGORY
    // ==================================================

    public class DeleteCategoryCommand
         : IRequest<DeleteCategoryResponseDto>
    {
        // ==================================================
        // CATEGORY ID DO CONTROLLER GÁN TỪ ROUTE
        //
        // DELETE /api/categories/{categoryId}
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
