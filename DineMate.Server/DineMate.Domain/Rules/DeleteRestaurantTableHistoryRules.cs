using DineMate.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Domain.Rules
{
    public static class
      DeleteRestaurantTableHistoryRules
    {
        public static Result Validate(
            int historyId
        )
        {
            // ==================================================
            // KIỂM TRA ID LỊCH SỬ
            // ==================================================

            /*
             * RestaurantTableHistory.Id là khóa chính
             * kiểu int tự tăng.
             *
             * Vì vậy Id hợp lệ phải lớn hơn 0.
             */
            if (
                historyId <= 0
            )
            {
                return Result.Failure(
                    "ID lịch sử hoạt động không hợp lệ."
                );
            }

            return Result.Success();
        }
    }
}
