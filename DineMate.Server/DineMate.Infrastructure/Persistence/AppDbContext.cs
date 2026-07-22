using DineMate.Infrastructure.Entities;
using DineMate.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DineMate.Infrastructure.Persistence
{
    public class AppDbContext
        : IdentityDbContext<AppUserModel>
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<RestaurantTable> RestaurantTables { get; set; }

        // ==================================================
        // THÊM MỚI
        // Bảng lưu QR Code của từng bàn
        // ==================================================
        public DbSet<RestaurantTableQr> RestaurantTableQrs { get; set; }

        public DbSet<RestaurantTableHistory> RestaurantTableHistories { get; set; }

        public DbSet<CategoryModel> Categories { get; set; }

       

        public DbSet<CategoryHistory> CategoryHistories  { get; set; }



        public DbSet<ProductModel> Products { get; set; }

        public DbSet<Reservation> Reservations { get; set; }

        public DbSet<OrderModel> Orders { get; set; }

        public DbSet<OrderDetails> OrderDetails { get; set; }

        public DbSet<ManageCustomer> ManageCustomers { get; set; }

        public DbSet<ManageIngredient> ManageIngredients { get; set; }

        public DbSet<EmployeeInfo> EmployeeInfos { get; set; }

        public DbSet<EmployeeShift> EmployeeShifts { get; set; }

        public DbSet<Permission> Permissions { get; set; }

        public DbSet<RolePermission> RolePermissions { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //--------------------------------------------------
            // Employee
            //--------------------------------------------------

            modelBuilder.Entity<EmployeeInfo>()
                .HasOne(x => x.User)
                .WithOne(x => x.EmployeeInfo)
                .HasForeignKey<EmployeeInfo>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EmployeeInfo>()
                .HasIndex(x => x.UserId)
                .IsUnique();

            modelBuilder.Entity<EmployeeShift>()
                .HasOne(x => x.Employee)
                .WithMany(x => x.EmployeeShifts)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            //--------------------------------------------------
            // Category
            //--------------------------------------------------

            modelBuilder.Entity<CategoryModel>()
                .HasMany(x => x.Products)
                .WithOne(x => x.Category)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);


            //--------------------------------------------------
            // Category 1 - N CategoryHistory
            //--------------------------------------------------

            /*
             * Một Category có nhiều bản ghi lịch sử.
             *
             * Khi Category bị xóa:
             *
             * - Không xóa lịch sử Category.
             * - CategoryHistory.CategoryId chuyển thành null.
             */
            modelBuilder.Entity<CategoryModel>()
                .HasMany(x => x.Histories)
                .WithOne(x => x.Category)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            //--------------------------------------------------
            // CategoryHistory
            //--------------------------------------------------

            modelBuilder.Entity<CategoryHistory>(entity =>
            {
                //--------------------------------------------------
                // TÊN BẢNG
                //--------------------------------------------------

                entity.ToTable(
                    "CategoryHistories"
                );

                //--------------------------------------------------
                // KHÓA CHÍNH
                //--------------------------------------------------

                entity.HasKey(
                    x => x.Id
                );

                /*
                 * Id tự động tăng trong SQL Server.
                 */
                entity.Property(
                    x => x.Id
                )
                .ValueGeneratedOnAdd();

                //--------------------------------------------------
                // CATEGORY ID
                //--------------------------------------------------

                /*
                 * Không cấu hình HasMaxLength tại đây.
                 *
                 * Vì bạn đã quyết định bỏ MaxLength
                 * cho CategoryModel.Id và CategoryHistory.CategoryId.
                 *
                 * EF Core sẽ tự đồng bộ kiểu dữ liệu
                 * của khóa chính và khóa ngoại.
                 */

                //--------------------------------------------------
                // USER ID
                //--------------------------------------------------

                /*
                 * CategoryHistory.UserId
                 * là khóa ngoại đến AspNetUsers.Id.
                 */
                entity.Property(
                    x => x.UserId
                )
                .HasMaxLength(450);

                //--------------------------------------------------
                // USER NAME
                //--------------------------------------------------

                entity.Property(
                    x => x.UserName
                )
                .HasMaxLength(200);

                //--------------------------------------------------
                // ACTION TYPE
                //--------------------------------------------------

                entity.Property(
                    x => x.ActionType
                )
                .HasMaxLength(50)
                .IsRequired();

                //--------------------------------------------------
                // DESCRIPTION
                //--------------------------------------------------

                entity.Property(
                    x => x.Description
                )
                .HasMaxLength(1000)
                .IsRequired();

                //--------------------------------------------------
                // IP ADDRESS
                //--------------------------------------------------

                entity.Property(
                    x => x.IpAddress
                )
                .HasMaxLength(100);

                //--------------------------------------------------
                // DỮ LIỆU CŨ DẠNG JSON
                //--------------------------------------------------

                entity.Property(
                    x => x.OldData
                )
                .HasColumnType(
                    "nvarchar(max)"
                );

                //--------------------------------------------------
                // DỮ LIỆU MỚI DẠNG JSON
                //--------------------------------------------------

                entity.Property(
                    x => x.NewData
                )
                .HasColumnType(
                    "nvarchar(max)"
                );

                //--------------------------------------------------
                // ASPNETUSERS 1 - N CATEGORY HISTORY
                //--------------------------------------------------

                /*
                 * Quan hệ:
                 *
                 * AspNetUsers.Id
                 *      1
                 *      |
                 *      N
                 * CategoryHistories.UserId
                 *
                 * Khi tài khoản người dùng bị xóa:
                 *
                 * - Bản ghi lịch sử vẫn được giữ lại.
                 * - UserId chuyển thành null.
                 */
                entity.HasOne(
                    x => x.User
                )
                .WithMany(
                    x => x.CategoryHistories
                )
                .HasForeignKey(
                    x => x.UserId
                )
                .OnDelete(
                    DeleteBehavior.SetNull
                );

                //--------------------------------------------------
                // INDEX CATEGORY ID
                //--------------------------------------------------

                entity.HasIndex(
                    x => x.CategoryId
                );

                //--------------------------------------------------
                // INDEX USER ID
                //--------------------------------------------------

                entity.HasIndex(
                    x => x.UserId
                );

                //--------------------------------------------------
                // INDEX THỜI GIAN
                //--------------------------------------------------

                entity.HasIndex(
                    x => x.CreatedAt
                );

                //--------------------------------------------------
                // INDEX CATEGORY ID + CREATED AT
                //--------------------------------------------------

                /*
                 * Tăng tốc khi lấy lịch sử
                 * của một Category theo thời gian.
                 */
                entity.HasIndex(
                    x => new
                    {
                        x.CategoryId,
                        x.CreatedAt
                    }
                );
            });











            //--------------------------------------------------
            // Product
            //--------------------------------------------------

            modelBuilder.Entity<ProductModel>()
                .HasMany(x => x.OrderDetails)
                .WithOne(x => x.Product)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            //--------------------------------------------------
            // Order
            //--------------------------------------------------

            modelBuilder.Entity<OrderModel>()
                .HasMany(x => x.OrderDetails)
                .WithOne(x => x.Order)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            //--------------------------------------------------
            // RestaurantTable
            //--------------------------------------------------

            modelBuilder.Entity<RestaurantTable>()
                .HasMany(x => x.Orders)
                .WithOne(x => x.Table)
                .HasForeignKey(x => x.TableId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<RestaurantTable>()
                .HasMany(x => x.Reservations)
                .WithOne(x => x.Table)
                .HasForeignKey(x => x.TableId)
                .OnDelete(DeleteBehavior.SetNull);

            //--------------------------------------------------
            // RestaurantTable 1 - N RestaurantTableHistory
            //--------------------------------------------------

            modelBuilder.Entity<RestaurantTable>()
                .HasMany(x => x.Histories)
                .WithOne(x => x.RestaurantTable)
                .HasForeignKey(x => x.RestaurantTableId)
                .OnDelete(DeleteBehavior.SetNull);

            //--------------------------------------------------
            
            // RestaurantTable 1 - 1 RestaurantTableQr
            //--------------------------------------------------
            //
            // Một bàn chỉ có một bản ghi QR.
            //
            // RestaurantTableQr.RestaurantTableId
            // là khóa ngoại đến RestaurantTable.Id.
            //
            // Khi xóa bàn thì bản ghi QR
            // của bàn cũng bị xóa theo.
            //--------------------------------------------------

            modelBuilder.Entity<RestaurantTable>()
                .HasOne(x => x.TableQr)
                .WithOne(x => x.RestaurantTable)
                .HasForeignKey<RestaurantTableQr>(
                    x => x.RestaurantTableId
                )
                .OnDelete(DeleteBehavior.Cascade);

            //--------------------------------------------------
            
            // Cấu hình bảng RestaurantTableQr
            //--------------------------------------------------

            modelBuilder.Entity<RestaurantTableQr>(entity =>
            {
                entity.ToTable("RestaurantTableQrs");

                //--------------------------------------------------
                // Khóa chính
                //--------------------------------------------------

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                    .ValueGeneratedOnAdd();

                //--------------------------------------------------
                // RestaurantTableId
                //--------------------------------------------------
                //
                // Phải đồng bộ độ dài với:
                // RestaurantTable.Id = nvarchar(50)
                //--------------------------------------------------

                entity.Property(x => x.RestaurantTableId)
                    .HasMaxLength(50)
                    .IsRequired();

                //--------------------------------------------------
                // Nội dung QR
                //--------------------------------------------------
                //
                // Ví dụ:
                // http://localhost:4200/order/A01
                //--------------------------------------------------

                entity.Property(x => x.QrContent)
                    .HasMaxLength(1000)
                    .IsRequired();

                //--------------------------------------------------
                // Trạng thái QR
                //--------------------------------------------------

                entity.Property(x => x.IsActive)
                    .IsRequired();

                //--------------------------------------------------
                // Một bàn chỉ có một QR
                //--------------------------------------------------

                entity.HasIndex(x => x.RestaurantTableId)
                    .IsUnique();

                //--------------------------------------------------
                // Index thời gian
                //--------------------------------------------------

                entity.HasIndex(x => x.CreatedAt);
            });

            //--------------------------------------------------
            // RestaurantTableHistory
            //--------------------------------------------------

            modelBuilder.Entity<RestaurantTableHistory>(entity =>
            {
                entity.ToTable("RestaurantTableHistories");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                    .ValueGeneratedOnAdd();

                entity.Property(x => x.ActionType)
                    .HasMaxLength(50);

                entity.Property(x => x.UserName)
                    .HasMaxLength(200);

                entity.Property(x => x.Description)
                    .HasMaxLength(1000);

                entity.Property(x => x.IpAddress)
                    .HasMaxLength(100);

                entity.Property(x => x.OldData)
                    .HasColumnType("nvarchar(max)");

                entity.Property(x => x.NewData)
                    .HasColumnType("nvarchar(max)");

                //--------------------------------------------------
                // AspNetUsers 1 - N RestaurantTableHistory
                //--------------------------------------------------

                entity.HasOne(x => x.User)
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.SetNull);

                //--------------------------------------------------
                // Index
                //--------------------------------------------------

                entity.HasIndex(x => x.RestaurantTableId);

                entity.HasIndex(x => x.UserId);

                entity.HasIndex(x => x.CreatedAt);

                entity.HasIndex(x => new
                {
                    x.RestaurantTableId,
                    x.CreatedAt
                });
            });

            //--------------------------------------------------
            // Customer
            //--------------------------------------------------

            modelBuilder.Entity<ManageCustomer>()
                .HasMany(x => x.Orders)
                .WithOne(x => x.Customer)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);

            //--------------------------------------------------
            // Reservation
            //--------------------------------------------------

            modelBuilder.Entity<Reservation>()
                .HasMany(x => x.Orders)
                .WithOne(x => x.Reservation)
                .HasForeignKey(x => x.ReservationId)
                .OnDelete(DeleteBehavior.SetNull);

            //--------------------------------------------------
            // Permission
            //--------------------------------------------------

            modelBuilder.Entity<RolePermission>()
                .HasKey(x => new
                {
                    x.RoleId,
                    x.PermissionId
                });

            modelBuilder.Entity<RolePermission>()
                .HasOne(x => x.Role)
                .WithMany()
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RolePermission>()
                .HasOne(x => x.Permission)
                .WithMany(x => x.RolePermissions)
                .HasForeignKey(x => x.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}