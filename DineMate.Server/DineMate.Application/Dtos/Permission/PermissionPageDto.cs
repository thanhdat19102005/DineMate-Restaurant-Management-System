using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Permission
{
    public class PermissionPageDto
    {
        public List<RoleDto> Roles { get; set; } = new();

        public string SelectedRoleId { get; set; } = string.Empty;

        public List<PermissionGroupDto> PermissionGroups { get; set; } = new();
    }

}
