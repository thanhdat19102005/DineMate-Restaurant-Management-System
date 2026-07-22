using DineMate.Application.Features.RestaurantTables.Commands;
using DineMate.Application.Features.RestaurantTables.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DineMate.Server.Controllers
{
    [ApiController]
    [Route("api/restaurant-tables")]
    [Authorize]
    public class RestaurantTablesController
       : ControllerBase
    {
        private readonly IMediator _mediator;

        public RestaurantTablesController(
            IMediator mediator
        )
        {
            _mediator = mediator;
        }

        // ==================================================
        // LOAD TOÀN BỘ DỮ LIỆU MÀN HÌNH QUẢN LÝ BÀN
        //
        // GET:
        // /api/restaurant-tables/management
        //
        // Ví dụ:
        // /api/restaurant-tables/management
        // ?search=B004
        // &areaName=Tầng 1 - Khu B
        // &status=1
        // &capacity=6
        // &pageNumber=1
        // &pageSize=8
        // &selectedTableId=B004
        // &historySize=10
        // ==================================================

        [HttpGet("management")]
        public async Task<IActionResult>
            GetManagementData(
                [FromQuery]
                GetRestaurantTablesQuery query,
                CancellationToken cancellationToken
            )
        {
            var result =
                await _mediator.Send(
                    query,
                    cancellationToken
                );

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }


        // ==================================================
        // TẠO BÀN MỚI
        //
        // POST:
        // /api/restaurant-tables
        // ==================================================

        [HttpPost]
        public async Task<IActionResult>
            CreateRestaurantTable(
                [FromBody]
                CreateRestaurantTableCommand
                    command,

                CancellationToken
                    cancellationToken
            )
        {
            // ==================================================
            // ID NGƯỜI ĐANG ĐĂNG NHẬP
            // ==================================================

            command.UserId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            // ==================================================
            // TÊN NGƯỜI ĐANG ĐĂNG NHẬP
            // ==================================================

            command.UserName =
                User.FindFirstValue(
                    ClaimTypes.Name
                )
                ?? User.FindFirstValue(
                    "userName"
                )
                ?? "Hệ thống";

            // ==================================================
            // ĐỊA CHỈ IP
            // ==================================================

            command.IpAddress =
                HttpContext
                    .Connection
                    .RemoteIpAddress?
                    .ToString();

            // ==================================================
            // GỬI COMMAND QUA MEDIATOR
            // ==================================================

            var result =
                await _mediator.Send(
                    command,
                    cancellationToken
                );

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }




        // DELETE:
        // /api/restaurant-tables/A14
        // ==================================================

        [HttpDelete("{id}")]
        public async Task<IActionResult>
            DeleteRestaurantTable(
                [FromRoute]
                string id,

                CancellationToken
                    cancellationToken
            )
        {
            var command =
                new DeleteRestaurantTableCommand
                {
                    Id = id,

                    UserId =
                        User.FindFirstValue(
                            ClaimTypes
                                .NameIdentifier
                        ),

                    UserName =
                        User.FindFirstValue(
                            ClaimTypes.Name
                        )
                        ?? User.FindFirstValue(
                            "userName"
                        )
                        ?? "Hệ thống",

                    IpAddress =
                        HttpContext
                            .Connection
                            .RemoteIpAddress?
                            .ToString()
                };

            var result =
                await _mediator.Send(
                    command,
                    cancellationToken
                );

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }





        // ==================================================
        // THÊM MỚI:
        // CẬP NHẬT THÔNG TIN BÀN
        //
        // PUT:
        // /api/restaurant-tables/A44
        //
        // Body:
        // {
        //   "tableName": "Bàn 44",
        //   "capacity": 6,
        //   "tableType": "VIP",
        //   "areaName": "Tầng thượng",
        //   "status": 0,
        //   "note": "Gần bếp"
        // }
        // ==================================================

        [HttpPut("{id}")]
        public async Task<IActionResult>
            UpdateRestaurantTable(
                [FromRoute]
                string id,

                [FromBody]
                UpdateRestaurantTableCommand
                    command,

                CancellationToken
                    cancellationToken
            )
        {
            // ==================================================
            // MÃ BÀN LẤY TỪ URL
            // KHÔNG CHO FRONTEND TỰ GỬI ID TRONG BODY
            // ==================================================

            command.Id =
                id;

            // ==================================================
            // ID NGƯỜI ĐANG ĐĂNG NHẬP
            // ==================================================

            command.UserId =
                User.FindFirstValue(
                    ClaimTypes
                        .NameIdentifier
                );

            // ==================================================
            // TÊN NGƯỜI ĐANG ĐĂNG NHẬP
            // ==================================================

            command.UserName =
                User.FindFirstValue(
                    ClaimTypes.Name
                )
                ?? User.FindFirstValue(
                    "userName"
                )
                ?? "Hệ thống";

            // ==================================================
            // ĐỊA CHỈ IP
            // ==================================================

            command.IpAddress =
                HttpContext
                    .Connection
                    .RemoteIpAddress?
                    .ToString();

            // ==================================================
            // GỬI COMMAND QUA MEDIATOR
            // ==================================================

            var result =
                await _mediator.Send(
                    command,
                    cancellationToken
                );

            if (
                !result.Success
            )
            {
                return BadRequest(
                    result
                );
            }

            return Ok(
                result
            );
        }



        // ==================================================
        // THÊM MỚI:
        // XÓA MỘT BẢN GHI LỊCH SỬ HOẠT ĐỘNG
        //
        // DELETE:
        // /api/restaurant-tables/histories/15
        // ==================================================

        [HttpDelete("histories/{historyId:int}")]
        public async Task<IActionResult>
            DeleteRestaurantTableHistory(
                [FromRoute]
        int historyId,

                CancellationToken
                    cancellationToken
            )
        {
            // ==================================================
            // 1. TẠO COMMAND
            // ==================================================

            var command =
                new DeleteRestaurantTableHistoryCommand
                {
                    HistoryId =
                        historyId,

                    // ==================================================
                    // ID NGƯỜI ĐANG ĐĂNG NHẬP
                    // ==================================================

                    UserId =
                        User.FindFirstValue(
                            ClaimTypes
                                .NameIdentifier
                        ),

                    // ==================================================
                    // TÊN NGƯỜI ĐANG ĐĂNG NHẬP
                    // ==================================================

                    UserName =
                        User.FindFirstValue(
                            ClaimTypes.Name
                        )
                        ?? User.FindFirstValue(
                            "userName"
                        )
                        ?? "Hệ thống",

                    // ==================================================
                    // ĐỊA CHỈ IP
                    // ==================================================

                    IpAddress =
                        HttpContext
                            .Connection
                            .RemoteIpAddress?
                            .ToString()
                };

            // ==================================================
            // 2. GỬI COMMAND QUA MEDIATOR
            // ==================================================

            var result =
                await _mediator.Send(
                    command,
                    cancellationToken
                );

            // ==================================================
            // 3. KIỂM TRA KẾT QUẢ
            // ==================================================

            if (
                !result.Success
            )
            {
                return BadRequest(
                    result
                );
            }

            return Ok(
                result
            );
        }






    }
}
