using DineMate.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DineMate.Domain.Rules
{
    public static class AuthRules
    {
        public static Result ValidateRegister(
            string fullName,
            string email,
            string phoneNumber,
            string password,
            string confirmPassword)
        {
            if (string.IsNullOrWhiteSpace(fullName))
                return Result.Failure("Họ và tên không được để trống.");

            if (fullName.Length < 2)
                return Result.Failure("Họ và tên phải có ít nhất 2 ký tự.");

            if (fullName.Length > 100)
                return Result.Failure("Họ và tên không được vượt quá 100 ký tự.");

            if (string.IsNullOrWhiteSpace(email))
                return Result.Failure("Email không được để trống.");

            if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return Result.Failure("Email không hợp lệ.");

            if (string.IsNullOrWhiteSpace(phoneNumber))
                return Result.Failure("Số điện thoại không được để trống.");

            if (!Regex.IsMatch(phoneNumber, @"^0\d{9}$"))
                return Result.Failure("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.");

            if (string.IsNullOrWhiteSpace(password))
                return Result.Failure("Mật khẩu không được để trống.");

            if (password.Length < 6)
                return Result.Failure("Mật khẩu phải có ít nhất 6 ký tự.");

            if (password != confirmPassword)
                return Result.Failure("Mật khẩu xác nhận không khớp.");

            return Result.Success();
        }
    }
}
