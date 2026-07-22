using DineMate.Infrastructure.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Identity
{
    public  class AppUserModel : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public EmployeeInfo? EmployeeInfo { get; set; }







        // ==================================================
        // LỊCH SỬ THAO TÁC CATEGORY
        // ==================================================

        public List<CategoryHistory>
            CategoryHistories
        {
            get;
            set;
        } = new();










    }
}
