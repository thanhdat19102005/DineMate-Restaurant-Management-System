using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Application.Dtos
{
    public class AttendanceSummaryDto
    {
        public string EmployeeId { get; set; } = string.Empty;

        public string EmployeeName { get; set; } = string.Empty;

        public int DaysWorked { get; set; }

        public int LeaveDays { get; set; }

        public int AbsentDays { get; set; }

        public decimal TotalHours { get; set; }
    }

}
