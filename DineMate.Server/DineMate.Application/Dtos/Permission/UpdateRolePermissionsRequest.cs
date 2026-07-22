using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Permission
{
    public class UpdateRolePermissionsRequest
    {
        public string RoleId { get; set; } = string.Empty;

        public List<int> PermissionIds { get; set; } = new();
    }

}
