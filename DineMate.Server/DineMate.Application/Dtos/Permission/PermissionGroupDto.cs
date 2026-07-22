using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Permission
{
    public class PermissionGroupDto
    {
        public string Module { get; set; } = string.Empty;

        public List<PermissionDto> Permissions { get; set; } = new();
    }

}
