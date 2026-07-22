using DineMate.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Domain.Rules
{
    public static class
         DeleteRestaurantTableRules
    {
        public static Result Validate(
            string? restaurantTableId
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    restaurantTableId
                )
            )
            {
                return Result.Failure(
                    "Mã bàn không được để trống."
                );
            }

            var normalizedId =
                restaurantTableId.Trim();

            if (
                normalizedId.Length > 50
            )
            {
                return Result.Failure(
                    "Mã bàn không được vượt quá 50 ký tự."
                );
            }

            return Result.Success();
        }
    }
}
