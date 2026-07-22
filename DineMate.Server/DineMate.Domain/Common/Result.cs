using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Domain.Common
{
    public class Result
    {
        public bool IsSuccess { get; set; }

        public string Message { get; set; } = string.Empty;

        public static Result Success(string message = "")
        {
            return new Result
            {
                IsSuccess = true,
                Message = message
            };
        }

        public static Result Failure(string message)
        {
            return new Result
            {
                IsSuccess = false,
                Message = message
            };
        }
    }
}
