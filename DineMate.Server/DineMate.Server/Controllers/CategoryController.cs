using DineMate.Application.Features.Categories.Commands;
using DineMate.Application.Features.Categories.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DineMate.Server.Controllers
{
    [ApiController]
    [Route("api/categories")]
    [Authorize]
    public class CategoryController
        : ControllerBase
    {
        private readonly IMediator
            _mediator;

        public CategoryController(
            IMediator mediator
        )
        {
            _mediator =
                mediator;
        }

        // ==================================================
        // GET: API/CATEGORIES/MANAGEMENT
        // ==================================================

        [HttpGet("management")]
        public async Task<IActionResult>
            GetManagementData(
                [FromQuery] string? search,
                [FromQuery] int? status,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 10,
                [FromQuery] string? selectedCategoryId = null,
                [FromQuery] int historySize = 10,
                CancellationToken cancellationToken = default
            )
        {
            var query =
                new GetCategoryManagementQuery
                {
                    Search =
                        search,

                    Status =
                        status,

                    PageNumber =
                        pageNumber,

                    PageSize =
                        pageSize,

                    SelectedCategoryId =
                        selectedCategoryId,

                    HistorySize =
                        historySize
                };

            var result =
                await _mediator.Send(
                    query,
                    cancellationToken
                );

            return Ok(
                result
            );
        }

        // ==================================================
        // POST: API/CATEGORIES
        // ==================================================

        [HttpPost]
        public async Task<IActionResult>
            CreateCategory(
                [FromBody]
                CreateCategoryCommand command,
                CancellationToken cancellationToken = default
            )
        {
            if (
                command is null
            )
            {
                return BadRequest(
                    new
                    {
                        success =
                            false,

                        message =
                            "Dữ liệu tạo loại món không hợp lệ."
                    }
                );
            }

            AddCurrentUserInformation(
                command
            );

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
        // PUT: API/CATEGORIES/{CATEGORYID}
        //
        // Mã Category lấy từ URL và không được phép sửa.
        //
        // BODY CHỈ GỬI:
        //
        // {
        //   "name": "Lẩu",
        //   "description": "...",
        //   "status": 1
        // }
        // ==================================================

        [HttpPut("{categoryId}")]
        public async Task<IActionResult>
            UpdateCategory(
                [FromRoute]
                string categoryId,

                [FromBody]
                UpdateCategoryCommand command,

                CancellationToken cancellationToken = default
            )
        {
            if (
                command is null
            )
            {
                return BadRequest(
                    new
                    {
                        success =
                            false,

                        message =
                            "Dữ liệu cập nhật loại món không hợp lệ."
                    }
                );
            }

            // ==================================================
            // CATEGORY ID LẤY TỪ ROUTE
            //
            // Không lấy ID từ Angular body để bảo đảm
            // mã loại món không bị thay đổi.
            // ==================================================

            command.CategoryId =
                categoryId;

            AddCurrentUserInformation(
                command
            );

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
        // THÊM MỚI: DELETE CATEGORY
        //
        // DELETE: API/CATEGORIES/{CATEGORYID}
        //
        // WORKFLOW:
        //
        // API
        //  -> DeleteCategoryCommand
        //  -> DeleteCategoryCommandHandler
        //  -> CategoryRules.ValidateDelete
        //  -> ICategoryRepository
        //  -> CategoryRepository
        //  -> SQL Server
        //  -> DeleteCategoryResponseDto
        // ==================================================

        [HttpDelete("{categoryId}")]
        public async Task<IActionResult>
            DeleteCategory(
                [FromRoute]
                string categoryId,

                CancellationToken cancellationToken = default
            )
        {
            // ==================================================
            // THÊM MỚI:
            // TẠO COMMAND TỪ CATEGORY ID TRÊN ROUTE
            // ==================================================

            var command =
                new DeleteCategoryCommand
                {
                    CategoryId =
                        categoryId
                };

            // ==================================================
            // THÊM MỚI:
            // GÁN NGƯỜI THỰC HIỆN VÀ IP TỪ SERVER
            //
            // Angular không được tự gửi các dữ liệu này.
            // ==================================================

            AddCurrentUserInformation(
                command
            );

            // ==================================================
            // THÊM MỚI:
            // GỬI COMMAND QUA MEDIATR
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
        // THÊM MỚI DELETE CATEGORY HISTORY:
        // XÓA MỘT BẢN GHI LỊCH SỬ CATEGORY
        //
        // DELETE:
        // API/CATEGORIES/HISTORIES/{HISTORYID}
        //
        // WORKFLOW:
        //
        // API
        //  -> DeleteCategoryHistoryCommand
        //  -> DeleteCategoryHistoryCommandHandler
        //  -> CategoryRules.ValidateDeleteHistory
        //  -> ICategoryRepository.DeleteHistoryAsync
        //  -> CategoryRepository.DeleteHistoryAsync
        //  -> SQL Server
        //  -> DeleteCategoryHistoryResponseDto
        // ==================================================

        [HttpDelete("histories/{historyId:int}")]
        public async Task<IActionResult>
            DeleteCategoryHistory(
                [FromRoute]
                int historyId,

                CancellationToken cancellationToken = default
            )
        {
            // ==================================================
            // THÊM MỚI DELETE CATEGORY HISTORY:
            // TẠO COMMAND TỪ HISTORY ID TRÊN ROUTE
            // ==================================================

            var command =
                new DeleteCategoryHistoryCommand
                {
                    HistoryId =
                        historyId
                };

            // ==================================================
            // THÊM MỚI DELETE CATEGORY HISTORY:
            // GÁN NGƯỜI THỰC HIỆN VÀ IP TỪ SERVER
            //
            // Angular không được tự gửi các dữ liệu này.
            // ==================================================

            AddCurrentUserInformation(
                command
            );

            // ==================================================
            // THÊM MỚI DELETE CATEGORY HISTORY:
            // GỬI COMMAND QUA MEDIATR
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
        // GÁN NGƯỜI DÙNG VÀ IP CHO CREATE
        // ==================================================

        private void AddCurrentUserInformation(
            CreateCategoryCommand command
        )
        {
            command.UserId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            command.UserName =
                GetCurrentUserName();

            command.IpAddress =
                HttpContext
                    .Connection
                    .RemoteIpAddress?
                    .ToString();
        }

        // ==================================================
        // GÁN NGƯỜI DÙNG VÀ IP CHO UPDATE
        // ==================================================

        private void AddCurrentUserInformation(
            UpdateCategoryCommand command
        )
        {
            command.UserId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            command.UserName =
                GetCurrentUserName();

            command.IpAddress =
                HttpContext
                    .Connection
                    .RemoteIpAddress?
                    .ToString();
        }


        // ==================================================
        // THÊM MỚI:
        // GÁN NGƯỜI DÙNG VÀ IP CHO DELETE
        // ==================================================

        private void AddCurrentUserInformation(
            DeleteCategoryCommand command
        )
        {
            command.UserId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            command.UserName =
                GetCurrentUserName();

            command.IpAddress =
                HttpContext
                    .Connection
                    .RemoteIpAddress?
                    .ToString();
        }


        // ==================================================
        // THÊM MỚI DELETE CATEGORY HISTORY:
        // GÁN NGƯỜI DÙNG VÀ IP CHO DELETE HISTORY
        // ==================================================

        private void AddCurrentUserInformation(
            DeleteCategoryHistoryCommand command
        )
        {
            command.UserId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            command.UserName =
                GetCurrentUserName();

            command.IpAddress =
                HttpContext
                    .Connection
                    .RemoteIpAddress?
                    .ToString();
        }

        // ==================================================
        // LẤY TÊN NGƯỜI ĐANG ĐĂNG NHẬP
        // ==================================================

        private string GetCurrentUserName()
        {
            return
                User.FindFirstValue(
                    ClaimTypes.Name
                )
                ?? User.FindFirstValue(
                    "userName"
                )
                ?? User.Identity?.Name
                ?? "Hệ thống";
        }
    }
}
