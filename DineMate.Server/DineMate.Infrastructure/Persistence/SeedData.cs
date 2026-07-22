using DineMate.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DineMate.Infrastructure.Persistence
{
    public static class SeedData
    {
        /*
         * Role có quyền cao nhất trong hệ thống.
         *
         * Tên này phải thống nhất với:
         * [Authorize(Roles = "SuperAdmin")]
         * và Angular kiểm tra role "superadmin".
         */
        private const string SuperAdminRole =
            "SuperAdmin";

        /*
         * Tài khoản quản trị mặc định.
         *
         * Chỉ nên dùng cho môi trường Development.
         * Khi deploy thật cần đổi email và mật khẩu.
         */
        private const string SuperAdminEmail =
            "admin@dc3ms.com";

        private const string SuperAdminPassword =
            "Admin@123456";

        private const string SuperAdminFullName =
            "Quản trị viên hệ thống";

        private const string SuperAdminPhoneNumber =
            "0900000000";

        /*
         * Phương thức chính dùng để:
         *
         * 1. Tạo role SuperAdmin.
         * 2. Tạo tài khoản SuperAdmin.
         * 3. Gán tài khoản vào role SuperAdmin.
         */
        public static async Task SeedDataAsync(
            IServiceProvider serviceProvider
        )
        {
            /*
             * Lấy UserManager từ Dependency Injection.
             */
            var userManager =
                serviceProvider
                    .GetRequiredService<
                        UserManager<AppUserModel>
                    >();

            /*
             * Lấy RoleManager từ Dependency Injection.
             */
            var roleManager =
                serviceProvider
                    .GetRequiredService<
                        RoleManager<IdentityRole>
                    >();

            /*
             * Bước 1:
             * Kiểm tra role SuperAdmin đã tồn tại chưa.
             */
            var roleExists =
                await roleManager.RoleExistsAsync(
                    SuperAdminRole
                );

            /*
             * Nếu chưa có thì tạo role.
             *
             * Dữ liệu được thêm vào bảng:
             * AspNetRoles
             */
            if (!roleExists)
            {
                var createRoleResult =
                    await roleManager.CreateAsync(
                        new IdentityRole
                        {
                            Name = SuperAdminRole
                        }
                    );

                if (!createRoleResult.Succeeded)
                {
                    var roleErrors =
                        string.Join(
                            "; ",
                            createRoleResult.Errors.Select(
                                error =>
                                    $"{error.Code}: {error.Description}"
                            )
                        );

                    throw new InvalidOperationException(
                        $"Không thể tạo role {SuperAdminRole}: " +
                        roleErrors
                    );
                }
            }

            /*
             * Bước 2:
             * Kiểm tra tài khoản quản trị đã tồn tại chưa.
             */
            var superAdmin =
                await userManager.FindByEmailAsync(
                    SuperAdminEmail
                );

            /*
             * Nếu chưa có thì tạo tài khoản.
             *
             * Dữ liệu được thêm vào bảng:
             * AspNetUsers
             */
            if (superAdmin == null)
            {
                superAdmin =
                    new AppUserModel
                    {
                        FullName =
                            SuperAdminFullName,

                        /*
                         * UserName lấy phần trước dấu @.
                         */
                        UserName =
                            SuperAdminEmail.Split('@')[0],

                        Email =
                            SuperAdminEmail,

                        PhoneNumber =
                            SuperAdminPhoneNumber,

                        EmailConfirmed = true,

                        PhoneNumberConfirmed = true
                    };

                /*
                 * Không gán PasswordHash thủ công.
                 *
                 * UserManager.CreateAsync sẽ tự:
                 * - Kiểm tra quy tắc mật khẩu.
                 * - Hash mật khẩu.
                 * - Lưu PasswordHash.
                 */
                var createUserResult =
                    await userManager.CreateAsync(
                        superAdmin,
                        SuperAdminPassword
                    );

                if (!createUserResult.Succeeded)
                {
                    var userErrors =
                        string.Join(
                            "; ",
                            createUserResult.Errors.Select(
                                error =>
                                    $"{error.Code}: {error.Description}"
                            )
                        );

                    throw new InvalidOperationException(
                        "Không thể tạo tài khoản SuperAdmin: " +
                        userErrors
                    );
                }
            }

            /*
             * Bước 3:
             * Kiểm tra tài khoản đã được gán role chưa.
             */
            var alreadyInRole =
                await userManager.IsInRoleAsync(
                    superAdmin,
                    SuperAdminRole
                );

            /*
             * Nếu chưa được gán thì thêm vào role.
             *
             * Dữ liệu được thêm vào bảng:
             * AspNetUserRoles
             */
            if (!alreadyInRole)
            {
                var addRoleResult =
                    await userManager.AddToRoleAsync(
                        superAdmin,
                        SuperAdminRole
                    );

                if (!addRoleResult.Succeeded)
                {
                    var addRoleErrors =
                        string.Join(
                            "; ",
                            addRoleResult.Errors.Select(
                                error =>
                                    $"{error.Code}: {error.Description}"
                            )
                        );

                    throw new InvalidOperationException(
                        "Không thể gán role SuperAdmin: " +
                        addRoleErrors
                    );
                }
            }
        }

        /*
         * Phương thức dành cho Program.cs.
         *
         * Có thể sử dụng khi chạy:
         * - Local
         * - Docker
         * - Server
         */
        public static async Task InitializeAsync(
            IServiceProvider serviceProvider
        )
        {
            var dbContext =
                serviceProvider
                    .GetRequiredService<AppDbContext>();

            /*
             * Tự áp dụng các Migration chưa chạy.
             */
            await dbContext.Database.MigrateAsync();

            /*
             * Sau khi database và bảng đã tồn tại,
             * tiến hành seed Identity.
             */
            await SeedDataAsync(
                serviceProvider
            );
        }
    }
}
