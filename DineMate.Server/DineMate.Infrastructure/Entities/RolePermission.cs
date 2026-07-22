using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Entities
{
    public class RolePermission
    {
        public string RoleId { get; set; } = string.Empty;
        // FK nối với AspNetRoles.Id

        [ForeignKey(nameof(RoleId))]
        public IdentityRole? Role { get; set; }

        public int PermissionId { get; set; }
        // FK nối với Permissions.Id

        [ForeignKey(nameof(PermissionId))]
        public Permission? Permission { get; set; }
    }

}
