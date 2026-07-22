using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos.Permission
{
    public class PermissionDto
    {
        public int Id { get; set; }

        public string Code { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Module { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public bool IsMenu { get; set; }

        public int SortOrder { get; set; }

        public bool IsGranted { get; set; }
    }

}
